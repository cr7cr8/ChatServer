const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const { User } = require("../db/schema")
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth')


const [{ checkConnState, getFileArray, uploadFile, deleteFileByUserName, downloadFile }] = require("../db/fileManager");
const { getSmallImageArray, makeAvatar, makeBackPicture, getAvatarImageArray } = require("../db/picManager");


router.post("/login", (req, res, next) => {

    //console.log(req.body)

    User.findOne({ userName: req.body.userName })
        .then(user => {

            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    next()
                }
                else {
                    console.log("wrong password")
                    res.status(400).json("wrong password")
                }
            }
            else {
                res.status(401).json("no such user")
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err)
        })

}, generateAndDispatchToken)


router.post("/register", (req, res, next) => {

    try {

        User.create({ ...req.body, password: bcrypt.hashSync(req.body.password) })
            .then(doc => {
                next()
            })
            .catch(err => {
                if (err.code === 11000) {
                    console.log(err);
                    res.status(403).json("userName already exist")
                }
                else {
                    console.log(err.message);
                    res.status(500).json("failed to create User in DB")
                }
            })
    }
    catch (err) {
        console.log(err)
        res.status(500).json("failed to create in Server")
    }


}, makeAvatar, uploadFile, generateAndDispatchToken)


router.get("/avatar/:username/:rand", downloadFile)



router.post("/postpic", authenticateToken, checkConnState, getFileArray, getAvatarImageArray, deleteFileByUserName, uploadFile,
    function (req, res, next) {

        // console.log(req.body.obj, req.user)

        res.json(req.user.userName + ".png is uploaded")
    })







module.exports = router