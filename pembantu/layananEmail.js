const nodemailer = require("nodemailer");
const { renderTemplateEmail } = require("./templateEmail");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// mengiri email notifikasi ke pengguna
async function kirimEmail({tujuan, subjek, anon, isi, link}) {
  await transporter.sendMail({
    from: `"Tembok Curhat" <${process.env.EMAIL_USER}>`,
    to: tujuan,
    subject: subjek,
    // text: isi
    html: renderTemplateEmail({anon, isi, link})
  });
}

module.exports = { kirimEmail };
