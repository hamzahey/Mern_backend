const WebSocket = require("ws")

const socket = new WebSocket("ws://localhost:8080")

socket.on("open", ()=>{
    console.log("Connected to WebSocket Server")

    socket.send("Hello, Server! This is Node.js Client")
})

socket.on("message",  (message)=>{
    console.log(`Recieved from Server: ${message}`)
})

socket.on("error", (error)=>{
    console.log(`WebSocket Error ${error}`)
})


socket.on("close", ()=>{
    console.log("Disconnected from WebSocket Server")
})