const express = require('express');
const router = express.Router();
const url = require('url');
const debug = require('debug')('app:admins')
const { Admin } = require('../models/admin');
const { User } = require('../models/user');
const { Interview } = require('../models/interview');
let added = "";

router.get('/listUsers',async(req,res)=>{
    try{
        const list = await User.find().sort({name:1});
        const resumeDir = url.pathToFileURL((__dirname + "/../data/resumes/")).href;
        res.render('listUsers',{list,resumeDir:resumeDir});
    }catch(err){
        debug('Could not fetch Users list');
        debug(err);
        return res.status(500).send(err);
    }
});


router.get('/listAdmins',async(req,res)=>{
    try{
        const list = await Admin.find().sort({name:1});
        res.render('listAdmins',{list});
    }catch(err){
        debug('Could not fetch Admins list');
        debug(err);
        return res.status(500).send(err);
    }
});



router.get('/new',async(req,res)=>{
    res.render('newAdmin',{'error':added});
    added = "";
});


router.get('/',async(req,res)=>{
    res.render('welcome');
});

router.get('/*',(req,res)=>{
    res.redirect('/admin/');
});


router.post('/new',async(req,res)=>{
    console.log(req.body);
    const newAdmin = new Admin({
        name:req.body.name,
        phone:req.body.phone,
        email:req.body.email
    });
    try{
        const result = await newAdmin.save();
        added = "Admin added to the Database"
    }catch(err){
        debug(err.message);
        added = err.message;
    }
    return res.redirect('/admin/new/');
});

module.exports = router;