const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  judul: {
    type: String,
    required: true
  },
  pembuatAnonim: {
    type: String,
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
