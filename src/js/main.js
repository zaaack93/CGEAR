
class ProductImages extends HTMLElement {
    // The constructor is called when an object is created with the class
    constructor() {
      super(); // Call the parent class constructor
    }

      // Method to initialize the Swiper
  initSwiper() {
    // Define the options for the Swiper
    const swiperOptions = {
      slidesPerView: 1, // Number of slides per view
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    };

    // Initialize the Swiper with the options
    new Swiper(this.querySelector('.swiper'), swiperOptions);
  }
  
    // connectedCallback is a lifecycle method that is called when the custom element is first connected to the document's DOM
    connectedCallback() {
        this.initSwiper(); // Initialize the Swiper when the component is connected
    }
  }
  
  // Define the custom element
  customElements.define("product-images-container", ProductImages);

// Horizontal scroll functionality for radio buttons
class RadioButtonsScroller {
  constructor() {
    this.initScrollButtons();
  }

  initScrollButtons() {
    const wrappers = document.querySelectorAll('.radio__buttons-wrapper');
    
    wrappers.forEach(wrapper => {
      const scrollContainer = wrapper.querySelector('.radio__buttons');
      const leftBtn = wrapper.querySelector('[data-scroll-left]');
      const rightBtn = wrapper.querySelector('[data-scroll-right]');
      
      if (scrollContainer && leftBtn && rightBtn) {
        // Find the actual scrollable container (either options-container or options-color-container)
        const actualScrollContainer = scrollContainer.querySelector('.options-container') || 
                                     scrollContainer.querySelector('.options-color-container') || 
                                     scrollContainer;
        
        this.setupScrollButton(leftBtn, actualScrollContainer, 'left');
        this.setupScrollButton(rightBtn, actualScrollContainer, 'right');
        this.setupTouchSwipe(actualScrollContainer);
        this.updateButtonStates(actualScrollContainer, leftBtn, rightBtn);
        
        // Update button states on scroll
        actualScrollContainer.addEventListener('scroll', () => {
          this.updateButtonStates(actualScrollContainer, leftBtn, rightBtn);
        });
        
        // Update button states on resize
        window.addEventListener('resize', () => {
          this.updateButtonStates(actualScrollContainer, leftBtn, rightBtn);
        });
        
        // Initial check after a short delay to ensure layout is complete
        setTimeout(() => {
          this.updateButtonStates(actualScrollContainer, leftBtn, rightBtn);
        }, 100);
      }
    });
  }

  setupScrollButton(button, container, direction) {
    button.addEventListener('click', () => {
      const scrollAmount = 120; // Adjust scroll distance as needed
      const currentScroll = container.scrollLeft;
      
      if (direction === 'left') {
        container.scrollTo({
          left: currentScroll - scrollAmount,
          behavior: 'smooth'
        });
      } else {
        container.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: 'smooth'
        });
      }
    });
  }

  setupTouchSwipe(container) {
    let startX = 0;
    let startY = 0;
    let isScrolling = null;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = null;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!startX || !startY) return;

      const diffX = startX - e.touches[0].clientX;
      const diffY = startY - e.touches[0].clientY;

      if (isScrolling === null) {
        isScrolling = Math.abs(diffX) > Math.abs(diffY);
      }

      if (isScrolling) {
        // Allow horizontal scrolling
        e.preventDefault();
        const scrollAmount = diffX * 0.8; // Adjust sensitivity
        container.scrollLeft += scrollAmount;
        startX = e.touches[0].clientX;
      }
    }, { passive: false });

    container.addEventListener('touchend', () => {
      startX = 0;
      startY = 0;
      isScrolling = null;
    }, { passive: true });
  }

  updateButtonStates(container, leftBtn, rightBtn) {
    const isAtStart = container.scrollLeft <= 1; // Allow for small rounding errors
    const isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 1);
    const hasOverflow = container.scrollWidth > container.clientWidth + 1;
    
    // Show buttons if there's overflow (removed mobile check)
    if (!hasOverflow) {
      leftBtn.style.display = 'none';
      rightBtn.style.display = 'none';
      return;
    }
    
    leftBtn.style.display = 'flex';
    rightBtn.style.display = 'flex';
    
    leftBtn.disabled = isAtStart;
    rightBtn.disabled = isAtEnd;
    
    // Add visual feedback
    leftBtn.style.opacity = isAtStart ? '0.3' : '1';
    rightBtn.style.opacity = isAtEnd ? '0.3' : '1';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RadioButtonsScroller();
});

// Also initialize on dynamic content changes (for AJAX)
document.addEventListener('variant:changed', () => {
  new RadioButtonsScroller();
});