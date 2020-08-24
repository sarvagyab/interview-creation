const express = require('express');
const router = express.Router();
const debug = require('debug')('app:interview');
const debugData = require('debug')('app:interviewData');
const debugMail = require('debug')('app:mail');

const sendMail = require('../mailing');
const { Admin } = require('../models/admin');
const { User } = require('../models/user');
const { Interview } = require('../models/interview');


let validationError = "";

router.get('/add',async (req,res)=>{
    const users = await User.find().sort({name:1}).select('name email phone');
    const admins = await Admin.find().sort({name:1}).select('name email phone');
    res.render('createInterview',{'error':validationError,'users':users,'admins':admins});
    validationError = "";
});

router.get('/listInterviews',async(req,res)=>{
    const interviews = await Interview.find()
    .populate('candidate','name email phone -_id')
    .populate('interviewer','name email phone -_id');
    res.render('listInterviews',{interviews})
});

router.post('/add',async (req,res)=>{
    debugData(req.body);
    try{
        data = preProcess(req.body);

        const valid = await validateTime(data);

        const newInterview = new Interview({
            candidate:data.users,
            interviewer:data.admins,
            startTime: data.startTime,
            endTime:data.endTime
        });
        const result = await newInterview.save();
        // debug('Successfully added new interview with mailing disabled - interview.js/router.post(/add)');
        
        debug('Successfully added new interview - without email mode');
        // debug('Successfully added new interview');
        // const verifyMail = await mailVerification(newInterview.candidate);
        validationError = "Successfully Added Interview";
    }catch(err){
        debug("An error ocurred- ",err.message);
        validationError = err.message;
    }
    res.redirect('/admin/interview/add');
});

module.exports = router;


function preProcess(data){
    if(!data.users){
        return new Error("Select one cadidate to interview");
    }
    if(!data.admins){
        throw new Error("Select at least one interviewer");
    }
    if(!Array.isArray(data.admins)){
        data.admins = [data.admins];
    }
    debugData(console.log(data.admins));
    debugData(console.log(data));

    for(let inter of data.admins){
        if(!inter){
            throw new Error("select at least one interviewer");
        }
    }
    if(!data.startDate)throw new Error("select start date for the interview");
    if(!data.startTime)throw new Error("select start time for the interview");
    if(!data.endDate)throw new Error("select end date for the interview");
    if(!data.endTime)throw new Error("select end time for the interview");

    data.startTime = new Date(data.startDate + ' ' + data.startTime);
    data.endTime = new Date(data.endDate + ' ' + data.endTime);
    debugData("preprocessing passed");
    return data;
}


async function validateTime(data){
    if((data.startTime>data.endTime)){
        throw new Error("Enter valid Start Times and End times ");
    }
    if(data.startTime<(new Date())){
        throw new Error("Invalid start date - Less than today");
    }
    let rows = await Interview.find({candidate:data.users}).select('startTime endTime -_id');
    for(x in rows){
        x = rows[x];
        if(!(x.startTime>data.endTime || x.endTime<data.startTime))throw new Error("Candidate already scheduled for interview at that time");
    }
    debug("Valid time!!");
    return true;
}


async function mailVerification(candidateId){
    try{
        const email = await User.find({_id:candidateId}).select('email -_id');
        console.log(email);
        await sendMail(email);
        debug("mail sent successfully");
    }catch(err){
        debugMail("could not send mail - ",err);
        throw err;
    }
}