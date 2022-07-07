const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const NodeCouchdb = require("node-couchdb");

const couch = new NodeCouchdb({
  auth: {
    user: "admin",
    password: "passw0rd",
  },
});

couch.listDatabases().then(function (dbs) {
  console.log('databases : ',dbs);
});

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", function (req, res) {
  //res.send("Working........");
  res.render('index')
});
app.listen(3000, function () {
  console.log("Server is started on Port 3000");
});
