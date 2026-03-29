// ============================================
// ARTISAN PASTA CO. - JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all functions
    initLoadingScreen();
    initNavigation();
    initScrollEffects();
    initRevealAnimations();
    initCounterAnimation();
    initTabs();
    initFormHandlers();
    initBackToTop();
    initSmoothScroll();
});

// ============================================
// LOADING SCREEN
// ============================================
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Simulate loading time
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 2000);
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    });
    
    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollEffects() {
    let lastScroll = 0;
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Hide/show navbar on scroll
        if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// ============================================
// REVEAL ANIMATIONS ON SCROLL
// ============================================
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-scale');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// ============================================
// COUNTER ANIMATION
// ============================================
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
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
// TABS FUNCTIONALITY
// ============================================
function initTabs() {
    const tabs = document.querySelectorAll('.spec-tab');
    const panels = document.querySelectorAll('.spec-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// ============================================
// FORM HANDLERS
// ============================================
// In script.js, update initFormHandlers():

function initFormHandlers() {
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = orderForm.querySelector('input[type="email"]').value;
      const name = orderForm.querySelector('input[type="text"]')?.value || "Customer";
      
      try {
        const response = await fetch("/send-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: name,
            customerEmail: email,
            customerPhone: "",
            orderDetails: "Order from main form - Customer interested in pasta",
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          showNotification('Thank you! Check your email for your 20% discount code.', 'success');
          orderForm.reset();
        } else {
          showNotification('Failed to send. Please try again.', 'error');
        }
      } catch (error) {
        showNotification('Connection error. Please try again.', 'error');
      }
    });
  }
    
    // Newsletter form
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Successfully subscribed to our newsletter!', 'success');
            form.reset();
        });
    });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: type === 'success' ? 'var(--basil-green)' : 'var(--tomato-red)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 'var(--z-modal)',
        animation: 'slideIn 0.3s ease',
        maxWidth: '400px'
    });
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// BACK TO TOP BUTTON
// ============================================
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// VIDEO MODAL (Placeholder)
// ============================================
const watchVideoBtn = document.getElementById('watchVideo');
if (watchVideoBtn) {
    watchVideoBtn.addEventListener('click', () => {
        showNotification('Video player would open here', 'info');
    });
}

// ============================================
// PARALLAX EFFECT FOR HERO IMAGE
// ============================================
window.addEventListener('scroll', () => {
    const heroImage = document.getElementById('heroImage');
    if (heroImage) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;
        heroImage.style.transform = `translateY(${rate}px)`;
    }
});

// ============================================
// LAZY LOADING FOR IMAGES
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for resize events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimize scroll listeners
window.addEventListener('scroll', debounce(() => {
    // Scroll-related updates
}, 10));

// Optimize resize listeners
window.addEventListener('resize', throttle(() => {
    // Resize-related updates
}, 250));

// ============================================
// CONSOLE MESSAGE
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  const chatbotToggle = document.getElementById("chatbot-toggle");
  const chatbotContainer = document.getElementById("chatbot-container");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotForm = document.getElementById("chatbot-form");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotMessages = document.getElementById("chatbot-messages");

  if (
    !chatbotToggle ||
    !chatbotContainer ||
    !chatbotClose ||
    !chatbotForm ||
    !chatbotInput ||
    !chatbotMessages
  ) {
    console.error("Chatbot elements not found.");
    return;
  }

  const chatHistory = [
    {
      role: "assistant",
      content: "Hi — ready to order pasta? 🍝",
    },
  ];

  let isLoading = false;

  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = sender === "user" ? "user-message" : "bot-message";
    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return messageDiv;
  }

  chatbotToggle.addEventListener("click", () => {
    chatbotContainer.classList.toggle("active");
  });

  chatbotClose.addEventListener("click", () => {
    chatbotContainer.classList.remove("active");
  });

  chatbotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isLoading) return;

    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    chatHistory.push({ role: "user", content: message });
    chatbotInput.value = "";

    isLoading = true;
    chatbotInput.disabled = true;

    const typingMessage = addMessage("Typing...", "bot");

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await response.json();

      typingMessage.remove();

      const reply = data.reply || "No reply received.";
addMessage(reply, "bot");
chatHistory.push({ role: "assistant", content: reply });

// Detect order summary
// Detect order summary
if (reply.includes("Order Summary:")) {
  // Show customer info form
  const formContainer = document.createElement("div");
  formContainer.style.cssText = `
    margin-top: 10px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 8px;
  `;
  
  formContainer.innerHTML = `
    <p style="margin-bottom: 10px; font-weight: 600;">Complete your order:</p>
    <input type="text" id="order-name" placeholder="Your Name" 
           style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <input type="email" id="order-email" placeholder="Your Email" 
           style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <input type="tel" id="order-phone" placeholder="Phone Number (Optional)" 
           style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <button id="send-order-btn" 
            style="width: 100%; padding: 10px; background: #D9381E; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
      📧 Send Order via Email
    </button>
    <button id="whatsapp-btn" 
            style="width: 100%; padding: 10px; background: #25D366; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; margin-top: 8px;">
      💬 Confirm via WhatsApp
    </button>
  `;
  
  chatbotMessages.appendChild(formContainer);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  // WhatsApp button
  document.getElementById("whatsapp-btn").addEventListener("click", () => {
    const phoneNumber = "971559246487"; // ← CHANGE THIS to your number
    const message = encodeURIComponent(reply);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  });

  // Email send button
  document.getElementById("send-order-btn").addEventListener("click", async () => {
    const name = document.getElementById("order-name").value.trim();
    const email = document.getElementById("order-email").value.trim();
    const phone = document.getElementById("order-phone").value.trim();

    if (!email) {
      addMessage("⚠️ Please enter your email address", "bot");
      return;
    }

    // Send order to backend
    try {
      const response = await fetch("/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          orderDetails: reply,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage("✅ Order sent! Check your email for confirmation.", "bot");
        formContainer.style.pointerEvents = "none";
        formContainer.style.opacity = "0.6";
      } else {
        addMessage("⚠️ Failed to send order. Please try WhatsApp instead.", "bot");
      }
    } catch (error) {
      console.error(error);
      addMessage("⚠️ Connection error. Please try WhatsApp instead.", "bot");
    }
  });
}
    } catch (error) {
      typingMessage.remove();
      addMessage("Error connecting to server.", "bot");
      console.error(error);
    } finally {
      isLoading = false;
      chatbotInput.disabled = false;
      chatbotInput.focus();
    }
  });
});