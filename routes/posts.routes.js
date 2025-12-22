const express = require("express");
const Post = require("../model/Post");
const Subscription = require("../model/Subscription");
const { userAnonMap } = require("../socket/feature/state");
const jwt = require("jsonwebtoken");
const User = require("../model/User");


const router = express.Router();

/**
 * GET daftar post
 */
router.get("/", async (req, res) => {
  const posts = await Post.find()
    .sort({ dibuatPada: -1 })
    .select("_id judul gambar pembuatAnonim dibuatPada");

  res.json(posts);
});

/**
 * GET 1 post
 */
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "POST_NOT_FOUND" });
    }
    res.json(post);
  } catch {
    res.status(400).json({ error: "INVALID_ID" });
  }
});

const auth = (req, res, next) => {
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
}

/**
 * POST buat post
 */
router.post("/", auth, async (req, res) => {
  const { judul, gambar } = req.body;
  if (!judul || !gambar) {
    return res.status(400).json({ error: "Judul dan Gambar wajib" });
  }

  const userId = req.userId;

  // ambil anonId user ini (SUDAH DITENTUKAN SERVER)
  const user = await User.findById(userId).select("anonId");
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
  if (!user.anonId) return res.status(400).json({ error: "USER_HAS_NO_ANONID" });

  const anonId = user.anonId;

  const post = await Post.create({
    judul,
    gambar,
    pembuatUser: userId,
    pembuatAnonim: anonId
  });

  res.status(201).json({
    _id: post._id,
    judul: post.judul,
    gambar: post.gambar,
    pembuatAnonim: anonId,
    dibuatPada: post.dibuatPada
  });
});

router.get("/:postId/subscription-status", auth, async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  const sub = await Subscription.findOne({ postId, userId });
  res.json({ subscribed: !!sub });
});


/**
 * POST subscribe
 */
router.post("/:postId/subscribe", auth, async (req, res) => {
  const userId = req.userId;
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ error: "POST_NOT_FOUND" });
  }

  // ❌ pembuat post tidak boleh subscribe
  if (post.pembuatUser.toString() === userId) {
    return res.status(403).json({ error: "CANNOT_SUBSCRIBE_OWN_POST" });
  }

  try {
    await Subscription.create({ postId, userId });
    res.json({ message: "SUBSCRIBED" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "ALREADY_SUBSCRIBED" });
    }
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});


/**
 * DELETE unsubscribe
 */
router.delete("/:postId/subscribe", auth, async (req, res) => {
  const userId = req.userId;
  const { postId } = req.params;

  const result = await Subscription.findOneAndDelete({ postId, userId });

  if (!result) {
    return res.status(404).json({ error: "NOT_SUBSCRIBED" });
  }

  res.json({ message: "UNSUBSCRIBED" });
});


module.exports = router;
