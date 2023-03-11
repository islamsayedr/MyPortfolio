// // cursor
// const cursor = document.querySelector(".cursor");
// const moveCursor = (e) => {
//     const mouseY = e.clientY;
//     const mouseX = e.clientX;
//     cursor.style.transform = `translate3d(${mouseX-4}px, ${mouseY-4}px, 0)`;
// }
// document.addEventListener('mousemove', moveCursor)



const newCursor = document.querySelector(".cursor");
document.addEventListener('mousemove', e =>{
    newCursor.setAttribute("style", "top: "+(e.pageY-12)+"px; left: "+(e.pageX-12)+"px;" )
});
document.addEventListener('mousedown', function () {
    newCursor.classList.add('click');
});
document.addEventListener('mouseup', function () {
    newCursor.classList.remove('click')
});
// burger menu
function burgerMenu() {
    var x = document.getElementById("navLinks");
    if (x.style.display === "flex") {
        x.style.display = "none";
    } else {
        x.style.display = "flex";
    }
}
// slideshow
let slideIndex = 0;
function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;

    if (slideIndex > slides.length) { slideIndex = 1 }

    slides[slideIndex - 1].style.display = "flex";

    setTimeout(showSlides, 7000);
}
showSlides();