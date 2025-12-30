const User = require("../models/user.js");

//signup form
module.exports.indexuser = (req, res) => {
  res.render("users/signup.ejs");
}

//create user
module.exports.createUser = async (req, res) => {
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
  }

  //login route
  module.exports.loginUser = (req, res) => {
  res.render("users/login.ejs");
}

//login user
    module.exports.loginUserPost = (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }

//logout user is handled in routes/user.js
module.exports.logoutUser =(req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged you out!");
    res.redirect("/listings");
  });
}

