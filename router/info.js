const express = require("express");
const router = express.Router();
const { compareAsc, format, formatDistanceToNow, utcTo } = require("date-fns");
const { zhCN } = require('date-fns/locale');
const { listTimeZones } = require('timezone-support')
const { parseFromTimeZone, formatToTimeZone } = require('date-fns-timezone')

const [{ checkConnState, getFileArray, uploadFile, downloadFile }] = require("../db/fileManager");

const fetch = require('node-fetch');

const startingTime = Date.now()
let socketArr = router.socketArr;
let io = router.io;

router.counter = 0;
router.backHelloCounter = 0;

router.use(function (req, res, next) {
  socketArr = router.socketArr.filter(function (socket) { return socket.connected });
  io = router.io;
  next()
})


router.get("/", function (req, res, next) {

  const passingTime1 = Date.now() - startingTime
  const passingTime2 = formatDistanceToNow(startingTime, { locale: zhCN, })

  let allConnectedId = `Connected sockets ${socketArr.length}<br />`;
  let allId = `All sockets ${router.socketArr.length}<br />`;


  socketArr.reverse().forEach(soc => { allConnectedId = allConnectedId + soc.id + "&nbsp;&nbsp;" + soc.userName + "&nbsp;&nbsp;" +/* soc.token + "&nbsp;&nbsp;" + */ formatDistanceToNow(soc.createdTime, { locale: zhCN, }) + "<br />" })
  socketArr.reverse()
  router.socketArr.reverse().forEach(soc => { allId = allId + soc.id + "&nbsp;&nbsp;" + soc.userName + "&nbsp;&nbsp;" + /*soc.token + "&nbsp;&nbsp;" + */ formatDistanceToNow(soc.createdTime, { locale: zhCN, }) + "<br />" })
  router.socketArr.reverse()



  res.send(`
  <h3>started on - ${formatToTimeZone(startingTime, 'YYYY.MM.DD - dddd - hh:mm:ss A', { timeZone: 'Asia/Shanghai' })} - ${passingTime2} - passing sec ${(passingTime1 / 1000).toFixed(0)}  </h3>
  <h2>io.engine.clientCount ${io.engine.clientsCount}</h2> 
  <h2>hello time is ${formatToTimeZone(router.helloTime, "HH:mm:ss", { timeZone: 'Asia/Shanghai' })}  updated times ${router.counter}</h2> 
 
  <h2>${allConnectedId}</h2>  

<br /> <br />
  <h2>${allId}</h2>  
  `)

})


router.get("/noti", function (req, res, next) {

  socketArr.forEach(socket => {
    if (!Boolean(socket.offline)) {
      const message = {
        // to: "ExponentPushToken[zf2BMVFHoITD_0URzleD9a]",
        to: socket.notiToken,
        sound: 'default',
        title: 'Testing Noti push from web',
        body: 'And here is the body!',
        data: { someData: 'goes here' },
      };

      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } 
  })




  res.json(socketArr.map(socket=>socket.id))
})



router.get("/hello", function (req, res, ) {

  console.log("task hello", new Date())
  router.backHello = new Date()
  router.backHelloCounter++
  res.send("task hello from server")
})



module.exports = router;