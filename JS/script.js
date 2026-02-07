// Book Library Functionality
const myLibrary = [];

function Book(title, author, pages, genreSelect, coverUrls, status) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.genreSelect = genreSelect;
  this.coverUrls = Array.isArray(coverUrls)
    ? coverUrls
    : [coverUrls].filter(Boolean); // Array of cover images
  this.status = status || "not-read"; // Boolean indicating if the book has been read
  this.id = crypto.randomUUID();
}

Book.prototype.toggleRead = function () {
  if (this.status === "not-read") {
    this.status = "reading";
  } else if (this.status === "reading") {
    this.status = "read";
  } else {
    this.status = "not-read";
  }
};

function removeBook(id) {
  const removeIndex = myLibrary.findIndex((b) => b.id === id);
  if (removeIndex !== -1) {
    myLibrary.splice(removeIndex, 1);
    saveLibrary();
  }
}

// Event delegation for toggle read status and remove book
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("remove-book-btn")) {
    const cardRemove = e.target.closest(".book-card");
    if (cardRemove) {
      const removeID = cardRemove.dataset.id;
      removeBook(removeID);
      displayBooks();
    }
  }

  if (e.target && e.target.classList.contains("toggle-read-btn")) {
    const cardToggle = e.target.closest(".book-card");
    if (cardToggle) {
      const toggleID = cardToggle.dataset.id;
      const bookToToggle = myLibrary.find((b) => b.id === toggleID);
      if (bookToToggle) {
        bookToToggle.toggleRead();
        saveLibrary();
        displayBooks();
      }
    }
  }
});

function displayBooks() {
  const container = document.querySelector(".books-container");
  container.innerHTML = "";

  myLibrary.forEach((book) => {
    const card = document.createElement("li");
    card.classList.add("book-card", book.status);
    card.dataset.id = book.id;

    let coverHtml = "";
    if (book.coverUrls && book.coverUrls.length > 0) {
      coverHtml = `<div class="hover-gallery">`;
      book.coverUrls.forEach((url, index) => {
        coverHtml += `<div class="hover-zone hover-zone-${index + 1}">
          <img src="${url}" alt="${book.title} cover" class="book-cover">
        </div>`;
      });

      if (book.coverUrls.length > 1) {
        coverHtml += `<div class="gallery-dots">`;
        for (let i = 1; i < book.coverUrls.length; i++) {
          coverHtml += `<span class="gallery-dot"></span>`;
        }
        coverHtml += `</div>`;
      }

      coverHtml += `</div>`;
    }

    card.innerHTML = `
      <div class="card-layout">
        <div class="card-image">
          ${coverHtml}
        </div>
        <div class="card-info">
        <div class="card-text">
          <h2>${book.title}</h2>
          <p><b>Author:</b> ${book.author}</p>
          <p><b>Pages:</b> ${book.pages}</p>
          <p><b>Status:</b> ${book.status === "read" ? "Read" : book.status === "reading" ? "Currently reading" : "Not Read"}</p>
          <p><b>Genre:</b> ${book.genreSelect}</p>
        </div>
        <div class="card-buttons">
          <button class="toggle-read-btn ${book.status}">
  ${
    book.status === "not-read"
      ? "Start Reading"
      : book.status === "reading"
        ? "Mark as Read"
        : "Mark Unread"
  }
</button>
          <button class="remove-book-btn">Remove</button>
        </div>
        </div>
      </div>
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
  const coverUrls = window.uploadedImages ? [...window.uploadedImages] : [];
  const status = document.getElementById("read-status").checked
    ? "read"
    : "not-read";

  const newBook = new Book(title, author, pages, genre, coverUrls, status);

  myLibrary.push(newBook);
  displayBooks();
  form.reset();

  if (window.uploadedImages) {
    window.uploadedImages.length = 0;
    if (window.updatePreviews) {
      window.updatePreviews();
    }
  }
}

const form = document.getElementById("book-form");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addBookToLibrary();
    saveLibrary();
  });
}

function saveLibrary() {
  try {
    localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
    console.log("Library saved successfully", myLibrary);
  } catch (error) {
    console.error("Error saving library:", error);
    if (error.name === "QuotaExceededError") {
      alert(
        "Storage limit exceeded. Your images may be too large. Try using smaller images.",
      );
    }
  }
}

function loadLibrary() {
  try {
    const libraryData = localStorage.getItem("myLibrary");
    if (!libraryData) return;

    const parsed = JSON.parse(libraryData);

    parsed.forEach((item) => {
      const covers = item.coverUrls || (item.coverUrl ? [item.coverUrl] : []);
      const bookItem = new Book(
        item.title,
        item.author,
        item.pages,
        item.genreSelect,
        covers,
        item.status,
      );
      bookItem.id = item.id;
      myLibrary.push(bookItem);
    });
    console.log("Library loaded successfully", myLibrary);
  } catch (error) {
    console.error("Error loading library:", error);
  }
}

loadLibrary();
displayBooks();
