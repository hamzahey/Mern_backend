const express = require("express")
const {graphqlHTTP} = require("express-graphql")
const { buildSchema } = require("graphql")
const cors = require("cors")

const books = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { id: 2, title: "1984", author: "George Orwell" },
]

const schema = buildSchema(`
    type Book {
    id: ID,
    title: String,
    author: String
    }

    type Query {
    books: [Book]
    book(id: ID!): Book
    }

    type Mutation {
    addBook(title: String!, author: String!): Book
    deleteBook(id: ID!): String
    }
`)

const root = {
    books: () => books,
    book: ({id}) => books.find(book => book.id == id),
    addBook: ({title, author}) => {
        const newBook = {id: books.length +1, title, author}
        books.push(newBook)
        return newBook;
    },
    deleteBook: ({id}) => {
        const index = books.findIndex(book => book.id == id)
        if (index === -1) return "Book not found"
        books.splice(index, 1)
        return "Books Deleted Successfully"
    }
}

const app = express()
app.use(cors())

app.use(
    "/graphql",
    graphqlHTTP({
        schema,
        rootValue: root,
        graphiql: true,
    })
)

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/graphql`));