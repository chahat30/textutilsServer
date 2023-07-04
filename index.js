const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(fileUpload({}))

app.use('/', require('./routes/home'))

app.listen(3001, function(){
   console.log('Server Started!');
})