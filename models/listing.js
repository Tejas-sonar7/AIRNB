const mongoose = require("mongoose");
const Review = require("./review"); // Capitalized for convention
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true, // fixed typo: require → required
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner : {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});

// ✅ Use the same schema you just defined (ListingSchema)
ListingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
