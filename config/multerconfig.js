const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/uploads'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, function(err, name) {
            if (err) {
                return cb(err); // Handle the error
            }
            const filenam = name.toString("hex") + path.extname(file.originalname); // Create a unique filename
            cb(null, filenam); // Call the callback with the new filename
        });
    }
});

const upload = multer({ storage: storage });
module.exports = upload;