const mongoose = require('mongoose');
const debug = require('debug')('app:dbConnection');

mongoose.connect('mongodb://localhost:27017/interviewCreation',{useNewUrlParser: true,useUnifiedTopology:true}) //authentication and environment variable to be used
    .then(()=>debug("connected to interviewCreation Database"))
    .catch(err=>debug('could not connect to interviewCreation database',err));

module.exports = mongoose;