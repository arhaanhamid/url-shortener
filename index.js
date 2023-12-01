require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

console.log("mongodb is starting");
mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 3000, function () {
    console.log(`Listening on port ${process.env.PORT}`);
  });
});
console.log("mongodb maybe started");

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});

const ShortURL = mongoose.model("ShortURL", urlSchema);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
  const dbLength = await ShortURL.countDocuments({});
  if (!dbLength) {
    res.status(500).json({ success: false });
  }
  // res.send({
  //   dbLength: dbLength
  // });

  // const k = ShortURL.find({}).then((count) => {
  //   console.log(count);
  //   console.log(count.length);
  //   dbLength = count.length;
  // });
  console.log(dbLength);

  const url = new ShortURL({
    original_url: req.body.url,
    short_url: dbLength + 1,
  });
  url
    .save()
    .then((result) => {
      // done(null, result);
    })
    .catch((error) => {
      console.error(error);
    });

  res.json({ original_url: req.body.url, short_url: dbLength + 1 });
});

app.get("/api/shorturl/:url", function (req, res) {
  ShortURL.findOne({ short_url: req.params.url }).then((result) => {
    res.redirect(result.original_url);
  });
});
