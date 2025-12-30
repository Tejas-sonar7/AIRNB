const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config(); // make sure this is added

const MONGO_URL = process.env.ATLAS_URI;

async function initDB() {
  try {
    // Connect to MongoDB first
    await mongoose.connect(MONGO_URL);
    console.log("Database connected successfully");

    // Clear existing listings
    await Listing.deleteMany({});

    // Add owner and insert listings
    const listingsToInsert = initData.data.map((listing) => {
      listing.owner = "6953ca96c5d1afe305386bb4"; // Replace with valid ObjectId
      return listing;
    });

    await Listing.insertMany(listingsToInsert);
    console.log("Data was initialized");

    // Close the connection
    await mongoose.connection.close();
    console.log("Connection closed");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

// Run the seeder
initDB();
