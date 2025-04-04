const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const port = 8080;
const methodOverride = require("method-override");
const Task = require("./models/task");
const { stat } = require("fs");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

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



app.listen(port, () => {
    console.log("app is listening to port 8080");
})

app.get("/", (req, resp) => {
    console.log(resp.send("Hey! it is root path"));
})

app.get("/home", async (req, resp) => {
    let allTasks = await Task.find({});
    // console.log(allTasks);
    resp.render("home", {allTasks});
})

app.post("/home", async (req, resp) => {
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
    } catch (e) {
        console.log(e);
    }

    resp.redirect("/home");
})

app.delete("/home/:id", async (req, resp) => {
    let id = req.params.id;

    try {
        let response = await Task.findByIdAndDelete(id);
        console.log(response);
        resp.redirect("/home");
    } catch (e) {
        console.log(e);
        resp.status(500).json({success: false, message: "Some error occured"});
    }

})

app.patch("/changeStatus/:id/:status", async (req, resp) => {
    let {id, status} = req.params;
    if(status === "pending") {
        status = "ongoing";
    } else {
        status = "completed";
    }
    
    await Task.findByIdAndUpdate(id, {status});
    resp.redirect("/home");
})


// test();

// async function test() {
//     const testModel = new Task({
//         title: "Random",
//         description: "A random model for testing",
//         priority: "High"
//     })
//     testModel.save()
//         .then((res) => console.log(res))
//         .catch(err => console.log(err));
// }