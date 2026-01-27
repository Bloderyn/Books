const myLibrary = [];

function book(title, author, pages, genreSelect, read) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.genreSelect = genreSelect;
  this.read = read; // Boolean indicating if the book has been read
  this.id = crypto.randomUUID();
}

book.prototype.toggleRead = function () {
  this.read = !this.read;
};

function removeBook(id) {
  const removeIndex = myLibrary.findIndex((b) => b.id === id);
  if (removeIndex !== -1) {
    myLibrary.splice(removeIndex, 1);
  }
}

// Event delegation for toggle read status and remove book
document.addEventListener("click", (e) => {
  if (e.target.matches(".remove-book-btn")) {
    const cardRemove = e.target.closest(".book-card");
    const removeID = cardRemove.dataset.id;
    removeBook(removeID);
    displayBooks();
  }

  if (e.target.matches(".toggle-read-btn")) {
    const cardToggle = e.target.closest(".book-card");
    const toggleID = cardToggle.dataset.id;
    const bookToToggle = myLibrary.find((b) => b.id === toggleID);
    if (bookToToggle) {
      bookToToggle.toggleRead();
      displayBooks();
    }
  }
});

function displayBooks() {
  const container = document.querySelector(".books-container");
  container.innerHTML = "";

  myLibrary.forEach((book) => {
    const card = document.createElement("li");
    card.classList.add("book-card");
    card.dataset.id = book.id;

    card.innerHTML = `
      <h2>${book.title}</h2>
      <p>Author: ${book.author}</p>
      <p>Pages: ${book.pages}</p>
      <p>Status: ${book.read ? "Read" : "Not Read"}</p>
      <p>Genre: ${book.genreSelect}</p>
      <button class="toggle-read-btn">Toggle Read Status</button>
      <button class="remove-book-btn">Remove Book</button>
      `;

    container.appendChild(card);
  });
}

function addBookToLibrary() {
  const form = document.getElementById("book-form");
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const pages = document.getElementById("pages").value;
  const genre = document.getElementById("genreSelect").value;
  const readStatus = document.getElementById("read-status").checked;

  const newBook = new book(title, author, pages, genre, readStatus);

  myLibrary.push(newBook);
  displayBooks();
  form.reset();
}

// Set up form submission listener once
const form = document.getElementById("book-form");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addBookToLibrary();
    saveLibrary();
  });
}

function saveLibrary() {
  localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
}

function loadLibrary() {
  const libraryData = localStorage.getItem("myLibrary");
  if (!libraryData) return;

  const parsed = JSON.parse(libraryData);

  parsed.forEach((item) => {
    const bookItem = new book(
      item.title,
      item.author,
      item.pages,
      item.genre,
      item.read,
    );
    bookItem.id = item.id;
    myLibrary.push(bookItem);
  });
}

loadLibrary();
displayBooks();
