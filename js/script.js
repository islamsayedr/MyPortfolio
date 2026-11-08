// burger menu
function burgerMenu() {
    const nav = document.getElementById("navLinks");
    const button = document.querySelector(".burger");
    if (!nav) return;

    const isOpen = nav.classList.toggle("is-open");
    nav.style.display = isOpen ? "flex" : "none";
    if (button) button.setAttribute("aria-expanded", String(isOpen));
}

// counter
document.addEventListener("DOMContentLoaded", () => {
    function counter(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;

        let current = start;
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const step = Math.abs(Math.floor(duration / range));
        const timer = setInterval(() => {
            current += increment;
            obj.textContent = current;
            if (current === end) clearInterval(timer);
        }, step);
    }
    counter("years", 0, 2, 500);
    counter("clients", 0, 12, 1000);
    counter("projects", 0, 24, 1000);
});

// slideshow feedback
let slideIndex = 0;
function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    if (!slides.length) return;

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;

    if (slideIndex > slides.length) { slideIndex = 1 }

    slides[slideIndex - 1].style.display = "flex";

    setTimeout(showSlides, 3000);
}
showSlides();