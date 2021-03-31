const express = require("express");
const router = express.Router();
const { compareAsc, format, formatDistanceToNow, } = require("date-fns");
const { zhCN } = require('date-fns/locale');

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
  <h1>starting Time ${String(new Date(startingTime)).substr(0, 24)}</h1> 
  <h1>passing Sec ${(passingTime1 / 1000).toFixed(0)}</h1> 
  <h1>running Time ${passingTime2}</h1> 

  <h2>io.engine.clientCount ${io.engine.clientsCount}</h2> 
  <h2>hello time is ${router.helloTime && format(router.helloTime, "HH:mm:ss", { locale: zhCN })}  updated times ${router.counter}</h2> 
  <h2>backhello time is ${ router.backHello && format(router.backHello, "HH:mm:ss", { locale: zhCN })}  updated times ${router.backHelloCounter}</h2> 

  <h2>${allConnectedId}</h2>  

<br /> <br />
  <h2>${allId}</h2>  
  `)

})


router.get("/noti",function(req,res,next){

  const message = {
    to: "ExponentPushToken[zf2BMVFHoITD_0URzleD9a]",
    sound: 'default',
    title: 'Original Title',
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

  res.send("noti")
})

router.get("/send/:msg", function (req, res, next) {

  socketArr.forEach(function (socket) {
    socket.emit("ChannelOneClient", req.params.msg)
  })
  res.send("ok")
})

router.get("/hello", function (req, res, ) {

  console.log("task hello", new Date())
  router.backHello = new Date()
  router.backHelloCounter++
  res.send("task hello from server")
})



module.exports = router;