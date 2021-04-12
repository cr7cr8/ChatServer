const express = require("express");
const router = express.Router();
const { compareAsc, format, formatDistanceToNow, utcTo } = require("date-fns");
const { zhCN } = require('date-fns/locale');
const { listTimeZones } = require('timezone-support')
const { parseFromTimeZone, formatToTimeZone } = require('date-fns-timezone');
const { authenticateToken, generateAndDispatchToken } = require('../middleware/auth');

const { User, OfflineMessage } = require("../db/schema")
const [{ }, { checkConnState, getFileArray, uploadFile, downloadFile, deleteFileById ,deleteOldFile}] = require("../db/fileManager");
const { getSmallImageArray, makeAvatar, makeBackPicture, getAvatarImageArray } = require("../db/picManager");


const fetch = require('node-fetch');






router.post("/",
  authenticateToken,
  checkConnState,
  deleteOldFile,
  getFileArray,
  getSmallImageArray,
  uploadFile,

 


  function (req, res, next) {
    //  const {whoSaid,toPerson}

    res.json("got picture")
    //console.log(req.body.obj)
    
    const { whoSaid, toPerson } = req.body.obj
    const msg = req.body.obj

    const userSock = router.socketArr.find(userSock => {
      return (userSock.userName === toPerson) && (userSock.connected) && (!Boolean(userSock.offline))
    })
    if (userSock) { userSock.emit("receiveMessage", whoSaid, msg) }
    else {

      let notiSocket = "";
      router.socketArr.forEach(sock => {
        if ((sock.userName === toPerson) && (!Boolean(sock.offline))) {

          notiSocket = sock
        }
      })


      OfflineMessage.create(msg)
     // console.log(msg)


      const message = {
        to: notiSocket.notiToken,
        sound: 'default',
        title: msg.whoSaid + " - From Server",
        body: msg.sentence,
      };

      User.findOne({ userName: toPerson }).then((user) => {

        if (user.pushNotificationOn) {
          fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          })
        }


      })



    }











  })

router.get("/:id",
  checkConnState,
  deleteOldFile,
  downloadFile,

)


module.exports = router