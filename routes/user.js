const express = require("express");
const router = express.Router();
const debug = require("debug")("app:users");
const { User } = require("../models/user");

let added = "";

router.get("/", (req, res) => {
    debug("i am called here");
    res.render("newUser", { error: added });
    added = "";
});

router.post("/",async (req, res) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        added = 'No files were uploaded.';
        return res.redirect("/user/");
    }
    // debug(req.files);
    try {
        const resumeID = await fileUpload(req);
        debug("ID IS = ",resumeID);
        const newUser = new User({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            resumeID: resumeID
        });
        const result = await newUser.save();
        debug("new object - ",result);
        added = "User Added to the database";
        debug(added);
    } catch (err) {
        debug("caught - ",err.message);
        added = err.message;
    }
    return res.redirect("/user");
});


async function fileUpload(req){
    const Resume = req.files.resumeC;
    const path = __dirname + "/../data/resumes/" + Resume.md5;
    debug('file uploaded');
    try{
        const result = await Resume.mv(path);
        debug('upload successful');
        return Resume.md5;
    }catch(err){
        debug('could not move file');
        debug(err);
        throw err;
    }            
}

module.exports = router;
