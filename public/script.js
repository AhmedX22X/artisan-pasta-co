// ============================================
// ARTISAN PASTA CO. - JAVASCRIPT (FULL FIXED)
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    initLoadingScreen();
    initNavigation();
    initScrollEffects();
    initRevealAnimations();
    initCounterAnimation();
    initTabs();
    initFormHandlers();
    initBackToTop();
    initSmoothScroll();
    initChatbot();
    initWatchVideo();
    initLazyLoading();
    initPerformanceHelpers();
    initVideoModal();
});

// ============================================
// LOADING SCREEN
// ============================================
function initLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");
    if (!loadingScreen) return;
    setTimeout(() => {
        loadingScreen.classList.add("hidden");
        document.body.style.overflow = "auto";
    }, 2000);
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (!navbar) return;
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 100);
    });

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            navToggle.classList.toggle("active");
            document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "auto";
        });
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                navToggle.classList.remove("active");
                document.body.style.overflow = "auto";
            });
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
                navToggle.classList.remove("active");
                document.body.style.overflow = "auto";
            }
        });
    }
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollEffects() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;
    let lastScroll = 0;
    window.addEventListener("scroll", () => {
        const currentScroll = window.pageYOffset;
        navbar.style.transform = currentScroll > lastScroll && currentScroll > 500 ? "translateY(-100%)" : "translateY(0)";
        lastScroll = currentScroll;
    });
}

// ============================================
// REVEAL ANIMATIONS
// ============================================
function initRevealAnimations() {
    const revealElements = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-scale");
    if (!revealElements.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => observer.observe(el));
}

// ============================================
// COUNTER ANIMATION
// ============================================
function initCounterAnimation() {
    const counters = document.querySelectorAll(".stat-number");
    if (!counters.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute("data-count"), 10);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ============================================
// TABS
// ============================================
function initTabs() {
    const tabs = document.querySelectorAll(".spec-tab");
    const panels = document.querySelectorAll(".spec-panel");
    if (!tabs.length || !panels.length) return;
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetTab = tab.getAttribute("data-tab");
            const targetPanel = document.getElementById(targetTab);
            tabs.forEach(t => t.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));
            tab.classList.add("active");
            if (targetPanel) targetPanel.classList.add("active");
        });
    });
}

// ============================================
// FORMS (order + newsletter)
// ============================================
function initFormHandlers() {
    const orderForm = document.getElementById("orderForm");
    if (orderForm) {
        orderForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const emailInput = orderForm.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : "";
            if (!email) {
                showNotification("Please enter your email.", "error");
                return;
            }
            try {
                const response = await fetch("/send-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        customerName: "Customer",
                        customerEmail: email,
                        customerPhone: "",
                        orderDetails: "Order from main form - Customer interested in pasta",
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    showNotification("Thank you! Check your email for your 20% discount code.", "success");
                    orderForm.reset();
                } else {
                    showNotification("Failed to send. Please try again.", "error");
                }
            } catch (error) {
                console.error(error);
                showNotification("Connection error. Please try again.", "error");
            }
        });
    }

    const newsletterForms = document.querySelectorAll(".newsletter-form");
    newsletterForms.forEach(form => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            const email = input ? input.value.trim() : "";
            if (!email) {
                showNotification("Please enter your email address.", "error");
                return;
            }
            try {
                const res = await fetch("/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (data.success) {
                    showNotification("Successfully subscribed to our newsletter!", "success");
                    form.reset();
                } else {
                    showNotification("Subscription failed. Please try again.", "error");
                }
            } catch (err) {
                showNotification("Network error. Try again later.", "error");
            }
        });
    });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = "info") {
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i><span>${message}</span>`;
    Object.assign(notification.style, {
        position: "fixed", bottom: "20px", right: "20px",
        background: type === "success" ? "var(--basil-green)" : type === "error" ? "var(--tomato-red)" : "var(--wood-dark)",
        color: "white", padding: "1rem 1.5rem", borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)", display: "flex",
        alignItems: "center", gap: "0.75rem", zIndex: "99999",
        maxWidth: "400px", animation: "slideIn 0.3s ease",
    });
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(10px)";
        notification.style.transition = "all 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ============================================
// BACK TO TOP
// ============================================
function initBackToTop() {
    const backToTop = document.getElementById("backToTop");
    if (!backToTop) return;
    window.addEventListener("scroll", () => {
        const visible = window.scrollY > 400;
        backToTop.style.opacity = visible ? "1" : "0";
        backToTop.style.pointerEvents = visible ? "auto" : "none";
    });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href || href === "#") return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const navbar = document.getElementById("navbar");
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
            window.scrollTo({ top: offsetTop, behavior: "smooth" });
        });
    });
}

// ============================================
// WATCH VIDEO BUTTON (opens modal)
// ============================================
function initWatchVideo() {
    const watchVideoBtn = document.getElementById("watchVideo");
    if (!watchVideoBtn) return;
    watchVideoBtn.addEventListener("click", () => {
        const modal = document.getElementById("videoModal");
        if (modal) modal.classList.add("active");
    });
}

function initVideoModal() {
    const modal = document.createElement("div");
    modal.id = "videoModal";
    modal.className = "video-modal";
    modal.innerHTML = `
        <div class="video-modal-content">
            <button class="close-video">&times;</button>
            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0" frameborder="0" allowfullscreen></iframe>
        </div>
    `;
    document.body.appendChild(modal);
    const closeBtn = modal.querySelector(".close-video");
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
    });
}

// ============================================
// PARALLAX
// ============================================
window.addEventListener("scroll", () => {
    const heroImage = document.getElementById("heroImage");
    if (heroImage) heroImage.style.transform = `translateY(${window.pageYOffset * 0.3}px)`;
});

// ============================================
// LAZY LOADING
// ============================================
function initLazyLoading() {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add("loaded");
                observer.unobserve(img);
            }
        });
    });
    document.querySelectorAll("img").forEach(img => observer.observe(img));
}

// ============================================
// PERFORMANCE HELPERS
// ============================================
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
function throttle(func, limit) {
    let inThrottle = false;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
function initPerformanceHelpers() {
    window.addEventListener("scroll", debounce(() => {}, 10));
    window.addEventListener("resize", throttle(() => {}, 250));
}

// ============================================
// CHATBOT (improved order summary detection)
// ============================================
function initChatbot() {
    const toggle = document.getElementById("chatbot-toggle");
    const container = document.getElementById("chatbot-container");
    const closeBtn = document.getElementById("chatbot-close");
    const form = document.getElementById("chatbot-form");
    const input = document.getElementById("chatbot-input");
    const messagesDiv = document.getElementById("chatbot-messages");

    if (!toggle || !container || !closeBtn || !form || !input || !messagesDiv) return;

    const chatHistory = [{ role: "assistant", content: "Hi — ready to order pasta? 🍝" }];
    let isLoading = false;
    let orderFormShown = false;

    function addMessage(text, sender) {
        const div = document.createElement("div");
        div.className = sender === "user" ? "user-message" : "bot-message";
        div.textContent = text;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        return div;
    }

    function setInputState(disabled) {
        input.disabled = disabled;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = disabled;
    }

    async function sendMessageWithRetry(messages, retries = 2, delay = 4000) {
        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                if (retries > 0) {
                    await new Promise(r => setTimeout(r, delay));
                    return sendMessageWithRetry(messages, retries - 1, delay);
                }
                throw new Error(data.reply || "Server error. Please try again.");
            }
            return data;
        } catch (error) {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, delay));
                return sendMessageWithRetry(messages, retries - 1, delay);
            }
            throw error;
        }
    }

    function createOrderForm(reply) {
        if (orderFormShown) return;
        orderFormShown = true;
        const formContainer = document.createElement("div");
        formContainer.style.cssText = "margin-top:10px; padding:10px; background:#f5f5f5; border-radius:8px;";
        formContainer.innerHTML = `
            <p style="margin-bottom:10px; font-weight:600;">Complete your order:</p>
            <input type="text" id="order-name" placeholder="Your Name" style="width:100%; padding:8px; margin-bottom:8px; border:1px solid #ccc; border-radius:4px;">
            <input type="email" id="order-email" placeholder="Your Email" style="width:100%; padding:8px; margin-bottom:8px; border:1px solid #ccc; border-radius:4px;">
            <input type="tel" id="order-phone" placeholder="Phone Number (Optional)" style="width:100%; padding:8px; margin-bottom:8px; border:1px solid #ccc; border-radius:4px;">
            <button id="send-order-btn" style="width:100%; padding:10px; background:#D9381E; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:600;">📧 Send Order via Email</button>
            <button id="whatsapp-btn" style="width:100%; padding:10px; background:#25D366; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:600; margin-top:8px;">💬 Confirm via WhatsApp</button>
        `;
        messagesDiv.appendChild(formContainer);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        const whatsappBtn = formContainer.querySelector("#whatsapp-btn");
        const sendOrderBtn = formContainer.querySelector("#send-order-btn");

        if (whatsappBtn) {
            whatsappBtn.addEventListener("click", () => {
                const phoneNumber = "971559246487"; // change to your number
                const message = encodeURIComponent(reply);
                window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
            });
        }
        if (sendOrderBtn) {
            sendOrderBtn.addEventListener("click", async () => {
                const name = formContainer.querySelector("#order-name")?.value.trim() || "";
                const email = formContainer.querySelector("#order-email")?.value.trim() || "";
                const phone = formContainer.querySelector("#order-phone")?.value.trim() || "";
                if (!email) {
                    addMessage("⚠️ Please enter your email address", "bot");
                    return;
                }
                try {
                    sendOrderBtn.disabled = true;
                    sendOrderBtn.textContent = "Sending...";
                    const response = await fetch("/send-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ customerName: name, customerEmail: email, customerPhone: phone, orderDetails: reply }),
                    });
                    const data = await response.json();
                    if (data.success) {
                        addMessage("✅ Order sent! Check your email for confirmation.", "bot");
                        formContainer.style.pointerEvents = "none";
                        formContainer.style.opacity = "0.6";
                    } else {
                        sendOrderBtn.disabled = false;
                        sendOrderBtn.textContent = "📧 Send Order via Email";
                        addMessage("⚠️ Failed to send order. Please try WhatsApp instead.", "bot");
                    }
                } catch (error) {
                    console.error(error);
                    sendOrderBtn.disabled = false;
                    sendOrderBtn.textContent = "📧 Send Order via Email";
                    addMessage("⚠️ Connection error. Please try WhatsApp instead.", "bot");
                }
            });
        }
    }

    toggle.addEventListener("click", () => container.classList.toggle("active"));
    closeBtn.addEventListener("click", () => container.classList.remove("active"));

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isLoading) return;
        const message = input.value.trim();
        if (!message) return;
        addMessage(message, "user");
        chatHistory.push({ role: "user", content: message });
        input.value = "";
        isLoading = true;
        setInputState(true);
        const typingMsg = addMessage("Waking up server... ⏳", "bot");
        try {
            const data = await sendMessageWithRetry(chatHistory);
            typingMsg.textContent = "Typing...";
            const reply = data.reply || "No reply received.";
            setTimeout(() => {
                typingMsg.remove();
                addMessage(reply, "bot");
                chatHistory.push({ role: "assistant", content: reply });
                if (reply.toLowerCase().includes("order summary:")) {
                    createOrderForm(reply);
                }
            }, 500);
        } catch (error) {
            typingMsg.remove();
            addMessage(error.message || "Error connecting to server.", "bot");
        } finally {
            isLoading = false;
            setInputState(false);
            input.focus();
        }
    });
}