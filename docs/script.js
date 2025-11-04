// ---- SKILLS DATA FOR RADAR ----
const skills = [
    { name: "JavaScript", value: 80 },
    { name: "HTML", value: 90 },
    { name: "CSS / SCSS", value: 85 },
    { name: "REST API", value: 75 },
    { name: "Git", value: 70 }
];

// ---- DARK MODE SAVE ----
const toggle = document.getElementById('themeToggle');
const body = document.body;

// Set initial theme
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
    toggle.textContent = "☀️ Light mode";
} else {
    toggle.textContent = "🌙 Dark mode";
}

// Theme toggle handler
toggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    toggle.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
});

// ---- REVEAL ON SCROLL ----
const revealEls = document.querySelectorAll('.reveal');
function reveal(){
    revealEls.forEach(el=>{
        const top = el.getBoundingClientRect().top;
        if(top < window.innerHeight - 100) el.classList.add('visible');
    });
}
window.addEventListener('scroll', reveal);
reveal();

// ---- CARD TILT ----
document.querySelectorAll('.tilt').forEach(card=>{
    card.addEventListener('mousemove', e=>{
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        card.style.transform = `rotateX(${y/25}deg) rotateY(${x/25}deg)`;
    });
    card.addEventListener('mouseleave', ()=>card.style.transform = "");
});

/// ---- ANIMATED TECH RADAR WITH LABELS ----
function drawRadarAnimated() {
    const canvas = document.getElementById("radarCanvas");
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    const angleStep = (Math.PI * 2) / skills.length;

    let progress = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw radar shape
        ctx.beginPath();
        skills.forEach((skill, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = (skill.value / 100) * radius * progress;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            ctx.lineTo(x, y);
        });
        ctx.closePath();

        ctx.strokeStyle = "#007bff";
        ctx.lineWidth = 2;
        ctx.stroke();

// Draw skill labels
        skills.forEach((skill, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const lx = centerX + (radius + 20) * Math.cos(angle);
            const ly = centerY + (radius + 20) * Math.sin(angle);

            ctx.fillStyle = "#007bff";
            ctx.font = "14px Inter";
            ctx.textAlign = "center";
            ctx.fillText(skill.name, lx, ly);
        });


        if (progress < 1) {
            progress += 0.015;
            requestAnimationFrame(animate);
        }
    }

    animate();
}


// ---- INTRO LOADER ----
window.onload = () => {
    setTimeout(()=>document.getElementById("preloader").style.opacity="0",400);
    setTimeout(()=>document.getElementById("preloader").style.display="none",900);
};

// ---- THANK YOU TOAST ----
setTimeout(() => {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3500);
}, 2000);

// ---- FETCH PINNED GITHUB REPOS ----
fetch("https://gh-pinned-repos.egoist.dev/?username=myasoutovd-cloud")
    .then(res => res.json())
    .then(data => {
        const box = document.getElementById("github-projects");
        data.slice(0, 3).forEach(repo => {
            const div = document.createElement("div");
            div.textContent = `⭐ ${repo.repo} — ${repo.language}`;
            box.appendChild(div);
        });
    })
    .catch(() => {});
drawRadarAnimated();


