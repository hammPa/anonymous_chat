const User = require("../../model/User");

/**
 * Menangani pendaftaran pengguna saat socket pertama kali terhubung
 * - Mengambil anonId dari database
 * - Menyimpan identitas ke konteks socket
 * - Mengirim info jumlah pengguna online
 */
function tanganiDaftarPengguna(socket, io, context){
  socket.on("daftar_user", async () => {
    const idPengguna = socket.userId;
    if (!idPengguna) return;


    const user = await User.findById(idPengguna).select("anonId");
    if (!user) return;

    // Simpan identitas ke konteks socket
    context.idAnonim = user.anonId;
    context.idPengguna = idPengguna;

    // Kirim identitas anonim ke client
    socket.emit("identitas_user", { idAnonim: user.anonId });

    // Hitung jumlah pengguna aktif
    const penggunaAktif = new Set(
      [...io.sockets.sockets.values()]
        .map(s => s.userId)
        .filter(Boolean)
    );
    io.emit("user_online", { jumlah: penggunaAktif.size });

    socket.broadcast.emit("notifikasi_sistem", {
      pesan: `Anonim ${user.anonId} baru saja masuk`
    });
  });
}


/**
 * Menangani logika saat socket terputus
 * - Memastikan pengguna benar-benar offline
 * - Mengirim notifikasi keluar
 * - Memperbarui jumlah pengguna online
 */
function tanganiPutusKoneksi(socket, io, context) {
  socket.on("disconnect", () => {
    const { idPengguna, idAnonim, postAktif } = context;
    if (!idAnonim || !idPengguna) return;

    // Cek apakah masih ada koneksi lain dari pengguna yang sama
    const masihAda = [...socket.server.sockets.sockets.values()]
      .some(s => s.userId === idPengguna);

    if (masihAda) return; // jangan hapus anon

    // Notifikasi keluar dari post aktif (jika ada)
    if (postAktif) {
      socket.to(postAktif).emit("notifikasi_sistem", {
        pesan: `Anonim ${idAnonim} keluar dari post`
      });
    }

    // Notifikasi keluar dari post aktif (jika ada)
    const penggunaAktif = new Set(
      [...io.sockets.sockets.values()]
        .map(s => s.userId)
        .filter(Boolean)
    );

    io.emit("user_online", {
      jumlah: penggunaAktif.size
    });

    socket.broadcast.emit("notifikasi_sistem", {
      pesan: `Anonim ${idAnonim} keluar`
    });
  });
}



module.exports = {
  tanganiDaftarPengguna,
  tanganiPutusKoneksi
};