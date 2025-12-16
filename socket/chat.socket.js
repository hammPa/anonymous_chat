const { mengandungKataKasar } = require("../utils/sensorBahasa");
const crypto = require("crypto");

/**
 * postId -> info post
 * contoh:
 * postId => { id, judul, pembuat }
 */
const daftarPost = new Map();

// client_id -> nomor anonim (persistent selama server hidup)
const daftarUser = new Map();

// nomor anonim yang sedang aktif (online)
const anonimAktif = new Set();

// ambil id anonim terkecil yang belum dipakai
function ambilIdAnonimKosong() {
  let id = 1;
  while (anonimAktif.has(id)) id++;
  return id;
}

function inisialisasiSocketChat(io) {
  io.on("connection", (socket) => {
    console.log("Socket terhubung:", socket.id);

    let idAnonim = null;
    let clientId = null;

    // post yang sedang aktif untuk socket ini (biar gak nyasar)
    let postAktif = null;

    /* =========================
       DAFTAR USER (wajib dulu)
       ========================= */
    socket.on("daftar_user", (data) => {
      clientId = data?.client_id;
      if (!clientId) return;

      // kalau user lama, pakai id lama
      if (daftarUser.has(clientId)) {
        idAnonim = daftarUser.get(clientId);
      } else {
        // user baru, ambil slot terkecil
        idAnonim = ambilIdAnonimKosong();
        daftarUser.set(clientId, idAnonim);
      }

      anonimAktif.add(idAnonim);

      socket.emit("identitas_user", { idAnonim });

      io.emit("user_online", {
        jumlah: anonimAktif.size
      });

      socket.broadcast.emit("notifikasi_sistem", {
        pesan: `Anonim ${idAnonim} baru saja masuk`
      });
    });

    /* =========================
       AMBIL DAFTAR POST
       ========================= */
    socket.on("ambil_daftar_post", () => {
      const daftar = Array.from(daftarPost.values());
      socket.emit("daftar_post", daftar);
    });

    /* =========================
       BUAT POST (room baru)
       ========================= */
    socket.on("buat_post", (data) => {
      if (!idAnonim) return;

      const judul = (data?.judul || "").trim();
      if (!judul) return;

      const postId = "post_" + crypto.randomUUID();

      daftarPost.set(postId, {
        id: postId,
        judul,
        pembuat: `Anonim ${idAnonim}`
      });

      // keluar dari post aktif sebelumnya (opsional tapi rapi)
      if (postAktif) socket.leave(postAktif);

      // masuk ke post baru
      socket.join(postId);
      postAktif = postId;

      socket.emit("post_dibuat", {
        postId,
        judul
      });

      // broadcast update list post ke semua user (biar UI bisa auto refresh)
      io.emit("daftar_post", Array.from(daftarPost.values()));

      console.log(`Post dibuat: ${postId} oleh Anonim ${idAnonim}`);
    });

    /* =========================
       MASUK POST (join room)
       ========================= */
    socket.on("masuk_post", (data) => {
      if (!idAnonim) return;

      const postId = data?.postId;
      if (!postId) return;
      if (!daftarPost.has(postId)) return;

      // keluar dari post aktif sebelumnya (biar tidak join banyak room)
      if (postAktif && postAktif !== postId) socket.leave(postAktif);

      socket.join(postId);
      postAktif = postId;

      socket.emit("berhasil_masuk_post", {
        postId,
        judul: daftarPost.get(postId).judul
      });

      socket.to(postId).emit("notifikasi_sistem", {
        pesan: `Anonim ${idAnonim} masuk ke post`
      });
    });

    /* =========================
       KELUAR POST (leave room)
       ========================= */
    socket.on("keluar_post", () => {
      if (!idAnonim) return;
      if (!postAktif) return;

      const postSebelumnya = postAktif;

      socket.leave(postSebelumnya);
      postAktif = null;

      socket.to(postSebelumnya).emit("notifikasi_sistem", {
        pesan: `Anonim ${idAnonim} keluar dari post`
      });
    });

    /* =========================
       TYPING INDICATOR (per post)
       ========================= */
    socket.on("mulai_mengetik", (data) => {
      if (!idAnonim) return;

      const postId = data?.postId;
      if (!postId) return;

      // cegah event nyasar
      if (postAktif !== postId) return;

      socket.to(postId).emit("user_mengetik", {
        pesan: `Anonim ${idAnonim} sedang mengetik...`
      });
    });

    socket.on("berhenti_mengetik", (data) => {
      const postId = data?.postId;
      if (!postId) return;

      if (postAktif !== postId) return;

      socket.to(postId).emit("user_berhenti_mengetik");
    });

    /* =========================
       KIRIM PESAN (per post)
       ========================= */
    socket.on("kirim_pesan", (data) => {
      if (!idAnonim) return;

      const postId = data?.postId;
      const isiPesan = (data?.isi_pesan || "").trim();

      if (!postId) return;
      if (!isiPesan) return;

      // cegah event nyasar
      if (postAktif !== postId) return;

      if (mengandungKataKasar(isiPesan)) {
        socket.emit("balasan_bot", {
          dari: "Bot",
          isi: "Eits, bahasamu tolong dijaga ya kawan 🙂"
        });
        return;
      }

      io.to(postId).emit("pesan_baru", {
        dari: `Anonim ${idAnonim}`,
        isi: isiPesan,
        waktu: new Date()
      });

      socket.to(postId).emit("user_berhenti_mengetik");
    });

    /* =========================
       DISCONNECT (cleanup)
       ========================= */
    socket.on("disconnect", () => {
      if (idAnonim !== null) {
        // notifikasi keluar dari post aktif (kalau ada)
        if (postAktif) {
          socket.to(postAktif).emit("notifikasi_sistem", {
            pesan: `Anonim ${idAnonim} keluar dari post`
          });
        }

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
