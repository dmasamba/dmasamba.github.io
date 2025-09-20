// Navigation and Active State Management
const navLinks = document.querySelectorAll('.sidebar ul li a');
const sections = document.querySelectorAll('section[id]');

// Function to update active navigation link
function updateActiveNavLink() {
    let currentSection = '';
    const scrollPosition = window.scrollY + 100; // Offset for better UX

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    // If we're at the very top, show home as active
    if (window.scrollY < 50) {
        currentSection = 'home';
    }

    // Update active class on navigation links
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Smooth scroll navigation with active state update
navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');

            // Smooth scroll to target section
            window.scrollTo({
                top: targetSection.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    });
});

// Listen for scroll events to update active navigation
window.addEventListener('scroll', updateActiveNavLink);

// Initialize active state on page load
document.addEventListener('DOMContentLoaded', function() {
    updateActiveNavLink();
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById("dark-mode-toggle");
darkModeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    // Change button text based on mode
    if (document.body.classList.contains("dark-mode")) {
        darkModeToggle.textContent = "☀️ Light Mode";
    } else {
        darkModeToggle.textContent = "🌙 Dark Mode";
    }
});
