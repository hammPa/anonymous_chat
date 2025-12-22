const Langganan = require("../model/Langganan");
const { kirimEmail } = require("./layananEmail");

async function kirimKePelanggan(idPost, context, isi){
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
}

module.exports = kirimKePelanggan;