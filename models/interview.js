const mongoose = require('../db');

const interviewSchema = new mongoose.Schema({
    candidate:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    interviewer:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin',
        required:true    
    }],
    startTime: {
        type:Date,
        required:true
    },
    endTime: {
        type:Date,
        required:true
    }
});

const Interview = mongoose.model('Interview',interviewSchema);

module.exports.interviewSchema = interviewSchema;
module.exports.Interview = Interview;
