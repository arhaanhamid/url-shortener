require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dns2 = require("dns2");

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 3000, function () {
    console.log(`Listening on port ${process.env.PORT}`);
  });
});

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
  // check if url is correct
  const dns = new dns2();
  const result = await dns.resolveA(req.body.url);
  console.log(result.answers);
  if (result.answers.length == 0) {
    res.status(500).json({ error: "invalid url" });
  } else {
    //get documents length from database
    const dbLength = await ShortURL.countDocuments({});
    if (!dbLength && dbLength !== 0) {
      res.status(500).json({ success: false });
    } else {
      // create a new document in db using model
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
    }
  }
});

app.get("/api/shorturl/:url", function (req, res) {
  ShortURL.findOne({ short_url: req.params.url }).then((result) => {
    res.redirect(result.original_url);
  });
});
