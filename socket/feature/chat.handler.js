const { mengandungKataKasar } = require("../../utils/sensorBahasa");
const Pesan = require("../../model/Pesan");
const Subscription = require("../../model/Subscription");
const { kirimEmail } = require("../../utils/emailService");

function chatHandler(socket, io, context) {

  socket.on("kirim_pesan", async (data) => {
    const postId = data?.postId;
    const isi = (data?.isi_pesan || "").trim();

    if (!postId || !isi) return;
    if (context.postAktif !== postId) return;

    if (mengandungKataKasar(isi)) {
      socket.emit("balasan_bot", {
        dari: "Bot",
        isi: "Eits, bahasamu tolong dijaga ya kawan 🙂"
      });
      return;
    }

    io.to(postId).emit("pesan_baru", {
      dari: `Anonim ${context.idAnonim}`,
      isi,
      waktu: new Date()
    });

    await Pesan.create({
      postId,
      pengirimAnonim: `Anonim ${context.idAnonim}`,
      isi
    });





    const subscriberList = await Subscription.find({ postId });

    const emailPengirim = data?.emailPengirim;

    for (const sub of subscriberList) {
      if (sub.email === emailPengirim) continue;

      await kirimEmail(
        sub.email,
        "Ada curhatan baru",
        `Ada pesan baru di post yang kamu ikuti:\n\n"${isi}"`
      );
    }
  });
}

module.exports = chatHandler;
