const User = require("../../model/User");


function tanganiDaftarPengguna(socket, io, context){
  socket.on("daftar_user", async () => {
    const idPengguna = socket.userId;
    if (!idPengguna) return;


    const user = await User.findById(idPengguna).select("anonId");
    if (!user) return;

    context.idAnonim = user.anonId;
    context.idPengguna = idPengguna;

    socket.emit("identitas_user", { idAnonim: user.anonId });

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


function tanganiPutusKoneksi(socket, io, context) {
  socket.on("disconnect", () => {
    const { idPengguna, idAnonim, postAktif } = context;
    if (!idAnonim || !idPengguna) return;

    // cek: masih ada socket lain dari user ini?
    const masihAda = [...socket.server.sockets.sockets.values()]
      .some(s => s.userId === idPengguna);

    if (masihAda) return; // jangan hapus anon

    if (postAktif) {
      socket.to(postAktif).emit("notifikasi_sistem", {
        pesan: `Anonim ${idAnonim} keluar dari post`
      });
    }

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