const { mengandungKataKasar } = require("../../utils/sensorBahasa");
const Pesan = require("../../model/Pesan");

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
  });
}

module.exports = chatHandler;
