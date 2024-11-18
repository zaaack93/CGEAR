
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