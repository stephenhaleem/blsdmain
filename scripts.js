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

// Enhanced Canadian Mortgage Calculator
document.addEventListener("DOMContentLoaded", () => {
  const mortgageForm = document.getElementById("mortgageForm");
  const resultCard = document.getElementById("result");
  const calculatorError = document.getElementById("calculatorError");

  // CMHC Insurance Rates (as of 2024)
  const cmhcRates = {
    0.05: 0.04, // 5-9.99% down
    0.1: 0.031, // 10-14.99% down
    0.15: 0.028, // 15-19.99% down
    0.2: 0, // 20%+ down (no insurance needed)
  };

  // Land Transfer Tax Rates by Province (simplified)
  const landTransferTaxRates = {
    AB: 0, // Alberta has no provincial land transfer tax
    BC: 0.01,
    MB: 0.005,
    NB: 0.005,
    NL: 0.004,
    NS: 0.015,
    ON: 0.02,
    PE: 0.01,
    QC: 0.005,
    SK: 0.003,
  };

  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  }

  // Calculate CMHC Insurance
  function calculateCMHC(propertyPrice, downPayment) {
    const downPaymentPercent = downPayment / propertyPrice;
    const mortgageAmount = propertyPrice - downPayment;

    if (downPaymentPercent >= 0.2) return 0;

    let rate = 0.04; // Default for 5-9.99%
    if (downPaymentPercent >= 0.15) rate = 0.028;
    else if (downPaymentPercent >= 0.1) rate = 0.031;

    return mortgageAmount * rate;
  }

  // Calculate Land Transfer Tax
  function calculateLandTransferTax(propertyPrice, province, firstTimeBuyer) {
    const baseRate = landTransferTaxRates[province] || 0;
    let tax = propertyPrice * baseRate;

    // Alberta has a flat fee structure
    if (province === "AB") {
      if (propertyPrice <= 150000) tax = 0;
      else if (propertyPrice <= 200000) tax = (propertyPrice - 150000) * 0.001;
      else tax = 50 + (propertyPrice - 200000) * 0.002;
    }

    // First-time buyer rebate (simplified - varies by province)
    if (firstTimeBuyer && province === "ON" && propertyPrice <= 500000) {
      tax = Math.max(0, tax - 4000);
    }

    return tax;
  }

  // Get payment frequency multiplier
  function getPaymentFrequency(frequency) {
    const frequencies = {
      monthly: 12,
      "semi-monthly": 24,
      "bi-weekly": 26,
      weekly: 52,
      "accelerated-bi-weekly": 26,
      "accelerated-weekly": 52,
    };
    return frequencies[frequency] || 12;
  }

  // Calculate mortgage payment
  function calculateMortgagePayment(
    principal,
    annualRate,
    years,
    frequency = "monthly"
  ) {
    const paymentsPerYear = getPaymentFrequency(frequency);
    const periodicRate = annualRate / 100 / paymentsPerYear;
    const totalPayments = years * paymentsPerYear;

    if (periodicRate === 0) return principal / totalPayments;

    const payment =
      (periodicRate * principal) /
      (1 - Math.pow(1 + periodicRate, -totalPayments));

    // For accelerated payments, calculate as monthly/payment multiplier
    if (frequency.includes("accelerated")) {
      const monthlyPayment = calculateMortgagePayment(
        principal,
        annualRate,
        years,
        "monthly"
      );
      return frequency === "accelerated-bi-weekly"
        ? monthlyPayment / 2
        : monthlyPayment / 4;
    }

    return payment;
  }

  // Calculate total interest and payoff time
  function calculateLoanDetails(principal, annualRate, years, frequency) {
    const paymentsPerYear = getPaymentFrequency(frequency);
    const periodicRate = annualRate / 100 / paymentsPerYear;
    let totalPayments = years * paymentsPerYear;
    const payment = calculateMortgagePayment(
      principal,
      annualRate,
      years,
      frequency
    );

    let balance = principal;
    let totalInterest = 0;
    let actualPayments = 0;

    for (let i = 0; i < totalPayments && balance > 0; i++) {
      const interestPayment = balance * periodicRate;
      const principalPayment = payment - interestPayment;
      balance -= principalPayment;
      totalInterest += interestPayment;
      actualPayments++;

      if (balance < 0) balance = 0;
    }

    return {
      totalInterest,
      totalPayments: actualPayments,
      yearsToPayoff: actualPayments / paymentsPerYear,
    };
  }

  // Generate amortization schedule
  function generateAmortizationSchedule(
    principal,
    annualRate,
    years,
    frequency
  ) {
    const paymentsPerYear = getPaymentFrequency(frequency);
    const periodicRate = annualRate / 100 / paymentsPerYear;
    const totalPayments = years * paymentsPerYear;
    const payment = calculateMortgagePayment(
      principal,
      annualRate,
      years,
      frequency
    );

    const schedule = [];
    let balance = principal;

    for (let i = 1; i <= totalPayments && balance > 0; i++) {
      const interestPayment = balance * periodicRate;
      const principalPayment = Math.min(payment - interestPayment, balance);
      balance -= principalPayment;

      if (i === 1 || i % paymentsPerYear === 1 || balance <= 0) {
        schedule.push({
          payment: i,
          paymentAmount: payment,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
        });
      }
    }

    return schedule;
  }

  // Render amortization table
  function renderAmortizationTable(schedule) {
    const table = document.getElementById("amortizationTable");
    table.innerHTML = `
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
        ${schedule
          .map(
            (row) => `
          <tr>
            <td>${row.payment}</td>
            <td>${formatCurrency(row.paymentAmount)}</td>
            <td>${formatCurrency(row.principal)}</td>
            <td>${formatCurrency(row.interest)}</td>
            <td>${formatCurrency(row.balance)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;
  }

  // Update down payment percentage display
  function updateDownPaymentPercent() {
    const propertyPrice =
      parseFloat(document.getElementById("propertyPrice").value) || 0;
    const downPayment =
      parseFloat(document.getElementById("downPayment").value) || 0;
    const percent = propertyPrice > 0 ? (downPayment / propertyPrice) * 100 : 0;

    const percentDisplays = document.querySelectorAll(".down-payment-percent");
    percentDisplays.forEach((display) => {
      display.textContent = `(${percent.toFixed(1)}%)`;
      display.style.color = percent >= 20 ? "#4ade80" : "#fbbf24";
    });
  }

  // Sync sliders with inputs and add dynamic max for down payment
  document.querySelectorAll('input[type="range"]').forEach((slider) => {
    const targetId = slider.getAttribute("data-target");
    const targetInput = document.getElementById(targetId);
    const rangeValue = slider.parentElement.querySelector(".range-value");

    slider.addEventListener("input", () => {
      targetInput.value = slider.value;
      updateRangeDisplay(slider, rangeValue);
      if (targetId === "propertyPrice" || targetId === "downPayment") {
        updateDownPaymentPercent();
        if (targetId === "propertyPrice") {
          const downSlider = document.getElementById("downPaymentSlider");
          downSlider.max = slider.value;
        }
      }
    });

    targetInput.addEventListener("input", () => {
      slider.value = Math.min(
        Math.max(targetInput.value, slider.min),
        slider.max
      );
      updateRangeDisplay(slider, rangeValue);
      if (targetId === "propertyPrice" || targetId === "downPayment") {
        updateDownPaymentPercent();
      }
    });

    updateRangeDisplay(slider, rangeValue);
  });

  function updateRangeDisplay(slider, rangeValue) {
    const value = parseFloat(slider.value);
    const targetId = slider.getAttribute("data-target");
    const percent = ((value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty("--value", `${percent}%`);

    if (
      targetId === "propertyPrice" ||
      targetId === "downPayment" ||
      targetId === "propertyTax" ||
      targetId === "condoFee"
    ) {
      rangeValue.innerHTML = `CAD $${formatCurrency(value)} ${
        targetId === "downPayment"
          ? '<span class="down-payment-percent">(20.0%)</span>'
          : ""
      }`;
    } else if (targetId === "interestRate") {
      rangeValue.textContent = `${value.toFixed(2)}%`;
    }
  }

  // Form submission
  mortgageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const propertyPrice = parseFloat(
      document.getElementById("propertyPrice").value
    );
    const downPayment = parseFloat(
      document.getElementById("downPayment").value
    );
    const interestRate = parseFloat(
      document.getElementById("interestRate").value
    );
    const amortization = parseInt(
      document.getElementById("amortization").value
    );
    const paymentFrequency = document.getElementById("paymentFrequency").value;
    const propertyTax =
      parseFloat(document.getElementById("propertyTax").value) || 0;
    const condoFee = parseFloat(document.getElementById("condoFee").value) || 0;
    const firstTimeBuyer = document.getElementById("firstTimeBuyer").checked;
    const province = document.getElementById("province").value;

    // Validate
    if (downPayment < propertyPrice * 0.05) {
      calculatorError.textContent =
        "Down payment must be at least 5% of property price.";
      calculatorError.style.display = "block";
      return;
    }

    if (downPayment < propertyPrice * 0.2 && amortization > 25) {
      calculatorError.textContent =
        "Amortization cannot exceed 25 years with less than 20% down payment.";
      calculatorError.style.display = "block";
      return;
    }

    calculatorError.style.display = "none";

    // Calculate CMHC Insurance
    const cmhcInsurance = calculateCMHC(propertyPrice, downPayment);
    const totalMortgage = propertyPrice - downPayment + cmhcInsurance;

    // Calculate Land Transfer Tax
    const landTransferTax = calculateLandTransferTax(
      propertyPrice,
      province,
      firstTimeBuyer
    );

    // Calculate payments
    const payment = calculateMortgagePayment(
      totalMortgage,
      interestRate,
      amortization,
      paymentFrequency
    );

    // Convert to monthly for display
    const paymentsPerYear = getPaymentFrequency(paymentFrequency);
    const monthlyPayment = (payment * paymentsPerYear) / 12;
    const monthlyPropertyTax = propertyTax / 12;
    const totalMonthly = monthlyPayment + monthlyPropertyTax + condoFee;

    // Calculate loan details
    const loanDetails = calculateLoanDetails(
      totalMortgage,
      interestRate,
      amortization,
      paymentFrequency
    );

    // Calculate comparison with monthly
    const monthlyDetails = calculateLoanDetails(
      totalMortgage,
      interestRate,
      amortization,
      "monthly"
    );
    const interestSaved =
      monthlyDetails.totalInterest - loanDetails.totalInterest;
    const timeSaved =
      ((monthlyDetails.totalPayments - loanDetails.totalPayments) /
        paymentsPerYear) *
      12;

    // Update display
    document.getElementById("closingDownPayment").textContent =
      formatCurrency(downPayment);
    document.getElementById("cmhcPremium").textContent =
      formatCurrency(cmhcInsurance);
    document.getElementById("landTransferTax").textContent =
      formatCurrency(landTransferTax);
    document.getElementById("totalClosing").textContent = formatCurrency(
      downPayment + cmhcInsurance + landTransferTax + 1500 + 500
    );

    document.getElementById("mortgagePayment").textContent =
      formatCurrency(monthlyPayment);
    document.getElementById("propertyTaxMonthly").textContent =
      formatCurrency(monthlyPropertyTax);
    document.getElementById("condoFeeMonthly").textContent =
      formatCurrency(condoFee);
    document.getElementById("totalMonthlyPayment").textContent =
      formatCurrency(totalMonthly);

    document.getElementById("totalMortgage").textContent =
      formatCurrency(totalMortgage);
    document.getElementById("totalInterest").textContent = formatCurrency(
      loanDetails.totalInterest
    );
    document.getElementById("totalPayment").textContent = formatCurrency(
      totalMortgage + loanDetails.totalInterest
    );
    document.getElementById("piRatio").textContent =
      ((loanDetails.totalInterest / totalMortgage) * 100).toFixed(1) + "%";

    // Update frequency comparison
    document.getElementById("selectedFrequency").textContent =
      paymentFrequency.replace(/-/g, " ");
    document.getElementById("interestSaved").textContent = formatCurrency(
      Math.abs(interestSaved)
    );
    document.getElementById("timeSaved").textContent =
      Math.round(Math.abs(timeSaved)) + " months";
    document.getElementById("comparisonInfo").innerHTML = `
      <p>By choosing <span id="selectedFrequency">${paymentFrequency.replace(
        /-/g,
        " "
      )}</span> payments, you will:</p>
      <ul>
        <li>${
          interestSaved >= 0 ? "Pay" : "Save"
        } <span id="interestSaved">${formatCurrency(
      Math.abs(interestSaved)
    )}</span> ${interestSaved >= 0 ? "more" : "less"} in interest</li>
        <li>Pay off your mortgage <span id="timeSaved">${Math.round(
          Math.abs(timeSaved)
        )}</span> months ${timeSaved >= 0 ? "slower" : "faster"}</li>
      </ul>
      <p>compared to monthly payments</p>
    `;

    // Show/hide CMHC warning
    const cmhcWarning = document.getElementById("cmhcWarning");
    if (downPayment < propertyPrice * 0.2) {
      cmhcWarning.style.display = "flex";
    } else {
      cmhcWarning.style.display = "none";
    }

    // Amortization schedule
    const schedule = generateAmortizationSchedule(
      totalMortgage,
      interestRate,
      amortization,
      paymentFrequency
    );

    document.getElementById("showAmortization").onclick = () => {
      const container = document.getElementById("amortizationContainer");
      if (container.style.display === "block") {
        container.style.display = "none";
        document.getElementById("showAmortization").textContent =
          "Show Amortization Schedule";
      } else {
        renderAmortizationTable(schedule);
        container.style.display = "block";
        document.getElementById("showAmortization").textContent =
          "Hide Amortization Schedule";
      }
    };

    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Reset button
  document.getElementById("reset").addEventListener("click", () => {
    calculatorError.style.display = "none";
    resultCard.style.display = "none";
    document.getElementById("amortizationContainer").style.display = "none";
    setTimeout(updateDownPaymentPercent, 100);
  });

  // Initialize
  updateDownPaymentPercent();
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
