const express = require("express");

const protectRouter = express.Router();


protectRouter.get("/", (req, res, next) => {
    res.json({
        messsage: "ok"
    })
})


module.exports = protectRouter