const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//package helps to parse images
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const rootDir = require("./util/path");

const app = express();

// see the classic-node-js-server-code-to-know-what-this-line-is-doing
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const random = (Math.random() + 1).toString(36).substring(7);
    callback(null, random + "-" + file.originalname);
  },
});

const myFileFilter = (req, file, callback) => {
  //to the if function and false of not
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

app.use(bodyParser.json());

// see the classic-node-js-server-code-to-know-what-this-route-is-doing
app.use(
  multer({ storage: fileStorage, fileFilter: myFileFilter }).single("image")
);

// see the classic-node-js-server-code-to-know-what-this-route-is-doing
app.use("/images", express.static(path.join(rootDir, "images")));

app.use((req, res, next) => {
  //this sets the domains that can connect to this server, "*" means any domain
  res.setHeader("Access-Control-Allow-Origin", "*");
  //this sets the http-request that are allowed in this server
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  //this allows the type of headers added here to be sent to this server,
  //since we specified, Content-Type and Authorization. we can include Content type headers
  //like => 'Content-Type': 'application/json', Authorization header is used for setting a token
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

//this is an error handling middlie-ware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  //error.message => this property exist by default and it holds the error message you passed
  //to the Error object constructor where this error was thrown, or when you pass the erroe to next(err)
  const message = error.message;
  //this error(passed by you from the express validator package) was passed by you in auth.js inthe controllers folder
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
//

mongoose
  .connect(
    "mongodb+srv://victorkudos:yPj5L429bl3BEhoT@cluster0.iogciqk.mongodb.net/messages?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(8080);
    console.log("Connected");
  })
  .catch((err) => console.log(err));
