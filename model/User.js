const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  anonId: {
    type: Number,
    unique: true
  },
}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);