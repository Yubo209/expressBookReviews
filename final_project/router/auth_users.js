const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};


const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username }, 'fingerprint_customer', { expiresIn: '1h' });

    req.session.authorization = {
      accessToken,
      username
    };
    return res.status(200).json({ message: "User successfully logged in." });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  const username = req.session.authorization?.username;
  // Can also use  const username = req.user.username; (we added it in req in jwt.verify())

  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: `Review for book with ISBN ${isbn} updated successfully.` });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
