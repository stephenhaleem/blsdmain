document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const sideMenu = document.querySelector(".side-menu");
  const closeMenu = document.querySelector(".close-menu");
  const menuOverlay = document.querySelector(".menu-overlay");
  const mobileDropdownToggle = document.querySelector(
    ".mobile-dropdown-toggle"
  );
  const mobileDropdown = document.querySelector(".mobile-dropdown");
  const navbar = document.querySelector(".navbar");

  // Open side menu
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.add("active");
      if (sideMenu) sideMenu.classList.add("active");
      if (menuOverlay) menuOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  // Close side menu function
  function closeSideMenu() {
    if (hamburger) hamburger.classList.remove("active");
    if (sideMenu) sideMenu.classList.remove("active");
    if (menuOverlay) menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Close menu button
  if (closeMenu) {
    closeMenu.addEventListener("click", closeSideMenu);
  }

  // Overlay click to close
  if (menuOverlay) {
    menuOverlay.addEventListener("click", closeSideMenu);
  }

  // Close menu when clicking internal links
  const sideMenuLinks = document.querySelectorAll(
    ".side-menu-links a:not(.mobile-dropdown-toggle)"
  );
  sideMenuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      setTimeout(closeSideMenu, 300);
    });
  });

  // Mobile dropdown toggle
  if (mobileDropdownToggle && mobileDropdown) {
    mobileDropdownToggle.addEventListener("click", function (e) {
      e.preventDefault();
      mobileDropdown.classList.toggle("active");
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#" && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navbarHeight = navbar ? navbar.offsetHeight : 60;
          const targetPosition =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            navbarHeight -
            20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
          closeSideMenu(); // Close menu after navigation
        }
      }
    });
  });

  // Add scrolled class to navbar
  window.addEventListener("scroll", function () {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  });

  // Keyboard accessibility - ESC key closes menu
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeSideMenu();
    }
  });
});

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

// ========================================
// IMAGE MODAL
// ========================================
const modal = document.getElementById("imageModal");
if (modal) {
  const modalImg = document.getElementById("modalImage");
  const captionText = document.getElementById("caption");
  const closeModal = document.querySelector(".close");

  if (modalImg && captionText && closeModal) {
    document.querySelectorAll(".carousel-item img").forEach((img) => {
      img.addEventListener("click", () => {
        modal.style.display = "flex";
        modalImg.src = img.src;
        captionText.textContent = img.alt || "Image";
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
}

// ========================================
// BACK TO TOP BUTTON
// ========================================
const backToTop = document.getElementById("backToTop");
if (backToTop) {
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
}

// ========================================
// CTA OVERLAY
// ========================================
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

// ========================================
// CONTACT FORM SUBMISSION
// ========================================
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formResponse = document.getElementById("formResponse");

    if (!formResponse) {
      console.error("formResponse element not found");
      return;
    }

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => {
        formResponse.textContent = "Message sent successfully!";
        formResponse.classList.add("visible");
        form.reset();
        setTimeout(() => {
          formResponse.classList.remove("visible");
        }, 3000);
      })
      .catch((error) => {
        formResponse.textContent = "Error sending message.";
        formResponse.classList.add("visible");
        console.error("Form submission error:", error);
      });
  });
}

const valuationForm = document.getElementById("valuationForm");
if (valuationForm) {
  valuationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formResponse = document.getElementById("valuationFormResponse");
    if (!formResponse) {
      console.error("valuationFormResponse element not found");
      return;
    }
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => {
        formResponse.textContent = "Valuation request sent successfully!";
        formResponse.classList.add("visible");
        form.reset();
        setTimeout(() => {
          formResponse.classList.remove("visible");
        }, 3000);
      })
      .catch((error) => {
        formResponse.textContent = "Error sending valuation request.";
        formResponse.classList.add("visible");
        console.error("Valuation form submission error:", error);
      });
  });
}

// ========================================
// CAROUSEL - TESTIMONIALS/LISTINGS
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;

  const carouselItems = document.querySelectorAll(".carousel-item");
  const prevButton = document.querySelector(
    ".carousel-container .carousel-arrow.prev"
  );
  const nextButton = document.querySelector(
    ".carousel-container .carousel-arrow.next"
  );
  const carouselContainer = document.querySelector(".carousel-container");
  const totalItems = carouselItems.length;

  if (totalItems === 0 || !prevButton || !nextButton) return;

  let currentIndex = 0;
  let itemsPerView = 3;
  let autoplayInterval;

  // Update items per view based on screen size
  const updateItemsPerView = () => {
    itemsPerView = window.innerWidth <= 768 ? 1 : 3;
    updateCarousel();
  };

  // Update carousel position
  const updateCarousel = () => {
    const itemWidth = carouselItems[0]?.getBoundingClientRect().width || 0;
    if (itemWidth === 0) return;

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
      resetAutoplay();
    }
  });

  // Prev button click
  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
      resetAutoplay();
    }
  });

  // Autoplay function
  const startAutoplay = () => {
    autoplayInterval = setInterval(() => {
      if (currentIndex < totalItems - itemsPerView) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      updateCarousel();
    }, 5000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayInterval);
    startAutoplay();
  };

  // Pause autoplay on hover
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", () =>
      clearInterval(autoplayInterval)
    );
    carouselContainer.addEventListener("mouseleave", startAutoplay);
  }

  // Touch/Swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0]?.clientX || 0;
  });

  carousel.addEventListener("touchmove", (e) => {
    touchEndX = e.touches[0]?.clientX || 0;
  });

  carousel.addEventListener("touchend", () => {
    const swipeDistance = touchEndX - touchStartX;
    const swipeThreshold = 50;

    if (swipeDistance > swipeThreshold && currentIndex > 0) {
      currentIndex--;
      updateCarousel();
      resetAutoplay();
    } else if (
      swipeDistance < -swipeThreshold &&
      currentIndex < totalItems - itemsPerView
    ) {
      currentIndex++;
      updateCarousel();
      resetAutoplay();
    }
  });

  // Initial setup
  updateItemsPerView();
  startAutoplay();

  // Update on window resize
  window.addEventListener(
    "resize",
    debounce(() => {
      updateItemsPerView();
    }, 250)
  );
});

// ========================================
// HOUSE CAROUSEL
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  const houseCarousel = document.querySelector(".house-carousel");
  if (!houseCarousel) return;

  const houseCarouselItems = document.querySelectorAll(".house-carousel-item");
  const housePrevButton = document.querySelector(
    ".house-carousel-container .carousel-arrow.prev"
  );
  const houseNextButton = document.querySelector(
    ".house-carousel-container .carousel-arrow.next"
  );

  if (houseCarouselItems.length === 0 || !housePrevButton || !houseNextButton)
    return;

  const houseTotalItems = houseCarouselItems.length;
  let houseCurrentIndex = 0;
  let houseItemsPerView = 2;

  // Update items per view based on screen size
  const updateHouseItemsPerView = () => {
    houseItemsPerView = window.innerWidth <= 768 ? 1 : 2;
    updateHouseCarousel();
  };

  // Update house carousel position
  const updateHouseCarousel = () => {
    const itemWidth = houseCarouselItems[0]?.getBoundingClientRect().width || 0;
    if (itemWidth === 0) return;

    const translateX = -(houseCurrentIndex * itemWidth);
    houseCarousel.style.transform = `translateX(${translateX}px)`;

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

  // Touch/Swipe support
  let houseTouchStartX = 0;
  let houseTouchEndX = 0;

  houseCarousel.addEventListener("touchstart", (e) => {
    houseTouchStartX = e.touches[0]?.clientX || 0;
  });

  houseCarousel.addEventListener("touchmove", (e) => {
    houseTouchEndX = e.touches[0]?.clientX || 0;
  });

  houseCarousel.addEventListener("touchend", () => {
    const swipeDistance = houseTouchEndX - houseTouchStartX;
    const swipeThreshold = 50;

    if (swipeDistance > swipeThreshold && houseCurrentIndex > 0) {
      houseCurrentIndex--;
      updateHouseCarousel();
    } else if (
      swipeDistance < -swipeThreshold &&
      houseCurrentIndex < houseTotalItems - houseItemsPerView
    ) {
      houseCurrentIndex++;
      updateHouseCarousel();
    }
  });

  // Initial setup
  updateHouseItemsPerView();

  // Update on window resize
  window.addEventListener(
    "resize",
    debounce(() => {
      updateHouseItemsPerView();
    }, 250)
  );
});

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelector(".nav-links");

  if (!navbar || !navLinks) return;

  window.addEventListener(
    "scroll",
    debounce(() => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
        navLinks.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
        navLinks.classList.remove("scrolled");
      }
    }, 100)
  );
});
