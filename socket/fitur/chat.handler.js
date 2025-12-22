const { mengandungKataKasar } = require("../../pembantu/sensorBahasa");
const Pesan = require("../../model/Pesan");
const Langganan = require("../../model/Langganan");
const { kirimEmail } = require("../../pembantu/layananEmail");


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
      console.log(idPost);
      
      const daftarLangganan = await Langganan.find({ postId: idPost }).populate("userId", "email");

      for (const langganan of daftarLangganan) {
        if (langganan.userId._id.toString() === context.idPengguna) continue;

        
        const res = await kirimEmail({
          tujuan: langganan.userId.email,
          subjek: "Ada curhatan baru",
          anon: context.idAnonim,
          isi: `Pesan baru:\n\n"${isi}"`,
          link: `${process.env.LINK_FE}/post/${idPost}`
        });
        console.log({res})
      }
    } catch (err) {
      console.error("❌ GAGAL KIRIM EMAIL:", err.message);
    }
  });
}

module.exports = tanganiChat;
