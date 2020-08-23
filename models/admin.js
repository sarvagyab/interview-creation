const mongoose = require('../db');

const adminSchema = new mongoose.Schema({
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
            message: 'The no should have exactly 10 digits'
        }
    }
});

const Admin = mongoose.model('Admin',adminSchema);

module.exports.adminSchema = adminSchema;
module.exports.Admin = Admin;
