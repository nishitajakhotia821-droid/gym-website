"use strict";

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const navLinks = [...document.querySelectorAll(".nav-link")];
const backToTop = document.querySelector(".back-top-float");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  primaryNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  primaryNav.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});
navLinks.forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});

let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    header.classList.toggle("is-scrolled", window.scrollY > 30);
    backToTop.classList.toggle("is-visible", window.scrollY > 550);
    scrollTicking = false;
  });
}, { passive: true });
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" }));
document.querySelector("#current-year").textContent = new Date().getFullYear();

const loader = document.querySelector(".loader");
const hideLoader = () => loader.classList.add("is-hidden");
window.addEventListener("load", hideLoader, { once: true });
window.setTimeout(hideLoader, 1800);

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
} else revealItems.forEach((item) => item.classList.add("is-visible"));

const sections = document.querySelectorAll("main section[id]");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach((section) => sectionObserver.observe(section));
}

const counterObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const target = Number(counter.dataset.count);
    const duration = reduceMotion ? 0 : 1200;
    const start = performance.now();
    const update = (time) => {
      const progress = duration === 0 ? 1 : Math.min((time - start) / duration, 1);
      counter.textContent = Math.round(target * (1 - (1 - progress) ** 3)).toLocaleString("en-IN");
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
    observer.unobserve(counter);
  });
}, { threshold: .65 }) : null;
document.querySelectorAll("[data-count]").forEach((counter) => {
  if (counterObserver) counterObserver.observe(counter);
  else counter.textContent = Number(counter.dataset.count).toLocaleString("en-IN");
});

const programCards = [...document.querySelectorAll(".program-card")];
const programFilters = [...document.querySelectorAll("[data-program-filter]")];
const programEmpty = document.querySelector("#program-empty");
programFilters.forEach((button) => button.addEventListener("click", () => {
  const filter = button.dataset.programFilter;
  let visibleCount = 0;
  programFilters.forEach((filterButton) => {
    const active = filterButton === button;
    filterButton.classList.toggle("is-active", active);
    filterButton.setAttribute("aria-pressed", String(active));
  });
  programCards.forEach((card) => {
    const categories = card.dataset.programCategories.split(" ");
    const visible = filter === "all" || categories.includes(filter);
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  programEmpty.hidden = visibleCount > 0;
}));

const bmiForm = document.querySelector("#bmi-form");
bmiForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const height = document.querySelector("#height");
  const weight = document.querySelector("#weight");
  if (!height.reportValidity() || !weight.reportValidity()) return;
  const bmi = Number(weight.value) / (Number(height.value) / 100) ** 2;
  let category;
  let message;
  if (bmi < 18.5) {
    category = "Below the usual range";
    message = "BMI is one data point. A health professional can help put it in context.";
  } else if (bmi < 25) {
    category = "Within the usual range";
    message = "Keep building healthy habits that work for your body and your life.";
  } else if (bmi < 30) {
    category = "Above the usual range";
    message = "BMI does not account for muscle or body composition. Consider personal guidance.";
  } else {
    category = "Well above the usual range";
    message = "BMI is not a diagnosis. A health professional can offer individual advice.";
  }
  document.querySelector("#bmi-value").textContent = bmi.toFixed(1);
  document.querySelector("#bmi-category").textContent = category;
  document.querySelector("#bmi-message").textContent = message;
  document.querySelector("#bmi-result").hidden = false;
});

const slides = [...document.querySelectorAll(".testimonial-slide")];
const currentSlide = document.querySelector("#current-slide");
document.querySelector("#total-slides").textContent = String(slides.length).padStart(2, "0");
let activeSlide = 0;
let slideTimer;
function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.hidden = i !== activeSlide;
    slide.classList.toggle("is-active", i === activeSlide);
  });
  currentSlide.textContent = String(activeSlide + 1).padStart(2, "0");
}
function startSlideTimer() {
  clearInterval(slideTimer);
  if (!reduceMotion) slideTimer = setInterval(() => showSlide(activeSlide + 1), 6500);
}
document.querySelectorAll("[data-slide]").forEach((button) => button.addEventListener("click", () => {
  showSlide(activeSlide + (button.dataset.slide === "next" ? 1 : -1));
  startSlideTimer();
}));
const testimonialStage = document.querySelector(".testimonial-stage");
testimonialStage.addEventListener("mouseenter", () => clearInterval(slideTimer));
testimonialStage.addEventListener("mouseleave", startSlideTimer);
testimonialStage.addEventListener("focusin", () => clearInterval(slideTimer));
testimonialStage.addEventListener("focusout", startSlideTimer);
startSlideTimer();

const contactForm = document.querySelector("#contact-form");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const name = document.querySelector("#contact-name").value.trim().split(/\s+/)[0];
  document.querySelector("#contact-status").textContent = `Thanks, ${name}. Your message is ready for the Iron Peak team.`;
  contactForm.reset();
});

const newsletterForm = document.querySelector("#newsletter-form");
newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!newsletterForm.reportValidity()) return;
  document.querySelector("#newsletter-status").textContent = "You're on the list. Look out for our next note.";
  newsletterForm.reset();
});

const membershipModal = document.querySelector("#membership-modal");
const trialModal = document.querySelector("#trial-modal");
const membershipForm = document.querySelector("#membership-form");
const trialForm = document.querySelector("#trial-form");
const planOptions = {
  basic: { name: "Basic", price: "₹999 / month" },
  pro: { name: "Pro", price: "₹1,999 / month" },
  elite: { name: "Elite", price: "₹3,499 / month" }
};
let lastGymModalTrigger = null;

function nextLocalDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatEnquiryDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function openGymModal(modal, focusSelector) {
  lastGymModalTrigger = document.activeElement;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
  window.setTimeout(() => {
    if (modal.classList.contains("is-open")) modal.querySelector(focusSelector).focus();
  }, 240);
}

function closeGymModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".gym-modal.is-open")) document.body.classList.remove("menu-open");
  if (lastGymModalTrigger?.isConnected) lastGymModalTrigger.focus();
}

function resetEnquiry(modal, form, confirmation, status) {
  form.reset();
  form.hidden = false;
  confirmation.hidden = true;
  status.textContent = "";
  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) dateInput.min = nextLocalDate();
}

function showEnquirySummary(container, items) {
  container.replaceChildren();
  items.forEach(([label, value]) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    row.append(term, description);
    container.append(row);
  });
}

function validateEnquiry(form, status) {
  const missingField = [...form.querySelectorAll("[required]")].find((field) => !field.value.trim());
  if (missingField) {
    status.textContent = "Please complete all required fields.";
    missingField.focus();
    return false;
  }
  const email = form.elements.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = "Please enter a valid email address.";
    form.elements.email.focus();
    return false;
  }
  const phone = form.elements.phone.value.trim();
  const phoneDigits = phone.replace(/\D/g, "");
  if (!/^\+?[0-9() .-]{8,20}$/.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
    status.textContent = "Please enter a valid phone number with 10 to 15 digits.";
    form.elements.phone.focus();
    return false;
  }
  const dateValue = form.elements.date.value;
  if (!dateValue || dateValue < nextLocalDate()) {
    status.textContent = "Please choose a date starting tomorrow or later.";
    form.elements.date.focus();
    return false;
  }
  if (!form.checkValidity()) {
    status.textContent = "Please check the highlighted fields and try again.";
    form.reportValidity();
    return false;
  }
  status.textContent = "";
  return true;
}

function submitWithLoading(button, submitLabel, complete) {
  button.disabled = true;
  button.innerHTML = 'SENDING <span class="submit-loader" aria-hidden="true"></span>';
  window.setTimeout(() => {
    complete();
    button.disabled = false;
    button.innerHTML = `${submitLabel} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>`;
  }, 550);
}

document.querySelectorAll("[data-open-membership]").forEach((trigger) => trigger.addEventListener("click", (event) => {
  event.preventDefault();
  if (menuToggle.getAttribute("aria-expanded") === "true") closeMenu();
  resetEnquiry(membershipModal, membershipForm, document.querySelector("#membership-confirmation"), document.querySelector("#membership-status"));
  openGymModal(membershipModal, "#member-name");
}));

document.querySelectorAll("[data-membership-plan]").forEach((trigger) => trigger.addEventListener("click", () => {
  resetEnquiry(membershipModal, membershipForm, document.querySelector("#membership-confirmation"), document.querySelector("#membership-status"));
  document.querySelector("#member-plan").value = trigger.dataset.membershipPlan;
  openGymModal(membershipModal, "#member-name");
}));

document.querySelectorAll("[data-open-trial], [data-book-trainer]").forEach((trigger) => trigger.addEventListener("click", () => {
  if (menuToggle.getAttribute("aria-expanded") === "true") closeMenu();
  resetEnquiry(trialModal, trialForm, document.querySelector("#trial-confirmation"), document.querySelector("#trial-status"));
  const trainerSelect = document.querySelector("#trial-trainer");
  trainerSelect.value = trigger.dataset.bookTrainer || "";
  openGymModal(trialModal, "#trial-name");
}));

document.querySelectorAll(".gym-modal").forEach((modal) => {
  modal.querySelectorAll("[data-close-gym-modal]").forEach((closeButton) => closeButton.addEventListener("click", () => closeGymModal(modal)));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeGymModal(modal);
  });
});

document.addEventListener("keydown", (event) => {
  const activeModal = document.querySelector(".gym-modal.is-open");
  if (!activeModal) return;
  if (event.key === "Escape") {
    closeGymModal(activeModal);
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = [...activeModal.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')]
    .filter((element) => !element.hidden && element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

membershipForm.querySelector('input[type="date"]').min = nextLocalDate();
trialForm.querySelector('input[type="date"]').min = nextLocalDate();
membershipForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector("#membership-status");
  if (!validateEnquiry(membershipForm, status)) return;
  const submitButton = membershipForm.querySelector('[type="submit"]');
  submitWithLoading(submitButton, "JOIN NOW", () => {
    const plan = planOptions[membershipForm.elements.plan.value];
    const confirmation = document.querySelector("#membership-confirmation");
    showEnquirySummary(document.querySelector("#membership-summary"), [
      ["Membership", `${plan.name} · ${plan.price}`],
      ["Preferred start", formatEnquiryDate(membershipForm.elements.date.value)],
      ["Fitness goal", membershipForm.elements.goal.value]
    ]);
    document.querySelector("#membership-reference").textContent = `IPM-${Math.floor(100000 + Math.random() * 900000)}`;
    membershipForm.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector("h2").focus();
  });
});

trialForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector("#trial-status");
  if (!validateEnquiry(trialForm, status)) return;
  const submitButton = trialForm.querySelector('[type="submit"]');
  submitWithLoading(submitButton, "BOOK FREE TRIAL", () => {
    const trainer = trialForm.elements.trainer.value || "No preference";
    const confirmation = document.querySelector("#trial-confirmation");
    showEnquirySummary(document.querySelector("#trial-summary"), [
      ["Preferred date", formatEnquiryDate(trialForm.elements.date.value)],
      ["Preferred time", trialForm.elements.time.value],
      ["Fitness goal", trialForm.elements.goal.value],
      ["Trainer", trainer]
    ]);
    document.querySelector("#trial-reference").textContent = `IPT-${Math.floor(100000 + Math.random() * 900000)}`;
    trialForm.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector("h2").focus();
  });
});