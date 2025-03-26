document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("toggle-mode");
    toggleButton.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });

    const links = document.querySelectorAll(".navbar ul li a");
    links.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);
            window.scrollTo({
                top: targetElement.offsetTop - 50,
                behavior: "smooth"
            });
        });
    });
});
