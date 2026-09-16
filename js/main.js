/**
 * EPIC VIETNAM Technical Service - Main JavaScript
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lucide Icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // 2. Mobile Menu Toggle & Click Outside to Close
  const mobileToggle = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  const closeMobileMenu = () => {
    if (mobileMenu && mobileMenu.classList.contains("open")) {
      mobileMenu.classList.remove("open");
      const icon = mobileToggle?.querySelector("i");
      if (icon) {
        icon.setAttribute("data-lucide", "menu");
        if (typeof lucide !== "undefined") lucide.createIcons();
      }
    }
  };

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle("open");
      const icon = mobileToggle.querySelector("i");
      if (icon) {
        if (mobileMenu.classList.contains("open")) {
          icon.setAttribute("data-lucide", "x");
        } else {
          icon.setAttribute("data-lucide", "menu");
        }
        if (typeof lucide !== "undefined") lucide.createIcons();
      }
    });

    // Click outside to collapse/zoom-out menu
    document.addEventListener("click", (e) => {
      if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // 3. Highlight Active Navigation Item (Top & Bottom Mobile Nav)
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link, .mobile-bottom-item");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || link.getAttribute("data-page");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  // 4. Scroll-aware Zoom (Thu Phóng) cho Mobile Bottom Nav
  const mobileBottomNav = document.querySelector(".mobile-bottom-nav");
  if (mobileBottomNav) {
    let lastScrollTop = 0;
    window.addEventListener(
      "scroll",
      () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          // Cuộn xuống: Thu nhỏ & giấu thanh bar để nhường chỗ xem nội dung
          mobileBottomNav.style.transform = "translateY(80px) scale(0.9)";
          mobileBottomNav.style.opacity = "0";
          mobileBottomNav.style.pointerEvents = "none";
          closeMobileMenu();
        } else {
          // Cuộn lên: Phóng to & hiện lại thanh bar
          mobileBottomNav.style.transform = "translateY(0) scale(1)";
          mobileBottomNav.style.opacity = "1";
          mobileBottomNav.style.pointerEvents = "auto";
        }
        lastScrollTop = Math.max(0, scrollTop);
      },
      { passive: true }
    );
  }

  // 4. Animated Number Counters
  const counterElements = document.querySelectorAll("[data-counter]");
  if (counterElements.length > 0) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute("data-counter"), 10);
      const duration = 1800; // ms
      const stepTime = 25;
      const steps = duration / stepTime;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          el.textContent = target.toLocaleString("vi-VN") + (target === 24 ? "/7" : "+");
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current).toLocaleString("vi-VN");
        }
      }, stepTime);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    counterElements.forEach((el) => observer.observe(el));
  }

  // 5. Projects Filter (For projects.html)
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");
        projectCards.forEach((card) => {
          if (filterValue === "all" || card.getAttribute("data-category") === filterValue) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // 6. Contact Form Submission Handler
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Đang gửi thông tin...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert("Cảm ơn Quý khách! Yêu cầu khảo sát kỹ thuật đã được gửi đến ban kỹ sư EPIC VIETNAM. Chúng tôi sẽ phản hồi trong vòng 30 phút.");
        contactForm.reset();
      }, 1000);
    });
  }
});
