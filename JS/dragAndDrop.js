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
}

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
