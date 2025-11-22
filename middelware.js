module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        //redirect original Url
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to perform this action!");
        return res.redirect("/login");
    }
    next();
};


module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;   
    }
    next();
}