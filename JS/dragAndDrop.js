// Drag-and-Drop functionality for cover image upload
const dropZone = document.getElementById("drop-zone");
const coverInput = document.getElementById("coverImage");

let previewContainer = document.getElementById("preview-container");
if (!previewContainer) {
  previewContainer = document.createElement("div");
  previewContainer.id = "preview-container";
  dropZone.appendChild(previewContainer);
}

const MAX_IMAGES = 4;
window.uploadedImages = [];
window.updatePreviews = updatePreviews;

// Compress image to reduce storage size
function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize if image is too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with compression (smaller than PNG)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

dropZone.addEventListener("click", () => {
  if (window.uploadedImages.length >= MAX_IMAGES) {
    alert(`You can upload a maximum of ${MAX_IMAGES} images.`);
    return;
  }
  coverInput.click();
});

function updatePreviews() {
  previewContainer.innerHTML = "";

  if (window.uploadedImages.length === 0) {
    dropZone.classList.remove("has-image");
    const addIcon = document.querySelector(".add-icon");
    if (addIcon && addIcon.parentElement) {
      addIcon.parentElement.style.display = "block";
    }
    return;
  }

  dropZone.classList.add("has-image");
  const addIcon = document.querySelector(".add-icon");
  if (addIcon && addIcon.parentElement) {
    addIcon.parentElement.style.display = "none";
  }

  window.uploadedImages.forEach((imgData, index) => {
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "image-preview-wrapper";
    imgWrapper.style.zIndex = window.uploadedImages.length - index;
    imgWrapper.dataset.index = index;

    const img = document.createElement("img");
    img.src = imgData;
    img.className = "image-preview";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-image-btn";
    removeBtn.innerHTML = "×";
    removeBtn.type = "button";
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      window.uploadedImages.splice(index, 1);
      updatePreviews();
    };

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(removeBtn);
    previewContainer.appendChild(imgWrapper);
  });

  // Initialize carousel for mobile
  initCarousel();
}

let currentSlide = 0;

function initCarousel() {
  if (window.innerWidth > 1024 || window.uploadedImages.length === 0) {
    currentSlide = 0;
    return;
  }

  updateCarouselPosition();

  if (window.uploadedImages.length > 1) {
    let prevArrow = document.querySelector(".carousel-arrow-prev");
    let nextArrow = document.querySelector(".carousel-arrow-next");

    if (!prevArrow) {
      prevArrow = document.createElement("button");
      prevArrow.className = "carousel-arrow carousel-arrow-prev";
      prevArrow.innerHTML = "‹";
      prevArrow.type = "button";
      prevArrow.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentSlide > 0) {
          currentSlide--;
          updateCarouselPosition();
        }
      });
      dropZone.appendChild(prevArrow);
    }

    if (!nextArrow) {
      nextArrow = document.createElement("button");
      nextArrow.className = "carousel-arrow carousel-arrow-next";
      nextArrow.innerHTML = "›";
      nextArrow.type = "button";
      nextArrow.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentSlide < window.uploadedImages.length - 1) {
          currentSlide++;
          updateCarouselPosition();
        }
      });
      dropZone.appendChild(nextArrow);
    }
  }

  let dotsContainer = document.querySelector(".carousel-dots");
  if (!dotsContainer && window.uploadedImages.length > 1) {
    dotsContainer = document.createElement("div");
    dotsContainer.className = "carousel-dots";
    previewContainer.appendChild(dotsContainer);
  }

  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    window.uploadedImages.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.className = "carousel-dot";
      if (index === currentSlide) dot.classList.add("active");
      dot.addEventListener("click", () => {
        currentSlide = index;
        updateCarouselPosition();
      });
      dotsContainer.appendChild(dot);
    });
  }
}

function updateCarouselPosition() {
  if (window.innerWidth > 1024) return;

  const wrappers = document.querySelectorAll(".image-preview-wrapper");
  wrappers.forEach((wrapper, index) => {
    wrapper.classList.remove("active");

    const offset = index - currentSlide;

    if (index === currentSlide) {
      wrapper.classList.add("active");
      wrapper.style.transform = "translateX(-50%) scale(1)";
      wrapper.style.zIndex = "10";
    } else if (offset === -1) {
      wrapper.style.transform = "translateX(calc(-50% - 90px)) scale(0.8)";
      wrapper.style.zIndex = "5";
    } else if (offset === 1) {
      wrapper.style.transform = "translateX(calc(-50% + 90px)) scale(0.8)";
      wrapper.style.zIndex = "5";
    } else if (offset < -1) {
      wrapper.style.transform = "translateX(calc(-50% - 140px)) scale(0.7)";
      wrapper.style.zIndex = "3";
    } else {
      wrapper.style.transform = "translateX(calc(-50% + 140px)) scale(0.7)";
      wrapper.style.zIndex = "3";
    }
  });

  const dots = document.querySelectorAll(".carousel-dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });

  // Update arrow visibility
  const prevArrow = document.querySelector(".carousel-arrow-prev");
  const nextArrow = document.querySelector(".carousel-arrow-next");

  if (prevArrow) {
    prevArrow.style.opacity = currentSlide === 0 ? "0.3" : "1";
    prevArrow.style.pointerEvents = currentSlide === 0 ? "none" : "auto";
  }

  if (nextArrow) {
    nextArrow.style.opacity =
      currentSlide === window.uploadedImages.length - 1 ? "0.3" : "1";
    nextArrow.style.pointerEvents =
      currentSlide === window.uploadedImages.length - 1 ? "none" : "auto";
  }
}

let touchStartX = 0;
let touchEndX = 0;

previewContainer.addEventListener(
  "touchstart",
  (e) => {
    if (window.innerWidth > 1024) return;
    touchStartX = e.changedTouches[0].screenX;
  },
  { passive: true },
);

previewContainer.addEventListener(
  "touchend",
  (e) => {
    if (window.innerWidth > 1024) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  },
  { passive: true },
);

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0 && currentSlide < window.uploadedImages.length - 1) {
      currentSlide++;
      updateCarouselPosition();
    } else if (diff < 0 && currentSlide > 0) {
      currentSlide--;
      updateCarouselPosition();
    }
  }
}

window.addEventListener("resize", () => {
  if (window.innerWidth <= 1024) {
    initCarousel();
  } else {
    const dotsContainer = document.querySelector(".carousel-dots");
    const prevArrow = document.querySelector(".carousel-arrow-prev");
    const nextArrow = document.querySelector(".carousel-arrow-next");

    if (dotsContainer) dotsContainer.remove();
    if (prevArrow) prevArrow.remove();
    if (nextArrow) nextArrow.remove();

    currentSlide = 0;
  }
});

coverInput.addEventListener("change", function () {
  const files = Array.from(coverInput.files);

  files.forEach(async (file) => {
    if (window.uploadedImages.length >= MAX_IMAGES) return;

    try {
      const compressedImage = await compressImage(file);
      window.uploadedImages.push(compressedImage);
      updatePreviews();
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to process image: " + file.name);
    }
  });
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Add and remove highlight drop zone on dragover
["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    preventDefaults(e);
    if (window.uploadedImages.length < MAX_IMAGES) {
      dropZone.classList.add("dragover");
    }
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    preventDefaults(e);
    dropZone.classList.remove("dragover");
  });
});

dropZone.addEventListener("drop", (e) => {
  preventDefaults(e);

  const files = Array.from(e.dataTransfer.files);

  if (files.length === 0) {
    alert("Please drop some files.");
    return;
  }

  files.forEach(async (file) => {
    if (window.uploadedImages.length >= MAX_IMAGES) return;

    try {
      const compressedImage = await compressImage(file);
      window.uploadedImages.push(compressedImage);
      updatePreviews();
    } catch (error) {
      console.error("Error processing file:", error);
      alert(`Failed to process: ${file.name}. Please use a valid image file.`);
    }
  });
});
