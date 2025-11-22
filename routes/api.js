// routes/api.js
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Review = require("../models/review");

// Get listing by title
router.get("/listings", async (req, res) => {
  const { title } = req.query;
  const listing = await Listing.findOne({ title: new RegExp(title, "i") });
  res.json(listing);
});

// Delete review by listing title
router.delete("/reviews/deleteByTitle/:title", async (req, res) => {
  const { title } = req.params;
  const listing = await Listing.findOne({ title: new RegExp(title, "i") }).populate("reviews");
  if (listing && listing.reviews.length > 0) {
    const reviewId = listing.reviews[0]._id; // deleting first review for demo
    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

module.exports = router;
