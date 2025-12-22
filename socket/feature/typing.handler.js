function typingHandler(socket, context) {

  socket.on("mulai_mengetik", (data) => {
    const postId = data?.postId;
    if (!postId || context.postAktif !== postId) return;

    socket.to(postId).emit("user_mengetik", {
      pesan: `Anonim ${context.idAnon} sedang mengetik...`
    });
  });

  socket.on("berhenti_mengetik", (data) => {
    const postId = data?.postId;
    if (!postId || context.postAktif !== postId) return;

    socket.to(postId).emit("user_berhenti_mengetik");
  });
}

module.exports = typingHandler;
