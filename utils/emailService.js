const nodemailer = require("nodemailer");
const { renderEmailTemplate } = require("./emailTemplate");
require("dotenv").config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "ADA" : "KOSONG");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function kirimEmail({tujuan, subjek, anon, isi, link}) {
  await transporter.sendMail({
    from: `"Tembok Curhat" <${process.env.EMAIL_USER}>`,
    to: tujuan,
    subject: subjek,
    // text: isi
    html: renderEmailTemplate({anon, isi, link})
  });
}

module.exports = { kirimEmail };
