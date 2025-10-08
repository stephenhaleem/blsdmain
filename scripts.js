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

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("mortgageForm");
  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("calculatorError");
  const showAmortizationBtn = document.getElementById("showAmortization");
  const amortizationContainer = document.getElementById(
    "amortizationContainer"
  );

  // Check if calculator exists on page
  if (!form) return;

  // Sync sliders with inputs
  const sliders = document.querySelectorAll(
    '.range-slider input[type="range"]'
  );
  sliders.forEach((slider) => {
    const targetId = slider.dataset.target;
    const targetInput = document.getElementById(targetId);
    const rangeValue = slider.nextElementSibling;

    // Update on slider change
    slider.addEventListener("input", function () {
      targetInput.value = this.value;
      updateRangeDisplay(slider, rangeValue, targetId);
      updateSliderProgress(slider);
    });

    // Update on input change
    targetInput.addEventListener("input", function () {
      slider.value = this.value;
      updateRangeDisplay(slider, rangeValue, targetId);
      updateSliderProgress(slider);
    });

    // Initialize
    updateRangeDisplay(slider, rangeValue, targetId);
    updateSliderProgress(slider);
  });

  function updateRangeDisplay(slider, displayElement, inputId) {
    const value = parseFloat(slider.value);

    if (
      inputId === "propertyPrice" ||
      inputId === "downPayment" ||
      inputId === "propertyTax" ||
      inputId === "condoFee"
    ) {
      displayElement.textContent = `CAD $${value.toLocaleString()}`;

      // Add down payment percentage
      if (inputId === "downPayment") {
        const propertyPrice = parseFloat(
          document.getElementById("propertyPrice").value
        );
        const percentage = ((value / propertyPrice) * 100).toFixed(1);
        displayElement.innerHTML = `CAD $${value.toLocaleString()} <span class="down-payment-percent">(${percentage}%)</span>`;
      }
    } else if (inputId === "interestRate") {
      displayElement.textContent = `${value.toFixed(2)}%`;
    }
  }

  function updateSliderProgress(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const value = parseFloat(slider.value);
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.setProperty("--value", `${percentage}%`);
  }

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calculateMortgage();
  });

  // Reset button
  document.getElementById("reset").addEventListener("click", function () {
    resultDiv.style.display = "none";
    errorDiv.style.display = "none";
    amortizationContainer.style.display = "none";
    showAmortizationBtn.textContent = "Show Amortization Schedule";
  });

  // Show amortization schedule
  if (showAmortizationBtn) {
    showAmortizationBtn.addEventListener("click", function () {
      if (amortizationContainer.style.display === "none") {
        amortizationContainer.style.display = "block";
        this.textContent = "Hide Amortization Schedule";
      } else {
        amortizationContainer.style.display = "none";
        this.textContent = "Show Amortization Schedule";
      }
    });
  }

  function calculateMortgage() {
    // Get input values
    const propertyPrice = parseFloat(
      document.getElementById("propertyPrice").value
    );
    const downPayment = parseFloat(
      document.getElementById("downPayment").value
    );
    const interestRate =
      parseFloat(document.getElementById("interestRate").value) / 100;
    const amortizationYears = parseInt(
      document.getElementById("amortization").value
    );
    const paymentFrequency = document.getElementById("paymentFrequency").value;
    const propertyTax = parseFloat(
      document.getElementById("propertyTax").value
    );
    const condoFee = parseFloat(document.getElementById("condoFee").value);
    const firstTimeBuyer = document.getElementById("firstTimeBuyer").checked;
    const province = document.getElementById("province").value;

    // Validation
    const downPaymentPercent = (downPayment / propertyPrice) * 100;

    if (downPayment < propertyPrice * 0.05) {
      showError("Down payment must be at least 5% of the property price.");
      return;
    }

    if (downPayment >= propertyPrice) {
      showError(
        "Down payment cannot be equal to or greater than property price."
      );
      return;
    }

    errorDiv.style.display = "none";

    // Calculate CMHC insurance
    let cmhcPremium = 0;
    const requiresCMHC = downPaymentPercent < 20;

    if (requiresCMHC) {
      const loanAmount = propertyPrice - downPayment;
      let cmhcRate = 0;

      if (downPaymentPercent >= 15 && downPaymentPercent < 20) {
        cmhcRate = 0.028;
      } else if (downPaymentPercent >= 10 && downPaymentPercent < 15) {
        cmhcRate = 0.031;
      } else if (downPaymentPercent >= 5 && downPaymentPercent < 10) {
        cmhcRate = 0.04;
      }

      cmhcPremium = loanAmount * cmhcRate;
    }

    // Calculate land transfer tax
    const landTransferTax = calculateLandTransferTax(
      propertyPrice,
      province,
      firstTimeBuyer
    );

    // Total mortgage amount (including CMHC if applicable)
    const totalMortgage = propertyPrice - downPayment + cmhcPremium;

    // Calculate payment based on frequency
    const paymentData = calculatePayment(
      totalMortgage,
      interestRate,
      amortizationYears,
      paymentFrequency
    );

    // Display results
    displayResults({
      propertyPrice,
      downPayment,
      cmhcPremium,
      landTransferTax,
      totalMortgage,
      mortgagePayment: paymentData.payment,
      propertyTax,
      condoFee,
      totalInterest: paymentData.totalInterest,
      totalPayment: paymentData.totalPaid,
      requiresCMHC,
      paymentFrequency,
      amortizationYears,
      interestRate,
      paymentsPerYear: paymentData.paymentsPerYear,
    });

    // Generate amortization schedule
    generateAmortizationSchedule(
      totalMortgage,
      interestRate,
      amortizationYears,
      paymentData
    );
  }

  function calculatePayment(principal, annualRate, years, frequency) {
    let paymentsPerYear;
    let rate;

    switch (frequency) {
      case "monthly":
        paymentsPerYear = 12;
        break;
      case "semi-monthly":
        paymentsPerYear = 24;
        break;
      case "bi-weekly":
        paymentsPerYear = 26;
        break;
      case "weekly":
        paymentsPerYear = 52;
        break;
      case "accelerated-bi-weekly":
        paymentsPerYear = 26;
        break;
      case "accelerated-weekly":
        paymentsPerYear = 52;
        break;
    }

    const totalPayments = years * paymentsPerYear;
    rate = annualRate / paymentsPerYear;

    let payment;
    if (frequency.includes("accelerated")) {
      // Accelerated payments: calculate monthly then divide
      const monthlyRate = annualRate / 12;
      const monthlyPayment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, years * 12))) /
        (Math.pow(1 + monthlyRate, years * 12) - 1);
      payment =
        frequency === "accelerated-bi-weekly"
          ? monthlyPayment / 2
          : monthlyPayment / 4;
    } else {
      // Standard amortization formula
      payment =
        (principal * (rate * Math.pow(1 + rate, totalPayments))) /
        (Math.pow(1 + rate, totalPayments) - 1);
    }

    // Calculate total interest
    let balance = principal;
    let totalInterest = 0;

    for (let i = 0; i < totalPayments; i++) {
      const interestPayment = balance * rate;
      const principalPayment = payment - interestPayment;
      totalInterest += interestPayment;
      balance -= principalPayment;

      if (balance <= 0) break;
    }

    return {
      payment: payment,
      totalInterest: totalInterest,
      totalPaid: payment * totalPayments,
      paymentsPerYear: paymentsPerYear,
    };
  }

  function calculateLandTransferTax(price, province, firstTime) {
    let tax = 0;

    switch (province) {
      case "AB":
        // Alberta has a flat registration fee, not a tax
        tax = price * 0.001; // Approximate
        break;
      case "BC":
        if (price <= 200000) {
          tax = price * 0.01;
        } else if (price <= 2000000) {
          tax = 2000 + (price - 200000) * 0.02;
        } else {
          tax = 38000 + (price - 2000000) * 0.03;
        }
        if (firstTime && price <= 500000) {
          tax = 0;
        }
        break;
      case "ON":
        if (price <= 55000) {
          tax = price * 0.005;
        } else if (price <= 250000) {
          tax = 275 + (price - 55000) * 0.01;
        } else if (price <= 400000) {
          tax = 2225 + (price - 250000) * 0.015;
        } else {
          tax = 4475 + (price - 400000) * 0.02;
        }
        if (firstTime && price <= 368333) {
          tax = Math.max(0, tax - 4000);
        }
        break;
      case "MB":
        tax = price * 0.005;
        break;
      case "NB":
        tax = price * 0.005;
        break;
      case "NL":
        tax = price * 0.004;
        break;
      case "NS":
        tax = price * 0.015;
        break;
      case "PE":
        tax = price * 0.01;
        break;
      case "QC":
        tax = price * 0.005;
        break;
      case "SK":
        tax = price * 0.003;
        break;
      default:
        tax = price * 0.01;
    }

    return tax;
  }

  function displayResults(data) {
    // Closing costs
    document.getElementById(
      "closingDownPayment"
    ).textContent = `CAD $${data.downPayment.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
    document.getElementById(
      "cmhcPremium"
    ).textContent = `CAD $${data.cmhcPremium.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
    document.getElementById(
      "landTransferTax"
    ).textContent = `CAD $${data.landTransferTax.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

    const totalClosing =
      data.downPayment + data.cmhcPremium + data.landTransferTax + 1500 + 500;
    document.getElementById(
      "totalClosing"
    ).textContent = `CAD $${totalClosing.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

    // CMHC warning
    const cmhcWarning = document.getElementById("cmhcWarning");
    cmhcWarning.style.display = data.requiresCMHC ? "flex" : "none";

    // Monthly payments
    const propertyTaxMonthly = data.propertyTax / 12;
    document.getElementById(
      "mortgagePayment"
    ).textContent = `CAD $${data.mortgagePayment.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
    document.getElementById(
      "propertyTaxMonthly"
    ).textContent = `CAD $${propertyTaxMonthly.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
    document.getElementById(
      "condoFeeMonthly"
    ).textContent = `CAD $${data.condoFee.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

    const totalMonthly =
      data.mortgagePayment + propertyTaxMonthly + data.condoFee;
    document.getElementById(
      "totalMonthlyPayment"
    ).textContent = `CAD $${totalMonthly.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

    // Loan summary
    document.getElementById(
      "totalMortgage"
    ).textContent = `CAD $${data.totalMortgage.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
    document.getElementById(
      "totalInterest"
    ).textContent = `CAD $${data.totalInterest.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
    document.getElementById(
      "totalPayment"
    ).textContent = `CAD $${data.totalPayment.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

    const piRatio = ((data.totalMortgage / data.totalPayment) * 100).toFixed(1);
    document.getElementById("piRatio").textContent = `${piRatio}% Principal`;

    // Frequency comparison
    const monthlyData = calculatePayment(
      data.totalMortgage,
      data.interestRate,
      data.amortizationYears,
      "monthly"
    );
    const interestSaved = monthlyData.totalInterest - data.totalInterest;
    const monthsSaved =
      data.amortizationYears * 12 -
      (data.totalPayment / data.mortgagePayment / data.paymentsPerYear) * 12;

    document.getElementById("selectedFrequency").textContent =
      data.paymentFrequency.replace("-", " ");
    document.getElementById("interestSaved").textContent = `CAD $${Math.max(
      0,
      interestSaved
    ).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    document.getElementById("timeSaved").textContent = `${Math.max(
      0,
      Math.round(monthsSaved)
    )} months`;

    resultDiv.style.display = "block";
    amortizationContainer.style.display = "none";
    showAmortizationBtn.textContent = "Show Amortization Schedule";
  }

  function generateAmortizationSchedule(
    principal,
    annualRate,
    years,
    paymentData
  ) {
    const table = document.getElementById("amortizationTable");
    const paymentsPerYear = paymentData.paymentsPerYear;
    const rate = annualRate / paymentsPerYear;
    const payment = paymentData.payment;

    let html = `
      <thead>
        <tr>
          <th>Payment #</th>
          <th>Payment</th>
          <th>Principal</th>
          <th>Interest</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
    `;

    let balance = principal;
    const totalPayments = years * paymentsPerYear;

    for (let i = 1; i <= totalPayments; i++) {
      const interestPayment = balance * rate;
      const principalPayment = payment - interestPayment;
      balance -= principalPayment;

      if (balance < 0) balance = 0;

      // Show first month of each year and final payment
      if (
        i === 1 ||
        i % paymentsPerYear === 1 ||
        i === totalPayments ||
        balance === 0
      ) {
        html += `
          <tr>
            <td>${i}</td>
            <td>CAD $${payment.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}</td>
            <td>CAD $${principalPayment.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}</td>
            <td>CAD $${interestPayment.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}</td>
            <td>CAD $${balance.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}</td>
          </tr>
        `;
      }

      if (balance === 0) break;
    }

    html += "</tbody>";
    table.innerHTML = html;
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    resultDiv.style.display = "none";
  }
});

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
