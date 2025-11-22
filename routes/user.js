const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middelware.js");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",saveRedirectUrl,
  wrapAsync(async (req, res) => {
    try {
      let { email, username, password } = req.body;
      let user = new User({ email, username });
      let registeredUser = await User.register(user, password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {return next(err)};
        req.flash("success", "Welcome to AIRNB!");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("signup");x  
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",saveRedirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged you out!");
    res.redirect("/listings");
  });
});

module.exports = router;
