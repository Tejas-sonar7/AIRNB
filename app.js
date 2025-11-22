const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const apiRoutes = require("./routes/api.js");
const userRoutes = require("./routes/user.js");

async function main() {
  await mongoose.connect(Mongo_Url);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log("something went wrong", err);
  });

const sessionOptions = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  },
};
app.get("/", (req, res) => {
  res.send("Hi I am Root");
});

app.use(session(sessionOptions));
app.use(flash());

passport.initialize();
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.get("/demouser" , async (req, res)=> {
  const fakeuser = new User({email: "tejas@gmail.com", username: "tejas" });
  let registeruser = await User.register(fakeuser, "chicken" );
  res.send(registeruser);
})

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/api", apiRoutes);
app.use("/", userRoutes);

// Catch-all 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Global error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server running on port 8080");
});
