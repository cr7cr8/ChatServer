const express = require("express")
const app = express()
const cors = require("cors");
const socket = require("socket.io")



app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = app.listen(80)
const io = socket(server)

let soc = null;

io.on("conection", function (socket) {
  //console.log("made socket connection", socket.id  );
  // socket.on("user1",function(msg){
  //   console.log(msg)
  // })
  
  socket.on("channel1", function(obj){

    console.log(obj)
   // socket.emit(obj.to,obj.msg)
     
    // socket.emit("server1","gogogo")
  })

})

// checking()
// function checking() {
//   console.log(soc)
//   if (soc) {
//     soc.on("user1", function (obj) {

//       console.log(obj)
//       // socket.emit(obj.to,obj.msg)

//       // socket.emit("server1","gogogo")
//     })
//   }
//   else {
//     setTimeout(checking,10)
//   }
// }
