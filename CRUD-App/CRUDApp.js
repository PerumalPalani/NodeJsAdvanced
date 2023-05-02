var express = require('express');
var app = express();
var fs = require('fs');
var cors = require('cors');

//---Decoding--
app.use(express.json());
app.use(cors());

//--Db connections

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://username:password@cluster0.mpjpn5c.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log(collection);

  // perform actions on the collection object
  client.close();
},res=>{
    console.log('Connected');
});


//---getting data--
app.get('/users', (req, res) => {
    fs.readFile('data.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error Retriving the data by users!!');
        }
        else {
            res.send(data);
            console.log(data);
        }
    });
});

//--check whether user alreadyexist--
app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    fs.readFile('data.json', 'utf-8', (err, data) => {
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
    });
});

//---create new user--
app.post('/users', (req, res) => {
    const user = req.body;
    console.log(user);
    fs.readFile('data.json', 'utf-8', (err, data)=>{
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
    });
});

//---Updating existing users---
app.put('/users/:id', (req, res)=>{
    const id = req.params.id;
    const user = req.body;
    fs.readFile('data.json', 'utf-8', (err, data)=>{
        if(err){
            console.log(err);
            res.status(500).send('Error for updating the data!!');
        }
        else{
            const users = JSON.parse(data);
            const check = users.findIndex((e)=> e.id === parseInt(id));
            if(check === -1){
                res.status(500).send('User was not found!!');
            }
            else{
                users[check] = {...users[check], ...user};
                fs.writeFile('data.json', JSON.stringify(users), (err)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send('Error for updating the data by storing!!');
                    }
                    else{
                        res.send(users[check]);
                    }
                });
            }
        }
    });
});

//---Deleting the data---
app.delete('/users/:id', (req, res)=>{
    const id = req.params.id;
    fs.readFile('data.json', 'utf-8', (err, data)=>{
        if(err){
            console.log(err);
            res.status(500).send('Error for deleting the data!!!');
        }
        else{
            const users = JSON.parse(data);
            const check = users.findIndex((e)=>e.id === parseInt(id));
            if(check === -1){
                res.status(500).send('Error for not found by the user!!!');
            }
            else{
                const delUser = users.splice(check, 1);
                fs.writeFile('data.json', JSON.stringify(users), (err)=>{
                    if(err){
                        console.log(err);
                        res.status(500).send('Error for deleting the data!!!');
                    }
                    else{
                        res.send(delUser[0]);
                    }
                });
            }
        }
    });
});

//---creating server port--
app.listen(3052);
console.log('Server it is running 3052....');