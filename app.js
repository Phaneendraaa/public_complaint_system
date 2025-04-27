const express = require("express");
const app = express();
const path = require("path");
const cookieparser = require("cookie-parser");
app.use(cookieparser());
const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
const userModel = require("./models/user");
const complaintModel = require("./models/complaint");
const adminModel = require("./models/admin");
const upload = require("./config/multerconfig");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

let currentResolveid = ""
let currentResolveimg = ""

const transporter = nodemailer.createTransport({
    secure:true,
    host:'smtp.gmail.com',
    port:465,
    auth:{
        user:'nagaworkk@gmail.com',
        pass:'afojsgcvxgcpfboz'
    }
});
function sendMail(to,sub,msg){
        transporter.sendMail(
            {
                to:to,
                subject:sub,
                html:msg,
                attachments: [
                    {
                        filename: uploadedFile, // The filename of the uploaded image
                        path: path.join(__dirname, "public", "images", "uploads", uploadedFile), // Full path to the image
                        cid: "complaintImage" // Content-ID to reference in the email body
                    }
                ]
            }
        );
        console.log("email sent");
}
app.get("/",function(req,res){
    res.render("index");
})

app.post("/signup-submit", async function(req,res){
    const {username,email,password} = req.body;
    const newUser = await userModel.create({username,email,password});
    const token = jwt.sign({id:newUser._id},"secret");
    res.cookie("UserToken",token);
    res.redirect("/home");

})

app.get("/home",function(req,res){
    if(req.cookies.UserToken==""){
        res.redirect("/login");
    }
    res.render("home");
})



app.get("/login",function(req,res){
    res.render("login");
})

app.post("/login-submit", async function(req,res){
    const {email,password} = req.body;
    
    const user = await userModel.findOne({email,password});
    
    if(user){
        const token = jwt.sign({id:user._id},"secret");
        res.cookie("UserToken",token);
        res.redirect("/home");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/logout",function(req,res){
    
    res.cookie("UserToken","");
    res.redirect("/login");
})

app.get("/readCookie",function(req,res){
    const token = req.cookies.UserToken;
    res.send("cookie is "+token);
})


app.get("/createComplaint",function(req,res){
    if(req.cookies.UserToken==""){
        res.redirect("/login");
    }
    res.render("Complaint");
})

app.post("/ComplaintUpload", upload.single("image"), async function (req, res) {
    try {

        const { complaintType, address, city, description } = req.body;
        const latitude = parseFloat(req.body.latitude); // Parse latitude as a float
        const longitude = parseFloat(req.body.longitude); // Parse longitude as a float
        const uploadedFile = req.file?.filename; // Ensure file exists before accessing filename

        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).send("Invalid latitude or longitude provided.");
        }

      
        const decimalLatitude = mongoose.Types.Decimal128.fromString(latitude.toString());
        const decimalLongitude = mongoose.Types.Decimal128.fromString(longitude.toString());

        const user = jwt.verify(req.cookies.UserToken, "secret");
        const user_id = user.id;

        const newComplaint = await complaintModel.create({
            complaintType,
            address,
            city,
            description,
            image: uploadedFile,
            latitude: decimalLatitude,
            longitude: decimalLongitude,
            user:user_id
        });
   
     

        await userModel.findOneAndUpdate(
            { _id: user_id },
            { $push: { complaints: newComplaint._id } }
        );
        
        let sendemailto = "";
        cityadmin = await adminModel.findOne({username:city});
        sendemailto = cityadmin.email;
        await adminModel.findOneAndUpdate(
            {username:city},
            {
                $push:{complaints:newComplaint._id}
            }
        )
        const transporter = nodemailer.createTransport({
            secure:true,
            host:'smtp.gmail.com',
            port:465,
            auth:{
                user:'nagaworkk@gmail.com',
                pass:'afojsgcvxgcpfboz'
            }
        });
        function sendMail(to,sub,msg){
                transporter.sendMail(
                    {
                        to:to,
                        subject:sub,
                        html:msg,
                        attachments: [
                            {
                                filename: uploadedFile, // The filename of the uploaded image
                                path: path.join(__dirname, "public", "images", "uploads", uploadedFile), // Full path to the image
                                cid: "complaintImage" // Content-ID to reference in the email body
                            }
                        ]
                    }
                );
                console.log("email sent");
        }
        const msgg = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4CAF50;
            color: #ffffff;
            padding: 15px;
            text-align: center;
            font-size: 1.5em;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }
        .content h2 {
            color: #4CAF50;
            margin-top: 0;
        }
        .content p {
            margin: 10px 0;
        }
        .content img {
            display: block;
            margin: 10px auto;
            max-width: 100%;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .footer {
            background-color: #f1f1f1;
            color: #777777;
            text-align: center;
            padding: 10px;
            font-size: 0.9em;
        }
        .button {
            display: inline-block;
            padding: 10px 15px;
            color: #ffffff;
            background-color: #4CAF50;
            text-decoration: none;
            border-radius: 5px;
            font-size: 1em;
            margin-top: 10px;
            text-align: center;
        }
        p a{
        color:white;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            New Complaint in ${city} Municipal Corporation
        </div>
        <div class="content">
            <h2>Complaint Details</h2>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Description:</strong>${description}.</p>
            <img src="cid:complaintImage" alt="Complaint Image" />
            <p style="text-align: center;">
                <a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" class="button" target="_blank">View Location on Maps</a>
            </p>
        </div>
        <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;
  
        sendMail(sendemailto,`New complaint int your city ${city}`,msgg);


        res.redirect("/publicComplaints");
    } catch (error) {
        console.error("Error handling complaint upload:", error);
        res.status(500).send("An error occurred while uploading the complaint.");
    }
});

app.get("/profile", async function(req, res) {
    const token = req.cookies.UserToken;
    
    if (!token) {
      
        res.redirect("/login");
    } else {
        try {
            
            const user = jwt.verify(token, "secret");

            
            const userDetails = await userModel.findOne({ _id: user.id }).populate("complaints");

            
            res.render("profile", { userDetails });
        } catch (error) {
            
            console.error(error);
            res.redirect("/login");
        }
    }
});


app.get("/publicComplaints", async function(req,res){


    const allComplaints = await complaintModel.find().populate("user");
    allComplaints.reverse();
    
    res.render("publicComplaints",{allComplaints:allComplaints});
})

app.post("/filter-posts", async function(req, res) {
    const filters = req.body;
    let query = {};

    if (filters.filterType && filters.filterType !== "all") {
        query.complaintType = filters.filterType;
    }
    if (filters.filterCity && filters.filterCity !== "all") {
        query.city = filters.filterCity;
    }
    if (filters.filterStatus && filters.filterStatus !== "all") {
        query.status = filters.filterStatus;
    }

    try {

        const filteredComplaints = await complaintModel.find(query).populate("user");
        filteredComplaints.reverse(); 

        res.render("publicComplaints", { allComplaints: filteredComplaints });
    } catch (error) {
        console.error(error);
        res.redirect("/publicComplaints");
    }
});

app.get("/loc",function(req,res){
    res.render("location");
})


app.get("/editp", async function(req,res){
    const token = req.cookies.UserToken;
    const user = jwt.verify(token, "secret");
    const id = user.id;
    const userdetials = await userModel.findById(id);
    res.render("editprofile",{user:userdetials});
})



app.post("/editprofile", async function(req,res){
    
const token = req.cookies.UserToken;
if (!token) {
    return res.redirect("/login");
}
try {
    const user = jwt.verify(token, "secret");
    const id = user.id; 

   
    const { username, email} = req.body; 
    await userModel.findByIdAndUpdate(id, { username, email}); 
    
    res.redirect("/profile"); 
} catch (error) {
    console.error(error);
    res.redirect("/login");
}
})






app.get("/sendmail",function(req,res){
    const msgg = "<h1>hello msgg</h1><p>hello msgg</p><h2>hello phani</h2>";    
    sendMail("245122749054@mvsrec.edu.in","test",msgg);
});
    


app.get("/addtoqueue", async function(req,res){
    const token = req.cookies.UserToken;
    if(!token){
        res.redirect("/adminlogin");
        
    }
    const adminid = jwt.verify(token,"secret");
    const admin = await adminModel.findOneAndUpdate({_id:adminid.id},{$push:{queue:"6766ea55086c321f1cb4fb86"}});
    res.send(admin);
})

app.get("/adminlogin",function(req,res){
    res.render("adminlogin");
})

app.post("/adminlogin", async function(req,res){
    const {email,password} = req.body;
    const user = await adminModel.findOne({email,password});
    if(user){
        const token = jwt.sign({id:user._id},"secret");
        res.cookie("UserToken",token);
        res.redirect("/adminhome");
    }
    else{
        res.redirect("/adminlogin");
    }
})

app.get("/adminhome", async function(req, res) {
    const token = req.cookies.UserToken;
    if (!token) {
        return res.redirect("/adminlogin");
    }

    const adminid = jwt.verify(token, "secret");
    const admin = await adminModel.findOne({ _id: adminid.id }).populate("complaints");

    // Filter only pending complaints
    const pendingComplaints = admin.complaints.filter(complaint => complaint.status === "pending");
    let empty = 1;
    if(pendingComplaints.length==0) empty=0;
    // Send the admin and the filtered pending complaints to the view
    res.render("adminhome", { admin, pendingComplaints,empty});
});

app.get("/addtoqueue/:complaintid", async (req, res) => {
    const complaintId = req.params.complaintid;

    try {
        // Find the complaint by ID
        const complaint = await complaintModel.findOne({ _id: complaintId });
        if (!complaint) {
            return res.status(404).send("Complaint not found.");
        }

        // Find the admin by the city (assuming admin's username corresponds to the city)
        const admin = await adminModel.findOne({ username: complaint.city });

        if (!admin) {
            return res.status(404).send("Admin not found.");
        }

        // Check if the complaint is already in the admin's queue
        if (!admin.queue.includes(complaintId)) {
            // Add the complaint ID to the queue if it's not already present
            await adminModel.findOneAndUpdate({username:complaint.city},{$push:{queue:complaint._id}});
        }

        res.redirect("/queue");
    } catch (error) {
        console.error("Error in adding to queue:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/queue", async function(req,res){
    const token = req.cookies.UserToken;
    if(!token){
        res.redirect("/adminlogin");
    }
    const adminid = jwt.verify(token,"secret");
    const admin = await adminModel.findOne({_id:adminid.id}).populate("queue");
    const pendingComplaints = admin.queue.filter(complaint => complaint.status === "pending");
    let empty = 1;
    if(pendingComplaints.length==0) empty=0;
    res.render("queue",{admin,pendingComplaints,empty});
})

app.post("/filter-posts-admin", async function (req, res) {
    const filters = req.body;
    const token = req.cookies.UserToken;

    if (!token) {
        return res.redirect("/adminlogin");
    }

    try {
        const adminid = jwt.verify(token, "secret");
        const admin = await adminModel.findById(adminid.id).populate("complaints");

        if (!admin) {
            return res.redirect("/adminlogin");
        }

        let complaints = admin.complaints;

        if (filters.filterType && filters.filterType !== "all") {
            complaints = complaints.filter(complaint => complaint.complaintType === filters.filterType);
        }

        if (filters.filterCity && filters.filterCity !== "all") {
            complaints = complaints.filter(complaint => complaint.city === filters.filterCity);
        }

        if (filters.filterStatus && filters.filterStatus !== "all") {
            complaints = complaints.filter(complaint => complaint.status === filters.filterStatus);
        }

        complaints.reverse();
        let empty = 1;
        if (complaints.length == 0) empty = 0;

        res.render("adminhome", {
            admin: {
                username: admin.username,
                queue: admin.queue,
            },
            empty,
            pendingComplaints: complaints,
        });
    } catch (error) {
        console.error("Error in filtering complaints:", error);
        res.redirect("/adminhome");
    }
});

app.post("/resolve_complaint/:complaintid", async function(req,res){
        const token = req.cookies.UserToken;
        currentResolveid = req.params.complaintid;
        res.render("complaintresolve")
})

app.post("/upload-proof", upload.single("proof-image"), async function(req, res) {
    const uploadedFile = req.file?.filename;

    if (!uploadedFile) {
        return res.status(400).send("No proof image uploaded.");
    }

    try {
        // Fetch the complaint from the database
        const complaint = await complaintModel.findOne({_id:currentResolveid});

        if (!complaint) {
            return res.status(404).send("Complaint not found.");
        }

        
        await complaintModel.findOneAndUpdate({_id:complaint._id},{status:"resolved",proofImage:uploadedFile});

        // Fetch the user email from the complaint's user field
        const user = await userModel.findOne({_id:complaint.user});
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const sendemailto = user.email; // Get the user's email address

        // Configure the email transporter
        const transporter = nodemailer.createTransport({
            secure: true,
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'nagaworkk@gmail.com',
                pass: 'afojsgcvxgcpfboz'
            }
        });

        // Function to send the email
        function sendMail(to, sub, msg) {
            transporter.sendMail({
                to: to,
                subject: sub,
                html: msg,
                attachments: [
                    {
                        filename: uploadedFile, // The filename of the uploaded image
                        path: path.join(__dirname, "public", "images", "uploads", uploadedFile), // Full path to the image
                        cid: "complaintImage" // Content-ID to reference in the email body
                    }
                ]
            }, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                } else {
                    console.log("Email sent:", info.response);
                }
            });
        }

        // Email content
        const msgg = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4CAF50;
            color: #ffffff;
            padding: 15px;
            text-align: center;
            font-size: 1.5em;
        }
        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }
        .content h2 {
            color: #4CAF50;
            margin-top: 0;
        }
        .content p {
            margin: 10px 0;
        }
        .content img {
            display: block;
            margin: 10px auto;
            max-width: 100%;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .footer {
            background-color: #f1f1f1;
            color: #777777;
            text-align: center;
            padding: 10px;
            font-size: 0.9em;
        }
        .button {
            display: inline-block;
            padding: 10px 15px;
            color: #ffffff;
            background-color: #4CAF50;
            text-decoration: none;
            border-radius: 5px;
            font-size: 1em;
            margin-top: 10px;
            text-align: center;
        }
        p a{
        color:white;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            Your Complaint has been Resolved
        </div>
        <div class="content">
            <h2>Complaint Resolved</h2>
            <p><strong>Address:</strong> ${complaint.address}</p>
            <p><strong>Description:</strong> ${complaint.description}</p>
            <p><strong>Status:</strong> Resolved</p>
            <img src="cid:complaintImage" alt="Complaint Image" />
            <p style="text-align: center;">
                <a href="https://www.google.com/maps/search/?api=1&query=${complaint.latitude},${complaint.longitude}" class="button" target="_blank">View Location on Maps</a>
            </p>
        </div>
        <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

        // Send the email with the resolved complaint details
        sendMail(sendemailto, `Your Complaint has been Resolved`, msgg);

        res.render("resolve_success")
    } catch (error) {
        console.error("Error processing proof upload:", error);
        res.status(500).send("An error occurred while processing the complaint resolution.");
    }
});

app.get("/admin-logout",function(req,res){
    req.cookies.UserToken = ""
    res.redirect("/login")
})

app.get("/analytics", async function(req,res) {
        const token = req.cookies.UserToken;
        if (!token) {
            res.status(401).send("Unauthorized");
            return;
        }
        const user = jwt.verify(token,"secret");
        const admin = await adminModel.findOne({_id:user.id});
        const resolvedComplaints = await complaintModel.find({city:admin.username,status:"resolved"}).populate("user");
        const pendingComplaints = await complaintModel.find({city:admin.username,status:"pending"})
        const resolvedComplaintsCount = resolvedComplaints.length;
        const pendingComplaintsCount = pendingComplaints.length;
        let empty = 1;
        if(resolvedComplaintsCount==0) empty=0;
        res.render("analytics",{resolvedComplaints,resolvedComplaintsCount,pendingComplaintsCount,empty});
        
})
app.get("/analytics-public", async function(req,res){
    const resolvedComplaints = await complaintModel.find({status:"resolved"}).populate("user");
    const pendingComplaints = await complaintModel.find({status:"pending"})
    const resolvedComplaintsCount = resolvedComplaints.length;
    const pendingComplaintsCount = pendingComplaints.length;
    let empty=1;
    if(resolvedComplaintsCount==0) empty=0;
    res.render("analytics-public",{resolvedComplaints,resolvedComplaintsCount,pendingComplaintsCount,empty})
})

app.listen(3000);