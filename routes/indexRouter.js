const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
    res.render("index");
})
router.get("/login", (req, res, next) => {
    res.render("login");
})
router.get("/signUp", (req, res, next) => {
    res.render("signUp");
})


module.exports = router;