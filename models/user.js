const mongoose = require('../db');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength: 3
    },
    email:{
        type:String,
        required:true,
        validate:{
            validator:function(v){
                const email = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                return email.test(v);
            },
            message: 'invalid email address provided'
        }
    },
    phone:{
        type:String,
        validate:{
            validator:function(v){
                return (v&&v.length===10);
            },
            message: 'The no of should have exactly 10 digits'
        }
    },
    resumeID:{
        type:String,
        required:true
    }
});

const User = mongoose.model('User',userSchema);

module.exports.userSchema = userSchema;
module.exports.User = User;
