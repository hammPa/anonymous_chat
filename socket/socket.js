// socket/index.js
const { daftarUserHandler, disconnectHandler } = require("./feature/user.handler");
const postHandler = require("./feature/post.handler");
const chatHandler = require("./feature/chat.handler");
const typingHandler = require("./feature/typing.handler");

function inisialisasiSocketChat(io) {
  io.on("connection", (socket) => {
    console.log("Socket connect:", socket.id, "user: ", socket.userId);

    const context = {
      idAnonim: socket.userId,
      clientId: null,
      postAktif: null
    };

    daftarUserHandler(socket, io, context);
    postHandler(socket, io, context);
    chatHandler(socket, io, context);
    typingHandler(socket, context);
    disconnectHandler(socket, io, context);
  });
}

module.exports = { inisialisasiSocketChat };
