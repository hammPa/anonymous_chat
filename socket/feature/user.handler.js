const { userAnonMap, anonimAktif, ambilIdAnonimKosong } = require("./state");


function daftarUserHandler(socket, io, context) {
  socket.on("daftar_user", () => {
    const userId = socket.userId;
    if (!userId) return;
0   
    let idAnonim;

    // 🔒 USER SUDAH PUNYA ANON?
    if (userAnonMap.has(userId)) {
      idAnonim = userAnonMap.get(userId);
    } else {
      idAnonim = ambilIdAnonimKosong();
      userAnonMap.set(userId, idAnonim);
      anonimAktif.add(idAnonim);
    }

    context.idAnonim = idAnonim;
    context.userId = userId;

    socket.emit("identitas_user", { idAnonim });

    io.emit("user_online", { jumlah: anonimAktif.size });

    socket.broadcast.emit("notifikasi_sistem", {
      pesan: `Anonim ${idAnonim} baru saja masuk`
    });
  });
}


function disconnectHandler(socket, io, context) {
  socket.on("disconnect", () => {
    const { userId, idAnonim, postAktif } = context;
    if (!idAnonim || !userId) return;

    // cek: masih ada socket lain dari user ini?
    const masihAda = [...socket.server.sockets.sockets.values()]
      .some(s => s.userId === userId);

    if (masihAda) return; // jangan hapus anon

    if (postAktif) {
      socket.to(postAktif).emit("notifikasi_sistem", {
        pesan: `Anonim ${idAnonim} keluar dari post`
      });
    }

    anonimAktif.delete(idAnonim);
    userAnonMap.delete(userId)

    io.emit("user_online", {
      jumlah: anonimAktif.size
    });

    socket.broadcast.emit("notifikasi_sistem", {
      pesan: `Anonim ${idAnonim} keluar`
    });
  });
}



module.exports = {
  daftarUserHandler,
  disconnectHandler
};