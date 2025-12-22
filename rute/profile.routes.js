const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const router = express.Router();

router.get("/", async (req, res) => {
  const headerOtorisasi = req.headers.authorization;
  if (!headerOtorisasi) {
    return res.status(401).json({ error: "Belum terautentikasi" });
  }

  const token = headerOtorisasi.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId);
    
    if (!user) {
      return res.status(404).json({ error: "Pengguna Tidak Ditemukan" });
    }

    res.json({
      username: user.username,
      anonId: user.anonId,
      createdAt: user.createdAt
    });
  } catch (err) {
    return res.status(401).json({ error: "Token Tidak Valid" });
  }
});

module.exports = router;
