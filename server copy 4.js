const express = require("express")
const app = express()
const cors = require("cors");
const socketIO = require("socket.io")

const { compareAsc, format, formatDistanceToNow, } = require("date-fns")
const { zhCN } = require('date-fns/locale');


const startingTime = Date.now()


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = app.listen(80)
const io = socketIO(server)

const clients = {}
let socketArr = []

app.get("/delete/:token",function(req,res,next){

  const index = socketArr.findIndex(function (socket) { return socket.handshake.auth.token === req.params.token })
  if(index>=0){
    socketArr[index].disconnect()
    socketArr = socketArr.filter(function(socket,index_){ return index!==index_ })
  }
  res.json("its index is "+index)
})


app.get("/ask/:token", function (req, res, next) {


  const index = socketArr.findIndex(function (socket) { return socket.handshake.auth.token === req.params.token })

  console.log("the token index is " + index)

  res.json(index)
})


app.get("/", function (req, res, next) {

  const passingTime1 = Date.now() - startingTime
  const passingTime2 = formatDistanceToNow(startingTime, { locale: zhCN, })

  let allId = "";
  socketArr.forEach(soc => { allId = allId + soc.id + "&nbsp;&nbsp;" + soc.handshake.auth.token + "&nbsp;&nbsp;" + "<br />" })

  res.send(`
  <h1>starting Time ${String(new Date(startingTime)).substr(0, 24)}</h1> 
  <h1>passing Sec ${(passingTime1 / 1000).toFixed(0)}</h1> 
  <h1>running Time ${passingTime2}</h1> 

  <h1>io.engine.clientCount ${io.engine.clientsCount}</h1> 
  
  <h1>socketArr.length ${socketArr.length}</h1>  
  <h1>socketArr.id <br />${allId}</h1>  
  
  `)

})


// io.engine.clientsCount
// io.sockets.sockets.length
// Object.keys(io.sockets.connected).length

// console.log(io.engine.clientsCount)

console.log("----")
io.on("connection", function (socket) {

  // socket.disconnect() 
  socketArr.push(socket)
  // console.log(socket.id, socket.handshake.auth,socket.connected ,count++);
  console.log(socket.id, socket.handshake.auth, socket.connected, socketArr.length, socket.client.conn.server.clientsCount + " users connected",io.engine.clientsCount +" engine conected");


  //console.log(socket.client)
  //console.log(Object.keys(socket))

  //console.log(socket)
  // clients[socket.id] = socket;

  // socket.on('disconnect', function () {

  //   console.log("disconnect")
  //   delete clients[socket.id];
  // });


  // socket.sendBuffer = [];




  //console.log(Object.keys(soc)) 

  socket.on("channel1", function (msg) {
    console.log(msg)
    socket.emit("user1", "hihi")
  })
})

io.on("connected", function (socket) {
  // socket.sendBuffer = [];
  console.log(socket.id, "===")

})


