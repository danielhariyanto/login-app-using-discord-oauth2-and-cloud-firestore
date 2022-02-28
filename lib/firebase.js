var admin = require("firebase-admin");
//var serviceAccount = require("./config_secret/firebase_secret.json");
var serviceAccount = process.env.serviceAccount;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
