const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  judul: {
    type: String,
    required: true
  },
  gambar: {
    type: String,
    required: true
  },
  pembuatUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  pembuatAnonim: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["terbuka", "ditutup"],
    default: "terbuka"
  },
  dibuatPada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Post", PostSchema);
