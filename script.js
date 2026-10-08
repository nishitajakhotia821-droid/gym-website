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