const User = require("../../model/User");
const { userAnonMap, anonimAktif, ambilIdAnonimKosong } = require("./state");


function daftarUserHandler(socket, io, context){
  socket.on("daftar_user", async () => {
    const userId = socket.userId;
    if (!userId) return;


    const user = await User.findById(userId).select("anonId");
    if (!user) return;

    context.idAnon = user.anonId;
    context.userId = userId;

    socket.emit("identitas_user", { idAnonim: user.anonId });

    const anonimAktif = new Set(
      [...io.sockets.sockets.values()]
        .map(s => s.userId)
        .filter(Boolean)
    );
    io.emit("user_online", { jumlah: anonimAktif.size });

    socket.broadcast.emit("notifikasi_sistem", {
      pesan: `Anonim ${user.anonId} baru saja masuk`
    });
  });
}


function disconnectHandler(socket, io, context) {
  socket.on("disconnect", () => {
    const { userId, idAnon, postAktif } = context;
    if (!idAnon || !userId) return;

    // cek: masih ada socket lain dari user ini?
    const masihAda = [...socket.server.sockets.sockets.values()]
      .some(s => s.userId === userId);

    if (masihAda) return; // jangan hapus anon

    if (postAktif) {
      socket.to(postAktif).emit("notifikasi_sistem", {
        pesan: `Anonim ${idAnon} keluar dari post`
      });
    }

    const anonimAktif = new Set(
      [...io.sockets.sockets.values()]
        .map(s => s.userId)
        .filter(Boolean)
    );

    io.emit("user_online", {
      jumlah: anonimAktif.size
    });

    socket.broadcast.emit("notifikasi_sistem", {
      pesan: `Anonim ${idAnon} keluar`
    });
  });
}



module.exports = {
  daftarUserHandler,
  disconnectHandler
};