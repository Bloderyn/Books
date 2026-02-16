// Book Library Functionality
const myLibrary = [];

function Book(title, author, pages, genreSelect, coverUrls, status) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.genreSelect = genreSelect;
  this.coverUrls = Array.isArray(coverUrls)
    ? coverUrls
    : [coverUrls].filter(Boolean);
  this.status = status || "not-read";
  this.id = crypto.randomUUID();

  this.rating = 0;
  this.notes = "";
  this.startDate = null;
  this.endDate = null;
  this.currentPage = 0;
  this.dateAdded = new Date().toISOString();
}

Book.prototype.toggleRead = function () {
  if (this.status === "unread") {
    this.status = "reading";
  } else if (this.status === "reading") {
    this.status = "read";
  } else {
    this.status = "unread";
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

        // Set dates automatically
        if (bookToToggle.status === "reading" && !bookToToggle.startDate) {
          bookToToggle.startDate = new Date().toISOString();
        }
        if (bookToToggle.status === "read" && !bookToToggle.endDate) {
          bookToToggle.endDate = new Date().toISOString();
        }

        saveLibrary();
        displayBooks();
      }
    }
  }

  if (
    e.target &&
    (e.target.classList.contains("view-details-btn") ||
      e.target.closest(".view-details-btn"))
  ) {
    const btn = e.target.classList.contains("view-details-btn")
      ? e.target
      : e.target.closest(".view-details-btn");
    const bookId = btn.dataset.id;
    openBookDetailsModal(bookId);
  }

  if (
    e.target &&
    (e.target.classList.contains("share-book-btn") ||
      e.target.closest(".share-book-btn"))
  ) {
    const btn = e.target.classList.contains("share-book-btn")
      ? e.target
      : e.target.closest(".share-book-btn");
    const bookId = btn.dataset.id;
    shareBook(bookId);
  }
});

function getStatusText(status) {
  if (status === "read") return "Read";
  if (status === "reading") return "Currently reading";
  if (status === "unread") return "Not Read";
  return "Not Read";
}

function displayBooks() {
  const container = document.querySelector(".books-container");
  container.innerHTML = "";

  // Apply filters and sorting
  let filteredBooks = filterBooks(myLibrary);
  filteredBooks = sortBooks(filteredBooks);

  const booksByStatus = {
    reading: filteredBooks.filter((book) => book.status === "reading"),
    unread: filteredBooks.filter((book) => book.status === "unread"),
    read: filteredBooks.filter((book) => book.status === "read"),
  };

  const statuses = [
    { key: "reading", label: "Currently Reading" },
    { key: "unread", label: "To Read" },
    { key: "read", label: "Finished" },
  ];

  for (const { key, label } of statuses) {
    const books = booksByStatus[key];
    if (books.length > 0) {
      const section = document.createElement("div");
      section.classList.add("status-section");

      const heading = document.createElement("h3");
      heading.classList.add("status-heading");
      heading.textContent = `${label} (${books.length})`;
      section.appendChild(heading);

      books.forEach((book) => {
        const card = createBookCard(book);
        section.appendChild(card);
      });

      container.appendChild(section);
    }
  }

  updateStatistics();
}

function createBookCard(book) {
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

  // Calculate reading progress percentage
  const progressPercent =
    book.pages > 0 ? Math.round((book.currentPage / book.pages) * 100) : 0;
  const progressHtml =
    book.status === "reading"
      ? `
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>
      <span class="progress-text">${progressPercent}% (${book.currentPage}/${book.pages} pages)</span>
    </div>
  `
      : "";

  // Rating stars display
  const ratingHtml =
    book.rating > 0
      ? `
    <p><b>Rating:</b> ${"⭐".repeat(book.rating)}</p>
  `
      : "";

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
          <p><b>Status:</b> ${getStatusText(book.status)}</p>
          <p><b>Genre:</b> ${book.genreSelect}</p>
          ${ratingHtml}
          ${progressHtml}
        </div>
        <div class="card-buttons">
          <button class="toggle-read-btn ${book.status}">
  ${
    book.status === "unread"
      ? "Start Reading"
      : book.status === "reading"
        ? "Mark as Read"
        : "Mark Unread"
  }
</button>
          <button class="view-details-btn" data-id="${book.id}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"></path>
              <path d="M12 12h5M12 16h5M12 8h5M7 12h.01M7 16h.01M7 8h.01"></path>
            </svg>
            Details
          </button>
          <button class="share-book-btn" data-id="${book.id}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share
          </button>
          <button class="remove-book-btn">Remove</button>
        </div>
        </div>
      </div>
      `;

  return card;
}

function addBookToLibrary() {
  const form = document.getElementById("book-form");
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const pages = document.getElementById("pages").value;
  const genre = document.getElementById("genreSelect").value;
  const coverUrls = window.uploadedImages ? [...window.uploadedImages] : [];
  const status = document.getElementById("read-status").value;

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

      // Restore enhanced book information
      bookItem.rating = item.rating || 0;
      bookItem.notes = item.notes || "";
      bookItem.startDate = item.startDate || null;
      bookItem.endDate = item.endDate || null;
      bookItem.currentPage = item.currentPage || 0;
      bookItem.dateAdded = item.dateAdded || new Date().toISOString();

      myLibrary.push(bookItem);
    });
    console.log("Library loaded successfully", myLibrary);
  } catch (error) {
    console.error("Error loading library:", error);
  }
}

let currentSearchTerm = "";
let currentGenreFilter = "all";
let currentSort = "default";

function filterBooks(books) {
  let filtered = [...books];

  if (currentSearchTerm) {
    filtered = filtered.filter(
      (book) =>
        book.title.toLowerCase().includes(currentSearchTerm) ||
        book.author.toLowerCase().includes(currentSearchTerm) ||
        book.genreSelect.toLowerCase().includes(currentSearchTerm),
    );
  }

  if (currentGenreFilter !== "all") {
    filtered = filtered.filter(
      (book) => book.genreSelect === currentGenreFilter,
    );
  }

  return filtered;
}

function sortBooks(books) {
  const sorted = [...books];

  switch (currentSort) {
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "author-asc":
      return sorted.sort((a, b) => a.author.localeCompare(b.author));
    case "pages-asc":
      return sorted.sort((a, b) => parseInt(a.pages) - parseInt(b.pages));
    case "pages-desc":
      return sorted.sort((a, b) => parseInt(b.pages) - parseInt(a.pages));
    default:
      return sorted;
  }
}

function updateStatistics() {
  const totalBooks = myLibrary.length;
  const booksRead = myLibrary.filter((b) => b.status === "read").length;
  const booksReading = myLibrary.filter((b) => b.status === "reading").length;
  const totalPages = myLibrary.reduce(
    (sum, book) => sum + parseInt(book.pages || 0),
    0,
  );

  document.getElementById("stat-total").textContent = totalBooks;
  document.getElementById("stat-read").textContent = booksRead;
  document.getElementById("stat-reading").textContent = booksReading;
  document.getElementById("stat-pages").textContent =
    totalPages.toLocaleString();
}

loadLibrary();
displayBooks();

const searchInput = document.getElementById("search-input");
const genreFilter = document.getElementById("genre-filter");
const sortSelect = document.getElementById("sort-select");

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearchTerm = e.target.value.toLowerCase();
    displayBooks();
  });
}

if (genreFilter) {
  genreFilter.addEventListener("change", (e) => {
    currentGenreFilter = e.target.value;
    displayBooks();
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    displayBooks();
  });
}

let currentModalBookId = null;

function openBookDetailsModal(bookId) {
  const book = myLibrary.find((b) => b.id === bookId);
  if (!book) return;

  currentModalBookId = bookId;
  const modal = document.getElementById("book-details-modal");

  document.getElementById("modal-title").textContent = book.title;
  document.getElementById("modal-author").textContent = book.author;
  document.getElementById("modal-pages").textContent = book.pages;
  document.getElementById("modal-genre").textContent = book.genreSelect;
  document.getElementById("modal-status").textContent = getStatusText(
    book.status,
  );

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "Not set";
  document.getElementById("modal-date-added").textContent = formatDate(
    book.dateAdded,
  );
  document.getElementById("modal-start-date").textContent = formatDate(
    book.startDate,
  );
  document.getElementById("modal-end-date").textContent = formatDate(
    book.endDate,
  );

  document.getElementById("start-date-display").style.display = book.startDate
    ? "block"
    : "none";
  document.getElementById("end-date-display").style.display = book.endDate
    ? "block"
    : "none";

  const progressSection = document.getElementById("progress-section");
  if (book.status === "reading") {
    progressSection.style.display = "block";
    document.getElementById("current-page-input").value = book.currentPage || 0;
    document.getElementById("current-page-input").max = book.pages;
  } else {
    progressSection.style.display = "none";
  }

  updateStarDisplay(book.rating);

  document.getElementById("notes-input").value = book.notes || "";

  modal.style.display = "block";
}

function updateStarDisplay(rating) {
  const stars = document.querySelectorAll("#star-rating .star");
  stars.forEach((star, index) => {
    star.textContent = index < rating ? "★" : "☆";
    star.classList.toggle("active", index < rating);
  });
}

const modal = document.getElementById("book-details-modal");
const closeBtn = document.querySelector(".close-modal");

if (closeBtn) {
  closeBtn.onclick = function () {
    modal.style.display = "none";
    currentModalBookId = null;
  };
}

window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
    currentModalBookId = null;
  }
};

const starRating = document.getElementById("star-rating");
if (starRating) {
  starRating.addEventListener("click", (e) => {
    if (e.target.classList.contains("star")) {
      const rating = parseInt(e.target.dataset.rating);
      const book = myLibrary.find((b) => b.id === currentModalBookId);
      if (book) {
        book.rating = rating;
        updateStarDisplay(rating);
        saveLibrary();
        displayBooks();
      }
    }
  });
}

const updateProgressBtn = document.getElementById("update-progress-btn");
if (updateProgressBtn) {
  updateProgressBtn.addEventListener("click", () => {
    const book = myLibrary.find((b) => b.id === currentModalBookId);
    const newPage = parseInt(
      document.getElementById("current-page-input").value,
    );
    if (book && newPage >= 0 && newPage <= book.pages) {
      book.currentPage = newPage;
      saveLibrary();
      displayBooks();
    }
  });
}

const saveNotesBtn = document.getElementById("save-notes-btn");
if (saveNotesBtn) {
  saveNotesBtn.addEventListener("click", () => {
    const book = myLibrary.find((b) => b.id === currentModalBookId);
    const notes = document.getElementById("notes-input").value;
    if (book) {
      book.notes = notes;
      saveLibrary();
      alert("Notes saved successfully!");
    }
  });
}

function shareBook(bookId) {
  const book = myLibrary.find((b) => b.id === bookId);
  if (!book) return;

  const shareText = `📚 ${book.title} by ${book.author}
${book.rating > 0 ? "⭐".repeat(book.rating) : ""}
Genre: ${book.genreSelect}
Pages: ${book.pages}
Status: ${getStatusText(book.status)}
${book.notes ? "\n" + book.notes : ""}`;

  if (navigator.share) {
    navigator
      .share({
        title: book.title,
        text: shareText,
      })
      .catch((err) => console.log("Error sharing:", err));
  } else {
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        alert("Book details copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);

        const textarea = document.createElement("textarea");
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Book details copied to clipboard!");
      });
  }
}
