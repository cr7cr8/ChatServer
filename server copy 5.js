const express = require("express")
const app = express()
const cors = require("cors");
const socketIO = require("socket.io")
const { compareAsc, format, formatDistanceToNow, } = require("date-fns");
const { zhCN } = require('date-fns/locale');


const user = require("./router/user")
const info = require("./router/info")

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/user", user)
app.use("/info", info)

/////////////////////////////////////////////////////////


const server = app.listen(80)


const io = socketIO(server)
let socketArr = [];
setInterval(function () {
  socketArr = socketArr.filter(socket => socket.connected)
  info.socketArr = socketArr
}, 3600 * 1000);
info.socketArr = socketArr
info.io = io





console.log("----")

io.use(
  function (socket, next) {

    socket.userName = socket.handshake.auth.userName
    socket.token = socket.handshake.auth.token
    socket.createdTime = formatDistanceToNow(Date.now(), { locale: zhCN, })
  

    socketArr.forEach(function (socketItem) {
      if (socketItem.userName === socket.userName) { socketItem.disconnect() }
    })
    socketArr.push(socket)
    next()
  },

);


io.on("connection", function (socket) {

  
  //console.log(socket.id, socket.handshake.auth, socket.connected, socketArr.length, socket.client.conn.server.clientsCount + " users connected", io.engine.clientsCount + " engine conected");

  socket.join(socket.userName)

  socket.on("ChannelOneServer", function (msg) {
    console.log(msg)
  })

  socket.emit("ChannelOneClient","hihihihi from server")


  socket.on("disconnecting", function (reason) {

    socket.leave(socket.userName)
    //console.log("disconnecting", reason, socket.id, socket.token)
  })

  socket.on("disconnect", function (reason) {
   // console.log("disconnect", reason, socket.id, socket.token)


    // socketArr = socketArr.filter(function (socketItem) { return socket.userName !== socketItem.userName })

    // info.socketArr = socketArr

  })


})




