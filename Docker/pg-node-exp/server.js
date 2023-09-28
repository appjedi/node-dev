const express = require("express");
const pool = require('./db');
const PORT = 3000;

const app = express();

app.get("/", (req, res) => {
    res.send("hello from node/express on docker");
})

app.listen(PORT, () => {
  console.log("listening on port:", port);
})