const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
require("dotenv").config();

const MONGO_URL = process.env.ATLAS_URI;

async function initDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Database connected successfully");

    await Listing.deleteMany({});

    // get one existing user
    const user = await User.findOne();
    if (!user) {
      console.log("❌ No user found. Create a user first.");
      return;
    }

    const listingsToInsert = initData.data.map((listing) => ({
      ...listing,
      owner: user._id,
    }));

    await Listing.insertMany(listingsToInsert);
    console.log("Data initialized with owner:", user.username);

    await mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

initDB();
