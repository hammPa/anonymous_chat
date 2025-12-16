const mongoose = require("mongoose");

const PesanSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  pengirimAnonim: {
    type: String,
    required: true
  },
  isi: {
    type: String,
    required: true
  },
  dibuatPada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Pesan", PesanSchema);
