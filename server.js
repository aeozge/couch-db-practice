"use strict";
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const NodeCouchDb = require("node-couchdb");
const path = require("path");
const { check, validationResult } = require("express-validator");

// Global Vars
app.use(function (req, res, next) {
  res.locals.errors = null;
  next();
});

//support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

const methodOverride = require("method-override");
app.use(methodOverride("_method", { methods: ["POST", "GET"] }));
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

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
const viewUrl = "/_all_docs?include_docs=true";

//WEB ROUTES
//GET ALL Coffee
app.get("/", function (req, res) {
  couchExternal.get(dbName, viewUrl).then(
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
app.post(
  "/coffee/add",
  [
    check("name").not().isEmpty().withMessage("Name is a required field."),
    check("coffee_type").not().isEmpty().withMessage("Need to choose Coffee Type"),
    check("flavor")
      .not()
      .isEmpty()
      .withMessage("Flavor is a required field."),
  ],
  function (req, res) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      couchExternal.get(dbName, viewUrl).then(
        function (data, headers, status) {
          res.render("index", {
            allcoffee: data.data.rows,
            errors: errors.array(),
          });
        },
        function (err) {
          res.send(err);
        }
      );
    } else {
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
    }
  }
);

//DELETE Coffee
app.delete("/coffee/delete/:_id", function (req, res) {
  couchExternal.del(dbName, req.params._id, req.body.rev).then(
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
