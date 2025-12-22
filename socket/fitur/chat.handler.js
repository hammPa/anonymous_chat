const { mengandungKataKasar } = require("../../pembantu/sensorBahasa");
const Pesan = require("../../model/Pesan");
const Langganan = require("../../model/Langganan");
const { kirimEmail } = require("../../pembantu/layananEmail");

function tanganiChat(socket, io, context) {
  socket.on("kirim_pesan", async (data) => {
    const idPost = data?.postId;
    const isi = (data?.isi_pesan || "").trim();

    if (!idPost || !isi) return;
    if (!context.idPengguna || !context.idAnonim) return;

    if (mengandungKataKasar(isi)) {
      socket.emit("balasan_bot", {
        dari: "Bot",
        isi: "Eits, bahasamu tolong dijaga ya"
      });
      return;
    }

    io.to(idPost).emit("pesan_baru", {
      dari: context.idAnonim,
      isi,
      waktu: new Date()
    });

    await Pesan.create({
      postId: idPost,
      pengirimUser: context.idPengguna,
      pengirimAnonim: context.idAnonim,
      isi
    });





    const daftarLangganan = await Langganan.find({ idPost }).populate("userId", "email");

    for (const langganan of daftarLangganan) {
      if (langganan.userId._id.toString() === context.idPengguna) continue;

      await kirimEmail({
        tujuan: langganan.userId.email,
        subjek: "Ada curhatan baru",
        anon: context.idAnonim,
        isi: `Pesan baru:\n\n"${isi}"`,
        link: `${process.env.LINK_FE}/post/${postId}`
      });
    }
  });
}

module.exports = tanganiChat;
