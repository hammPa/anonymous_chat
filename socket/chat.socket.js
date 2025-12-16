const { mengandungKataKasar } = require("../utils/sensorBahasa");

// client id -> nomor anonym
const daftarUser = new Map();

// nomor anonim yg aktif
const anonimAktif = new Set();

// cari id anonim terkecil yg blm di pakai
const ambilIdAnonimKosong = () => {
    let id = 1;
    while(anonimAktif.has(id)) id++;
    return id;
}

function inisialisasiSocketChat(io){
    let jumlahUserOnline = 0;

    io.on("connection", (socket) => {
        console.log("User terhubung: ", socket.id);

        let idAnonim = null;
        let clientId = null;

        // ========== DAFTAR USER ==========
        socket.on("daftar_user", (data) => {
            clientId = data.client_id;

            if (daftarUser.has(clientId)) {
                idAnonim = daftarUser.get(clientId);
            } else {
                idAnonim = ambilIdAnonimKosong();
                daftarUser.set(clientId, idAnonim);
            }

            anonimAktif.add(idAnonim);

            // kirim identitas ke user sendiri
            socket.emit("identitas_user", { idAnonim });

            // update user online (BERDASARKAN SET)
            io.emit("user_online", {
                jumlah: anonimAktif.size
            });

            // notifikasi masuk
            socket.broadcast.emit("notifikasi_sistem", {
                pesan: `Anonim ${idAnonim} baru saja masuk`
            });
        });








        // ========== TYPING INDICATOR ==========
        socket.on("mulai_mengetik", () => {
            if(!idAnonim) return;

            socket.broadcast.emit("user_mengetik", {
                pesan: `Anonim ${idAnonim} sedang mengetik...`
            });
        });

        socket.on("berhenti_mengetik", () => {
            socket.broadcast.emit("user_berhenti_mengetik");
        });

        // ========== KIRIM PESAN ==========
        socket.on("kirim_pesan", (data) => {
            if(!idAnonim) return;

            const isiPesan = data.isi_pesan;

            if(mengandungKataKasar(isiPesan)){
                socket.emit("balasan_bot", {
                    dari: "bot",
                    isi: "eits, no no no ya"
                });
                return;
            }

            io.emit("pesan_baru", {
                dari: `Anonim ${idAnonim}`,
                isi: isiPesan,
                waktu: new Date()
            });

            socket.broadcast.emit("user_berhenti_mengetik");
        })


        // ========== DISCONNECT ==========
        socket.on("disconnect", () => {
            if (idAnonim !== null) {
                anonimAktif.delete(idAnonim);

                io.emit("user_online", {
                    jumlah: anonimAktif.size
                });

                socket.broadcast.emit("notifikasi_sistem", {
                    pesan: `Anonim ${idAnonim} keluar`
                });
            }

            console.log("Socket terputus:", socket.id);
        });
    });
}

module.exports = { inisialisasiSocketChat };