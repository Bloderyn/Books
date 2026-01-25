const myLibrary = [];

function Book(title, author, pages, read) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read; // Boolean indicating if the book has been read
  this.id = crypto.randomUUID();
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;
};

function displayBooks() {
  const container = document.querySelector(".books-container");
  container.innerHTML = "";

  myLibrary.forEach((Book) => {
    const card = document.createElement("div");
    card.classList.add("book-card");
    card.dataset.id = Book.id;

    card.innerHTML = `
      <h2>${Book.title}</h2>
      <p>Author: ${Book.author}</p>
      <p>Pages: ${Book.pages}</p>
      <p>Status: ${Book.read ? "Read" : "Not Read"}</p>
      <button class="toggle-read-btn">Toggle Read Status</button>
      <button class="remove-book-btn">Remove Book</button>
      `;

    function removeBook(id) {
      const removeIndex = myLibrary.findIndex((b) => b.id === id);
      if (removeIndex !== -1) {
        myLibrary.splice(removeIndex, 1);
      }
    }

    // Event delegation for toggle read status
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

    container.appendChild(card);
  });
}

function addBookToLibrary() {
  const form = document.getElementById("book-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const pages = document.getElementById("pages").value;
    const readStatusElement = document.getElementById("read-status");
    const readStatus = readStatusElement
      ? readStatusElement.value === "read"
      : false;

    const newBook = new book(title, author, pages, readStatus);

    myLibrary.push(newBook);
    displayBooks();
    form.reset();
  });
}
