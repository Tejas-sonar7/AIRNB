const Listing = require("../models/listing");

module.exports.index = async (req, res, next) => {
  try {
    const allListings = await Listing.find({});
    res.render("listing/index", { allListings });
  } catch (err) {
    next(err);
  }
};

//render new form
module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
};

//create route
module.exports.createListing = async (req, res, next) => {
  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // ⭐️ FIX: SAVE UPLOADED IMAGE
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};


// show listing
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Filter out null reviews (deleted but not removed from array)
    listing.reviews = listing.reviews.filter((review) => review != null);

    res.render("listing/show", { listing });
  } catch (err) {
    next(err);
  }
};

// render edit form
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");

    }
    let originalImageUrl = listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listing/edit", { listing , originalImageUrl});
  } catch (err) {
    next(err);
  }
};

// update listing
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    // update non-image fields
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // ⭐ FIX: update image properly
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      await listing.save();
    }

    req.flash("success", "Listing updated Successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

// delete listing
module.exports.deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};
