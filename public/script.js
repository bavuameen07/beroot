document.documentElement.classList.add("js");

const body = document.body;
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const cursorGlow = document.querySelector(".cursor-glow");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const modal = document.querySelector("[data-modal]");
const openButtons = document.querySelectorAll("[data-open-consultation]");
const closeButton = document.querySelector("[data-close-consultation]");
const consultForm = document.querySelector("[data-consult-form]");
const formSuccess = document.querySelector("[data-form-success]");
const formError = document.querySelector("[data-form-error]");
let lastFocusedElement = null;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setHeaderState = () => {
  const scrollTop = window.scrollY;
  header?.classList.toggle("scrolled", scrollTop > 24);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress?.style.setProperty("transform", `scaleX(${scrollable > 0 ? scrollTop / scrollable : 0})`);
  const heroPoster = document.querySelector(".hero-poster");
  heroPoster?.style.setProperty("--scroll-shift", `${Math.min(scrollTop * 0.07, 28)}px`);
  const floatingNote = document.querySelector(".floating-note");
  floatingNote?.style.setProperty("--scroll-shift", `${Math.min(scrollTop * 0.035, 12)}px`);
};

const setMenuState = (isOpen) => {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  mobileMenu.classList.toggle("open", isOpen);
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("modal-open", isOpen);
};

const setModalState = (isOpen) => {
  if (!modal) return;
  if (isOpen) {
    lastFocusedElement = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    formSuccess.hidden = true;
    formError.hidden = true;
    const submitButton = modal.querySelector("button[type=submit]");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = "Send my note <span aria-hidden=\"true\">↗</span>";
    }
    window.setTimeout(() => modal.querySelector("input")?.focus(), 120);
  } else {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }
};

const observeReveals = () => {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6%" });
  items.forEach((item) => observer.observe(item));
};

const animateCounter = (element) => {
  const target = Number(element.dataset.counter || 0);
  if (prefersReducedMotion) {
    element.textContent = target.toLocaleString();
    return;
  }
  const duration = 1300;
  const start = performance.now();
  const tick = (now) => {
    const progressValue = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    element.textContent = Math.round(target * eased).toLocaleString();
    if (progressValue < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const observeCounters = () => {
  const counters = document.querySelectorAll("[data-counter]");
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    counters.forEach((counter) => {
      counter.textContent = Number(counter.dataset.counter || 0).toLocaleString();
    });
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.8 });
  counters.forEach((counter) => observer.observe(counter));
};

const bindTilt = () => {
  if (prefersReducedMotion) return;
  const cards = document.querySelectorAll(".path-card, .service-card, .destination-card, .journal-card");
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${y * -5}deg) rotateY(${x * 6}deg) translateY(-5px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });

  const stage = document.querySelector(".hero-stage");
  const poster = document.querySelector("[data-tilt-card]");
  if (stage && poster) {
    stage.addEventListener("pointermove", (event) => {
      const bounds = stage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      poster.style.setProperty("--tilt-x", `${-8 + x * 14}deg`);
      poster.style.setProperty("--tilt-y", `${3 + y * -10}deg`);
    });
    stage.addEventListener("pointerleave", () => {
      poster.style.setProperty("--tilt-x", "-10deg");
      poster.style.setProperty("--tilt-y", "3deg");
    });
  }
};

const bindMagneticButtons = () => {
  if (prefersReducedMotion) return;
  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const bounds = button.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.16;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.16;
      button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    button.addEventListener("pointerleave", () => {
      button.style.transform = "translate3d(0, 0, 0)";
    });
  });
};

const bindCourseFilters = () => {
  const filters = document.querySelectorAll("[data-filter]");
  const rows = document.querySelectorAll(".course-row");
  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.filter;
      filters.forEach((item) => {
        const isActive = item === filter;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });
      rows.forEach((row) => {
        row.classList.toggle("is-hidden", category !== "all" && row.dataset.category !== category);
      });
    });
  });
};

const testimonials = [
  {
    quote: "“Beroot made the unknown feel wonderfully possible. Every step felt considered, clear, and genuinely human.”",
    name: "Rabiya S.",
    course: "MSc Drug Discovery & Development · University of Sunderland",
    initials: "RS",
  },
  {
    quote: "“They were there at midnight, when arrival suddenly felt overwhelming. That kind of support changes everything.”",
    name: "Maneesha P.",
    course: "MSc Public Health · UCLan University",
    initials: "MP",
  },
  {
    quote: "“The Beroot team helped me find work, a place to stay, and the confidence to take the next step.”",
    name: "Romin Anilkumar",
    course: "MSc Pharmaceutical Quality by Design · De Montfort University",
    initials: "RA",
  },
  {
    quote: "“Patient, friendly, and genuinely dedicated. They turned a complicated application into a plan I could follow.”",
    name: "Aslama Ashraf",
    course: "MSc Biomedical Science · University of East London",
    initials: "AA",
  },
  {
    quote: "“They listened to what mattered to me, then found a university that fit the life I wanted—not just the brochure.”",
    name: "Sinan Shoukath",
    course: "International Business Management · De Montfort University",
    initials: "SS",
  },
  {
    quote: "“Thanks to the Beroot team for their end-to-end support. From documentation to university shortlisting, every step was handled brilliantly.”",
    name: "Muhammed Jaseem",
    course: "MSc Engineering Management · Brunel University London",
    initials: "MJ",
  },
];

const bindTestimonials = () => {
  const quote = document.querySelector(".testimonial-shell blockquote");
  const name = document.querySelector(".testimonial-person strong");
  const course = document.querySelector(".testimonial-person small");
  const avatar = document.querySelector(".person-avatar");
  const count = document.querySelector(".testimonial-count");
  const dots = document.querySelectorAll(".testimonial-dots span");
  let activeIndex = 0;

  const render = (index) => {
    activeIndex = (index + testimonials.length) % testimonials.length;
    const item = testimonials[activeIndex];
    quote.textContent = item.quote;
    name.textContent = item.name;
    course.textContent = item.course;
    avatar.textContent = item.initials;
    count.innerHTML = `${String(activeIndex + 1).padStart(2, "0")} <i>/</i> ${String(testimonials.length).padStart(2, "0")}`;
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === activeIndex));
  };

  document.querySelector("[data-testimonial-prev]")?.addEventListener("click", () => render(activeIndex - 1));
  document.querySelector("[data-testimonial-next]")?.addEventListener("click", () => render(activeIndex + 1));
};

const bindModal = () => {
  openButtons.forEach((button) => button.addEventListener("click", () => setModalState(true)));
  closeButton?.addEventListener("click", () => setModalState(false));
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) setModalState(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setModalState(false);
      setMenuState(false);
    }
  });
  consultForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!consultForm.checkValidity()) {
      consultForm.reportValidity();
      return;
    }

    const submitButton = consultForm.querySelector("button[type=submit]");
    formSuccess.hidden = true;
    formError.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(consultForm))),
      });

      if (!response.ok) throw new Error("Request rejected");
      formSuccess.hidden = false;
      submitButton.textContent = "Note received ✦";
    } catch {
      formError.hidden = false;
      submitButton.disabled = false;
      submitButton.innerHTML = "Send my note <span aria-hidden=\"true\">↗</span>";
    }
  });
};

const bindMenu = () => {
  menuToggle?.addEventListener("click", () => {
    setMenuState(!mobileMenu?.classList.contains("open"));
  });
  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });
};

const bindCursorGlow = () => {
  if (prefersReducedMotion) return;
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
    cursorGlow.style.opacity = "1";
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });
};

bindMenu();
bindModal();
bindCourseFilters();
bindTestimonials();
bindTilt();
bindMagneticButtons();
bindCursorGlow();
observeReveals();
observeCounters();
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", setHeaderState);
