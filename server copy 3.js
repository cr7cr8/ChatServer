const express = require("express")
const app = express()
const cors = require("cors");
const socketIO = require("socket.io")



app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = app.listen(80)
const io = socketIO(server)

let count = 1
const clients = {}


io.on("connection", function (socket) {

  //socket.disconnect() 


  // clients[socket.id] = socket;

  // socket.on('disconnect', function () {

  //   console.log("disconnect")
  //   delete clients[socket.id];
  // });


  // socket.sendBuffer = [];



  console.log(socket.id, socket.connected, count++);
  //console.log(Object.keys(soc)) 
 
  socket.on("channel1", function (msg) {
    console.log(msg)
    socket.emit("user1","hihi")
  }) 
})     

// io.on("connected",function(socket){
//   socket.sendBuffer = [];
//   console.log(socket.id,"===")

// })


//checking()

// function checking(){

//   if(soc){
//     soc.on("user1", function (msg) {

//       console.log(msg)

//     })
//   }
//   else{
//     setTimeout(checking,10)
//   }

// }

