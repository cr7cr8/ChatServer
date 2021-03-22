const express = require("express")
const app = express()
const cors = require("cors");
const socketIO = require("socket.io")
const { compareAsc, format, formatDistanceToNow, } = require("date-fns");
const { zhCN } = require('date-fns/locale');


const user = require("./router/user")
const { User, OfflineMessage } = require("./db/schema")


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


setInterval(function () {
  socketArr = socketArr.filter(socket => socket.connected)
  info.socketArr = socketArr
  info.io = io
  user.socketArr = socketArr
  user.io = io

}, 3600 * 1000);

// setInterval(function () {
//   socketArr.forEach(socket=>{
//     if(socket.connected){
//       socket.emit("helloPacket",Date.now())
//     }
//   })
// }, 1800 * 1000);


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




io.on("connection", function (socket) {

  socket.emit("toClient", "socket " + socket.id + " is established on server")
  socket.join(socket.userName)
  console.log("socket "+socket.userName+" is connected")

  socket.on("test", function (buf) {
    //   console.log("server ttttt",Object.keys(obj))
    //console.log(buf)

    // var imgArray = new Uint8Array(buf);
    // console.log(imgArray.length)


    //  socket.emit("clientBuffer",{buffer:obj.buffer})
  })




  socket.on("getOfflineMessage", function () {
  
    OfflineMessage.find({ toPerson: socket.userName }).sort("saidTime").then(docs => {
      //  console.log(docs)
     return docs.forEach(msg => {

        //Note {...msg} !== msg
        const msg_ = {
          key: msg.key,
          saidTime: new Date(msg.saidTime).getTime(),
          whoSaid: msg.whoSaid,
          toPerson: msg.toPerson,
          sentence: msg.sentence
        }

      
        socket.emit("receiveMessage", msg.whoSaid, msg_)
      })
    }).then(
      ()=>{
        OfflineMessage.deleteMany({ toPerson: socket.userName }).exec()

      }
    ).catch(err=>console.log("error in getOfflineMessage",err))
   
  })


  socket.on("getAllUsers", () => {

    User.find({}).then(docs => {
      return docs.map((item) => {


        return {
          userName: item.userName,
          name: item.userName,
          key: item._id,


          //  isOnline: Boolean(userSock),
        }
      })
    }).then(arr => {



      // socket.emit("receiveUsers", arr)

      User.findOne({ userName: socket.userName }).then(({ friendsList }) => {
        //  console.log(friendsList)

        const arr_ = []
        friendsList.forEach((friend) => {
          arr.forEach((people, index) => {
            if (people.userName === friend.name) {
              friend.key = people.key
              arr_.push(friend)
              //  arr[index] = null
            }
          })
        });

        arr.forEach(people => {
          if (arr_.findIndex(element => { return element.userName === people.userName }) < 0) {
            arr_.push(people)
          }

        })


        // io.to(socket.userName).emit("receiveUsers", arr_)
        socket.emit("receiveUsers", arr_)


      })



    })
  })

  socket.on("toAnother", function (toPerson, msg) {


    const userSock = socketArr.find(userSock => {
      return (userSock.userName === toPerson) && (userSock.connected)
    })
    if (userSock) { userSock.emit("receiveMessage", socket.userName, msg) }
    else {


      OfflineMessage.create(msg)
      console.log(msg)
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

  socket.on("helloResponseFromClient",function(data){

    info.helloTime = new Date()
    info.counter++
    console.log(data)
  })


  socket.on("disconnecting", function (reason) {
    // socket.leave(socket.userName) done automatically
    //console.log(socket.rooms, "---");
    console.log(`socket ${socket.userName} is disconnected`)
  })

  socket.on("disconnect", function (reason) {
  
  })

 
})




