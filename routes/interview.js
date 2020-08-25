const express = require('express');
const router = express.Router();
const debug = require('debug')('app:interview');
const debugData = require('debug')('app:interviewData');
const debugMail = require('debug')('app:mail');
const debugEdit = require('debug')('app:edit');

const sendMail = require('../mailing');
const { Admin } = require('../models/admin');
const { User } = require('../models/user');
const { Interview } = require('../models/interview');
const { kStringMaxLength } = require('buffer');
const { getDefaultSettings } = require('http2');


let validationError = "";

router.get('/add',async (req,res)=>{
    let users = [], admins= [];
    try{
        users = await User.find().sort({name:1}).select('name email phone');
        admins = await Admin.find().sort({name:1}).select('name email phone');
    }catch(err){
        debug("error", err.message);
        return res.status(500).send("sorry some internal error has occured. Please try reloading or try after some time.");
    }
    
    let data = setData(new Date(),new Date());
    const id = req.query;
    console.log(id);
    try{
        if(id && id.editID){
            const inter = await Interview.find({_id:id.editID});
            if(inter.length==1){
                data = setData(inter[0].startTime,inter[0].endTime);
                data.cadiID = String(inter[0].candidate);
                data.interviewerIDs = inter[0].interviewer;
                data.interviewID = id.editID;
                data.mode = 'Update';
                data.action = "/admin/interview/add";
                data.method = "POST";
            }
        }
        debugEdit(data);
    }catch(err){
        debug("error = ",err.message);
        validationError = err.message;
    }
    res.render('createInterview',{'error':validationError,'users':users,'admins':admins,data:data});
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
        const data = preProcess(req.body);
        const valid = await validateTime(data);
        
        if(data.interviewID){
            debugEdit("Reached updating stage");
            debugEdit("ID = ",data.interviewID);
            const check = await Interview.update({_id:data.interviewID},{
                candidate:data.users,
                interviewer:data.admins,
                startTime:data.startTime,
                endTime:data.endTime
            });
            validationError = "Successfully updated the interview";
            // return res.redirect('/admin/interview/listInterviews/');
        }
        else {
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
        }
    }catch(err){
        debug("An error ocurred- ",err.message);
        validationError = err.message;
    }
    res.redirect('/admin/interview/add');
});


module.exports = router;


function setData(startDate,endDate){
    const parseDate = (year,mon,date)=>{
        year = String(year),mon = String(mon+1), date = String(date);
        return (year + '-' + (mon.length==1?('0' + mon):mon) + '-' + (date.length==1?('0'+date):date));
    }
    const parseTime = (hours,minutes)=>{
        hours = String(hours), minutes = String(minutes);
        return ((hours.length==1?('0' + hours):hours) + ':' + (minutes.length==1?('0'+minutes):minutes))
    }
    let data = {};
    data.sdate = parseDate(startDate.getFullYear(),startDate.getMonth(),startDate.getDate());
    data.edate = parseDate(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    data.stime = parseTime(startDate.getHours(),startDate.getMinutes());
    data.etime = parseTime(endDate.getHours(), endDate.getMinutes());
    data.mode = "Submit";
    data.method = "POST";
    data.action = "/admin/interview/add/";
    return data;
}


function preProcess(data){
    console.log("inside pre process");
    console.log(data);

    if(!data.users){
        throw new Error("Select one cadidate to interview");
    }
    if(!data.admins){
        throw new Error("Select at least one interviewer");
    }
    if(!Array.isArray(data.admins)){
        data.admins = [data.admins];
    }
    debugData("printing admins - ",data.admins);
    debugData("printing all of data - ",data);

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
    debugData("this is the result - ",data);
    return data;
}


async function validateTime(data){
    if((data.startTime>data.endTime)){
        throw new Error("Enter valid Start Times and End times ");
    }
    if(data.startTime<(new Date())){
        throw new Error("Invalid start date - Less than today");
    }
    let rows = [];
    if(data.interviewID)rows = await Interview.find({candidate:data.users , _id:{$ne:data.interviewID}}).select('startTime endTime -_id');
    else rows = await Interview.find({candidate:data.users}).select('startTime endTime');
    debug("all the rows - ", rows);
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