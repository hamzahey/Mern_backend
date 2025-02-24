const WebSocket = require("ws")

const server = new WebSocket.Server({port:8080})

server.on("connection", (socket)=>{
    console.log("Client Connected");

    socket.send("Hello, Client! Welcome to WebSocket Server.")


    socket.on("message", (message)=>{
        console.log(`Recieved: ${message}`)

        socket.send(`Server recieved: ${message}`)
    })

    socket.on("close", ()=>{
        console.log("Client Disconnected")
    })
})

console.log("Websocket Server is running on ws://localhost:8080")