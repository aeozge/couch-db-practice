const fs = require("fs");
const https = require("https");

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const NodeCouchDb = require("node-couchdb");
const path = require("path");

// Global Vars
app.use(function (req, res, next) {
  res.locals.errors = null;
  next();
});

//support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to CouchDB
const couchExternal = new NodeCouchDb({
  auth: {
    user: "admin",
    password: "passw0rd",
  },
});

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// List all databases to console
couchExternal.listDatabases().then(function (dbs) {
  console.log("databases : ", dbs);
});

//database name
const dbName = "allcoffee";

//all is the name of the MapReduce views
const viewUrl2 = "/_all_docs?include_docs=true";

//WEB ROUTES

//INDEX root website/SHOW
app.get("/", function (req, res) {
  couchExternal.get(dbName, viewUrl2).then(
    function (data, headers, status) {
      res.render("index", {
        allcoffee: data.data.rows,
      });
    },
    function (err) {
      res.send(err);
    }
  );
});

//STORE Coffee
app.post("/coffee/add", function (req, res) {
  couchExternal.get(dbName, viewUrl2).then(
    function (data, headers, status) {
      res.render("index", {
        allcoffee: data.data.rows,
      });
    },
    function (err) {
      res.send(err);
    }
  );

  let newCoffee = {
    name: req.body.name,
    coffee_type: req.body.coffee_type,
    flavor: req.body.flavor,
  };
  couchExternal.insert(dbName, newCoffee).then(
    function (data, headers, status) {
      res.redirect("/");
    },
    function (err) {
      res.send(err);
    }
  );
});

app.listen(3000, function () {
  console.log("Server is started on Port 3000");
});
