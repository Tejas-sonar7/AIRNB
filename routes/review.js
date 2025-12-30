const express = require ("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn , isAuthor } = require("../middelware.js");

const  reviewcontroller = require("../cotrollers/reviews.js");

// Validate review
//Reviews 
// Post route

router.post("/" , validateReview,isLoggedIn , wrapAsync(reviewcontroller.createReview));

// Delete review route

router.delete("/:reviewId",isLoggedIn,isAuthor, wrapAsync(reviewcontroller.deleteReview));


module.exports = router;
