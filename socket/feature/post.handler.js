const Post = require("../../model/Post");
const Pesan = require("../../model/Pesan");

function postHandler(socket, io, context) {

  socket.on("masuk_post", async (data) => {
    if (!context.idAnon) return;

    const postId = data?.postId;
    if (!postId) return;

    const post = await Post.findById(postId);
    if (!post) return;

    if (context.postAktif) {
      socket.leave(context.postAktif);
    }

    socket.join(postId);
    context.postAktif = postId;

    socket.emit("berhasil_masuk_post", {
      postId,
      judul: post.judul
    });

    socket.to(postId).emit("notifikasi_sistem", {
      pesan: `Anonim ${context.idAnon} masuk ke post`
    });
  });

  socket.on("keluar_post", () => {
    if (!context.postAktif) return;

    const lama = context.postAktif;
    socket.leave(lama);
    context.postAktif = null;

    socket.to(lama).emit("notifikasi_sistem", {
      pesan: `Anonim ${context.idAnon} keluar dari post`
    });
  });
}

module.exports = postHandler;
