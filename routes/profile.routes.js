const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const router = express.Router();

router.get("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "NO_AUTH" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId);
    
    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    res.json({
      username: user.username,
      anonId: user.anonId,
      createdAt: user.createdAt
    });
  } catch (err) {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
});

module.exports = router;
