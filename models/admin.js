const mongoose = require("mongoose");
const adminSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    complaints:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"complaint"
    }],
    queue:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"complaint"
        }
    ]
})
module.exports = mongoose.model("admin",adminSchema);