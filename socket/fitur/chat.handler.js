const { mengandungKataKasar } = require("../../pembantu/sensorBahasa");
const Pesan = require("../../model/Pesan");
const kirimKePelanggan = require("../../pembantu/kirimKePelanggan");


/**
 * Menangani pengiriman pesan chat dalam satu postingan
 * - Validasi konteks pengguna
 * - Sensor bahasa kasar
 * - Simpan pesan ke database
 * - Kirim notifikasi ke pengguna yang berlangganan
 */
function tanganiChat(socket, io, context) {
  socket.on("kirim_pesan", async (data) => {
    try {
      const idPost = data?.postId;
      const isi = (data?.isi_pesan || "").trim();

      if (!idPost || !isi) return;
      if (!context.idPengguna || !context.idAnonim) return;

      // cek isi pesan
      if (mengandungKataKasar(isi)) {
        socket.emit("balasan_bot", {
          dari: "Bot",
          isi: "Eits, bahasamu tolong dijaga ya"
        });
        return;
      }

      // kirim pesan
      io.to(idPost).emit("pesan_baru", {
        dari: context.idAnonim,
        isi,
        waktu: new Date()
      });

      // masukkan pesan ke database
      await Pesan.create({
        postId: idPost,
        pengirimUser: context.idPengguna,
        pengirimAnonim: context.idAnonim,
        isi
      });


      // kirim ke pelanggan
      kirimKePelanggan(idPost, context, isi);
    } catch (err) {
      console.error("Gagal Mengirim Email:", err.message);
    }
  });
}

module.exports = tanganiChat;
