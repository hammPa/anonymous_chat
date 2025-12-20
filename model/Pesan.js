const mongoose = require("mongoose");

const PesanSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  pengirimUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  pengirimAnonim: {
    type: Number,
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
