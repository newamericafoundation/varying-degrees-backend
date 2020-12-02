var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
const path = require('path');
const dbUrl = process.env.NODE_ENV == "development" ? "mongodb://localhost:27017/higher_ed_survey" : "mongodb://test_user:test@cluster-varying-degrees-shard-00-00.pr0zd.mongodb.net:27017,cluster-varying-degrees-shard-00-01.pr0zd.mongodb.net:27017,cluster-varying-degrees-shard-00-02.pr0zd.mongodb.net:27017/heroku_5cdsjn00?ssl=true&replicaSet=atlas-bv0fyw-shard-0&authSource=admin&retryWrites=true&w=majority";
var app = express();
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(dbUrl, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api/:collection', (req, res) => {
  db.collection(req.params.collection).find().toArray(function(err, docs) {
    if (err) {
      console.log(res, err.message, "Failed to get collection");
    } else {
      res.status(200).json(docs);
    }
  });
});