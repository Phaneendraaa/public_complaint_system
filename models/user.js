const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    complaints:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"complaint"
    }],
    admin:{
        type:Boolean,
        default:false
    }
})
module.exports = mongoose.model("user",userSchema);
