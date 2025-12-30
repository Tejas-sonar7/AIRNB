const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

//post review
module.exports.createReview = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    
    await newReview.save();
    
    listing.reviews.push(newReview);
    await listing.save();
    
    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    next(err); // Pass error to Express error handler
  }
};

//delete review
module.exports.deleteReview = async (req, res, next) => {
  try {
    let { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err); // Pass error to Express error handler
  }
};
