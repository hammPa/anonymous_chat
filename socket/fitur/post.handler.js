const Post = require("../../model/Post");

/**
 * Menangani event masuk dan keluar post
 * - Memindahkan socket ke room post
 * - Menyimpan post aktif di context
 * - Mengirim notifikasi sistem ke pengguna lain
 */

function tanganiPost(socket, io, context) {
  socket.on("masuk_post", async (data) => {
    if (!context.idAnonim) return;

    const idPost = data?.postId;
    if (!idPost) return;

    const post = await Post.findById(idPost);
    if (!post) return;

    if (context.postAktif) {
      socket.leave(context.postAktif);
    }

    socket.join(idPost);
    context.postAktif = idPost;

    socket.emit("berhasil_masuk_post", {
      idPost,
      judul: post.judul
    });

    socket.to(idPost).emit("notifikasi_sistem", {
      pesan: `Anonim ${context.idAnon} masuk ke post`
    });
  });

  socket.on("keluar_post", () => {
    if (!context.postAktif) return;

    const idPostLama = context.postAktif;
    socket.leave(idPostLama);
    context.postAktif = null;

    socket.to(idPostLama).emit("notifikasi_sistem", {
      pesan: `Anonim ${context.idAnon} keluar dari post`
    });
  });
}

module.exports = tanganiPost;
