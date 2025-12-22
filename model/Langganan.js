const mongoose = require("mongoose");

const LanggananSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  dibuatPada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Langganan", LanggananSchema);
