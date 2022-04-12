const express = require("express");
//const { clientId, clientSecret, port } = require("./config_secret/discord_secret.json");
const fetch = require('node-fetch');
const axios = require('axios')
const btoa = require('btoa');
const admin = require("./firebase");
let session = require("express-session");

const router = express.Router();

const CLIENT_ID = process.env.clientId ? JSON.parse(process.env.clientId) : undefined;
const CLIENT_SECRET = process.env.clientSecret ? JSON.parse(process.env.clientSecret) : undefined;
const redirect = encodeURIComponent("https://discord-login-app.herokuapp.com/api/discord/callback");

// async/await error catcher
const catchAsync = fn => (
  (req, res, next) => {
      const routePromise = fn(req, res, next);
      if (routePromise.catch) {
          routePromise.catch(err => next(err));
      }
  }
);

router.get("/login", (req, res) => {
  res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
});

router.get('/callback', catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error('NoCodeProvided');
  const code = req.query.code;
  const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const data = {
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "grant_type": "authorization_code",
    "code": code,
    "scope": "identify"
  }
  const params = _encode(data)
  const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
  const json = await response.json();
  const username = await getDiscordUserInfo(json.access_token);

  logInUser(req, res, username);
}));


function _encode(obj) {
  let string = "";

  for (const [key, value] of Object.entries(obj)) {
    if (!value) continue;
    string += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }

  return string.substring(1);
}


async function getDiscordUserInfo(token) {
  const response = await axios.get("https://discordapp.com/api/users/@me",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  const username = response.data.username + "#" + response.data.discriminator;
  return username;
};


async function logInUser(req, res, username) {
  let db = admin.firestore();

  // if query params are incorrect
  if (typeof username === "undefined") {
    //res.send("invalid login");
    res.redirect('/');
  }
  const existingUserRef = db.collection('users').doc(username);
  const existingUser = await existingUserRef.get();

  // there's an existing user, login automatically
  if (existingUser.exists) {
    session = req.session;
    session.username = username;
    //res.send("successfully logged in");
    res.redirect('/');
  }
  // if it's a new user
  else {
    let docRef = db.collection('users').doc(username)
    await docRef.set({
      verified: true,
      curr_level: 0
      // add more fields here
    });
    session = req.session;
    session.username = username;
    //res.send("new user successfully added and is logged in");
    res.redirect('/');
  }
}


module.exports = router;
