const mongoose = require("mongoose");

const complaintSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    complaintType:String,
    address:String,
    city:String,
    description:String,
    status:{
        type:String,
        enum:["pending","resolved"],
        default:"pending"
    },
    
    date: {
        type: Date,
        default: Date.now
    },
    image: [{
        type: String, 
        required: true
    }],

    latitude:{
        type:mongoose.Types.Decimal128,
    }
    ,
    longitude:{
        type: mongoose.Types.Decimal128,
    },
    proofImage:{
        type:String

    }




});

module.exports = mongoose.model("complaint", complaintSchema);
