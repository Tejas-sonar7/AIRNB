const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middelware.js");

const userController = require("../cotrollers/user.js");
const user = require("../models/user.js");
// Signup routes
router
  .route("/signup")
  .get(userController.indexuser)
  .post(saveRedirectUrl, wrapAsync(userController.createUser));

// Login routes

router
  .route("/login")
  .get(userController.loginUser)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.loginUserPost
  );

// Logout route

router.get("/logout", userController.logoutUser);

module.exports = router;
