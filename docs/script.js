const header = document.querySelector(".top");

const scrollToId = (id) => {
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;

    const headerHeight = header ? header.offsetHeight : 0;
    const rect = target.getBoundingClientRect();
    const offset = window.scrollY + rect.top - headerHeight - 8;

    window.scrollTo({
        top: offset,
        behavior: "smooth",
    });
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        e.preventDefault();
        scrollToId(id);
    });
});

const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navOverlay = document.getElementById("navOverlay");

const lockBody = (lock) => {
    document.body.classList.toggle("body--no-scroll", lock);
};

const closeNav = () => {
    if (!nav || !navToggle || !navOverlay) return;
    nav.classList.remove("nav--open");
    navToggle.classList.remove("nav-toggle--open");
    navToggle.setAttribute("aria-expanded", "false");
    navOverlay.classList.remove("nav-overlay--visible");
    lockBody(false);
};

const openNav = () => {
    if (!nav || !navToggle || !navOverlay) return;
    nav.classList.add("nav--open");
    navToggle.classList.add("nav-toggle--open");
    navToggle.setAttribute("aria-expanded", "true");
    navOverlay.classList.add("nav-overlay--visible");
    lockBody(true);
};

if (nav && navToggle && navOverlay) {
    navToggle.addEventListener("click", () => {
        const isOpen = nav.classList.contains("nav--open");
        if (isOpen) closeNav();
        else openNav();
    });

    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", () => {
            closeNav();
        });
    });

    navOverlay.addEventListener("click", () => {
        closeNav();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
    });
}

const backToTop = document.getElementById("backToTop");

if (backToTop) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) backToTop.classList.add("show");
        else backToTop.classList.remove("show");
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}