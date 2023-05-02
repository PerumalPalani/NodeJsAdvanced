var express = require('express');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var app = express();

app.use(express.json());
app.use(cors());

const mongoose = require('mongoose');
const uri = "mongodb+srv://UserName:Password@cluster0.mpjpn5c.mongodb.net/project01";

let connectdb = async () => {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MogoDB');
}
console.log(connectdb());
let db = mongoose.connection;

db.once('open', _ => {
    console.log('Connected DataBase!');
});
db.on('error', err => {
    console.log('connected', err);
});

//---Schema--
let Schema = mongoose.Schema;
let Users = new Schema({
    userName: String,
    password: String,
    role: String,
    token: Object
})
let Tokens = new Schema({
    token: Object
})

let NewUsers = mongoose.model('customer', Users);
let TokenUsers = mongoose.model('token', Tokens);

//--get user credentials--
app.get('/', async (req, res) => {
    try {
        let check = await NewUsers.find({});
        console.log(check);
        res.send(check);
    }
    catch (err) {
        res.status(500).send(err);
        console.log('error');
    }
});
//---user signup page--
app.post('/signup', async (req, res) => {
    const data = req.body;
    let check = await NewUsers.find({ userName: { $eq: data.userName } });
    console.log(check);
    let encryptPassword = await bcrypt.hash(data.password, 10);
    data.password = encryptPassword;
    if (check.length === 0) {
        try {
            let user = await NewUsers.insertMany(data);
            res.send('User credential was created!!');
            // console.log(user);
        }
        catch (err) {
            res.status(500).send(err);
            console.log(err);
        }
    } else {
        res.status(500).send('User name already exists, Please try valid username');
    }
});

app.post('/login', async (req, res) => {
    let { userName, password } = req.body;
    let check = await NewUsers.findOne({ userName: userName });
    console.log(check);
    if (check && (await bcrypt.compare(password, check.password))) {
        try {
            //---already user was login that token was deleting--
            let tokenList = await TokenUsers.find({ token: { $ne: '' } });
            console.log('get list:', tokenList);
            tokenList.map(async(e) => {
                let decode01 = jwt.verify(e.token, "secret");
                console.log('decoded list', decode01);
                if (decode01._id == check._id) {
                    let del = await TokenUsers.deleteOne({ token: { $eq: e.token } });
                    console.log(del);
                }
            })
            //---creating new token
            let ver = jwt.sign({ _id: check._id }, "secret", { expiresIn: '2h', });
            console.log(ver);
            let obj = { token: ver }
            let mainToken = await TokenUsers.insertMany(obj);
            console.log("token was stored");
            console.log(mainToken);
            res.send(mainToken);
        }
        catch (err) {
            res.status(500).send(err);
            console.log(err);
        }
    }
    else {
        res.status(404).send('Please enter valid user name and password or New user first Signup');
        console.log('please signup or corrcet your auth');
    }
});
//---On collecting user details--
app.get('/logout/:user', async (req, res) => {
    let data = req.params.user;
    console.log('it is get:', data);
    let decode = jwt.verify(data, "secret");
    console.log(decode);
    let check = await NewUsers.find({ _id: { $eq: decode._id } })
    console.log(check, 'it is get');
    if (check.length !== 0) {
        const obj = { userName: check[0].userName, role: check[0].role };
        console.log(obj);
        res.send(obj);
    }
    else {
        res.status(404).send('error')
    }
})


//---On logout button--
app.put('/logout/:user', async (req, res) => {
    let data = req.params.user;
    console.log(data);
    let decode = jwt.verify(data, "secret");
    console.log(decode);
    if (decode) {
        try {
            let del = await TokenUsers.deleteMany({ token: { $eq: data } });
            res.send(decode);
            console.log(decode);
        }
        catch (err) {
            res.status(500).send(err);
            console.log(err);
        }
    }
    else {
        res.status(404).send('Not valid data');
    }
})


app.listen(3054, () => {
    console.log('Server it is running!!!');
})