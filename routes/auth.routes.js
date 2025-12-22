const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const { ambilIdAnonimKosong } = require("../socket/feature/state");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    if (password.length < 3) {
      return res.status(400).json({ error: "Password minimal 3 karakter" });
    }

    const existing = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existing) {
      return res.status(400).json({
        error: "Username atau email sudah digunakan"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const lastUser = await User.findOne().sort({ anonId: -1 }).select("anonId");
    const newAnonId = lastUser ? lastUser.anonId + 1 : 1;

    await User.create({
      username,
      email,
      password: hashed,
      anonId: newAnonId
    });

    res.status(201).json({ message: "Register sukses" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
