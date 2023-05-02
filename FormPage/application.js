var express = require('express')
var multer = require('multer')
var mongoose = require('mongoose')
var path = require('path')
var bodyParser = require('body-parser')
var csv = require('csvtojson')
var policySchema = require('./models/PolModel')
var app = express();
var cors = require('cors');

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve(__dirname, 'public')))
app.use(express.json())
app.use(cors())

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})
var uploads = multer({ storage: storage })
mongoose
  .connect('mongodb+srv://<Username>:<Password>@cluster0.mpjpn5c.mongodb.net/Task01', { useNewUrlParser: true })
  .then(() => console.log('Connected'))
  .catch((err) => console.log(err))

  //--collect all info by agent name---
app.get('/:agent', async(req, res) => {
  let val = req.params.agent;
  let check = await policySchema.find({agent: {$eq: val}});
  if(check.length !==0){
    res.status(200).send(check);
  }
  else{
    res.status(500).send("Can not found the data!!");
  }
})

//--upload file and store database--
app.post('/api/upload', uploads.single('csvFile'), (req, res) => {
csv()
    .fromFile(req.file.path)
    .then((response) => {
      if(response.length !== 0){
        console.log(response)
        let a = response.map(async(e)=>{
          let val = await policySchema.insertMany(e);
          console.log(val);
        })
        res.status(200).send(a)
      }
      else{
        res.status(500).send('File data can not fetch!!')
      }      
    })
})

//---Creating the new Policy--
app.post('/api/create', async(req, res)=>{
  let val = req.body;
  let check = await policySchema.find({$and:[{account_name: {$eq: val.account_name}}, {email: {$eq: val.email}}, {firstname: {$eq: val.firstname}}, {phone: {$eq: val.phone}}]});
  if(check.length === 0){
    for(let a = 0; a<= 20; a++){
      let policy = generatePolicy(12);
      let validate = await policySchema.find({policy_number: {$eq: policy}});
      if(validate.length === 0){
        val.policy_number = policy; 
        break;
      }
    }
    let add = await policySchema.insertMany(val);
    console.log(add);
    res.status(200);
    // res.send(add);
  }
  res.status(500).send('You have existing account!!');
})


//---Read existing data--
app.get('/api/read/:policy', async(req, res)=>{
  let policy = req.params.policy;
  let check = await policySchema.find({policy_number: {$eq: policy}});
  if(check.length !== 0 ){
    console.log(check);
    res.status(200).send(check);
  }else{
    res.status(500).send("Can not find your Policy Number!!");
  }
})

//---update existing data--
app.put('/api/update/:policy', async(req, res)=>{
  let policy = req.params.policy;
  let obj = req.body;
  let check = await policySchema.find({policy_number: {$eq: policy}});
  if(check.length !== 0 ){
    let update = await policySchema.updateMany({policy_number: {$eq: policy}}, {$set:{...obj}});
    console.log(check);
    res.status(200).send(update);
  }else{
    res.status(500).send("Can not find your Policy Number!!");
  }
})

//---Deleting the data--
app.post('/api/delete/:policy', async(req, res)=>{
  let policy = req.params.policy;
  let check = await policySchema.find({policy_number: {$eq: policy}});
  if(check.length !== 0 ){
    let del = await policySchema.deleteMany({policy_number: {$eq: policy}});
    console.log(check);
    res.status(200).send(del);
  }else{
    res.status(500).send("Can not find your Policy Number!!");
  }
})

//---creating the policy number randomly--
function generatePolicy(length){
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charLength = char.length;
  for(let i = 0; i<length; i++){
      result += char.charAt(Math.floor(Math.random() * charLength));
  }
  console.log(result);
  return result;
}

var port = process.env.PORT || 5556
app.listen(port, () => console.log('App connected on: ' + port))