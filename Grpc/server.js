const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")

const packageDefinition = protoLoader.loadSync("protos/book.proto", {})
const bookproto = grpc.loadPackageDefinition(packageDefinition).book

const books = [
    { id: 1, title: "MERN Guide", author: "John Doe" },
    { id: 2, title: "GraphQL Guide", author: "Jane Doe" },
  ];

const getBook = (call, callback) => {
    const book = books.find((b)=> b.id === call.request.id)
    if(book){
        callback(null, {book})
    } else {
        callback({code: grpc.status.NOT_FOUND, details: "Book not found"})
    }
}


const addBook = (call, callback) => {
    const newBook = {
        id: books.length +1,
        title: call.request.title,
        author: call.request.author,
    }
    books.push(newBook)
    callback(null, {book: newBook})
}

const server = new grpc.Server();
server.addService(bookproto.BookService.service, {GetBook: getBook, AddBook: addBook})

server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), ()=>{
    console.log("🚀 gRPC Server running on port 50051")
})