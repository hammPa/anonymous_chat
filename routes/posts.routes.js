const express = require("express");
const Post = require("../model/Post");
const Subscription = require("../model/Subscription");
const { userAnonMap } = require("../socket/feature/state");
const jwt = require("jsonwebtoken");

const router = express.Router();

/**
 * GET daftar post
 */
router.get("/", async (req, res) => {
  const posts = await Post.find()
    .sort({ dibuatPada: -1 })
    .select("judul pembuatAnonim dibuatPada");
  res.json(posts);
});

/**
 * POST buat post
 */
router.post("/", (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "NO_AUTH" });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    console.log({"SECRET": process.env.JWT_SECRET});
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (e) {
    console.error("JWT VERIFY ERROR:", e.message);
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}, async (req, res) => {
  const { judul } = req.body;
  if (!judul) {
    return res.status(400).json({ error: "Judul wajib" });
  }

  const userId = req.userId;

  // ambil anonId user ini (SUDAH DITENTUKAN SERVER)
  const anonId = userAnonMap.get(userId);
  if (!anonId) {
    return res.status(400).json({
      error: "User belum terdaftar di socket"
    });
  }

  const post = await Post.create({
    judul,
    pembuatUser: userId,
    pembuatAnonim: anonId
  });

  res.status(201).json({
    _id: post._id,
    judul: post.judul,
    pembuatAnonim: anonId,
    dibuatPada: post.dibuatPada
  });
});

/**
 * POST subscribe
 */
router.post("/:postId/subscribe", async (req, res) => {
  const { email } = req.body;
  const { postId } = req.params;

  if (!email) {
    return res.status(400).json({ error: "Email wajib" });
  }

  const sudahAda = await Subscription.findOne({ postId, email });
  if (sudahAda) {
    return res.status(409).json({ error: "Sudah subscribe" });
  }

  await Subscription.create({ postId, email });
  res.json({ message: "Subscribe berhasil" });
});

/**
 * DELETE unsubscribe
 */
router.delete("/:postId/subscribe", async (req, res) => {
  const { email } = req.body;
  const { postId } = req.params;

  await Subscription.findOneAndDelete({ postId, email });
  res.json({ message: "Unsubscribe berhasil" });
});

module.exports = router;
