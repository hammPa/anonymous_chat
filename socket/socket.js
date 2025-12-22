// socket/index.js
const { tanganiDaftarPengguna, tanganiPutusKoneksi } = require("./fitur/pengguna.handler");
const tanganiPost = require("./fitur/post.handler");
const tanganiChat = require("./fitur/chat.handler");

function inisialisasiSocketChat(io) {
  io.on("connection", (socket) => {
    console.log("Socket connect:", socket.id, "user: ", socket.userId);

    const context = {
      idPengguna: socket.userId,
      idAnonim: null,
      postAktif: null
    };

    tanganiDaftarPengguna(socket, io, context);
    tanganiPost(socket, io, context);
    tanganiChat(socket, io, context);
    tanganiPutusKoneksi(socket, io, context);
  });
}

module.exports = { inisialisasiSocketChat };
