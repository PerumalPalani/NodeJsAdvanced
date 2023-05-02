var express = require('express');
var app = express();
// var fs = require('fs');
var cors = require('cors');

//---Decoding--
app.use(express.json());
app.use(cors());

//--DataBase connections

/* {
const { MongoClient, ServerApiVersion } = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

// var url = "mongodb+srv://perumal199601:Perumal1996@cluster0.mpjpn5c.mongodb.net/test";
var url = 'mongodb+srv://perumal199601:Perumal1996@cluster0.mpjpn5c.mongodb.net/test'
// const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

MongoClient.connect(url,function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  const collection = MongoClient.db("test").collection("devices");

  db.close();
});
} */

const mongoose = require('mongoose');
const uri = "mongodb+srv://perumal199601:password@cluster0.mpjpn5c.mongodb.net/demo";
let connectdb = async () => {
    mongoose.connect(uri, {
        useNewUrlParser: true, useUnifiedTopology: true
    });
    console.log("connected to mongo");
}
console.log(connectdb());
// connectdb()
let db = mongoose.connection;
db.once('open', _ => {
    console.log('connected db');
})
db.on('error', err => {
    console.log('connected', err);
});

//--schema--
let Schema = mongoose.Schema;
let users = new Schema({
    firstName: String,
    lastName: String,
    mobileNumber: String,
    emailId: String,
    city: String
})
let NewUsers = mongoose.model('usersData', users);

//---getting data--
app.get('/', async (req, res) => {
    /* fs.readFile('data.json', 'utf-8', (err, data) => {
       if (err) {
           console.log(err);
           res.status(500).send('Error Retriving the data by users!!');
       }
       else {
           res.send(data);
           console.log(data);
       }
   });  */
    try {
        let x = await NewUsers.find({});
        res.send(x);
        console.log(x);
    }
    catch (err) {
        res.status(500).send(err);
        console.log(err);
    }

});


//--check whether user alreadyexist--
app.get('/users/:id', async (req, res) => {
    const id = req.params.id;
    try {
        let x = await NewUsers.find({ _id: { $eq: id } });

        res.send(x);
        console.log(x);
    }
    catch (err) {
        res.status(500).send(err);
        console.log(err);
    }
    /* fs.readFile('data.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error Retriving the data by users!!');
        }
        else {
            const users = JSON.parse(data);
            const user = users.find((e) => e.id === parseInt(id));
            if (!user) {
                res.status(404).send('user not found!!!');
            }
            else {
                res.send(JSON.stringify(user));
                console.log(user);
            }
        }
    }); */
});

//---create new user--
app.post('/users', async (req, res) => {
    const user = req.body;
    // let initial = await NewUsers.find({});
    // console.log(initial.length == 0);
    let check = await NewUsers.find({ $or: [{ mobileNumber: user.mobileNumber }, { emailId: user.emailId }] });
    console.log(check);
    if (check.length === 0) {
        try {
            let a = await NewUsers.insertMany(user);
            console.log(user);
            res.send(a)
        }
        catch (err) {
            res.status(500).send(err);
            console.log(err);
        }
    }
    else {
        res.status(404).send(`Already exists your Mobile number and email ID!!!. Please enter valid or try to update already exists`);
        console.log('already exists');
    }
    /* fs.readFile('data.json', 'utf-8', (err, data)=>{
        if(err){
            console.log(err);
            res.status(500).send('Error for creating by new user');
        }
        else{
            const arr = JSON.parse(data);
            user.id = Math.floor(1+Math.random()*9000);
            arr.push(user);
            fs.writeFile('data.json', JSON.stringify(arr), (err)=>{
                if(err){
                    console.log(err);
                    res.status(500).send('Error for creating the new user!!')
                }
                else{
                    res.send(user);
                }
            });
        }
    }); */
});

//---Updating existing users---
app.put('/users/:id', async (req, res) => {
    const id = req.params.id;
    const user = req.body;
    let check = await NewUsers.find({ $or: [{ mobileNumber: user.mobileNumber }, { emailId: user.emailId }] });
    console.log(check);
    let check01 = check.map((e) => {
        /* console.log(e._id+' '+id);
        console.log(e.mobileNumber+" "+user.mobileNumber);
        console.log(e.emailId+" "+user.emailId); */
        if (e._id == id && e.mobileNumber == user.mobileNumber && e.emailId == user.emailId) {
            console.log(e._id);
            return true;
        }
        else {
            return false;
        }
    });
    console.log(check01);
    if (check01[0] !== false) {
        try {
            let u = await NewUsers.updateMany({ _id: { $eq: id } }, { $set: {firstName:user.firstName, lastName: user.lastName, city: user.city}});
            res.send(u);
            console.log(u);
        }
        catch (err) {
            res.status(500).send(err);
            console.log(err);
        }
    }
    else {
        res.status(404).send(`Please don't change your mobiler numbe and password or Please enter valid values or try to update !!`);
        console.log(`Please Don't change your Email or mobile number`);
    }
    /* fs.readFile('data.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error for updating the data!!');
        }
        else {
            const users = JSON.parse(data);
            const check = users.findIndex((e) => e.id === parseInt(id));
            if (check === -1) {
                res.status(500).send('User was not found!!');
            }
            else {
                users[check] = { ...users[check], ...user };
                fs.writeFile('data.json', JSON.stringify(users), (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send('Error for updating the data by storing!!');
                    }
                    else {
                        res.send(users[check]);
                    }
                });
            }
        }
    }); */
});

//---Deleting the data---
app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    const user = req.body;
    try {
        let d = await NewUsers.deleteMany({ _id: { $eq: id } });
        res.send(d);
        console.log(d);
    }
    catch (err) {
        res.status(500).send(err);
        console.log(err);
    }
    /* fs.readFile('data.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error for deleting the data!!!');
        }
        else {
            const users = JSON.parse(data);
            const check = users.findIndex((e) => e.id === parseInt(id));
            if (check === -1) {
                res.status(500).send('Error for not found by the user!!!');
            }
            else {
                const delUser = users.splice(check, 1);
                fs.writeFile('data.json', JSON.stringify(users), (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send('Error for deleting the data!!!');
                    }
                    else {
                        res.send(delUser[0]);
                    }
                });
            }
        }
    }); */
});

//---creating server port--
app.listen(3052, () => {
    console.log('Server it is running 3052....');
});