const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require ("./schema.js");
const Review = require ("./models/review.js");


module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        //redirect original Url
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to perform this action!");
        return res.redirect("/login");
    }
    next();
};


module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;   
    }
    next();
}

module.exports.isOwner = async (req,res,next) => {
    const {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error","You are Not the owner of ths Listing !");
        return res.redirect(`/listings/${id}`);
    }
    next();

}



// ✅ Validation middleware
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details.map(el => el.message).join(","));
  } else {
    next();
  }
};

module.exports.validateReview = (req,res,next) =>{
  let {error} = reviewSchema.validate(req.body);
  if(error){
    throw new ExpressError(400, result.error);
  }else{
    next();

  }
}

// review validation middleware

module.exports.isAuthor = async (req,res,next) => {
    const {id , reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error","You are Not the author of this Id !");
        return res.redirect(`/listings/${id}`);
    }
    next();

}
