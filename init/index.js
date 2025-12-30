const mongoose = require ("mongoose");
const initData = require("./data.js")
const Listing = require ("../models/listing.js");

const MONGO_URL = process.env.ATLAS_URI;

main().then(() =>{
    console.log("database connected succesfully")
}).catch((err) =>{
    console.log("error")
});


async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map(listing => { 
        listing.owner = "6953ca96c5d1afe305386bb4"; // Replace with a valid User ObjectId from your database
        return listing;
    });
    await Listing.insertMany(initData.data);
    console.log("Data was initialized")
}

initDB();