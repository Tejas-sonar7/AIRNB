const mongoose = require ("mongoose");
const initData = require("./data.js")
const Listing = require ("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

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
        listing.owner = "69258633717638eb9cdccc49"; // Replace with a valid User ObjectId from your database
        return listing;
    });
    await Listing.insertMany(initData.data);
    console.log("Data was initialized")
}

initDB();