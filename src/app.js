const express = require("express");
const cors = require("cors");

const notFound = require("./errors/notFound");
const addTransaction = require("./points/points.router");
const errorHandler = require("./errors/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/points", addTransaction);

app.use(notFound);
app.use(errorHandler);

module.exports = app;