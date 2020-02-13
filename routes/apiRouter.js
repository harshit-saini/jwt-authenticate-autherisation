const express = require("express");
const userModel = require("../model/userModel")
const mongoose = require("mongoose");
const jsonWebToken = require("jsonwebtoken");
require("dotenv").config();

const apiRouter = express.Router();


apiRouter.post("/signUp", async (req, res, next) => {
    // *********test
    // console.log(req.body);


    // create a new user
    const newUser = await userModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    })

    // create a token for the new user
    const token = jsonWebToken.sign({ id: newUser._id }, process.env.SECRET, { expiresIn: "60d" })

    // send this token as cookie to the user
    res.cookie("jwt", token, {
        expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        httpOnly: true
    })

    // now remove the password from the new user object
    newUser.password = undefined;

    // send res
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })


})

apiRouter.post("/login", async (req, res, next) => {
    console.log(req.body)

    const { email, password } = req.body

    // check if user entered both email and password
    if (!email || !password) {

        res.json({
            status: 400,
            message: "please enter email and password"
        })
        return
    }

    // check if user with this email exits
    const user = await userModel.findOne({ email }).select("+password")

    console.log(user)

    if (!user || !await user.comparePassword(password, user.password)) {
        res.json({
            message: "user or password wrong"
        })
        return
    }

    // we have the user and the password is corrrect 
    // now create and send the token

    const token = jsonWebToken.sign({ id: user._id }, process.env.SECRET, {
        expiresIn: "60d",

    })

    res.cookie("jwt", token, {
        expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),

    })

    // now remove the password from the new user object
    user.password = undefined;

    // send res
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    })


})

module.exports = apiRouter;