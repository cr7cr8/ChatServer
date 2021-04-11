const mongoose = require("mongoose");
const { connDB } = require("./db")


const offlineMessageSchema = new mongoose.Schema({
    saidTime: {
        type: Date,
        required: true,
    },
    whoSaid: {
        type: String,
        required: true,
    },
    toPerson: {
        type: String,
        required: true,
    },
    sentence: {
        type: String,
        minlength: 1,
        required: true,
    },
    key:{
        type:String,
    },
    isImage:{
        type:Boolean,
        default:false,
    },
    width:{
        type:Number,
    },
    height:{
        type:Number,     
    },
    mongooseID:{
        type:String,
    }

})


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
    pushNotificationOn:{
        type:Boolean,
        required:true,
        default:true,
    }

},
    {
        toObject: { virtuals: true },
        collection: "users",
        //  timestamps: true, 
    }

)


const User = connDB.model("users", userSchema);
const OfflineMessage = connDB.model("offlineMessages", offlineMessageSchema);

module.exports = { User, OfflineMessage }

