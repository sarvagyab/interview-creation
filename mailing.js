const nodemailer = require('nodemailer');
const debug = require('debug')('app:mail');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {         // environment variables
        user: process.env.USER, 
        pass: process.env.PASSWORD
    }
});


async function sendMail(to){
    let mailOptions = {
        from:'fakesirsenior@gmail.com',
        to,
        subject:'Custom templates that we will be using for new applicants.',
        text:'Custom templates that we will be using for new applicants.'
    }
    debug(mailOptions);
    try{
        const result = await transporter.sendMail(mailOptions);
        return "Check your mail";
    }catch(err){
        debug("transporter failed to send mail");
        throw err;
    }
}

module.exports = sendMail;
