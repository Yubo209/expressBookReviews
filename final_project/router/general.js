const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }


  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists." });
  }

  
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
//
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

public_users.get('/', async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    res.status(200).json(allBooks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books" });
  }
});
//

// Get book details based on ISBN
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) resolve(book);
    else reject("Book not found");
  });
};

public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBN(isbn);
    res.status(200).json(book);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});
//
  
// Get book details based on author
//public_users.get('/author/:author', (req, res) => {
  //const author = req.params.author;
  //const results = [];

  //for (let isbn in books) {
    //if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      //results.push({ isbn, ...books[isbn] });  
    //}
  //}

  // same as. 
  // results.push({
  // isbn: isbn,
  // author: books[isbn].author,
  // title: books[isbn].title,
  // reviews: books[isbn].reviews
// });

  //if (results.length > 0) {
    //return res.status(200).json(results);
  //} else {
   // return res.status(404).json({ message: "No books found by this author." });
  //}
//});
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const results = Object.entries(books).filter(([isbn, book]) => book.author === author);
    if (results.length > 0) {
      resolve(results.map(([isbn, book]) => ({ isbn, ...book })));
    } else {
      reject("No books found for that author");
    }
  });
};

public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const result = await getBooksByAuthor(author);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// Get all books based on title
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const results = Object.entries(books).filter(([isbn, book]) => book.title === title);
    if (results.length > 0) {
      resolve(results.map(([isbn, book]) => ({ isbn, ...book })));
    } else {
      reject("No books found for that title");
    }
  });
};

public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const result = await getBooksByTitle(title);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});



//  Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});


module.exports.general = public_users;
