const { daftarUser, anonimAktif, ambilIdAnonimKosong } = require("./state");


function daftarUserHandler(socket, io, context) {
  socket.on("daftar_user", (data) => {
    const clientId = data?.client_id;
    if (!clientId) return;

    let idAnonim;
    if (daftarUser.has(clientId)) {
      idAnonim = daftarUser.get(clientId);
    } else {
      idAnonim = ambilIdAnonimKosong();
      daftarUser.set(clientId, idAnonim);
    }

    anonimAktif.add(idAnonim);
    context.idAnonim = idAnonim;
    context.clientId = clientId;

    socket.emit("identitas_user", { idAnonim });

    io.emit("user_online", { jumlah: anonimAktif.size });

    socket.broadcast.emit("notifikasi_sistem", {
      pesan: `Anonim ${idAnonim} baru saja masuk`
    });
  });
}


function disconnectHandler(socket, io, context) {
  socket.on("disconnect", () => {
    const { idAnonim, postAktif } = context;
    if (idAnonim == null) return;

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
  });
}



module.exports = {
  daftarUserHandler,
  disconnectHandler
};