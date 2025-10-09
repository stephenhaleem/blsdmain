// Debounce function to limit scroll event frequency
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Preloader
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.display = "none";
    }, 500);
  }
});

// Navbar Scroll Behavior
let lastScroll = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener(
  "scroll",
  debounce(() => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    lastScroll = currentScroll;
  }, 100)
);

// Hamburger Menu Toggle
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  hamburger.textContent = navLinks.classList.contains("active") ? "✕" : "☰";
});

// Smooth Scroll for Nav Links
document.querySelectorAll(".nav-links a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const href = this.getAttribute("href");
    if (href.includes("#")) {
      const targetId = href.split("#")[1];
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    } else {
      window.location.href = href;
    }
    navLinks.classList.remove("active");
    hamburger.textContent = "☰";
  });
});

// ========================================
// MORTGAGE CALCULATOR - COMPLETE CODE
// ========================================

// Image Modal
const modal = document.getElementById("imageModal");
if (modal) {
  const modalImg = document.getElementById("modalImage");
  const captionText = document.getElementById("caption");
  const closeModal = document.querySelector(".close");

  document.querySelectorAll(".carousel-item img").forEach((img) => {
    img.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = img.src;
      captionText.textContent = img.alt;
    });
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Back to Top Button
const backToTop = document.getElementById("backToTop");
window.addEventListener(
  "scroll",
  debounce(() => {
    if (window.scrollY > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  }, 100)
);

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// CTA Overlay
const ctaOverlay = document.getElementById("ctaOverlay");
if (ctaOverlay) {
  window.addEventListener(
    "scroll",
    debounce(() => {
      if (window.scrollY > 300) {
        ctaOverlay.classList.add("visible");
      } else {
        ctaOverlay.classList.remove("visible");
      }
    }, 100)
  );
}

// Contact Form Submission
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => {
        document.getElementById("formResponse").textContent =
          "Message sent successfully!";
        document.getElementById("formResponse").classList.add("visible");
        form.reset();
        setTimeout(() => {
          document.getElementById("formResponse").classList.remove("visible");
        }, 3000);
      })
      .catch((error) => {
        document.getElementById("formResponse").textContent =
          "Error sending message.";
        document.getElementById("formResponse").classList.add("visible");
        console.error("Form submission error:", error);
      });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel");
  const carouselItems = document.querySelectorAll(".carousel-item");
  const prevButton = document.querySelector(
    ".carousel-container .carousel-arrow.prev"
  );
  const nextButton = document.querySelector(
    ".carousel-container .carousel-arrow.next"
  );
  const carouselContainer = document.querySelector(".carousel-container"); // Define the container
  const totalItems = carouselItems.length;
  let currentIndex = 0;
  let itemsPerView = 3; // Default for desktop

  // Function to update the number of items per view based on screen size
  const updateItemsPerView = () => {
    itemsPerView = window.innerWidth <= 768 ? 1 : 3; // 1 item on mobile, 3 on desktop
    updateCarousel();
  };

  // Function to update the carousel position
  const updateCarousel = () => {
    const itemWidth = carouselItems[0].getBoundingClientRect().width;
    const translateX = -(currentIndex * itemWidth);
    carousel.style.transform = `translateX(${translateX}px)`;

    // Update button states
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex >= totalItems - itemsPerView;
  };

  // Next button click
  nextButton.addEventListener("click", () => {
    if (currentIndex < totalItems - itemsPerView) {
      currentIndex++;
      updateCarousel();
    }
  });

  // Prev button click
  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  // Add autoplay functionality
  let autoplayInterval = setInterval(() => {
    if (currentIndex < totalItems - itemsPerView) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateCarousel();
  }, 5000); // Change every 5 seconds

  // Pause autoplay on hover
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", () =>
      clearInterval(autoplayInterval)
    );
    carouselContainer.addEventListener("mouseleave", () => {
      autoplayInterval = setInterval(() => {
        if (currentIndex < totalItems - itemsPerView) {
          currentIndex++;
        } else {
          currentIndex = 0;
        }
        updateCarousel();
      }, 5000);
    });
  }

  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  carousel.addEventListener("touchmove", (e) => {
    touchEndX = e.touches[0].clientX;
  });

  carousel.addEventListener("touchend", () => {
    const swipeDistance = touchEndX - touchStartX;
    const swipeThreshold = 50; // Minimum distance to trigger a swipe

    if (swipeDistance > swipeThreshold) {
      // Swipe right (prev)
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    } else if (swipeDistance < -swipeThreshold) {
      // Swipe left (next)
      if (currentIndex < totalItems - itemsPerView) {
        currentIndex++;
        updateCarousel();
      }
    }
  });

  // Initial setup
  updateItemsPerView();

  // Update on window resize
  window.addEventListener("resize", () => {
    updateItemsPerView();
  });
});
// House Carousel
document.addEventListener("DOMContentLoaded", () => {
  const houseCarousel = document.querySelector(".house-carousel");
  const houseCarouselItems = document.querySelectorAll(".house-carousel-item");
  const housePrevButton = document.querySelector(
    ".house-carousel-container .carousel-arrow.prev"
  );
  const houseNextButton = document.querySelector(
    ".house-carousel-container .carousel-arrow.next"
  );
  const houseTotalItems = houseCarouselItems.length;
  let houseCurrentIndex = 0;
  let houseItemsPerView = 2; // Default for desktop

  // Function to update the number of items per view based on screen size
  const updateHouseItemsPerView = () => {
    houseItemsPerView = window.innerWidth <= 768 ? 1 : 2; // 1 item on mobile, 2 on desktop
    updateHouseCarousel();
  };

  // Function to update the house carousel position
  const updateHouseCarousel = () => {
    const itemWidth = houseCarouselItems[0].getBoundingClientRect().width;
    const translateX = -(houseCurrentIndex * itemWidth);
    houseCarousel.style.transform = `translateX(${translateX}px)`;

    // Update button states
    housePrevButton.disabled = houseCurrentIndex === 0;
    houseNextButton.disabled =
      houseCurrentIndex >= houseTotalItems - houseItemsPerView;
  };

  // Next button click
  houseNextButton.addEventListener("click", () => {
    if (houseCurrentIndex < houseTotalItems - houseItemsPerView) {
      houseCurrentIndex++;
      updateHouseCarousel();
    }
  });

  // Prev button click
  housePrevButton.addEventListener("click", () => {
    if (houseCurrentIndex > 0) {
      houseCurrentIndex--;
      updateHouseCarousel();
    }
  });

  // Swipe support for mobile
  let houseTouchStartX = 0;
  let houseTouchEndX = 0;

  houseCarousel.addEventListener("touchstart", (e) => {
    houseTouchStartX = e.touches[0].clientX;
  });

  houseCarousel.addEventListener("touchmove", (e) => {
    houseTouchEndX = e.touches[0].clientX;
  });

  houseCarousel.addEventListener("touchend", () => {
    const swipeDistance = houseTouchEndX - houseTouchStartX;
    const swipeThreshold = 50; // Minimum distance to trigger a swipe

    if (swipeDistance > swipeThreshold) {
      // Swipe right (prev)
      if (houseCurrentIndex > 0) {
        houseCurrentIndex--;
        updateHouseCarousel();
      }
    } else if (swipeDistance < -swipeThreshold) {
      // Swipe left (next)
      if (houseCurrentIndex < houseTotalItems - houseItemsPerView) {
        houseCurrentIndex++;
        updateHouseCarousel();
      }
    }
  });

  // Initial setup
  updateHouseItemsPerView();

  // Update on window resize
  window.addEventListener("resize", () => {
    updateHouseItemsPerView();
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelector(".nav-links");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled"); // Add the scrolled class to the navbar
      navLinks.classList.add("scrolled"); // Add the scrolled class to the nav-links
    } else {
      navbar.classList.remove("scrolled"); // Remove the scrolled class from the navbar
      navLinks.classList.remove("scrolled"); // Remove the scrolled class from the nav-links
    }
  });
});
