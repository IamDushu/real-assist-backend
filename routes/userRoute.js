const express = require("express");
const user_route = express();

user_route.set("view engine", "ejs");
user_route.set("views", "./views");
user_route.use(express.static("public"));

const userController = require("../controllers/userController");

user_route.get("/report", userController.loadReport);
// This route generates a pdf report
user_route.post("/report-generate", userController.generateReport);

module.exports = user_route;
