const express = require("express");
const userModel = require("../model/userModel")
const mongoose = require("mongoose");
const jsonWebToken = require("jsonwebtoken");
require("dotenv").config();

const { promisify } = require("util")

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

    res.status(200).render("message", {
        message: newUser
    })


    // res.status(200).json({
    //     status: 'success',
    //     token,
    //     data: {
    //         user: newUser
    //     }
    // })


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


apiRouter.get("/checkLogin", async (req, res, next) => {
    // check if we have token

    console.log(req.cookies)

    let token;
    if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) {
        res.json({
            message: "you are not logged in"
        })
        return
    }

    // if token is there then verify that

    const decodedToken = await promisify(jsonWebToken.verify)(token, process.env.SECRET)

    console.log(decodedToken)
    // check if we have this user

    const user = await userModel.findById(decodedToken.id)

    console.log(user)

    if (!user) {
        res.json({
            message: "you are not even signed in dude"
        })
    }

    // check if the user changed password after the token was issued
    if (user.isPasswordChangedAt(decodedToken.iat)) {
        res.json({
            message: "password for this user is changed"
        })
        return
    }

    // every thing is right and the user is logged in

    res.json({
        message: `hello ${user.name}, you are logged in`
    })


})






apiRouter.get("/logOut", (req, res, next) => {
    res.cookie("jwt", "logged Out", {
        expires: new Date(Date.now() + 100)
    })

    res.json({
        message: "you are logged out"
    })
})




module.exports = apiRouter;