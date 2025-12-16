// socket/post.handler.js
const Post = require("../../model/Post");
const Pesan = require("../../model/Pesan");
const Subscription = require("../../model/Subscription");

function postHandler(socket, io, context) {

  socket.on("ambil_daftar_post", async () => {
    const posts = await Post.find().sort({ dibuatPada: -1 });
    socket.emit("daftar_post", posts);
  });

  socket.on("buat_post", async (data) => {
    if (!context.idAnonim) return;

    const judul = (data?.judul || "").trim();
    if (!judul) return;

    const post = await Post.create({
      judul,
      pembuatAnonim: `Anonim ${context.idAnonim}`
    });

    if (context.postAktif) socket.leave(context.postAktif);

    socket.join(post._id.toString());
    context.postAktif = post._id.toString();

    socket.emit("post_dibuat", {
      postId: context.postAktif,
      judul: post.judul
    });

    const semuaPost = await Post.find().sort({ dibuatPada: -1 });
    io.emit("daftar_post", semuaPost);
  });

  socket.on("masuk_post", async (data) => {
    if (!context.idAnonim) return;

    const postId = data?.postId;
    if (!postId) return;

    const post = await Post.findById(postId);
    if (!post) return;

    if (context.postAktif && context.postAktif !== postId) {
      socket.leave(context.postAktif);
    }

    socket.join(postId);
    context.postAktif = postId;

    socket.emit("berhasil_masuk_post", {
      postId,
      judul: post.judul
    });

    socket.to(postId).emit("notifikasi_sistem", {
      pesan: `Anonim ${context.idAnonim} masuk ke post`
    });

    const pesanLama = await Pesan.find({ postId })
      .sort({ dibuatPada: 1 })
      .limit(50);

    socket.emit("riwayat_pesan", pesanLama);
  });

  socket.on("keluar_post", () => {
    if (!context.postAktif) return;

    const lama = context.postAktif;
    socket.leave(lama);
    context.postAktif = null;

    socket.to(lama).emit("notifikasi_sistem", {
      pesan: `Anonim ${context.idAnonim} keluar dari post`
    });
  });



  socket.on("subscribe_post", async (data) => {
    const postId = data?.postId;
    const email = (data?.email || "").trim();

    if (!postId || !email) return;

    const sudahAda = await Subscription.findOne({ postId, email });
    if (sudahAda) {
      socket.emit("subscribe_gagal", {
        pesan: "Email sudah terdaftar pada post ini"
      });
      return;
    }

    await Subscription.create({
      postId,
      email,
      idAnonim: context.idAnonim
    });

    socket.emit("subscribe_berhasil", {
      pesan: "Berhasil subscribe notifikasi email"
    });
  });

}

module.exports = postHandler;
