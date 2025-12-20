const express = require("express");
const Pesan = require("../model/Pesan");

const router = express.Router();

router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  const limit = Number(req.query.limit) || 50;

  const pesan = await Pesan.find({ postId })
    .sort({ dibuatPada: -1 })
    .limit(limit);

  res.json(pesan.reverse());
});

module.exports = router;
