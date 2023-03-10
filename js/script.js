let slideIndex = 0;
        function showSlides() {
            let i;
            let slides = document.getElementsByClassName("mySlides");

            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }

            slideIndex++;

            if (slideIndex > slides.length) { slideIndex = 1 }

            slides[slideIndex-1].style.display = "flex";

            setTimeout(showSlides, 7000);
        }
        showSlides();