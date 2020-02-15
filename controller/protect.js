const express = require("express");
const userModel = require("../model/userModel")
const mongoose = require("mongoose");
const jsonWebToken = require("jsonwebtoken");
require("dotenv").config();

const { promisify } = require("util")

exports.protect = async (req, res, next) => {
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

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
}