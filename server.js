const express = require("express");
require("dotenv").config();
const ejs = require("ejs");
const expressEjsLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const indexRouter = require("./routes/indexRouter");
const apiRouter = require("./routes/apiRouter");
const protectRouter = require("./routes/protectRouter")

const protect = require("./controller/protect")

const app = express();

// settings to serve static files
app.use(express.static("public"))

// 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

// setting for the view engine
app.set("views", "view");
app.set("view engine", "ejs");
app.use(expressEjsLayouts);


// using all routes
app.use("/", indexRouter);
app.use("/api", apiRouter);

// protected routes
app.use("/protected", protect.protect, protectRouter)

// starting the app
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server started...on port ${PORT}`);
})

// connecting to mongodb

// setting up the connection string 
let connection_string;
connection_string = "mongodb://localhost:27017/jwt-authenticate-autherisation";

mongoose.connect(connection_string, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected to database"))
    .catch((error) => console.log(error))