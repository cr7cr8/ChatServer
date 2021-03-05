const express =  require("express")
const app = express()
const cors = require("cors");
const socket = require("socket.io")



app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = app.listen(80)
const io = socket(server)


let soc = null;

io.on("connection", function(socket){
  //console.log("made socket connection", socket.id  );
  
  socket.on("user1", function(msg){
    console.log(msg)
    socket.emit("server1",{a:"aaa",b:"bbb"})
  })

})


