const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            min: 10,
            max: 50
        },
        dueDate: {
            type: Date,
            default: Date.now()
        },
        status: {
            type: String,
            default: "pending"
        },
        priority: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Task = new mongoose.model("Task", taskSchema);

module.exports = Task;