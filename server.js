const express = require("express")
const app = express()
const cors = require("cors");
const socketIO = require("socket.io")
const { compareAsc, format, formatDistanceToNow, } = require("date-fns");
const { zhCN } = require('date-fns/locale');


const user = require("./router/user")
const { User } = require("./db/schema")


const info = require("./router/info")

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/user", user)
app.use("/info", info)

/////////////////////////////////////////////////////////

// var fs = require('fs');
// var text2png = require('text2png');
// fs.writeFileSync('out.png', text2png('ds好!', {color: 'blue'}));



const server = app.listen(80)


const io = socketIO(server)
let socketArr = [];
let offlineMessageArr = [];

setInterval(function () {
  socketArr = socketArr.filter(socket => socket.connected)
  info.socketArr = socketArr
}, 3600 * 1000);
info.socketArr = socketArr
info.io = io







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

function getUserSocketByName(name) {
  const userSock = socketArr.find(userSock => {
    return (userSock.userName === name) && (userSock.connected)
  })
  return userSock
}

function checkOfflineMessage(name) {
  const list = [];
  offlineMessageArr = offlineMessageArr.filter(msg => {
    if (msg.toPerson === name) {
    //  console.log(msg)
      list.push(msg)
    }
    else {
      return msg
    }
  })
  return list
}


io.on("connection", function (socket) {

  socket.emit("toClient", "socket " + socket.id + " is established on server")
  socket.join(socket.userName)



  socket.on("getOfflineMessage", function () {
    const list = checkOfflineMessage(socket.userName)
    list.forEach(msg => {
      console.log("who said is", msg.whoSaid, "toPerson is", msg.toPerson,"socket UserName is", socket.userName)
      socket.emit("receiveMessage", msg.whoSaid, msg)
    })

  })


  socket.on("getAllUsers", () => {

    User.find().find().then(docs => {

      const arr = docs.map((item) => {

        const userSock = socketArr.find(userSock => {
          return (userSock.userName === item.userName) && (userSock.connected)
        })
        return { userName: item.userName, key: item._id, isOnline: Boolean(userSock) }

      })

      io.to(socket.userName).emit("receiveUsers", arr)

    })
  })

  socket.on("toAnother", function (toPerson, msg) {

   // if (toPerson === socket.userName) { return }
    const userSock = socketArr.find(userSock => {
      return (userSock.userName === toPerson) && (userSock.connected)
    })
    if (userSock) { userSock.emit("receiveMessage", socket.userName, msg) }
    else {
     // console.log(msg)
      offlineMessageArr.push(msg)
    }

    //io.to(toPerson).emit("receiveMessage", socket.userName, msg)
  })

  socket.on("updateAvatar",function(data){

    console.log(data.length)
  //  console.log(Object.keys(data))
    // console.log("inside receiver");
    // const buffer = Buffer.from(img);
    // console.log(buffer.length[1])
    // var base64Str = img;
    // var buff = new Buffer(base64Str ,"base64");

  })




  socket.on("disconnecting", function (reason) {
    // socket.leave(socket.userName) done automatically
    //console.log(socket.rooms, "---");
  })

  socket.on("disconnect", function (reason) {

  })


})




