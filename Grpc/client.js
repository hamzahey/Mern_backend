const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");


const packageDefinition = protoLoader.loadSync("protos/book.proto", {});
const bookProto = grpc.loadPackageDefinition(packageDefinition).book;


const client = new bookProto.BookService("localhost:50051", grpc.credentials.createInsecure())

client.GetBook({id:2}, (error, response)=>{
    if(!error){
        console.log("Book", response.book)
    } else {
        console.error("Error", error.details)
    }
})

client.AddBook({ title: "New Book", author: "Alice" }, (error, response) => {
    if (!error) {
      console.log("Added Book:", response.book);
    } else {
      console.error("Error:", error.details);
    }
  });