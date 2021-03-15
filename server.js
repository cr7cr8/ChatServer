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

app.get("/", (req, res) => { res.send("<h2>" + new Date() + "</h2>") })


const server = app.listen(process.env.PORT || 80)


const io = socketIO(server)
let socketArr = [];
let offlineMessageArr = [];

setInterval(function () {
  socketArr = socketArr.filter(socket => socket.connected)
  info.socketArr = socketArr
  info.io = io
  user.socketArr = socketArr
  user.io = io

}, 3600 * 1000);
info.socketArr = socketArr
info.io = io
user.socketArr = socketArr
user.io = io






io.use(
  function (socket, next) {

    socket.userName = socket.handshake.auth.userName
    socket.token = socket.handshake.auth.token
    socket.createdTime = Date.now()


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


  socket.on("test", function (buf) {
    //   console.log("server ttttt",Object.keys(obj))
    console.log(buf)
    console.log("xx")
    //     var imgArray = new Uint8Array(buf);
    //     console.log(imgArray.length)


    // socket.emit("clientBuffer",{buffer:obj.buffer})
  })




  socket.on("getOfflineMessage", function () {
    const list = checkOfflineMessage(socket.userName)
    list.forEach(msg => {
      console.log("who said is", msg.whoSaid, "toPerson is", msg.toPerson, "socket UserName is", socket.userName)
      socket.emit("receiveMessage", msg.whoSaid, msg)
    })

  })


  socket.on("getAllUsers", () => {

    User.find({}).then(docs => {
      return docs.map((item) => {

        const userSock = socketArr.find(userSock => {
          return (userSock.userName === item.userName) && (userSock.connected)
        })
        return { userName: item.userName, key: item._id, isOnline: Boolean(userSock) }

      })
    }).then(arr => {





      User.findOne({ userName: socket.userName }).then(({ friendsList }) => {
        //  console.log(friendsList)

        const arr_ = []
        friendsList.forEach((friend) => {
          arr.forEach(people => {
            if (people.userName === friend) {
              arr_.push(people)
            }
          })
        });

        arr.forEach(people => {
          if (!friendsList.includes(people.userName)) {
            arr_.push(people)
          }
        })


        io.to(socket.userName).emit("receiveUsers", arr_)



      })



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

  socket.on("updateAvatar", function (data) {

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




