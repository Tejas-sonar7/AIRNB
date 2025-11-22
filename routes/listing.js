const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middelware.js");

// ✅ Validation middleware
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details.map(el => el.message).join(","));
  } else {
    next();
  }
};

// ✅ NEW route (MUST come before /:id)
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listing/new.ejs");
});

// ✅ Index route (show all listings)
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listing/index", { allListings });
}));

// ✅ Create route
router.post("/",isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
}));

// ✅ Show route
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews").populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listing/show", { listing });
}));

// ✅ Edit route
router.get("/:id/edit",isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listing/edit", { listing });
}));

// ✅ Update route
router.put("/:id", isLoggedIn,validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   req.flash("success", "Listing updated Successfully!");
  res.redirect(`/listings/${id}`);
}));

// ✅ Delete route
router.delete("/:id",isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
   req.flash("success", "Listing deleted!");
  res.redirect("/listings");
}));

module.exports = router;
