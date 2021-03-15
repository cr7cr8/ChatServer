const mongoose = require("mongoose");
const { connDB } = require("./db")


const userSchema = new mongoose.Schema({
   
    userName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
        index: { unique: true },
        //     validate: [(val) => { return /\d{3}-\d{3}-\d{4}/.test(val) }, "please enter a valid userName"],

    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 1024
    },
    friendsList: [{ type: Object }],
},
    {
        toObject: { virtuals: true },
        collection: "users",
        //  timestamps: true, 
    }

)


const User = connDB.model("users", userSchema);


module.exports = { User }

