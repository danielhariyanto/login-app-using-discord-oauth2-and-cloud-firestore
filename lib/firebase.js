var admin = require("firebase-admin");
//var serviceAccount = require("./config_secret/firebase_secret.json");
var serviceAccount = {
  "type": process.env.type ? JSON.parse(process.env.type) : undefined,
  "project_id": process.env.project_id ? JSON.parse(process.env.project_id) : undefined,
  "private_key_id": process.env.private_key_id ? JSON.parse(process.env.private_key_id) : undefined,
  "private_key": process.env.private_key ? JSON.parse(process.env.private_key) : undefined,
  "client_email": process.env.client_email ? JSON.parse(process.env.client_email) : undefined,
  "client_id": process.env.client_id ? JSON.parse(process.env.client_id) : undefined,
  "auth_uri": process.env.auth_uri ? JSON.parse(process.env.auth_uri) : undefined,
  "token_uri": process.env.token_uri ? JSON.parse(process.env.token_uri) : undefined,
  "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url ? JSON.parse(process.env.auth_provider_x509_cert_url) : undefined,
  "client_x509_cert_url": process.env.client_x509_cert_url ? JSON.parse(process.env.client_x509_cert_url) : undefined
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
