const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const port = 8080;
const methodOverride = require("method-override");
const Task = require("./models/task");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const flash = require("connect-flash");
const isLoggedIn = require("./middleware.js");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
const engine = require('ejs-mate'); // 👈
app.engine('ejs', engine);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const TASKTRACK_URL = "mongodb://127.0.0.1:27017/tasktrack";

async function main() {
    await mongoose.connect(TASKTRACK_URL);
}

main()
.then(() => {
    console.log("DB Connection Successful");
})
.catch((err) => {
    console.log("Some error occured", err);
})

const sessionOptions = {
	secret: "MySuperSecretKey",
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true,
	}
};

app.use(session(sessionOptions));
app.use(flash());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        try {
            const decoded = jwt.verify(token, "MySuperSecretKey");
            const user = await User.findById(decoded.id);
            req.user = user;
        } catch (err) {
            console.log("Invalid Token");
        }
    }
    next();
});


app.use((req, resp, next) => {
	resp.locals.success = req.flash("success");
	resp.locals.error = req.flash("error");
	resp.locals.currUser = req.user;
	next();
})

app.listen(port, () => {
    console.log("app is listening to port 8080");
})

app.get("/", (req, resp) => {
    resp.send("Hey! it is root path");
})

app.get("/home", isLoggedIn, async (req, resp) => {
    let allTasks = await Task.find({});
    // console.log(allTasks);
    resp.render("home", {allTasks});
})

app.post("/home", isLoggedIn, async (req, resp) => {
    let {title, description, priority, dueDate} = req.body;
    let newTask = new Task({
        title: title,
        description: description,
        priority: priority,
        dueDate: new Date(dueDate)
    })

    console.log(newTask);

    try {
        let response = await newTask.save();
        console.log(response);
        req.flash("success", "New Task Added!!");
    } catch (e) {
        console.log(e);
    }

    resp.redirect("/home");
})

app.delete("/home/:id", isLoggedIn, async (req, resp) => {
    let id = req.params.id;

    try {
        let response = await Task.findByIdAndDelete(id);
        console.log(response);
        resp.redirect("/home");
        req.flash("success", "Task got deleted");
    } catch (e) {
        console.log(e);
        resp.status(500).json({success: false, message: "Some error occured"});
    }

})

app.patch("/changeStatus/:id/:status", isLoggedIn, async (req, resp) => {
    let {id, status} = req.params;
    if(status === "pending") {
        status = "ongoing";
    } else {
        status = "completed";
    }
    
    await Task.findByIdAndUpdate(id, {status});
    resp.redirect("/home");
})

app.get("/calendar", (req, res) => {
    res.render("calendar", { title: "Calendar" });
});

app.get("/signup", (req, resp) => {
    resp.render("users/signup.ejs");
})

app.get("/login", (req, resp) => {
    resp.render("users/login.ejs");
})

app.post("/signup", async (req, resp) => {
    let {username, email, password} = req.body.user;
    let user = (await User.findOne({username})) || (await User.findOne({email}));
    if(user) {
        req.flash("error", "User with given email/username already Exists!!");
        return resp.redirect("/signup");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword
    });

    const result = await newUser.save();
    const token = jwt.sign({id: result._id}, "MySuperSecretKey", {expiresIn:"1d"});
    resp.cookie("token", token);
    console.log(result);
    req.user = newUser;
    req.flash("success", "Welcome to TaskTrack");
    resp.redirect("/home");
})

app.post("/login", async (req, resp) => {
    let {email, password} = req.body;
    const user = await User.findOne({email: email});
    if(!user) {
        req.flash("error", "No user exists with given email");
        return resp.redirect("/login");
    }
    if(!(await bcrypt.compare(password, user.password))) {
        req.flash("error", "Incorrect Email/password");
        return resp.redirect("/login");
    }
    const token = jwt.sign({id: user._id}, "MySuperSecretKey", {expiresIn:"1d"});
    resp.cookie("token", token);
    req.user = user;
    req.flash("success", "Welcome Back to TaskTrack");
    resp.redirect("/home");
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    req.flash("success", "Logged out successfully!");
    res.redirect("/login");
});

