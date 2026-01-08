const links = document.querySelectorAll('a[href^="#"]');

links.forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
    });
});

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const backToTop = document.getElementById("backToTop");

const toggleBackToTop = () => {
    if (!backToTop) return;
    backToTop.classList.toggle("show", window.scrollY > 400);
};

toggleBackToTop();
window.addEventListener("scroll", toggleBackToTop, { passive: true });

if (backToTop) {
    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}