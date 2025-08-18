/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/***/ (() => {

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var ProductImages = /*#__PURE__*/function (_HTMLElement) {
  _inherits(ProductImages, _HTMLElement);
  var _super = _createSuper(ProductImages);
  // The constructor is called when an object is created with the class
  function ProductImages() {
    _classCallCheck(this, ProductImages);
    return _super.call(this); // Call the parent class constructor
  }

  // Method to initialize the Swiper
  _createClass(ProductImages, [{
    key: "initSwiper",
    value: function initSwiper() {
      // Define the options for the Swiper
      var swiperOptions = {
        slidesPerView: 1,
        // Number of slides per view
        pagination: {
          el: ".swiper-pagination",
          clickable: true
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev"
        }
      };

      // Initialize the Swiper with the options
      new Swiper(this.querySelector('.swiper'), swiperOptions);
    }

    // connectedCallback is a lifecycle method that is called when the custom element is first connected to the document's DOM
  }, {
    key: "connectedCallback",
    value: function connectedCallback() {
      this.initSwiper(); // Initialize the Swiper when the component is connected
    }
  }]);
  return ProductImages;
}( /*#__PURE__*/_wrapNativeSuper(HTMLElement)); // Define the custom element
customElements.define("product-images-container", ProductImages);

// Horizontal scroll functionality for radio buttons
var RadioButtonsScroller = /*#__PURE__*/function () {
  function RadioButtonsScroller() {
    _classCallCheck(this, RadioButtonsScroller);
    this.initScrollButtons();
  }
  _createClass(RadioButtonsScroller, [{
    key: "initScrollButtons",
    value: function initScrollButtons() {
      var _this = this;
      var wrappers = document.querySelectorAll('.radio__buttons-wrapper');
      wrappers.forEach(function (wrapper) {
        var scrollContainer = wrapper.querySelector('.radio__buttons');
        var leftBtn = wrapper.querySelector('[data-scroll-left]');
        var rightBtn = wrapper.querySelector('[data-scroll-right]');
        if (scrollContainer && leftBtn && rightBtn) {
          // Find the actual scrollable container (either options-container or options-color-container)
          var actualScrollContainer = scrollContainer.querySelector('.options-container') || scrollContainer.querySelector('.options-color-container') || scrollContainer;
          _this.setupScrollButton(leftBtn, actualScrollContainer, 'left');
          _this.setupScrollButton(rightBtn, actualScrollContainer, 'right');
          _this.setupTouchSwipe(actualScrollContainer);
          _this.updateButtonStates(actualScrollContainer, leftBtn, rightBtn);

          // Update button states on scroll
          actualScrollContainer.addEventListener('scroll', function () {
            _this.updateButtonStates(actualScrollContainer, leftBtn, rightBtn);
          });

          // Update button states on resize
          window.addEventListener('resize', function () {
            _this.updateButtonStates(actualScrollContainer, leftBtn, rightBtn);
          });

          // Initial check after a short delay to ensure layout is complete
          setTimeout(function () {
            _this.updateButtonStates(actualScrollContainer, leftBtn, rightBtn);
          }, 100);
        }
      });
    }
  }, {
    key: "setupScrollButton",
    value: function setupScrollButton(button, container, direction) {
      button.addEventListener('click', function () {
        var scrollAmount = 120; // Adjust scroll distance as needed
        var currentScroll = container.scrollLeft;
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
  }, {
    key: "setupTouchSwipe",
    value: function setupTouchSwipe(container) {
      var startX = 0;
      var startY = 0;
      var isScrolling = null;
      container.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isScrolling = null;
      }, {
        passive: true
      });
      container.addEventListener('touchmove', function (e) {
        if (!startX || !startY) return;
        var diffX = startX - e.touches[0].clientX;
        var diffY = startY - e.touches[0].clientY;
        if (isScrolling === null) {
          isScrolling = Math.abs(diffX) > Math.abs(diffY);
        }
        if (isScrolling) {
          // Allow horizontal scrolling
          e.preventDefault();
          var scrollAmount = diffX * 0.8; // Adjust sensitivity
          container.scrollLeft += scrollAmount;
          startX = e.touches[0].clientX;
        }
      }, {
        passive: false
      });
      container.addEventListener('touchend', function () {
        startX = 0;
        startY = 0;
        isScrolling = null;
      }, {
        passive: true
      });
    }
  }, {
    key: "updateButtonStates",
    value: function updateButtonStates(container, leftBtn, rightBtn) {
      var isAtStart = container.scrollLeft <= 1; // Allow for small rounding errors
      var isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
      var hasOverflow = container.scrollWidth > container.clientWidth + 1;

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
  }]);
  return RadioButtonsScroller;
}(); // Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  new RadioButtonsScroller();
});

// Also initialize on dynamic content changes (for AJAX)
document.addEventListener('variant:changed', function () {
  new RadioButtonsScroller();
});

/***/ }),

/***/ "./src/scss/main.scss":
/*!****************************!*\
  !*** ./src/scss/main.scss ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"/assets/main": 0,
/******/ 			"assets/main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkhandee"] = self["webpackChunkhandee"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, ["assets/main"], () => (__webpack_require__("./src/js/main.js")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["assets/main"], () => (__webpack_require__("./src/scss/main.scss")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;