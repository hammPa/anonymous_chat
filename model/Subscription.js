const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  idAnonim: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  dibuatPada: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
