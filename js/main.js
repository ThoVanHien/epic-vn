/**
 * EPIC VIETNAM Technical Service - Main JavaScript
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lucide Icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Add the same Google Maps direction button to every mobile contact bar.
  // It is generated here so all pages remain consistent without duplicating markup.
  document.querySelectorAll(".mobile-bottom-nav").forEach((contactBar) => {
    if (contactBar.querySelector("[data-google-maps]")) return;

    const mapButton = document.createElement("a");
    mapButton.href =
      "https://www.google.com/maps/dir/?api=1&destination=Th%E1%BB%9Bi%20H%C3%B2a%2C%20B%E1%BA%BFn%20C%C3%A1t%2C%20B%C3%ACnh%20D%C6%B0%C6%A1ng%2C%20Vi%E1%BB%87t%20Nam";
    mapButton.target = "_blank";
    mapButton.rel = "noopener noreferrer";
    mapButton.className = "mobile-contact-circle";
    mapButton.title = "Chỉ đường đến EPIC VIETNAM";
    mapButton.setAttribute(
      "aria-label",
      "Chỉ đường đến EPIC VIETNAM bằng Google Maps",
    );
    mapButton.dataset.googleMaps = "true";
    mapButton.innerHTML = `
      <div class="circle-icon btn-map">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path>
          <circle cx="12" cy="10" r="2.5"></circle>
        </svg>
      </div>
      <span class="circle-label">Chỉ đường</span>`;

    const messengerButton = contactBar.querySelector(".btn-messenger")?.closest("a");
    messengerButton?.insertAdjacentElement("afterend", mapButton) || contactBar.append(mapButton);
  });

  // 2. Mobile Menu Toggle & Click Outside to Close
  const mobileToggle = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  const closeMobileMenu = () => {
    if (mobileMenu && mobileMenu.classList.contains("open")) {
      mobileMenu.classList.remove("open");
      mobileToggle?.classList.remove("active");
      mobileToggle?.setAttribute("aria-expanded", "false");
    }
  };

  if (mobileToggle && mobileMenu) {
    mobileToggle.setAttribute(
      "aria-expanded",
      String(mobileMenu.classList.contains("open")),
    );

    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle("open");
      mobileToggle.classList.toggle("active");
      mobileToggle.setAttribute(
        "aria-expanded",
        String(mobileMenu.classList.contains("open")),
      );
    });

    // Click outside to collapse/zoom-out menu
    document.addEventListener("click", (e) => {
      if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  // 3. Highlight Active Navigation Item (Top Menu)
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");
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
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          // Cuộn xuống: Thu nhỏ & giấu thanh bar để nhường chỗ xem nội dung
          mobileBottomNav.style.transform =
            "translateX(-50%) translateY(90px) scale(0.85)";
          mobileBottomNav.style.opacity = "0";
          mobileBottomNav.style.pointerEvents = "none";
          closeMobileMenu();
        } else {
          // Cuộn lên: Phóng to & hiện lại thanh bar
          mobileBottomNav.style.transform =
            "translateX(-50%) translateY(0) scale(1)";
          mobileBottomNav.style.opacity = "1";
          mobileBottomNav.style.pointerEvents = "auto";
        }
        lastScrollTop = Math.max(0, scrollTop);
      },
      { passive: true },
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
          el.textContent =
            target.toLocaleString("vi-VN") + (target === 24 ? "/7" : "+");
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
      { threshold: 0.2 },
    );

    counterElements.forEach((el) => observer.observe(el));
  }

  // 5. Projects Filter (Legacy)
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filterValue = btn.getAttribute("data-filter");
        projectCards.forEach((card) => {
          if (
            filterValue === "all" ||
            card.getAttribute("data-category") === filterValue
          ) {
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
        alert(
          "Cảm ơn Quý khách! Yêu cầu khảo sát kỹ thuật đã được gửi đến ban kỹ sư EPIC VIETNAM. Chúng tôi sẽ phản hồi trong vòng 30 phút.",
        );
        contactForm.reset();
      }, 1000);
    });
  }

  // Close modal on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
      closeProductModal();
    }
  });

  // 8. Product Filter & Search (products.html)
  const productFilterBtns = document.querySelectorAll(".product-filter-btn");
  const productCards = document.querySelectorAll(
    ".product-card[data-product-cat]",
  );
  const productSearchInput = document.getElementById("product-search-input");

  function filterProducts() {
    const activeBtn = document.querySelector(".product-filter-btn.active");
    const activeCat = activeBtn ? activeBtn.getAttribute("data-cat") : "all";
    const searchQuery = (productSearchInput ? productSearchInput.value : "")
      .trim()
      .toLowerCase();

    productCards.forEach((card) => {
      const cardCat = card.getAttribute("data-product-cat");
      const title = (
        card.querySelector(".product-title")?.textContent || ""
      ).toLowerCase();
      const model = (
        card.querySelector(".product-model")?.textContent || ""
      ).toLowerCase();

      const matchesCat = activeCat === "all" || cardCat === activeCat;
      const matchesSearch =
        !searchQuery ||
        title.includes(searchQuery) ||
        model.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }

  if (productFilterBtns.length > 0) {
    productFilterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        productFilterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        filterProducts();
      });
    });
  }

  if (productSearchInput) {
    productSearchInput.addEventListener("input", filterProducts);
  }

  // 9. Product Modal (Xem chi tiết thông số & Nhận báo giá)
  const productModalOverlay = document.getElementById("product-modal-overlay");
  const productModalClose = document.getElementById("product-modal-close");

  const closeProductModal = () => {
    if (productModalOverlay) {
      productModalOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  };

  if (productModalClose) {
    productModalClose.addEventListener("click", closeProductModal);
  }

  if (productModalOverlay) {
    productModalOverlay.addEventListener("click", (e) => {
      if (e.target === productModalOverlay) {
        closeProductModal();
      }
    });
  }

  // Handle click on "Xem thông số"
  document.querySelectorAll(".btn-view-spec").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card || !productModalOverlay) return;

      const title =
        card.querySelector(".product-title")?.textContent ||
        "Chi tiết sản phẩm";
      const model = card.querySelector(".product-model")?.textContent || "";
      const price =
        card.querySelector(".price-value")?.textContent || "Liên hệ báo giá";
      const imgSrc =
        card.querySelector(".product-thumb img")?.getAttribute("src") ||
        "images/logo.png";
      const brand =
        card.querySelector(".badge-brand")?.textContent || "EPIC VIETNAM";

      const modalTitle = document.getElementById("modal-product-title");
      const modalModel = document.getElementById("modal-product-model");
      const modalPrice = document.getElementById("modal-product-price");
      const modalZaloLink = document.getElementById("modal-zalo-link");

      if (modalTitle) modalTitle.textContent = title;
      if (modalModel) modalModel.textContent = model;
      if (modalPrice) modalPrice.textContent = price || "Liên Hệ";

      if (modalZaloLink) {
        const textMsg = encodeURIComponent(
          `Xin chào EPIC VIETNAM, tôi muốn nhận báo giá sản phẩm: ${title.trim()} (${model.trim()})`,
        );
        modalZaloLink.setAttribute(
          "href",
          `https://zalo.me/0989584595?text=${textMsg}`,
        );
      }

      productModalOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    });
  });

  // 9. Tab Sản Phẩm Expand / Collapse (Mobile Accordion & Desktop Toggle)
  const mobileAccordions = document.querySelectorAll(".mobile-nav-accordion");
  mobileAccordions.forEach((accordion) => {
    const toggleBtn = accordion.querySelector(".mobile-accordion-btn");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isExpanded = accordion.classList.toggle("expanded");
        toggleBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      });
    }
  });

  const desktopDropdowns = document.querySelectorAll(".nav-item-dropdown");
  desktopDropdowns.forEach((dd) => {
    const chevron = dd.querySelector(".dropdown-chevron");
    if (chevron) {
      chevron.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dd.classList.toggle("is-open");
      });
    }
  });

  document.addEventListener("click", (e) => {
    desktopDropdowns.forEach((dd) => {
      if (!dd.contains(e.target)) {
        dd.classList.remove("is-open");
      }
    });
  });
});
