const jwt = require("jsonwebtoken");
const User = require("./models/user"); // make sure path is correct

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, "MySuperSecretKey");
        const user = await User.findById(decoded.id);
        if (!user) {
            req.flash("error", "User not found!");
            return res.redirect("/login");
        }
        req.user = user;
        next();
    } catch (err) {
        req.flash("error", "Invalid or expired token!");
        return res.redirect("/login");
    }
};

module.exports = isLoggedIn;
