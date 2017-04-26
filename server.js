var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
const path = require('path');
const dbUrl = process.env.NODE_ENV == "development" ? "mongodb://localhost:27017/higher_ed_survey" : "mongodb://heroku_2l5qrfnd:bm3ve3469v2or4vpb1c2ajq0rm@ds151909.mlab.com:51909/heroku_2l5qrfnd";
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
      handleError(res, err.message, "Failed to get collection");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get('/api/institution-list', (req, res) => {
  db.collection('inst_combined').find({}, { name: 1, path: 1 }).toArray(function(err, docs) {
    docs.sort(sortAlpha);
    if (err) {
      handleError(res, err.message, "Failed to get institutions.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get('/api/state/:path', (req, res) => {
  db.collection('states_combined').findOne({path:req.params.path}, function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get institutions.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.get('/api/institution/:path', (req, res) => {
  db.collection('inst_combined').findOne({path:req.params.path}, function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get institutions.");
    } else {
      res.status(200).json(docs);
    }
  });
});

// app.get('/api/states/:type', (req, res) => {
//   db.collection('fake_states').find({}).toArray(function(err, docs) {
//     console.log(docs);
//     if (err) {
//       handleError(res, err.message, "Failed to get");
//     } else {
//       res.status(200).json(docs);
//     }
//   });
// });

// app.get('/api/data-download/:collection/:type', (req, res) => {
//   const { collection, type } = req.params;
//   let whichField = {};
//   whichField[type] = 1;
//   console.log(whichField);
//   console.log(collection, type);

//   console.log(req.params.collection);
//   db.collection('higher-ed-survey').find({}, whichField).toArray(function(err, docs) {
//     docs = docs.map((d) => {
//       return d[type][0];
//     })
//     // docs.sort(sortAlpha);
//     if (err) {
//       handleError(res, err.message, "Failed to get");
//     } else {
//       res.status(200).json(docs);
//     }
//   });
// });
