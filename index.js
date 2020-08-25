const debug = require('debug')('app:startup');
const express = require('express');
const app = express();
const mongoose = require('./db');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 *1024 },
    createParentPath:true
}));

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(expressLayouts);
app.use(express.static(__dirname + '/static'));

const user = require('./routes/user');
const admin = require('./routes/admin');
const interview = require('./routes/interview');


app.use('/user',user);
app.use('/admin/interview',interview);
app.use('/admin',admin);


app.get('/*',(req,res)=>{
    res.redirect('/user');
})

const port = process.env.PORT || 5000 ;
app.listen(port,()=>{
    debug(`Listening on port ${port}`);
    console.log(`Listening on port ${port}`)
});
