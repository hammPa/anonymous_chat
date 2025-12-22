const { mengandungKataKasar } = require("../../utils/sensorBahasa");
const Pesan = require("../../model/Pesan");
const Subscription = require("../../model/Subscription");
const { kirimEmail } = require("../../utils/emailService");
const Post = require("../../model/Post");

function chatHandler(socket, io, context) {
  socket.on("kirim_pesan", async (data) => {
    const postId = data?.postId;
    const isi = (data?.isi_pesan || "").trim();

    if (!postId || !isi) return;
    if (!context.userId || !context.idAnon) return;

    if (mengandungKataKasar(isi)) {
      socket.emit("balasan_bot", {
        dari: "Bot",
        isi: "Eits, bahasamu tolong dijaga ya kawan 🙂"
      });
      return;
    }

    io.to(postId).emit("pesan_baru", {
      dari: context.idAnon,
      isi,
      waktu: new Date()
    });

    await Pesan.create({
      postId,
      pengirimUser: context.userId,
      pengirimAnonim: context.idAnon,
      isi
    });





    const subs = await Subscription.find({ postId }).populate("userId", "email");

    for (const sub of subs) {
      if (sub.userId._id.toString() === context.userId) continue;

      await kirimEmail({
        tujuan: sub.userId.email,
        subjek: "Ada curhatan baru",
        anon: context.idAnon,
        isi: `Pesan baru:\n\n"${isi}"`,
        link: `${process.env.LINK_FE}/post/${postId}`
      });
    }
  });
}

module.exports = chatHandler;
