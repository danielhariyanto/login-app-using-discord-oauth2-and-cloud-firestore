const express = require("express");
let session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
//const { sessionSecret } = require("./lib/config_secret/session_secret.json");

// express app setup
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.sessionSecret ? JSON.parse(process.env.sessionSecret) : undefined,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 }, // aka one day
    resave: false
}));
app.use(cookieParser());


// placeholder login & success page
app.get("/", (req, res) => {
    session = req.session;
    if (session.username) {
        console.log(session.username);
        res.status(200).sendFile(path.join(__dirname, "success.html"));
    } else {
        res.status(200).sendFile(path.join(__dirname, "login.html"));
    }
});


app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});


const port = process.env.PORT || 3000
app.listen(port, (req, res) => {
    console.info(`Running on ${port}`);
});


// use https://medium.com/@ritik.gupta2018/firebase-storage-and-firestore-with-node-js-for-absolute-beginners-7072f4c1a0f5 as reference
app.use('/api/discord', require('./lib/login'));
app.use((err, req, res, next) => {
    switch (err.message) {
      case 'NoCodeProvided':
        return res.status(400).send({
          status: 'ERROR',
          error: err.message,
        });
      default:
        return res.status(500).send({
          status: 'ERROR',
          error: err.message,
        });
    }
  });
