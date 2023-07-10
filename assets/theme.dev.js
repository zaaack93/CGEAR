
/*
* @license
* Palo Alto Theme (c)
*
* This file is included for advanced development by
* Shopify Agencies.  Modified versions of the theme
* code are not supported by Shopify or Presidio Creative.
*
* In order to use this file you will need to change
* theme.js to theme.dev.js in /layout/theme.liquid
*
*/

(function (scrollLock, Flickity, themeCurrency, Ajaxinate, AOS) {
  'use strict';

  window.theme = window.theme || {};

  window.theme.sizes = {
    mobile: 480,
    small: 768,
    large: 1024,
    widescreen: 1440,
  };

  window.theme.keyboardKeys = {
    TAB: 'Tab',
    ENTER: 'Enter',
    NUMPADENTER: 'NumpadEnter',
    ESCAPE: 'Escape',
    SPACE: 'Space',
    LEFTARROW: 'ArrowLeft',
    RIGHTARROW: 'ArrowRight',
  };

  window.theme.focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function debounce(fn, time) {
    let timeout;
    return function () {
      // eslint-disable-next-line prefer-rest-params
      if (fn) {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
      }
    };
  }

  const selectors$14 = {
    body: 'body',
    main: '[data-main]',
    header: '[data-site-header]',
    preventTransparentHeader: '[data-prevent-transparent-header]',
  };
  const classes$S = {
    supportsTransparentHeader: 'supports-transparent-header',
    siteHeaderTransparent: 'site-header--transparent',
    isFirstSectionTransparent: 'is-first-section-transparent',
  };

  const attributes$H = {
    transparent: 'data-transparent',
  };

  const initTransparentHeader = () => {
    // Determine what is the first
    const body = document.querySelector(selectors$14.body);
    const header = body.querySelector(selectors$14.header);

    if (!header) return;

    const headerTransparent = header.getAttribute(attributes$H.transparent) === 'true';
    const firstSection = body.querySelector(selectors$14.main).children[0];

    if (!firstSection) return;

    const preventTransparentHeader = firstSection.querySelector(`${selectors$14.preventTransparentHeader}:first-of-type`);
    window.isHeaderTransparent = headerTransparent && firstSection.classList.contains(classes$S.supportsTransparentHeader) && !preventTransparentHeader;

    const supportsHasSelector = CSS.supports('(selector(:has(*)))');
    if (!supportsHasSelector) {
      body.classList.toggle(classes$S.isFirstSectionTransparent, window.isHeaderTransparent);
      header.classList.toggle(classes$S.siteHeaderTransparent, window.isHeaderTransparent);
    }
  };

  let screenOrientation = getScreenOrientation();

  const selectors$13 = {
    body: 'body',
    main: '[data-main]',
    collectionFilters: '[data-collection-filters]',
    footer: '[data-section-type*="footer"]',
    header: '[data-header-height]',
    stickyHeader: '[data-site-header][data-position="fixed"]',
    announcementBar: '[data-announcement-bar]',
    collectionStickyBar: '[data-collection-sticky-bar]',
    logoTextLink: '[data-logo-text-link]',
  };

  const classes$R = {
    templateCollection: 'template-collection',
    templateSearch: 'template-search',
    supportsTransparentHeader: 'supports-transparent-header',
  };

  function readHeights() {
    const h = {};
    h.windowHeight = Math.min(window.screen.height, window.innerHeight);
    h.footerHeight = getHeight(selectors$13.footer);
    h.headerHeight = getHeight(selectors$13.header);
    h.headerInitialHeight = parseInt(document.querySelector(selectors$13.header)?.dataset.height || document.querySelector(selectors$13.header)?.offsetHeight) || 0;
    h.announcementBarHeight = getHeight(selectors$13.announcementBar);
    h.collectionStickyBarHeight = getHeight(selectors$13.collectionStickyBar);
    return h;
  }

  function setVarsOnResize() {
    document.addEventListener('theme:resize', resizeVars);
    setVars();
    document.dispatchEvent(new CustomEvent('theme:vars'), {bubbles: false});
  }

  function setVars() {
    calcVars();
  }

  function resizeVars() {
    // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
    calcVars(true);
  }

  function calcVars(checkOrientation = false) {
    const body = document.querySelector(selectors$13.body);
    const hasCollectionFilters = document.querySelector(selectors$13.collectionFilters);
    const hasLogoTextLink = document.querySelector(selectors$13.logoTextLink) !== null;

    let {windowHeight, headerHeight, headerInitialHeight, announcementBarHeight, footerHeight, collectionStickyBarHeight} = readHeights();

    if (hasLogoTextLink) headerHeight = recalcHeaderHeight();

    const contentFullHeight = window.isHeaderTransparent && checkFirstSectionTransparency() ? windowHeight - announcementBarHeight : windowHeight - headerInitialHeight - announcementBarHeight;
    let fullHeight = isHeaderSticky() ? windowHeight - window.stickyHeaderHeight : windowHeight;
    const isCollectionPage = body.classList.contains(classes$R.templateCollection);
    const isSearchPage = body.classList.contains(classes$R.templateSearch);
    const isPageWithFilters = (isCollectionPage && hasCollectionFilters) || (isSearchPage && hasCollectionFilters);

    document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    document.documentElement.style.setProperty('--content-full', `${contentFullHeight}px`);
    document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
    document.documentElement.style.setProperty('--collection-sticky-bar-height', `${collectionStickyBarHeight}px`);

    if (isPageWithFilters) fullHeight = windowHeight;

    if (!checkOrientation) {
      document.documentElement.style.setProperty('--full-height', `${fullHeight}px`);
      return;
    }

    const currentScreenOrientation = getScreenOrientation();
    if (currentScreenOrientation !== screenOrientation) {
      // Only update the heights on screen orientation change
      document.documentElement.style.setProperty('--full-height', `${fullHeight}px`);

      // Update the screen orientation state
      screenOrientation = currentScreenOrientation;
    }
  }

  function getHeight(selector) {
    const el = document.querySelector(selector);
    if (el) {
      return el.clientHeight;
    } else {
      return 0;
    }
  }

  function checkFirstSectionTransparency() {
    const firstSection = document.querySelector(selectors$13.main).firstElementChild;
    return firstSection.classList.contains(classes$R.supportsTransparentHeader);
  }

  function isHeaderSticky() {
    return document.querySelector(selectors$13.stickyHeader);
  }

  function getScreenOrientation() {
    if (window.matchMedia('(orientation: portrait)').matches) {
      return 'portrait';
    }

    if (window.matchMedia('(orientation: landscape)').matches) {
      return 'landscape';
    }
  }

  function recalcHeaderHeight() {
    document.documentElement.style.setProperty('--header-height', 'auto');
    document.documentElement.style.setProperty('--header-sticky-height', 'auto');

    // Header is declared here to avoid `offsetHeight` returning zero when the element has not been rendered to the DOM yet in the Theme editor
    const header = document.querySelector(selectors$13.header);
    const resetHeight = header.offsetHeight;

    // requestAnimationFrame method is needed to properly update the CSS variables on resize after they have been reset
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--header-height', `${resetHeight}px`);
      document.documentElement.style.setProperty('--header-sticky-height', `${resetHeight}px`);
    });

    return resetHeight;
  }

  const selectors$12 = {
    overflowBackground: '[data-overflow-background]',
    overflowFrame: '[data-overflow-frame]',
    overflowContent: '[data-overflow-content]',
    overflowContainer: '[data-overflow-container]',
    overflowWrapper: '[data-overflow-wrapper]',
  };

  function singles(frame, wrappers) {
    // sets the height of any frame passed in with the
    // tallest preventOverflowContent as well as any image in that frame
    let tallest = 0;

    wrappers.forEach((wrap) => {
      tallest = wrap.offsetHeight > tallest ? wrap.offsetHeight : tallest;
    });
    const images = frame.querySelectorAll(selectors$12.overflowBackground);
    const frames = [frame, ...images];
    frames.forEach((el) => {
      el.style.setProperty('min-height', `calc(${tallest}px + var(--header-height))`);
    });
  }

  function doubles(section) {
    if (window.innerWidth < window.theme.sizes.small) {
      // if we are below the small breakpoint, the double section acts like two independent
      // single frames
      let singleFrames = section.querySelectorAll(selectors$12.overflowFrame);
      singleFrames.forEach((singleframe) => {
        const wrappers = singleframe.querySelectorAll(selectors$12.overflowContent);
        singles(singleframe, wrappers);
      });
      return;
    }

    let tallest = 0;

    const frames = section.querySelectorAll(selectors$12.overflowFrame);
    const contentWrappers = section.querySelectorAll(selectors$12.overflowContent);
    contentWrappers.forEach((content) => {
      if (content.offsetHeight > tallest) {
        tallest = content.offsetHeight;
      }
    });
    const images = section.querySelectorAll(selectors$12.overflowBackground);
    let applySizes = [...frames, ...images];
    applySizes.forEach((el) => {
      el.style.setProperty('min-height', `${tallest}px`);
    });
    section.style.setProperty('min-height', `${tallest}px`);
  }

  function preventOverflow(container) {
    const singleFrames = container.querySelectorAll(selectors$12.overflowContainer);
    if (singleFrames) {
      singleFrames.forEach((frame) => {
        const wrappers = frame.querySelectorAll(selectors$12.overflowContent);
        singles(frame, wrappers);
        document.addEventListener('theme:resize', () => {
          singles(frame, wrappers);
        });
      });
    }

    const doubleSections = container.querySelectorAll(selectors$12.overflowWrapper);
    if (doubleSections) {
      doubleSections.forEach((section) => {
        doubles(section);
        document.addEventListener('theme:resize', () => {
          doubles(section);
        });
      });
    }
  }

  window.lastWindowWidth = window.innerWidth;

  function dispatchResizeEvent() {
    document.dispatchEvent(
      new CustomEvent('theme:resize', {
        bubbles: true,
      })
    );

    if (window.lastWindowWidth !== window.innerWidth) {
      document.dispatchEvent(
        new CustomEvent('theme:resize:width', {
          bubbles: true,
        })
      );

      window.lastWindowWidth = window.innerWidth;
    }
  }

  function resizeListener() {
    window.addEventListener('resize', debounce(dispatchResizeEvent, 50));
  }

  let prev = window.pageYOffset;
  let up = null;
  let down = null;
  let wasUp = null;
  let wasDown = null;
  let scrollLockTimer$1 = 0;

  const classes$Q = {
    quickViewVisible: 'js-quick-view-visible',
    cartDrawerOpen: 'js-drawer-open-cart',
  };

  function dispatchScrollEvent() {
    const position = window.pageYOffset;
    if (position > prev) {
      down = true;
      up = false;
    } else if (position < prev) {
      down = false;
      up = true;
    } else {
      up = null;
      down = null;
    }
    prev = position;
    document.dispatchEvent(
      new CustomEvent('theme:scroll', {
        detail: {
          up,
          down,
          position,
        },
        bubbles: false,
      })
    );
    if (up && !wasUp) {
      document.dispatchEvent(
        new CustomEvent('theme:scroll:up', {
          detail: {position},
          bubbles: false,
        })
      );
    }
    if (down && !wasDown) {
      document.dispatchEvent(
        new CustomEvent('theme:scroll:down', {
          detail: {position},
          bubbles: false,
        })
      );
    }
    wasDown = down;
    wasUp = up;
  }

  function lock(e) {
    // Prevent body scroll lock race conditions
    setTimeout(() => {
      if (scrollLockTimer$1) {
        clearTimeout(scrollLockTimer$1);
      }

      scrollLock.disablePageScroll(e.detail, {
        allowTouchMove: (el) => el.tagName === 'TEXTAREA',
      });

      document.documentElement.setAttribute('data-scroll-locked', '');
    });
  }

  function unlock(e) {
    const timeout = e.detail;

    if (timeout) {
      scrollLockTimer$1 = setTimeout(removeScrollLock, timeout);
    } else {
      removeScrollLock();
    }
  }

  function removeScrollLock() {
    const isPopupVisible = document.body.classList.contains(classes$Q.quickViewVisible) || document.body.classList.contains(classes$Q.cartDrawerOpen);

    if (!isPopupVisible) {
      scrollLock.clearQueueScrollLocks();
      scrollLock.enablePageScroll();
      document.documentElement.removeAttribute('data-scroll-locked');
    }
  }

  function scrollListener() {
    let timeout;
    window.addEventListener(
      'scroll',
      function () {
        if (timeout) {
          window.cancelAnimationFrame(timeout);
        }
        timeout = window.requestAnimationFrame(function () {
          dispatchScrollEvent();
        });
      },
      {passive: true}
    );

    window.addEventListener('theme:scroll:lock', lock);
    window.addEventListener('theme:scroll:unlock', unlock);
  }

  const wrap = (toWrap, wrapperClass = '', wrapperOption) => {
    const wrapper = wrapperOption || document.createElement('div');
    wrapper.classList.add(wrapperClass);
    wrapper.setAttribute('data-scroll-lock-scrollable', '');
    toWrap.parentNode.insertBefore(wrapper, toWrap);
    return wrapper.appendChild(toWrap);
  };

  function wrapElements(container) {
    // Target tables to make them scrollable
    const tableSelectors = 'table';
    const tables = container.querySelectorAll(tableSelectors);
    tables.forEach((table) => {
      wrap(table, 'table-wrapper');
    });
  }

  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }

  function isTouch() {
    if (isTouchDevice()) {
      document.documentElement.className = document.documentElement.className.replace('no-touch', 'supports-touch');
      window.theme.touch = true;
    } else {
      window.theme.touch = false;
    }
  }

  function loading() {
    document.documentElement.classList.remove('is-loading');
    document.documentElement.classList.add('is-loaded');
  }

  const selectors$11 = {
    inputSearch: 'input[type="search"]',
    form: 'form',
    allVisibleElements: '[role="option"]',
    ariaSelected: '[aria-selected="true"]',
    selectedOption: '[aria-selected="true"] a, button[aria-selected="true"]',
    popularSearches: '[data-popular-searches]',
    popdownBody: '[data-popdown-body]',
    predictiveSearchResults: '[data-predictive-search-results]',
    predictiveSearch: 'predictive-search',
    searchForm: 'search-form',
  };

  const classes$P = {
    isSearched: 'is-searched',
  };

  class SearchForm extends HTMLElement {
    constructor() {
      super();

      this.input = this.querySelector(selectors$11.inputSearch);
      this.form = this.querySelector(selectors$11.form);
      this.popdownBody = this.closest(selectors$11.popdownBody);
      this.popularSearches = this.popdownBody?.querySelector(selectors$11.popularSearches);
      this.predictiveSearchResults = this.querySelector(selectors$11.predictiveSearchResults);
      this.predictiveSearch = this.matches(selectors$11.predictiveSearch);
      this.searchForm = this.matches(selectors$11.searchForm);
      this.selectedElement = null;
      this.activeElement = null;
      this.searchTerm = '';
      this.currentSearchTerm = '';

      this.input.addEventListener(
        'input',
        debounce((event) => {
          this.onChange(event);
        }, 300).bind(this)
      );

      this.input.addEventListener('focus', this.onFocus.bind(this));
      this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));
      this.addEventListener('keyup', this.onKeyup.bind(this));
      this.addEventListener('keydown', this.onKeydown.bind(this));
    }

    getQuery() {
      return this.input.value.trim();
    }

    onFocus() {
      this.currentSearchTerm = this.getQuery();
    }

    onChange() {
      this.classList.toggle(classes$P.isSearched, !this.isFormCleared());
      this.searchTerm = this.getQuery();
    }

    isFormCleared() {
      return this.input.value.length === 0;
    }

    submit() {
      this.form.submit();
    }

    reset() {
      this.input.val = '';
    }

    onFormSubmit(event) {
      if (!this.getQuery().length || this.querySelector(selectors$11.selectedLink)) event.preventDefault();
    }

    onKeydown(event) {
      // Prevent the cursor from moving in the input when using the up and down arrow keys
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault();
      }
    }

    onKeyup(event) {
      if (!this.getQuery().length && this.predictiveSearch) {
        this.close(true);
      }
      event.preventDefault();

      switch (event.code) {
        case 'ArrowUp':
          this.switchOption('up');
          break;
        case 'ArrowDown':
          this.switchOption('down');
          break;
        case 'Enter':
          this.selectOption();
          break;
      }
    }

    switchOption(direction) {
      const moveUp = direction === 'up';
      const predictiveSearchOpened = this.classList.contains(classes$P.isSearched) && this.predictiveSearchResults;

      const visibleElementsContainer = predictiveSearchOpened ? this.predictiveSearchResults : this.popularSearches;

      if (!visibleElementsContainer) return;
      this.selectedElement = visibleElementsContainer.querySelector(selectors$11.ariaSelected);

      // Filter out hidden elements
      const allVisibleElements = Array.from(visibleElementsContainer.querySelectorAll(selectors$11.allVisibleElements)).filter((element) => element.offsetParent !== null);

      let activeElementIndex = 0;

      if (moveUp && !this.selectedElement) return;

      let selectedElementIndex = -1;
      let i = 0;

      while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
        if (allVisibleElements[i] === this.selectedElement) {
          selectedElementIndex = i;
        }
        i++;
      }

      if (!moveUp && this.selectedElement) {
        activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
      } else if (moveUp) {
        activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
      }

      if (activeElementIndex === selectedElementIndex) return;

      this.activeElement = allVisibleElements[activeElementIndex];
      this.handleFocusableDescendants();
    }

    selectOption() {
      const selectedOption = this.querySelector(selectors$11.selectedOption);

      if (selectedOption) selectedOption.click();
    }

    handleFocusableDescendants(reset = false) {
      const selected = this.selectedElement ? this.selectedElement : this.querySelector(selectors$11.ariaSelected);
      if (selected) selected.setAttribute('aria-selected', false);

      if (!this.activeElement || reset) {
        this.selectedElement = null;
        this.activeElement?.setAttribute('aria-selected', false);
        this.input.setAttribute('aria-expanded', false);
        this.input.setAttribute('aria-activedescendant', '');
        return;
      }

      this.activeElement.setAttribute('aria-selected', true);
      this.input.setAttribute('aria-activedescendant', this.activeElement.id);
    }
  }

  customElements.define('search-form', SearchForm);

  const selectors$10 = {
    predictiveSearch: 'predictive-search',
    sectionPredictiveSearch: '#shopify-section-api-predictive-search',
    predictiveSearchResults: '[data-predictive-search-results]',
    predictiveSearchStatus: '[data-predictive-search-status]',
    searchResultsLiveRegion: '[data-predictive-search-live-region-count-value]',
    searchResultsWrapper: '[data-search-results-wrapper]',
  };

  const classes$O = {
    reset: 'reset',
  };

  class PredictiveSearch extends SearchForm {
    constructor() {
      super();

      this.abortController = new AbortController();
      this.allPredictiveSearchInstances = document.querySelectorAll(selectors$10.predictiveSearch);
      this.predictiveSearchResults = this.querySelector(selectors$10.predictiveSearchResults);
      this.cachedResults = {};
    }

    connectedCallback() {
      this.predictiveSearchResults.addEventListener('transitionend', (event) => {
        if (event.target === this.predictiveSearchResults && !this.getQuery().length) {
          this.classList.remove(classes$O.reset);
          requestAnimationFrame(() => this.clearResultsHTML());
        }
      });
    }

    onChange() {
      super.onChange();
      this.classList.remove(classes$O.reset);

      if (!this.searchTerm.length) {
        this.classList.add(classes$O.reset);
        return;
      }

      requestAnimationFrame(() => this.getSearchResults(this.searchTerm));
    }

    onFocus() {
      super.onFocus();

      if (!this.currentSearchTerm.length) return;

      if (this.searchTerm !== this.currentSearchTerm) {
        // Search term was changed from other search input, treat it as a user change
        this.onChange();
      } else if (this.getAttribute('results') === 'true') {
        this.open();
      } else {
        this.getSearchResults(this.searchTerm);
      }
    }

    getSearchResults(searchTerm) {
      const queryKey = searchTerm.replace(' ', '-').toLowerCase();
      const suggestionsResultsLimit = parseInt(window.theme.settings.suggestionsResultsLimit);
      let resources = 'query';
      resources += window.theme.settings.suggestArticles ? ',article' : '';
      resources += window.theme.settings.suggestCollections ? ',collection' : '';
      resources += window.theme.settings.suggestProducts ? ',product' : '';
      resources += window.theme.settings.suggestPages ? ',page' : '';

      this.setLiveRegionLoadingState();

      if (this.cachedResults[queryKey]) {
        this.renderSearchResults(this.cachedResults[queryKey]);
        return;
      }

      fetch(`${theme.routes.predictiveSearchUrl}?q=${encodeURIComponent(searchTerm)}&resources[type]=${resources}&resources[limit]=${suggestionsResultsLimit}&section_id=api-predictive-search`, {
        signal: this.abortController.signal,
      })
        .then((response) => {
          if (!response.ok) {
            var error = new Error(response.status);
            this.close();
            throw error;
          }

          return response.text();
        })
        .then((text) => {
          const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$10.sectionPredictiveSearch).innerHTML;
          // Save bandwidth keeping the cache in all instances synced
          this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
            predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
          });
          this.renderSearchResults(resultsMarkup);
        })
        .catch((error) => {
          if (error?.code === 20) {
            // Code 20 means the call was aborted
            return;
          }
          this.close();
          throw error;
        });
    }

    switchOption(direction) {
      super.switchOption(direction);

      if (this.statusElement) this.statusElement.textContent = '';
    }

    setLiveRegionLoadingState() {
      this.statusElement = this.statusElement || this.querySelector(selectors$10.predictiveSearchStatus);
      this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

      this.setLiveRegionText(this.loadingText);
      this.setAttribute('loading', true);
    }

    setLiveRegionText(statusText) {
      this.statusElement.setAttribute('aria-hidden', 'false');
      this.statusElement.textContent = statusText;

      setTimeout(() => {
        this.statusElement.setAttribute('aria-hidden', 'true');
      }, 1000);
    }

    renderSearchResults(resultsMarkup) {
      this.predictiveSearchResults.innerHTML = resultsMarkup;

      this.setAttribute('results', true);

      this.setLiveRegionResults();
      this.open();
    }

    setLiveRegionResults() {
      this.removeAttribute('loading');
      this.setLiveRegionText(this.querySelector(selectors$10.searchResultsLiveRegion).textContent);
    }

    open() {
      this.setAttribute('open', true);
    }

    close(clearSearchTerm = false) {
      this.closeResults(clearSearchTerm);
    }

    closeResults(clearSearchTerm = false) {
      if (clearSearchTerm) {
        this.reset();
        this.removeAttribute('results');
        this.classList.remove(classes$O.reset);
      }

      this.removeAttribute('loading');
      this.removeAttribute('open');
    }

    clearResultsHTML() {
      this.predictiveSearchResults.innerHTML = '';
    }
  }

  customElements.define('predictive-search', PredictiveSearch);

  resizeListener();
  scrollListener();
  isTouch();

  const headerFunctions = debounce(() => {
    // Recheck sticky header settings if section is set to hidden
    initTransparentHeader();
  }, 300);

  window.addEventListener('load', () => {
    setVarsOnResize();
    preventOverflow(document);
    wrapElements(document);
    loading();
  });

  document.addEventListener('shopify:section:load', (e) => {
    const container = e.target;

    window.dispatchEvent(new Event('resize'), {bubbles: true});

    preventOverflow(container);
    wrapElements(container);
    setVarsOnResize();

    headerFunctions();
  });

  document.addEventListener('shopify:section:reorder', () => {
    headerFunctions();
  });

  document.addEventListener('shopify:section:unload', () => {
    headerFunctions();
  });

  (function () {
    function n(n) {
      var i = window.innerWidth || document.documentElement.clientWidth,
        r = window.innerHeight || document.documentElement.clientHeight,
        t = n.getBoundingClientRect();
      return t.top >= 0 && t.bottom <= r && t.left >= 0 && t.right <= i;
    }
    function t(n) {
      var i = window.innerWidth || document.documentElement.clientWidth,
        r = window.innerHeight || document.documentElement.clientHeight,
        t = n.getBoundingClientRect(),
        u = (t.left >= 0 && t.left <= i) || (t.right >= 0 && t.right <= i),
        f = (t.top >= 0 && t.top <= r) || (t.bottom >= 0 && t.bottom <= r);
      return u && f;
    }
    function i(n, i) {
      function r() {
        var r = t(n);
        r != u && ((u = r), typeof i == 'function' && i(r, n));
      }
      var u = t(n);
      window.addEventListener('load', r);
      window.addEventListener('resize', r);
      window.addEventListener('scroll', r);
    }
    function r(t, i) {
      function r() {
        var r = n(t);
        r != u && ((u = r), typeof i == 'function' && i(r, t));
      }
      var u = n(t);
      window.addEventListener('load', r);
      window.addEventListener('resize', r);
      window.addEventListener('scroll', r);
    }
    window.visibilityHelper = {isElementTotallyVisible: n, isElementPartiallyVisible: t, inViewportPartially: i, inViewportTotally: r};
  })();

  window.Shopify = window.Shopify || {};
  window.Shopify.theme = window.Shopify.theme || {};
  window.Shopify.theme.sections = window.Shopify.theme.sections || {};

  window.Shopify.theme.sections.registered = window.Shopify.theme.sections.registered || {};
  window.Shopify.theme.sections.instances = window.Shopify.theme.sections.instances || [];
  const registered = window.Shopify.theme.sections.registered;
  const instances = window.Shopify.theme.sections.instances;

  const attributes$G = {
    id: 'data-section-id',
    type: 'data-section-type',
  };

  class Registration {
    constructor(type = null, components = []) {
      this.type = type;
      this.components = validateComponentsArray(components);
      this.callStack = {
        onLoad: [],
        onUnload: [],
        onSelect: [],
        onDeselect: [],
        onBlockSelect: [],
        onBlockDeselect: [],
        onReorder: [],
      };
      components.forEach((comp) => {
        for (const [key, value] of Object.entries(comp)) {
          const arr = this.callStack[key];
          if (Array.isArray(arr) && typeof value === 'function') {
            arr.push(value);
          } else {
            console.warn(`Unregisted function: '${key}' in component: '${this.type}'`);
            console.warn(value);
          }
        }
      });
    }

    getStack() {
      return this.callStack;
    }
  }

  class Section {
    constructor(container, registration) {
      this.container = validateContainerElement(container);
      this.id = container.getAttribute(attributes$G.id);
      this.type = registration.type;
      this.callStack = registration.getStack();

      try {
        this.onLoad();
      } catch (e) {
        console.warn(`Error in section: ${this.id}`);
        console.warn(this);
        console.warn(e);
      }
    }

    callFunctions(key, e = null) {
      this.callStack[key].forEach((func) => {
        const props = {
          id: this.id,
          type: this.type,
          container: this.container,
        };
        if (e) {
          func.call(props, e);
        } else {
          func.call(props);
        }
      });
    }

    onLoad() {
      this.callFunctions('onLoad');
    }

    onUnload() {
      this.callFunctions('onUnload');
    }

    onSelect(e) {
      this.callFunctions('onSelect', e);
    }

    onDeselect(e) {
      this.callFunctions('onDeselect', e);
    }

    onBlockSelect(e) {
      this.callFunctions('onBlockSelect', e);
    }

    onBlockDeselect(e) {
      this.callFunctions('onBlockDeselect', e);
    }

    onReorder(e) {
      this.callFunctions('onReorder', e);
    }
  }

  function validateContainerElement(container) {
    if (!(container instanceof Element)) {
      throw new TypeError('Theme Sections: Attempted to load section. The section container provided is not a DOM element.');
    }
    if (container.getAttribute(attributes$G.id) === null) {
      throw new Error('Theme Sections: The section container provided does not have an id assigned to the ' + attributes$G.id + ' attribute.');
    }

    return container;
  }

  function validateComponentsArray(value) {
    if ((typeof value !== 'undefined' && typeof value !== 'object') || value === null) {
      throw new TypeError('Theme Sections: The components object provided is not a valid');
    }

    return value;
  }

  /*
   * @shopify/theme-sections
   * -----------------------------------------------------------------------------
   *
   * A framework to provide structure to your Shopify sections and a load and unload
   * lifecycle. The lifecycle is automatically connected to theme editor events so
   * that your sections load and unload as the editor changes the content and
   * settings of your sections.
   */

  function register(type, components) {
    if (typeof type !== 'string') {
      throw new TypeError('Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered');
    }

    if (typeof registered[type] !== 'undefined') {
      throw new Error('Theme Sections: A section of type "' + type + '" has already been registered. You cannot register the same section type twice');
    }

    if (!Array.isArray(components)) {
      components = [components];
    }

    const section = new Registration(type, components);
    registered[type] = section;

    return registered;
  }

  function load(types, containers) {
    types = normalizeType(types);

    if (typeof containers === 'undefined') {
      containers = document.querySelectorAll('[' + attributes$G.type + ']');
    }

    containers = normalizeContainers(containers);

    types.forEach(function (type) {
      const registration = registered[type];

      if (typeof registration === 'undefined') {
        return;
      }

      containers = containers.filter(function (container) {
        // Filter from list of containers because container already has an instance loaded
        if (isInstance(container)) {
          return false;
        }

        // Filter from list of containers because container doesn't have data-section-type attribute
        if (container.getAttribute(attributes$G.type) === null) {
          return false;
        }

        // Keep in list of containers because current type doesn't match
        if (container.getAttribute(attributes$G.type) !== type) {
          return true;
        }

        instances.push(new Section(container, registration));

        // Filter from list of containers because container now has an instance loaded
        return false;
      });
    });
  }

  function reorder(selector) {
    var instancesToReorder = getInstances(selector);

    instancesToReorder.forEach(function (instance) {
      instance.onReorder();
    });
  }

  function unload(selector) {
    var instancesToUnload = getInstances(selector);

    instancesToUnload.forEach(function (instance) {
      var index = instances
        .map(function (e) {
          return e.id;
        })
        .indexOf(instance.id);
      instances.splice(index, 1);
      instance.onUnload();
    });
  }

  function getInstances(selector) {
    var filteredInstances = [];

    // Fetch first element if its an array
    if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
      var firstElement = selector[0];
    }

    // If selector element is DOM element
    if (selector instanceof Element || firstElement instanceof Element) {
      var containers = normalizeContainers(selector);

      containers.forEach(function (container) {
        filteredInstances = filteredInstances.concat(
          instances.filter(function (instance) {
            return instance.container === container;
          })
        );
      });

      // If select is type string
    } else if (typeof selector === 'string' || typeof firstElement === 'string') {
      var types = normalizeType(selector);

      types.forEach(function (type) {
        filteredInstances = filteredInstances.concat(
          instances.filter(function (instance) {
            return instance.type === type;
          })
        );
      });
    }

    return filteredInstances;
  }

  function getInstanceById(id) {
    var instance;

    for (var i = 0; i < instances.length; i++) {
      if (instances[i].id === id) {
        instance = instances[i];
        break;
      }
    }
    return instance;
  }

  function isInstance(selector) {
    return getInstances(selector).length > 0;
  }

  function normalizeType(types) {
    // If '*' then fetch all registered section types
    if (types === '*') {
      types = Object.keys(registered);

      // If a single section type string is passed, put it in an array
    } else if (typeof types === 'string') {
      types = [types];

      // If single section constructor is passed, transform to array with section
      // type string
    } else if (types.constructor === Section) {
      types = [types.prototype.type];

      // If array of typed section constructors is passed, transform the array to
      // type strings
    } else if (Array.isArray(types) && types[0].constructor === Section) {
      types = types.map(function (Section) {
        return Section.type;
      });
    }

    types = types.map(function (type) {
      return type.toLowerCase();
    });

    return types;
  }

  function normalizeContainers(containers) {
    // Nodelist with entries
    if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
      containers = Array.prototype.slice.call(containers);

      // Empty Nodelist
    } else if (NodeList.prototype.isPrototypeOf(containers) && containers.length === 0) {
      containers = [];

      // Handle null (document.querySelector() returns null with no match)
    } else if (containers === null) {
      containers = [];

      // Single DOM element
    } else if (!Array.isArray(containers) && containers instanceof Element) {
      containers = [containers];
    }

    return containers;
  }

  if (window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector('[' + attributes$G.id + '="' + id + '"]');

      if (container !== null) {
        load(container.getAttribute(attributes$G.type), container);
      }
    });

    document.addEventListener('shopify:section:reorder', function (event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector('[' + attributes$G.id + '="' + id + '"]');
      var instance = getInstances(container)[0];

      if (typeof instance === 'object') {
        reorder(container);
      }
    });

    document.addEventListener('shopify:section:unload', function (event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector('[' + attributes$G.id + '="' + id + '"]');
      var instance = getInstances(container)[0];

      if (typeof instance === 'object') {
        unload(container);
      }
    });

    document.addEventListener('shopify:section:select', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onSelect(event);
      }
    });

    document.addEventListener('shopify:section:deselect', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onDeselect(event);
      }
    });

    document.addEventListener('shopify:block:select', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onBlockSelect(event);
      }
    });

    document.addEventListener('shopify:block:deselect', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onBlockDeselect(event);
      }
    });
  }

  const throttle = (fn, wait) => {
    let prev, next;
    return function invokeFn(...args) {
      const now = Date.now();
      next = clearTimeout(next);
      if (!prev || now - prev >= wait) {
        // eslint-disable-next-line prefer-spread
        fn.apply(null, args);
        prev = now;
      } else {
        next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
      }
    };
  };

  function FetchError(object) {
    this.status = object.status || null;
    this.headers = object.headers || null;
    this.json = object.json || null;
    this.body = object.body || null;
  }
  FetchError.prototype = Error.prototype;

  const selectors$$ = {
    single: '[data-collapsible-single]', // Add this attribute when we want only one item expanded at the same time
    trigger: '[data-collapsible-trigger]',
    content: '[data-collapsible-content]',
  };

  const classes$N = {
    isExpanded: 'is-expanded',
  };

  const attributes$F = {
    expanded: 'aria-expanded',
    controls: 'aria-controls',
    triggerMobile: 'data-collapsible-trigger-mobile',
    transitionOverride: 'data-collapsible-transition-override',
  };

  const settings$6 = {
    animationDelay: 500,
  };

  const sections$y = {};

  class Collapsible {
    constructor(container) {
      this.container = container;
      this.single = this.container.querySelector(selectors$$.single);
      this.triggers = this.container.querySelectorAll(selectors$$.trigger);
      this.resetHeightTimer = 0;
      this.isTransitioning = false;
      this.transitionOverride = this.container.hasAttribute(attributes$F.transitionOverride);
      this.collapsibleToggleEvent = (event) => throttle(this.collapsibleToggle(event), 1250);

      this.init();
    }

    init() {
      this.triggers.forEach((trigger) => {
        trigger.addEventListener('click', this.collapsibleToggleEvent);
        trigger.addEventListener('keyup', this.collapsibleToggleEvent);
      });
    }

    collapsibleToggle(e) {
      e.preventDefault();

      const trigger = e.target.matches(selectors$$.trigger) ? e.target : e.target.closest(selectors$$.trigger);
      const dropdownId = trigger.getAttribute(attributes$F.controls);
      const dropdown = document.getElementById(dropdownId);
      const triggerMobile = trigger.hasAttribute(attributes$F.triggerMobile);
      const isExpanded = trigger.classList.contains(classes$N.isExpanded);
      const isSpace = e.code === theme.keyboardKeys.SPACE;
      const isEscape = e.code === theme.keyboardKeys.ESCAPE;
      const isMobile = window.innerWidth < theme.sizes.small;

      // Do nothing if transitioning
      if (this.isTransitioning && !this.transitionOverride) {
        return;
      }

      // Do nothing if any different than ESC and Space key pressed
      if (e.code && !isSpace && !isEscape) {
        return;
      }

      // Do nothing if ESC key pressed and not expanded or mobile trigger clicked and screen not mobile
      if ((!isExpanded && isEscape) || (triggerMobile && !isMobile)) {
        return;
      }

      this.isTransitioning = true;
      trigger.disabled = true;

      // When we want only one item expanded at the same time
      if (this.single) {
        this.triggers.forEach((otherTrigger) => {
          const isExpanded = otherTrigger.classList.contains(classes$N.isExpanded);

          if (trigger == otherTrigger || !isExpanded) return;

          const dropdownId = otherTrigger.getAttribute(attributes$F.controls);
          const dropdown = document.getElementById(dropdownId);

          requestAnimationFrame(() => {
            this.closeItem(dropdown, otherTrigger);
          });
        });
      }

      // requestAnimationFrame fixes content jumping when item is sliding down
      if (isExpanded) {
        requestAnimationFrame(() => {
          this.closeItem(dropdown, trigger);
        });
      } else {
        requestAnimationFrame(() => {
          this.openItem(dropdown, trigger);
        });
      }
    }

    openItem(dropdown, trigger) {
      let dropdownHeight = dropdown.querySelector(selectors$$.content).offsetHeight;

      this.setDropdownHeight(dropdown, dropdownHeight, trigger, true);
      trigger.classList.add(classes$N.isExpanded);
      trigger.setAttribute(attributes$F.expanded, true);

      trigger.dispatchEvent(
        new CustomEvent('theme:form:sticky', {
          bubbles: true,
          detail: {
            element: 'accordion',
          },
        })
      );
    }

    closeItem(dropdown, trigger) {
      let dropdownHeight = dropdown.querySelector(selectors$$.content).offsetHeight;

      requestAnimationFrame(() => {
        dropdownHeight = 0;
        this.setDropdownHeight(dropdown, dropdownHeight, trigger, false);
        trigger.classList.remove(classes$N.isExpanded);
      });

      this.setDropdownHeight(dropdown, dropdownHeight, trigger, false);
      trigger.classList.remove(classes$N.isExpanded);
      trigger.setAttribute(attributes$F.expanded, false);
    }

    setDropdownHeight(dropdown, dropdownHeight, trigger, isExpanded) {
      dropdown.style.height = `${dropdownHeight}px`;
      dropdown.setAttribute(attributes$F.expanded, isExpanded);
      dropdown.classList.toggle(classes$N.isExpanded, isExpanded);

      if (this.resetHeightTimer) {
        clearTimeout(this.resetHeightTimer);
      }

      if (dropdownHeight == 0) {
        this.resetHeightTimer = setTimeout(() => {
          dropdown.style.height = '';
        }, settings$6.animationDelay);
      }

      if (isExpanded) {
        this.resetHeightTimer = setTimeout(() => {
          dropdown.style.height = 'auto';
          this.isTransitioning = false;
        }, settings$6.animationDelay);
      } else {
        this.isTransitioning = false;
      }

      // Always remove trigger disabled attribute after animation completes
      setTimeout(() => {
        trigger.disabled = false;
      }, settings$6.animationDelay);
    }

    onUnload() {
      this.triggers.forEach((trigger) => {
        trigger.removeEventListener('click', this.collapsibleToggleEvent);
        trigger.removeEventListener('keyup', this.collapsibleToggleEvent);
      });
    }
  }

  const collapsible = {
    onLoad() {
      sections$y[this.id] = new Collapsible(this.container);
    },
    onUnload() {
      sections$y[this.id].onUnload();
    },
  };

  const selectors$_ = {
    quantityHolder: '[data-quantity-holder]',
    quantityField: '[data-quantity-field]',
    quantityButton: '[data-quantity-button]',
    quantityMinusButton: '[data-quantity-minus]',
    quantityPlusButton: '[data-quantity-plus]',
  };

  const classes$M = {
    quantityReadOnly: 'read-only',
    isDisabled: 'is-disabled',
  };

  class QuantityCounter {
    constructor(holder, inCart = false) {
      this.holder = holder;
      this.quantityUpdateCart = inCart;
    }

    init() {
      // DOM Elements
      this.quantity = this.holder.querySelector(selectors$_.quantityHolder);

      if (!this.quantity) {
        return;
      }

      this.field = this.quantity.querySelector(selectors$_.quantityField);
      this.buttons = this.quantity.querySelectorAll(selectors$_.quantityButton);
      this.increaseButton = this.quantity.querySelector(selectors$_.quantityPlusButton);

      // Set value or classes
      this.quantityValue = Number(this.field.value || 0);
      this.cartItemID = this.field.getAttribute('data-id');
      this.maxValue = Number(this.field.getAttribute('max')) > 0 ? Number(this.field.getAttribute('max')) : null;
      this.minValue = Number(this.field.getAttribute('min')) > 0 ? Number(this.field.getAttribute('min')) : 0;
      this.disableIncrease = this.disableIncrease.bind(this);

      // Flags
      this.emptyField = false;

      // Methods
      this.updateQuantity = this.updateQuantity.bind(this);
      this.decrease = this.decrease.bind(this);
      this.increase = this.increase.bind(this);

      this.disableIncrease();

      // Events
      if (!this.quantity.classList.contains(classes$M.quantityReadOnly)) {
        this.changeValueOnClick();
        this.changeValueOnInput();
      }
    }

    /**
     * Change field value when click on quantity buttons
     *
     * @return  {Void}
     */

    changeValueOnClick() {
      this.buttons.forEach((element) => {
        element.addEventListener('click', (event) => {
          event.preventDefault();

          this.quantityValue = Number(this.field.value || 0);

          const clickedElement = event.target;
          const isDescrease = clickedElement.matches(selectors$_.quantityMinusButton) || clickedElement.closest(selectors$_.quantityMinusButton);
          const isIncrease = clickedElement.matches(selectors$_.quantityPlusButton) || clickedElement.closest(selectors$_.quantityPlusButton);

          if (isDescrease) {
            this.decrease();
          }

          if (isIncrease) {
            this.increase();
          }

          this.updateQuantity();
        });
      });
    }

    /**
     * Change field value when input new value in a field
     *
     * @return  {Void}
     */

    changeValueOnInput() {
      this.field.addEventListener('input', () => {
        this.quantityValue = this.field.value;
        this.updateQuantity();
      });
    }

    /**
     * Update field value
     *
     * @return  {Void}
     */

    updateQuantity() {
      if (this.maxValue < this.quantityValue && this.maxValue !== null) {
        this.quantityValue = this.maxValue;
      }

      if (this.minValue > this.quantityValue) {
        this.quantityValue = this.minValue;
      }

      this.field.value = this.quantityValue;

      this.disableIncrease();

      document.dispatchEvent(new CustomEvent('theme:cart:update'));

      if (this.quantityUpdateCart) {
        this.updateCart();
      }
    }

    /**
     * Decrease value
     *
     * @return  {Void}
     */

    decrease() {
      if (this.quantityValue > this.minValue) {
        this.quantityValue--;

        return;
      }

      this.quantityValue = 0;
    }

    /**
     * Increase value
     *
     * @return  {Void}
     */

    increase() {
      this.quantityValue++;
    }

    /**
     * Disable increase
     *
     * @return  {[type]}  [return description]
     */

    disableIncrease() {
      this.increaseButton.classList.toggle(classes$M.isDisabled, this.quantityValue >= this.maxValue && this.maxValue !== null);
    }

    updateCart() {
      if (this.quantityValue === '') return;

      const event = new CustomEvent('theme:cart:update', {
        bubbles: true,
        detail: {
          id: this.cartItemID,
          quantity: this.quantityValue,
        },
      });

      this.holder.dispatchEvent(event);
    }
  }

  const a11y = {
    /**
     * A11y Helpers
     * -----------------------------------------------------------------------------
     * A collection of useful functions that help make your theme more accessible
     */

    state: {
      firstFocusable: null,
      lastFocusable: null,
      trigger: null,
    },

    trapFocus: function (options) {
      var focusableElements = Array.from(options.container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex^="-"])')).filter(function (element) {
        var width = element.offsetWidth;
        var height = element.offsetHeight;

        return width !== 0 && height !== 0 && getComputedStyle(element).getPropertyValue('display') !== 'none';
      });

      focusableElements = focusableElements.filter(function (element) {
        return !element.classList.contains('deferred-media__poster');
      });

      this.state.firstFocusable = focusableElements[0];
      this.state.lastFocusable = focusableElements[focusableElements.length - 1];

      if (!options.elementToFocus) {
        options.elementToFocus = this.state.firstFocusable || options.container;
      }
      this._setupHandlers();

      document.addEventListener('focusin', this._onFocusInHandler);
      document.addEventListener('focusout', this._onFocusOutHandler);

      options.container.setAttribute('tabindex', '-1');
      options.elementToFocus.focus();
    },

    removeTrapFocus: function (options) {
      const focusVisible = !document.body.classList.contains('no-outline');
      if (options && options.container) {
        options.container.removeAttribute('tabindex');
      }
      document.removeEventListener('focusin', this._onFocusInHandler);

      if (this.state.trigger && focusVisible) {
        this.state.trigger.focus();
      }
    },

    _manageFocus: function (evt) {
      if (evt.code !== theme.keyboardKeys.TAB) {
        return;
      }

      /**
       * On the last focusable element and tab forward,
       * focus the first element.
       */
      if (evt.target === this.state.lastFocusable && !evt.shiftKey) {
        evt.preventDefault();
        this.state.firstFocusable.focus();
      }

      /**
       * On the first focusable element and tab backward,
       * focus the last element.
       */
      if (evt.target === this.state.firstFocusable && evt.shiftKey) {
        evt.preventDefault();
        this.state.lastFocusable.focus();
      }
    },

    _onFocusOut: function () {
      document.removeEventListener('keydown', this._manageFocusHandler);
    },

    _onFocusIn: function (evt) {
      if (evt.target !== this.state.lastFocusable && evt.target !== this.state.firstFocusable) {
        return;
      }

      document.addEventListener('keydown', this._manageFocusHandler);
    },

    _setupHandlers: function () {
      if (!this._onFocusInHandler) {
        this._onFocusInHandler = this._onFocusIn.bind(this);
      }

      if (!this._onFocusOutHandler) {
        this._onFocusOutHandler = this._onFocusIn.bind(this);
      }

      if (!this._manageFocusHandler) {
        this._manageFocusHandler = this._manageFocus.bind(this);
      }
    },
  };

  function getScript(url, callback, callbackError) {
    let head = document.getElementsByTagName('head')[0];
    let done = false;
    let script = document.createElement('script');
    script.src = url;

    // Attach handlers for all browsers
    script.onload = script.onreadystatechange = function () {
      if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
        done = true;
        callback();
      } else {
        callbackError();
      }
    };

    head.appendChild(script);
  }

  const loaders = {};
  window.isYoutubeAPILoaded = false;
  window.isVimeoAPILoaded = false;

  function loadScript(options = {}) {
    if (!options.type) {
      options.type = 'json';
    }

    if (options.url) {
      if (loaders[options.url]) {
        return loaders[options.url];
      } else {
        return getScriptWithPromise(options.url, options.type);
      }
    } else if (options.json) {
      if (loaders[options.json]) {
        return Promise.resolve(loaders[options.json]);
      } else {
        return window
          .fetch(options.json)
          .then((response) => {
            return response.json();
          })
          .then((response) => {
            loaders[options.json] = response;
            return response;
          });
      }
    } else if (options.name) {
      const key = ''.concat(options.name, options.version);
      if (loaders[key]) {
        return loaders[key];
      } else {
        return loadShopifyWithPromise(options);
      }
    } else {
      return Promise.reject();
    }
  }

  function getScriptWithPromise(url, type) {
    const loader = new Promise((resolve, reject) => {
      if (type === 'text') {
        fetch(url)
          .then((response) => response.text())
          .then((data) => {
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        getScript(
          url,
          function () {
            resolve();
          },
          function () {
            reject();
          }
        );
      }
    });

    loaders[url] = loader;
    return loader;
  }

  function loadShopifyWithPromise(options) {
    const key = ''.concat(options.name, options.version);
    const loader = new Promise((resolve, reject) => {
      try {
        window.Shopify.loadFeatures([
          {
            name: options.name,
            version: options.version,
            onLoad: (err) => {
              onLoadFromShopify(resolve, reject, err);
            },
          },
        ]);
      } catch (err) {
        reject(err);
      }
    });
    loaders[key] = loader;
    return loader;
  }

  function onLoadFromShopify(resolve, reject, err) {
    if (err) {
      return reject(err);
    } else {
      return resolve();
    }
  }

  const selectors$Z = {
    videoIframe: '[data-video-id]',
  };

  const classes$L = {
    loaded: 'loaded',
  };

  const attributes$E = {
    dataEnableSound: 'data-enable-sound',
    dataEnableBackground: 'data-enable-background',
    dataEnableAutoplay: 'data-enable-autoplay',
    dataEnableLoop: 'data-enable-loop',
    dataVideoId: 'data-video-id',
    dataVideoType: 'data-video-type',
  };

  class LoadVideoVimeo {
    constructor(container) {
      this.container = container;
      this.player = this.container.querySelector(selectors$Z.videoIframe);

      if (this.player) {
        this.videoID = this.player.getAttribute(attributes$E.dataVideoId);
        this.videoType = this.player.getAttribute(attributes$E.dataVideoType);
        this.enableBackground = this.player.getAttribute(attributes$E.dataEnableBackground) === 'true';
        this.disableSound = this.player.getAttribute(attributes$E.dataEnableSound) === 'false';
        this.enableAutoplay = this.player.getAttribute(attributes$E.dataEnableAutoplay) !== 'false';
        this.enableLoop = this.player.getAttribute(attributes$E.dataEnableLoop) !== 'false';

        if (this.videoType == 'vimeo') {
          this.init();
        }
      }
    }

    init() {
      this.loadVimeoPlayer();
    }

    loadVimeoPlayer() {
      const oembedUrl = 'https://vimeo.com/api/oembed.json';
      const vimeoUrl = 'https://vimeo.com/' + this.videoID;
      let paramsString = '';
      const state = this.player;

      const params = {
        url: vimeoUrl,
        background: this.enableBackground,
        muted: this.disableSound,
        autoplay: this.enableAutoplay,
        loop: this.enableLoop,
      };

      for (let key in params) {
        paramsString += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
      }

      fetch(`${oembedUrl}?${paramsString}`)
        .then((response) => response.json())
        .then(function (data) {
          state.innerHTML = data.html;

          setTimeout(function () {
            state.parentElement.classList.add(classes$L.loaded);
          }, 1000);
        })
        .catch(function () {
          console.log('error');
        });
    }
  }

  const selectors$Y = {
    videoIframe: '[data-video-id]',
    videoWrapper: '.video-wrapper',
    youtubeWrapper: '[data-youtube-wrapper]',
  };

  const attributes$D = {
    dataSectionId: 'data-section-id',
    dataEnableSound: 'data-enable-sound',
    dataHideOptions: 'data-hide-options',
    dataCheckPlayerVisibility: 'data-check-player-visibility',
    dataVideoId: 'data-video-id',
    dataVideoType: 'data-video-type',
  };

  const classes$K = {
    loaded: 'loaded',
  };

  const players = [];

  class LoadVideoYT {
    constructor(container) {
      this.container = container;
      this.player = this.container.querySelector(selectors$Y.videoIframe);

      if (this.player) {
        this.videoOptionsVars = {};
        this.videoID = this.player.getAttribute(attributes$D.dataVideoId);
        this.videoType = this.player.getAttribute(attributes$D.dataVideoType);
        if (this.videoType == 'youtube') {
          this.checkPlayerVisibilityFlag = this.player.getAttribute(attributes$D.dataCheckPlayerVisibility) === 'true';
          this.playerID = this.player.querySelector(selectors$Y.youtubeWrapper) ? this.player.querySelector(selectors$Y.youtubeWrapper).id : this.player.id;
          if (this.player.hasAttribute(selectors$Y.dataHideOptions)) {
            this.videoOptionsVars = {
              cc_load_policy: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              playsinline: 1,
              autohide: 0,
              controls: 0,
              branding: 0,
              showinfo: 0,
              rel: 0,
              fs: 0,
              wmode: 'opaque',
            };
          }

          this.init();

          this.container.addEventListener(
            'touchstart',
            function (e) {
              if (e.target.matches(selectors$Y.videoWrapper) || e.target.closest(selectors$Y.videoWrapper)) {
                const playerID = e.target.querySelector(selectors$Y.videoIframe).id;
                players[playerID].playVideo();
              }
            },
            {passive: true}
          );
        }
      }
    }

    init() {
      if (window.isYoutubeAPILoaded) {
        this.loadYoutubePlayer();
      } else {
        // Load Youtube API if not loaded yet
        loadScript({url: 'https://www.youtube.com/iframe_api'}).then(() => this.loadYoutubePlayer());
      }
    }

    loadYoutubePlayer() {
      const defaultYoutubeOptions = {
        height: '720',
        width: '1280',
        playerVars: this.videoOptionsVars,
        events: {
          onReady: (event) => {
            const eventIframe = event.target.getIframe();
            const id = eventIframe.id;
            const enableSound = document.querySelector(`#${id}`).getAttribute(attributes$D.dataEnableSound) === 'true';

            eventIframe.setAttribute('tabindex', '-1');

            if (enableSound) {
              event.target.unMute();
            } else {
              event.target.mute();
            }
            event.target.playVideo();

            if (this.checkPlayerVisibilityFlag) {
              this.checkPlayerVisibility(id);

              window.addEventListener(
                'scroll',
                throttle(() => {
                  this.checkPlayerVisibility(id);
                }, 150)
              );
            }
          },
          onStateChange: (event) => {
            // Loop video if state is ended
            if (event.data == 0) {
              event.target.playVideo();
            }
            if (event.data == 1) {
              // video is playing
              event.target.getIframe().parentElement.classList.add(classes$K.loaded);
            }
          },
        },
      };

      const currentYoutubeOptions = {...defaultYoutubeOptions};
      currentYoutubeOptions.videoId = this.videoID;
      if (this.videoID.length) {
        YT.ready(() => {
          players[this.playerID] = new YT.Player(this.playerID, currentYoutubeOptions);
        });
      }
      window.isYoutubeAPILoaded = true;
    }

    checkPlayerVisibility(id) {
      let playerID;
      if (typeof id === 'string') {
        playerID = id;
      } else if (id.data != undefined) {
        playerID = id.data.id;
      } else {
        return;
      }

      const playerElement = document.getElementById(playerID + '-container');
      if (!playerElement) {
        return;
      }
      const player = players[playerID];
      const box = playerElement.getBoundingClientRect();
      let isVisible = visibilityHelper.isElementPartiallyVisible(playerElement) || visibilityHelper.isElementTotallyVisible(playerElement);

      // Fix the issue when element height is bigger than the viewport height
      if (box.top < 0 && playerElement.clientHeight + box.top >= 0) {
        isVisible = true;
      }

      if (isVisible && player && typeof player.playVideo === 'function') {
        player.playVideo();
      } else if (!isVisible && player && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
      }
    }

    onUnload() {
      const playerID = 'youtube-' + this.container.getAttribute(attributes$D.dataSectionId);
      if (!players[playerID]) {
        return;
      }
      players[playerID].destroy();
    }
  }

  const selectors$X = {
    notificationForm: '[data-notification-form]',
    notification: '[data-notification]',
    popupClose: '[data-popup-close]',
  };

  const classes$J = {
    popupSuccess: 'pswp--success',
    notificationPopupVisible: 'notification-popup-visible',
  };

  class LoadNotification {
    constructor(popup, pswpElement) {
      this.popup = popup;
      this.pswpElement = pswpElement;
      this.notificationForm = null;
      this.notificationStopSubmit = true;
      this.sessionStorage = window.sessionStorage;
      const notificationWrapper = this.pswpElement.querySelector(selectors$X.notification);
      this.outerCloseEvent = (e) => {
        if (!notificationWrapper.contains(e.target)) {
          this.popup.close();
        }
      };

      this.init();
    }

    init() {
      this.popup.listen('preventDragEvent', (e, isDown, preventObj) => {
        preventObj.prevent = false;
      });

      const notificationFormSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
      this.notificationForm = this.pswpElement.querySelector(selectors$X.notificationForm);
      const closeBtn = this.pswpElement.querySelector(selectors$X.popupClose);
      document.body.classList.add(classes$J.notificationPopupVisible);

      this.pswpElement.addEventListener('mousedown', () => {
        this.popup.framework.unbind(window, 'pointermove pointerup pointercancel', this.popup);
      });

      if (notificationFormSuccess) {
        this.pswpElement.classList.add(classes$J.popupSuccess);
      }

      this.notificationForm.addEventListener('submit', (e) => this.notificationSubmitEvent(e));

      // Custom closing events
      this.pswpElement.addEventListener('click', this.outerCloseEvent);

      closeBtn.addEventListener('click', () => {
        this.popup.close();
      });

      this.popup.listen('destroy', () => {
        this.notificationRemoveStorage();
        this.pswpElement.removeEventListener('click', this.outerCloseEvent);
        document.body.classList.remove(classes$J.notificationPopupVisible);
      });
    }

    notificationSubmitEvent(e) {
      if (this.notificationStopSubmit) {
        e.preventDefault();

        this.notificationRemoveStorage();
        this.notificationWriteStorage();
        this.notificationStopSubmit = false;
        this.notificationForm.submit();
      }
    }

    notificationWriteStorage() {
      if (this.sessionStorage !== undefined) {
        this.sessionStorage.setItem('notification_form_id', this.notificationForm.id);
      }
    }

    notificationRemoveStorage() {
      this.sessionStorage.removeItem('notification_form_id');
    }
  }

  // iOS smooth scrolling fix
  function flickitySmoothScrolling(slider) {
    const flkty = Flickity.data(slider);

    if (!flkty) {
      return;
    }

    flkty.on('dragStart', (event, pointer) => {
      document.ontouchmove = function (e) {
        e.preventDefault();
      };
    });

    flkty.on('dragEnd', (event, pointer) => {
      document.ontouchmove = function (e) {
        return true;
      };
    });
  }

  const hosts = {
    html5: 'html5',
    youtube: 'youtube',
    vimeo: 'vimeo',
  };

  const selectors$W = {
    deferredMedia: '[data-deferred-media]',
    deferredMediaButton: '[data-deferred-media-button]',
    productMediaWrapper: '[data-product-single-media-wrapper]',
    mediaContainer: '[data-video]',
    mediaHidden: '.media--hidden',
  };

  const classes$I = {
    mediaHidden: 'media--hidden',
  };

  const attributes$C = {
    loaded: 'loaded',
    sectionId: 'data-section-id',
    dataAutoplayVideo: 'data-autoplay-video',
    mediaId: 'data-media-id',
  };

  class ProductVideo {
    constructor(container) {
      this.container = container;
      this.id = this.container.getAttribute(attributes$C.sectionId);
      this.autoplayVideo = this.container.getAttribute(attributes$C.dataAutoplayVideo) === 'true';
      this.players = {};
      this.pauseContainerMedia = (mediaId, container = this.container) => this.pauseOtherMedia(mediaId, container);
      this.init();
    }

    init() {
      const mediaContainers = this.container.querySelectorAll(selectors$W.mediaContainer);

      mediaContainers.forEach((mediaContainer) => {
        const deferredMediaButton = mediaContainer.querySelector(selectors$W.deferredMediaButton);

        if (deferredMediaButton) {
          deferredMediaButton.addEventListener('click', this.loadContent.bind(this, mediaContainer));
        }

        if (this.autoplayVideo) {
          this.loadContent(mediaContainer);
        }
      });
    }

    loadContent(mediaContainer) {
      if (mediaContainer.querySelector(selectors$W.deferredMedia).getAttribute(attributes$C.loaded)) {
        return;
      }

      const content = document.createElement('div');
      content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
      const mediaId = mediaContainer.dataset.mediaId;
      const element = content.querySelector('video, iframe');
      const host = this.hostFromVideoElement(element);
      const deferredMedia = mediaContainer.querySelector(selectors$W.deferredMedia);
      deferredMedia.appendChild(element);
      deferredMedia.setAttribute('loaded', true);

      this.players[mediaId] = {
        mediaId: mediaId,
        sectionId: this.id,
        container: mediaContainer,
        element: element,
        host: host,
        ready: () => {
          this.createPlayer(mediaId);
        },
      };

      const video = this.players[mediaId];

      switch (video.host) {
        case hosts.html5:
          this.loadVideo(video, hosts.html5);
          break;
        case hosts.vimeo:
          if (window.isVimeoAPILoaded) {
            this.loadVideo(video, hosts.vimeo);
          } else {
            loadScript({url: 'https://player.vimeo.com/api/player.js'}).then(() => this.loadVideo(video, hosts.vimeo));
          }
          break;
        case hosts.youtube:
          if (window.isYoutubeAPILoaded) {
            this.loadVideo(video, hosts.youtube);
          } else {
            loadScript({url: 'https://www.youtube.com/iframe_api'}).then(() => this.loadVideo(video, hosts.youtube));
          }
          break;
      }
    }

    hostFromVideoElement(video) {
      if (video.tagName === 'VIDEO') {
        return hosts.html5;
      }

      if (video.tagName === 'IFRAME') {
        if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(video.src)) {
          return hosts.youtube;
        } else if (video.src.includes('vimeo.com')) {
          return hosts.vimeo;
        }
      }

      return null;
    }

    loadVideo(video, host) {
      if (video.host === host) {
        video.ready();
      }
    }

    createPlayer(mediaId) {
      const video = this.players[mediaId];

      switch (video.host) {
        case hosts.html5:
          video.element.addEventListener('play', () => {
            video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
          });

          video.element.addEventListener('pause', () => {
            video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
          });

          if (this.autoplayVideo) {
            this.observeVideo(video, mediaId);
          }

          break;
        case hosts.vimeo:
          video.player = new Vimeo.Player(video.element);
          video.player.play(); // Force video play on iOS
          video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});

          window.isVimeoAPILoaded = true;

          video.player.on('play', () => {
            video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
          });

          video.player.on('pause', () => {
            video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
          });

          if (this.autoplayVideo) {
            this.observeVideo(video, mediaId);
          }

          break;
        case hosts.youtube:
          if (video.host == hosts.youtube && video.player) {
            return;
          }

          YT.ready(() => {
            const videoId = video.container.dataset.videoId;

            video.player = new YT.Player(video.element, {
              videoId: videoId,
              events: {
                onReady: (event) => {
                  event.target.playVideo(); // Force video play on iOS
                  video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
                },
                onStateChange: (event) => {
                  // Playing
                  if (event.data == 1) {
                    video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
                  }

                  // Paused
                  if (event.data == 2) {
                    video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
                  }

                  // Ended
                  if (event.data == 0) {
                    video.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
                  }
                },
              },
            });

            window.isYoutubeAPILoaded = true;

            if (this.autoplayVideo) {
              this.observeVideo(video, mediaId);
            }
          });

          break;
      }

      video.container.addEventListener('theme:media:visible', (event) => this.onVisible(event));
      video.container.addEventListener('theme:media:hidden', (event) => this.onHidden(event));
      video.container.addEventListener('xrLaunch', (event) => this.onHidden(event));
    }

    observeVideo(video) {
      let observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            const outsideViewport = entry.intersectionRatio == 0;
            const isVisible = !video.element.closest(selectors$W.mediaHidden);

            if (outsideViewport) {
              this.pauseVideo(video);
            } else if (isVisible) {
              this.playVideo(video);
            }
          });
        },
        {
          rootMargin: '200px',
          threshold: [0, 0.25, 0.75, 1],
        }
      );
      observer.observe(video.element);
    }

    playVideo(video) {
      if (video.player && video.player.playVideo) {
        video.player.playVideo();
      } else if (video.element && video.element.play) {
        video.element.play();
      } else if (video.player && video.player.play) {
        video.player.play();
      }

      video.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
    }

    pauseVideo(video) {
      if (video.player && video.player.pauseVideo) {
        // Youtube
        if (video.player.playerInfo.playerState == '1') {
          // If Youtube video is playing
          // There is no need to trigger the 'pause' event since we are listening for it when initializing the YT Video
          video.player.pauseVideo();
        }
      } else if (video.player && video.player.pause) {
        // Vimeo
        video.player.pause();
      } else if (video.element && !video.element.paused) {
        // HTML5
        // If HTML5 video is playing (we used .paused because there is no 'playing' property)
        video.element?.pause();
      }
    }

    onHidden(event) {
      if (typeof event.target.dataset.mediaId !== 'undefined') {
        const mediaId = event.target.dataset.mediaId;
        const video = this.players[mediaId];
        this.pauseVideo(video);
      }
    }

    onVisible(event) {
      if (typeof event.target.dataset.mediaId !== 'undefined') {
        const mediaId = event.target.dataset.mediaId;
        const video = this.players[mediaId];

        // Using a timeout so the video "play" event can triggers after the previous video "pause" event
        // because both events change the "draggable" option of the slider and we need to time it right
        setTimeout(() => {
          this.playVideo(video);
        }, 50);

        this.pauseContainerMedia(mediaId);
      }
    }

    pauseOtherMedia(mediaId, container) {
      const currentMedia = `[${attributes$C.mediaId}="${mediaId}"]`;
      const otherMedia = container.querySelectorAll(`${selectors$W.productMediaWrapper}:not(${currentMedia})`);

      if (otherMedia.length) {
        otherMedia.forEach((media) => {
          media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
          media.classList.add(classes$I.mediaHidden);
        });
      }
    }
  }

  const selectors$V = {
    scrollbar: '[data-custom-scrollbar]',
    scrollbarItems: '[data-custom-scrollbar-items]',
    scrollbarThumb: '[data-custom-scrollbar-thumb]',
  };

  class CustomScrollbar {
    constructor(container) {
      this.container = container;
      this.scrollbarItems = container.querySelector(selectors$V.scrollbarItems);
      this.scrollbar = container.querySelector(selectors$V.scrollbar);
      this.scrollbarThumb = container.querySelector(selectors$V.scrollbarThumb);
      this.trackWidth = 0;
      this.calcScrollbarEvent = () => this.calculateScrollbar();
      this.onScrollbarChangeEvent = (e) => this.onScrollbarChange(e);

      if (this.scrollbar && this.scrollbarItems) {
        this.events();
        this.calculateScrollbar();
        if (this.scrollbarItems.children.length) {
          this.calculateTrack(this.scrollbarItems.children[0]);
        }
      }
    }

    calculateTrack(element) {
      const thumbScale = element.clientWidth / this.scrollbarThumb.parentElement.clientWidth;
      const thumbPosition = element.offsetLeft / this.scrollbarThumb.parentElement.clientWidth;
      this.scrollbar.style.setProperty('--thumb-scale', thumbScale);
      this.scrollbar.style.setProperty('--thumb-position', `${this.trackWidth * thumbPosition}px`);
    }

    calculateScrollbar() {
      if (this.scrollbarItems.children.length) {
        const childrenArr = [...this.scrollbarItems.children];
        this.trackWidth = 0;

        childrenArr.forEach((element) => {
          this.trackWidth += element.getBoundingClientRect().width + parseInt(window.getComputedStyle(element).marginRight);
        });
        this.scrollbar.style.setProperty('--track-width', `${this.trackWidth}px`);
      }
    }

    onScrollbarChange(e) {
      if (e && e.detail && e.detail.element && this.container.contains(e.detail.element)) {
        this.calculateTrack(e.detail.element);
      }
    }

    events() {
      document.addEventListener('theme:resize:width', this.calcScrollbarEvent);
      document.addEventListener('theme:custom-scrollbar:change', this.onScrollbarChangeEvent);
    }

    unload() {
      document.removeEventListener('theme:resize:width', this.calcScrollbarEvent);
      document.removeEventListener('theme:custom-scrollbar:change', this.onScrollbarChangeEvent);
    }
  }

  const selectors$U = {
    tabsLink: '[data-tabs-link]',
    tab: '[data-tab]',
    tabRef: '[data-tab-ref]',
    scrollable: '[data-custom-scrollbar]',
    scrollableHolder: '[data-custom-scrollbar-holder]',
    slider: '[data-slider]',
    tabsContents: '[data-tabs-contents]',
  };

  const classes$H = {
    current: 'current',
    hide: 'hide',
    alt: 'alt',
    aosAnimate: 'aos-animate',
    aosInit: 'aos-init',
  };

  const attributes$B = {
    tabsLink: 'data-tabs-link',
    tab: 'data-tab',
    tabRef: 'data-tab-ref',
    tabStartIndex: 'data-start-index',
  };

  const sections$x = {};

  class Tabs {
    constructor(container) {
      this.container = container;
      this.tabsContents = container.querySelector(selectors$U.tabsContents);
      this.animateElementsTimer = null;

      if (this.container) {
        this.scrollable = this.container.querySelector(selectors$U.scrollable);
        this.tabRef = this.container.querySelectorAll(selectors$U.tabRef);

        this.init();
        this.initCustomScrollbar();
      }
    }

    init() {
      const tabsNavList = this.container.querySelectorAll(selectors$U.tabsLink);
      const firstTabsLink = this.container.querySelector(
        `[${attributes$B.tabsLink}="${this.container.hasAttribute(attributes$B.tabStartIndex) ? this.container.getAttribute(attributes$B.tabStartIndex) : 0}"]`
      );
      const firstTab = this.container.querySelector(`[${attributes$B.tab}="${this.container.hasAttribute(attributes$B.tabStartIndex) ? this.container.getAttribute(attributes$B.tabStartIndex) : 0}"]`);

      firstTab?.classList.add(classes$H.current);
      firstTabsLink?.classList.add(classes$H.current);

      this.checkVisibleTabsLinks();

      tabsNavList.forEach((element) => {
        this.handleTabsNavListeners(element);
      });
    }

    handleTabsNavListeners(element) {
      const tabId = parseInt(element.getAttribute(attributes$B.tabsLink));
      const tab = this.container.querySelector(`[${attributes$B.tab}="${tabId}"]`);

      if (!tab) return;

      element.addEventListener('click', () => {
        this.tabChange(element, tab);
      });

      element.addEventListener('keyup', (event) => {
        if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
          this.tabChange(element, tab);
        }
      });
    }

    initCustomScrollbar() {
      if (!this.scrollable) {
        return;
      }

      this.customScrollbar = new CustomScrollbar(this.container);
    }

    tabChange(element, tab) {
      if (element.classList.contains(classes$H.current)) return;

      const parent = element.closest(selectors$U.scrollableHolder) ? element.closest(selectors$U.scrollableHolder) : element.parentElement;
      const parentPadding = parseInt(window.getComputedStyle(parent).getPropertyValue('padding-left'));
      const lastActiveTab = this.container.querySelector(`${selectors$U.tab}.${classes$H.current}`);
      const lastActiveTabsLink = this.container.querySelector(`${selectors$U.tabsLink}.${classes$H.current}`);
      const slider = tab.querySelector(selectors$U.slider);

      this.tabRef?.forEach((refElement) => {
        const isActive = refElement.classList.contains(classes$H.current);
        const shouldBeActive = refElement.getAttribute(attributes$B.tabRef) === tab.getAttribute(attributes$B.tab);

        refElement.classList.toggle(classes$H.current, !isActive && shouldBeActive);
      });

      lastActiveTab.classList.remove(classes$H.current);
      lastActiveTabsLink.classList.remove(classes$H.current);
      element.classList.add(classes$H.current);
      tab.classList.add(classes$H.current);

      // Trigger theme:tab:change custom event to reset the selected tab slider position
      if (slider) slider.dispatchEvent(new CustomEvent('theme:tab:change', {bubbles: false}));

      // Scroll to current tab link
      parent.scrollTo({
        top: 0,
        left: element.offsetLeft - parent.offsetWidth / 2 + element.offsetWidth / 2 + parentPadding,
        behavior: 'smooth',
      });

      element.dispatchEvent(
        new CustomEvent('theme:custom-scrollbar:change', {
          bubbles: true,
          detail: {
            element: element,
          },
        })
      );

      // Trigger animations if they are enabled
      if (theme.settings.animations) {
        this.tabsContents.querySelectorAll(`.${classes$H.aosInit}`).forEach((element) => {
          element.classList.remove(classes$H.aosAnimate);
        });

        if (this.animateElementsTimer) {
          clearTimeout(this.animateElementsTimer);
        }

        this.animateElementsTimer = setTimeout(() => {
          tab.querySelectorAll(`.${classes$H.aosInit}`).forEach((element) => {
            element.classList.add(classes$H.aosAnimate);
          });
        }, 150);
      }

      if (element.classList.contains(classes$H.hide)) {
        tab.classList.add(classes$H.hide);
      }

      this.checkVisibleTabsLinks();
    }

    checkVisibleTabsLinks() {
      const tabsNavList = this.container.querySelectorAll(selectors$U.tabsLink);
      const tabsNavListHidden = this.container.querySelectorAll(`${selectors$U.tabsLink}.${classes$H.hide}`);
      const difference = tabsNavList.length - tabsNavListHidden.length;

      if (difference < 2) {
        this.container.classList.add(classes$H.alt);
      } else {
        this.container.classList.remove(classes$H.alt);
      }
    }

    onBlockSelect(evt) {
      const element = evt.target;
      if (element) {
        element.dispatchEvent(new Event('click'));

        element.parentNode.scrollTo({
          top: 0,
          left: element.offsetLeft - element.clientWidth,
          behavior: 'smooth',
        });
      }
    }

    onUnload() {
      if (this.customScrollbar) {
        this.customScrollbar.unload();
      }
    }
  }

  const tabs = {
    onLoad() {
      sections$x[this.id] = new Tabs(this.container);
    },
    onBlockSelect(e) {
      sections$x[this.id].onBlockSelect(e);
    },
    onUnload() {
      sections$x[this.id].onUnload();
    },
  };

  const selectors$T = {
    drawer: '[data-drawer]',
    drawerToggle: '[data-drawer-toggle]',
    scroller: '[data-scroll]',
    quickviewItem: '[data-quick-view-item]',
    tabsLink: '[data-tabs-link]',
  };
  const classes$G = {
    open: 'is-open',
    drawerOpen: 'js-drawer-open',
    contentVisibilityHidden: 'cv-h',
    header: 'site-header',
  };
  const attributes$A = {
    ariaExpanded: 'aria-expanded',
    ariaControls: 'aria-controls',
  };

  let sections$w = {};

  class Drawer {
    constructor(container) {
      this.container = container;
      this.drawers = this.container.querySelectorAll(selectors$T.drawer);
      this.drawerToggleButtons = this.container.querySelectorAll(selectors$T.drawerToggle);
      this.a11y = a11y;

      this.drawerToggleEvent = throttle((event) => {
        this.toggle(event);
      }, 150);

      this.keyPressCloseEvent = throttle((event) => {
        if (event.code === theme.keyboardKeys.ESCAPE) {
          this.close(event);
        }
      }, 150);

      // Define drawer close event
      this.drawerCloseEvent = (event) => {
        const activeDrawer = document.querySelector(`${selectors$T.drawer}.${classes$G.open}`);
        let isDrawerToggle = false;

        if (!activeDrawer) {
          return;
        }

        if (event.type === 'click') {
          isDrawerToggle = event.target.matches(selectors$T.drawerToggle);
        }
        const isDrawerChild = activeDrawer ? activeDrawer.contains(event.target) : false;
        const quickviewItem = activeDrawer.closest(selectors$T.quickviewItem);
        const isQuickviewChild = quickviewItem ? quickviewItem.contains(event.target) : false;

        if (!isDrawerToggle && !isDrawerChild && !isQuickviewChild) {
          this.close();
        }
      };

      this.initListeners();
    }

    initListeners() {
      // Toggle event for each drawer button
      this.drawerToggleButtons.forEach((button) => {
        button.addEventListener('click', this.drawerToggleEvent);
      });

      // Close drawers if escape key pressed
      this.drawers.forEach((drawer) => {
        drawer.addEventListener('keyup', this.keyPressCloseEvent);

        // Init collapsible mobile dropdowns
        this.collapsible = new Collapsible(drawer);
        this.tabs = new Tabs(drawer);
      });

      // Close drawers on click outside
      document.addEventListener('click', this.drawerCloseEvent);

      // Close drawers on closing event
      document.addEventListener('theme:drawer:closing', this.drawerCloseEvent);
    }

    toggle(e) {
      e.preventDefault();
      const drawer = document.querySelector(`#${e.target.getAttribute(attributes$A.ariaControls)}`);
      if (!drawer) {
        return;
      }

      const isDrawerOpen = drawer.classList.contains(classes$G.open);

      if (isDrawerOpen) {
        this.close();
      } else {
        this.open(e);
      }
    }

    open(e) {
      const drawerOpenButton = e.target;
      const drawer = document.querySelector(`#${e.target.getAttribute(attributes$A.ariaControls)}`);

      if (!drawer) {
        return;
      }
      const drawerScroller = drawer.querySelector(selectors$T.scroller) || drawer;

      // Disable page scroll right away
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: drawerScroller}));
      document.dispatchEvent(new CustomEvent('theme:drawer:open'), {bubbles: true});
      document.body.classList.add(classes$G.drawerOpen);

      drawer.classList.add(classes$G.open);
      drawer.classList.remove(classes$G.contentVisibilityHidden);
      drawerOpenButton.setAttribute(attributes$A.ariaExpanded, true);

      setTimeout(() => {
        this.a11y.state.trigger = drawerOpenButton;
        this.a11y.trapFocus({
          container: drawer,
        });
      });
    }

    close() {
      if (!document.body.classList.contains(classes$G.drawerOpen)) {
        return;
      }

      const drawer = document.querySelector(`${selectors$T.drawer}.${classes$G.open}`);

      this.drawerToggleButtons.forEach((button) => {
        button.setAttribute(attributes$A.ariaExpanded, false);
      });

      this.a11y.removeTrapFocus({
        container: drawer,
      });

      drawer.classList.remove(classes$G.open);

      const onDrawerTransitionEnd = (event) => {
        if (event.target !== drawer) return;

        requestAnimationFrame(() => {
          drawer.classList.add(classes$G.contentVisibilityHidden);
          document.dispatchEvent(new CustomEvent('theme:drawer:close'), {bubbles: true});
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        });

        drawer.removeEventListener('transitionend', onDrawerTransitionEnd);
      };

      drawer.addEventListener('transitionend', onDrawerTransitionEnd);

      document.body.classList.remove(classes$G.drawerOpen);
    }

    onUnload() {
      // Close drawer
      this.close();

      // Unbind all event listeners for drawers
      this.drawerToggleButtons.forEach((button) => {
        button.removeEventListener('click', this.drawerToggleEvent);
      });
      this.drawers.forEach((drawer) => {
        drawer.removeEventListener('keyup', this.keyPressCloseEvent);
      });
      document.removeEventListener('click', this.drawerCloseEvent);
      document.removeEventListener('theme:drawer:closing', this.drawerCloseEvent);

      if (this.collapsible) {
        this.collapsible.onUnload();
      }

      if (this.tabs) {
        this.tabs.onUnload();
      }
    }
  }

  const drawer = {
    onLoad() {
      if (this.container.classList.contains(classes$G.header)) {
        this.container = this.container.parentNode;
      }

      sections$w[this.id] = new Drawer(this.container);
    },
    onUnload() {
      sections$w[this.id].onUnload();
    },
  };

  const showElement = (elem, removeProp = false, prop = 'block') => {
    if (elem) {
      if (removeProp) {
        elem.style.removeProperty('display');
      } else {
        elem.style.display = prop;
      }
    }
  };

  const hideElement = (elem) => {
    if (elem) {
      elem.style.display = 'none';
    }
  };

  const selectors$S = {
    headerSticky: '[data-header-sticky]',
    headerHeight: '[data-header-height]',
  };

  const scrollTo = (elementTop) => {
    /* Sticky header check */
    const headerHeight =
      document.querySelector(selectors$S.headerSticky) && document.querySelector(selectors$S.headerHeight) ? document.querySelector(selectors$S.headerHeight).getBoundingClientRect().height : 0;

    window.scrollTo({
      top: elementTop + window.scrollY - headerHeight,
      left: 0,
      behavior: 'smooth',
    });
  };

  function Listeners() {
    this.entries = [];
  }

  Listeners.prototype.add = function (element, event, fn) {
    this.entries.push({element: element, event: event, fn: fn});
    element.addEventListener(event, fn);
  };

  Listeners.prototype.removeAll = function () {
    this.entries = this.entries.filter(function (listener) {
      listener.element.removeEventListener(listener.event, listener.fn);
      return false;
    });
  };

  /**
   * Find a match in the project JSON (using a ID number) and return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Number} value Accepts Number (e.g. 6908023078973)
   * @returns {Object} The variant object once a match has been successful. Otherwise null will be return
   */

  /**
   * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
   * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
   */
  function getVariantFromSerializedArray(product, collection) {
    _validateProductStructure(product);

    // If value is an array of options
    var optionArray = _createOptionArrayFromOptionCollection(product, collection);
    return getVariantFromOptionArray(product, optionArray);
  }

  /**
   * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
   * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
   */
  function getVariantFromOptionArray(product, options) {
    _validateProductStructure(product);
    _validateOptionsArray(options);

    var result = product.variants.filter(function (variant) {
      return options.every(function (option, index) {
        return variant.options[index] === option;
      });
    });

    return result[0] || null;
  }

  /**
   * Creates an array of selected options from the object
   * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
   * @param {Object} product Product JSON object
   * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
   * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
   */
  function _createOptionArrayFromOptionCollection(product, collection) {
    _validateProductStructure(product);
    _validateSerializedArray(collection);

    var optionArray = [];

    collection.forEach(function (option) {
      for (var i = 0; i < product.options.length; i++) {
        var name = product.options[i].name || product.options[i];
        if (name.toLowerCase() === option.name.toLowerCase()) {
          optionArray[i] = option.value;
          break;
        }
      }
    });

    return optionArray;
  }

  /**
   * Check if the product data is a valid JS object
   * Error will be thrown if type is invalid
   * @param {object} product Product JSON object
   */
  function _validateProductStructure(product) {
    if (typeof product !== 'object') {
      throw new TypeError(product + ' is not an object.');
    }

    if (Object.keys(product).length === 0 && product.constructor === Object) {
      throw new Error(product + ' is empty.');
    }
  }

  /**
   * Validate the structure of the array
   * It must be formatted like jQuery's serializeArray()
   * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
   */
  function _validateSerializedArray(collection) {
    if (!Array.isArray(collection)) {
      throw new TypeError(collection + ' is not an array.');
    }

    if (collection.length === 0) {
      throw new Error(collection + ' is empty.');
    }

    if (collection[0].hasOwnProperty('name')) {
      if (typeof collection[0].name !== 'string') {
        throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
      }
    } else {
      throw new Error(collection[0] + 'does not contain name key.');
    }
  }

  /**
   * Validate the structure of the array
   * It must be formatted as list of values
   * @param {Array} collection Array of object (e.g. ['36', 'Black'])
   */
  function _validateOptionsArray(options) {
    if (Array.isArray(options) && typeof options[0] === 'object') {
      throw new Error(options + 'is not a valid array of options.');
    }
  }

  var selectors$R = {
    idInput: '[name="id"]',
    planInput: '[name="selling_plan"]',
    optionInput: '[name^="options"]',
    quantityInput: '[name="quantity"]',
    propertyInput: '[name^="properties"]',
  };

  // Public Methods
  // -----------------------------------------------------------------------------

  /**
   * Returns a URL with a variant ID query parameter. Useful for updating window.history
   * with a new URL based on the currently select product variant.
   * @param {string} url - The URL you wish to append the variant ID to
   * @param {number} id  - The variant ID you wish to append to the URL
   * @returns {string} - The new url which includes the variant ID query parameter
   */

  function getUrlWithVariant(url, id) {
    if (/variant=/.test(url)) {
      return url.replace(/(variant=)[^&]+/, '$1' + id);
    } else if (/\?/.test(url)) {
      return url.concat('&variant=').concat(id);
    }

    return url.concat('?variant=').concat(id);
  }

  /**
   * Constructor class that creates a new instance of a product form controller.
   *
   * @param {Element} element - DOM element which is equal to the <form> node wrapping product form inputs
   * @param {Object} product - A product object
   * @param {Object} options - Optional options object
   * @param {Function} options.onOptionChange - Callback for whenever an option input changes
   * @param {Function} options.onPlanChange - Callback for changes to name=selling_plan
   * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
   * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
   * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
   */
  class ProductForm {
    constructor(element, product, options) {
      this.element = element;
      this.form = this.element.tagName == 'FORM' ? this.element : this.element.querySelector('form');
      this.product = this._validateProductObject(product);
      this.variantElement = this.element.querySelector(selectors$R.idInput);

      options = options || {};

      this._listeners = new Listeners();
      this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));

      this.optionInputs = this._initInputs(selectors$R.optionInput, options.onOptionChange);

      this.planInputs = this._initInputs(selectors$R.planInput, options.onPlanChange);

      this.quantityInputs = this._initInputs(selectors$R.quantityInput, options.onQuantityChange);

      this.propertyInputs = this._initInputs(selectors$R.propertyInput, options.onPropertyChange);
    }

    /**
     * Cleans up all event handlers that were assigned when the Product Form was constructed.
     * Useful for use when a section needs to be reloaded in the theme editor.
     */
    destroy() {
      this._listeners.removeAll();
    }

    /**
     * Getter method which returns the array of currently selected option values
     *
     * @returns {Array} An array of option values
     */
    options() {
      return this._serializeInputValues(this.optionInputs, function (item) {
        var regex = /(?:^(options\[))(.*?)(?:\])/;
        item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
        return item;
      });
    }

    /**
     * Getter method which returns the currently selected variant, or `null` if variant
     * doesn't exist.
     *
     * @returns {Object|null} Variant object
     */
    variant() {
      const opts = this.options();
      if (opts.length) {
        return getVariantFromSerializedArray(this.product, opts);
      } else {
        return this.product.variants[0];
      }
    }

    /**
     * Getter method which returns the current selling plan, or `null` if plan
     * doesn't exist.
     *
     * @returns {Object|null} Variant object
     */
    plan(variant) {
      let plan = {
        allocation: null,
        group: null,
        detail: null,
      };
      const formData = new FormData(this.form);
      const id = formData.get('selling_plan');

      if (id && variant) {
        plan.allocation = variant.selling_plan_allocations.find(function (item) {
          return item.selling_plan_id.toString() === id.toString();
        });
      }
      if (plan.allocation) {
        plan.group = this.product.selling_plan_groups.find(function (item) {
          return item.id.toString() === plan.allocation.selling_plan_group_id.toString();
        });
      }
      if (plan.group) {
        plan.detail = plan.group.selling_plans.find(function (item) {
          return item.id.toString() === id.toString();
        });
      }

      if (plan && plan.allocation && plan.detail && plan.allocation) {
        return plan;
      } else return null;
    }

    /**
     * Getter method which returns a collection of objects containing name and values
     * of property inputs
     *
     * @returns {Array} Collection of objects with name and value keys
     */
    properties() {
      return this._serializeInputValues(this.propertyInputs, function (item) {
        var regex = /(?:^(properties\[))(.*?)(?:\])/;
        item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
        return item;
      });
    }

    /**
     * Getter method which returns the current quantity or 1 if no quantity input is
     * included in the form
     *
     * @returns {Array} Collection of objects with name and value keys
     */
    quantity() {
      return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
    }

    getFormState() {
      const variant = this.variant();
      return {
        options: this.options(),
        variant: variant,
        properties: this.properties(),
        quantity: this.quantity(),
        plan: this.plan(variant),
      };
    }

    // Private Methods
    // -----------------------------------------------------------------------------
    _setIdInputValue(variant) {
      if (variant && variant.id) {
        this.variantElement.value = variant.id.toString();
      } else {
        this.variantElement.value = '';
      }

      this.variantElement.dispatchEvent(new Event('change'));
    }

    _onSubmit(options, event) {
      event.dataset = this.getFormState();
      if (options.onFormSubmit) {
        options.onFormSubmit(event);
      }
    }

    _onOptionChange(event) {
      this._setIdInputValue(event.dataset.variant);
    }

    _onFormEvent(cb) {
      if (typeof cb === 'undefined') {
        return Function.prototype.bind();
      }

      return function (event) {
        event.dataset = this.getFormState();
        this._setIdInputValue(event.dataset.variant);
        cb(event);
      }.bind(this);
    }

    _initInputs(selector, cb) {
      var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));

      return elements.map(
        function (element) {
          this._listeners.add(element, 'change', this._onFormEvent(cb));
          return element;
        }.bind(this)
      );
    }

    _serializeInputValues(inputs, transform) {
      return inputs.reduce(function (options, input) {
        if (
          input.checked || // If input is a checked (means type radio or checkbox)
          (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
        ) {
          options.push(transform({name: input.name, value: input.value}));
        }

        return options;
      }, []);
    }

    _validateProductObject(product) {
      if (typeof product !== 'object') {
        throw new TypeError(product + ' is not an object.');
      }

      if (typeof product.variants[0].options === 'undefined') {
        throw new TypeError('Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route');
      }
      return product;
    }
  }

  const selectors$Q = {
    list: '[data-store-availability-list]',
  };

  const defaults$1 = {
    close: '.js-modal-close',
    open: '.js-modal-open-store-availability-modal',
    openClass: 'modal--is-active',
    openBodyClass: 'modal--is-visible',
    closeModalOnClick: false,
    scrollIntoView: false,
  };

  class Modals {
    constructor(id, options) {
      this.modal = document.getElementById(id);

      if (!this.modal) return false;

      this.nodes = {
        parents: [document.querySelector('html'), document.body],
      };
      this.config = Object.assign(defaults$1, options);
      this.modalIsOpen = false;
      this.focusOnOpen = this.config.focusOnOpen ? document.getElementById(this.config.focusOnOpen) : this.modal;
      this.openElement = document.querySelector(this.config.open);
      this.a11y = a11y;

      this.init();
    }

    init() {
      this.openElement.addEventListener('click', this.open.bind(this));
      this.modal.querySelector(this.config.close).addEventListener('click', this.closeModal.bind(this));
    }

    open(evt) {
      // Keep track if modal was opened from a click, or called by another function
      let externalCall = false;
      // Prevent following href if link is clicked
      if (evt) {
        evt.preventDefault();
      } else {
        externalCall = true;
      }

      if (this.modalIsOpen && !externalCall) {
        this.closeModal();
        return;
      }

      this.modal.classList.add(this.config.openClass);
      this.nodes.parents.forEach((node) => {
        node.classList.add(this.config.openBodyClass);
      });
      this.modalIsOpen = true;

      const scrollableElement = document.querySelector(selectors$Q.list);
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: scrollableElement}));

      if (this.config.scrollIntoView) {
        this.scrollIntoView();
      }
      this.bindEvents();

      this.a11y.trapFocus({
        container: this.modal,
      });
    }

    closeModal() {
      if (!this.modalIsOpen) return;
      document.activeElement.blur();
      this.modal.classList.remove(this.config.openClass);
      var self = this;
      this.nodes.parents.forEach(function (node) {
        node.classList.remove(self.config.openBodyClass);
      });
      this.modalIsOpen = false;
      this.openElement.focus();
      this.unbindEvents();

      this.a11y.removeTrapFocus({
        container: this.modal,
      });

      // Enable page scroll right after the closing animation ends
      const timeout = 400;
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: timeout}));
    }

    bindEvents() {
      this.keyupHandler = this.keyupHandler.bind(this);
      this.clickHandler = this.clickHandler.bind(this);
      document.body.addEventListener('keyup', this.keyupHandler);
      document.body.addEventListener('click', this.clickHandler);
    }

    unbindEvents() {
      document.body.removeEventListener('keyup', this.keyupHandler);
      document.body.removeEventListener('click', this.clickHandler);
    }

    keyupHandler(event) {
      if (event.code === theme.keyboardKeys.ESCAPE) {
        this.closeModal();
      }
    }

    clickHandler(event) {
      if (this.config.closeModalOnClick && !this.modal.contains(event.target) && !event.target.matches(this.config.open)) {
        this.closeModal();
      }
    }

    scrollIntoView() {
      this.focusOnOpen.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }

  const selectors$P = {
    body: 'body',
    storeAvailabilityModal: '[data-store-availability-modal]',
    storeAvailabilityModalOpen: '[data-store-availability-modal-open]',
    storeAvailabilityModalClose: '[data-store-availability-modal-close]',
    storeAvailabilityModalProductTitle: '[data-store-availability-modal-product__title]',
  };

  const classes$F = {
    openClass: 'store-availabilities-modal--active',
  };

  class StoreAvailability {
    constructor(container) {
      this.container = container;
    }

    updateContent(variantId, productTitle) {
      this._fetchStoreAvailabilities(variantId, productTitle);
    }

    clearContent() {
      this.container.innerHTML = '';
    }

    _initModal() {
      return new Modals('StoreAvailabilityModal', {
        close: selectors$P.storeAvailabilityModalClose,
        open: selectors$P.storeAvailabilityModalOpen,
        closeModalOnClick: true,
        openClass: classes$F.openClass,
        scrollIntoView: false,
      });
    }

    _fetchStoreAvailabilities(variantId, productTitle) {
      const variantSectionUrl = '/variants/' + variantId + '/?section_id=store-availability';
      this.clearContent();

      const self = this;
      fetch(variantSectionUrl)
        .then(function (response) {
          return response.text();
        })
        .then(function (storeAvailabilityHTML) {
          const body = document.querySelector(selectors$P.body);
          let storeAvailabilityModal = body.querySelector(selectors$P.storeAvailabilityModal);
          if (storeAvailabilityModal) {
            storeAvailabilityModal.remove();
          }

          self.container.innerHTML = storeAvailabilityHTML;
          self.container.innerHTML = self.container.firstElementChild.innerHTML;

          if (self.container.firstElementChild.innerHTML.trim() === '') {
            self.clearContent();
            return;
          }

          const storeAvailabilityModalOpen = self.container.querySelector(selectors$P.storeAvailabilityModalOpen);
          // Only create modal if open modal element exists
          if (!storeAvailabilityModalOpen) {
            return;
          }

          self.modal = self._initModal();
          self._updateProductTitle(productTitle);

          storeAvailabilityModal = self.container.querySelector(selectors$P.storeAvailabilityModal);
          if (storeAvailabilityModal) {
            body.appendChild(storeAvailabilityModal);
          }
        });
    }

    _updateProductTitle(productTitle) {
      const storeAvailabilityModalProductTitle = this.container.querySelector(selectors$P.storeAvailabilityModalProductTitle);
      storeAvailabilityModalProductTitle.textContent = productTitle;
    }
  }

  /**
   * Variant Sellout Precrime Click Preview
   * I think of this like the precrime machine in Minority report.  It gives a preview
   * of every possible click action, given the current form state.  The logic is:
   *
   * for each clickable name=options[] variant selection element
   * find the value of the form if the element were clicked
   * lookup the variant with those value in the product json
   * clear the classes, add .unavailable if it's not found,
   * and add .sold-out if it is out of stock
   *
   * Caveat: we rely on the option position so we don't need
   * to keep a complex map of keys and values.
   */

  const selectors$O = {
    form: '[data-product-form]',
    optionPosition: '[data-option-position]',
    optionInput: '[name^="options"], [data-popout-option]',
  };

  const classes$E = {
    soldOut: 'sold-out',
    unavailable: 'unavailable',
  };

  const attributes$z = {
    optionPosition: 'data-option-position',
    selectOptionValue: 'data-value',
  };

  class SelloutVariants {
    constructor(container, productJSON) {
      this.container = container;
      this.productJSON = productJSON;
      this.form = this.container.querySelector(selectors$O.form);
      this.formData = new FormData(this.form);
      this.optionElements = this.container.querySelectorAll(selectors$O.optionInput);

      if (this.productJSON && this.form) {
        this.init();
      }
    }

    init() {
      this.update();
    }

    update() {
      this.getCurrentState();

      this.optionElements.forEach((el) => {
        const val = el.value || el.getAttribute(attributes$z.selectOptionValue);
        const optionSelector = el.closest(selectors$O.optionPosition);

        if (!optionSelector) {
          return;
        }

        const positionString = optionSelector.getAttribute(attributes$z.optionPosition);
        // subtract one because option.position in liquid does not count form zero, but JS arrays do
        const position = parseInt(positionString, 10) - 1;

        let newVals = [...this.selections];
        newVals[position] = val;

        const found = this.productJSON.variants.find((element) => {
          // only return true if every option matches our hypothetical selection
          let perfectMatch = true;
          for (let index = 0; index < newVals.length; index++) {
            if (element.options[index] !== newVals[index]) {
              perfectMatch = false;
            }
          }
          return perfectMatch;
        });

        el.parentElement.classList.remove(classes$E.soldOut, classes$E.unavailable);
        if (typeof found === 'undefined') {
          el.parentElement.classList.add(classes$E.unavailable);
        } else if (found?.available === false) {
          el.parentElement.classList.add(classes$E.soldOut);
        }
      });
    }

    getCurrentState() {
      this.formData = new FormData(this.form);
      this.selections = [];
      for (var value of this.formData.entries()) {
        if (value[0].includes('options[')) {
          // push the current state of the form, dont worry about the group name
          // we will be using the array position instead of the name to match values
          this.selections.push(value[1]);
        }
      }
    }
  }

  /*
  Usage:
    import {NotificationPopup} from '../features/notification-popup';

    if (button.hasAttribute(attributes.notificationPopup) {
      new NotificationPopup(button);
    }

  */

  const settings$5 = {
    templateIndex: 1,
  };

  const classes$D = {
    popupNotification: 'pswp--notification pswp--not-close-btn',
  };

  const attributes$y = {
    notificationPopup: 'data-notification-popup',
  };

  const options$1 = {
    history: false,
    focus: false,
    mainClass: classes$D.popupNotification,
    closeOnVerticalDrag: false,
  };

  class NotificationPopup {
    constructor(button) {
      this.button = button;
      this.a11y = a11y;
      this.notificationPopupHtml = this.button.getAttribute(attributes$y.notificationPopup);

      if (this.notificationPopupHtml.trim() !== '') {
        this.init();
      }
    }

    init() {
      const items = [
        {
          html: this.notificationPopupHtml,
        },
      ];

      this.a11y.state.trigger = this.button;

      new LoadPhotoswipe(items, options$1, settings$5.templateIndex);
    }
  }

  const selectors$N = {
    product: '[data-product]',
    productForm: '[data-product-form]',
    addToCart: '[data-add-to-cart]',
    addToCartText: '[data-add-to-cart-text]',
    buyItNow: '[data-buy-it-now]',
    comparePrice: '[data-compare-price]',
    formWrapper: '[data-form-wrapper]',
    header: '[data-site-header]',
    originalSelectorId: '[data-product-select]',
    preOrderTag: '_preorder',
    priceWrapper: '[data-price-wrapper]',
    priceOffWrap: '[data-price-off]',
    priceOffType: '[data-price-off-type]',
    priceOffAmount: '[data-price-off-amount]',
    productSlide: '[data-product-slide]',
    productImage: '[data-product-image]',
    productMediaSlider: '[data-product-single-media-slider]',
    productJson: '[data-product-json]',
    productPrice: '[data-product-price]',
    unitPrice: '[data-product-unit-price]',
    unitBase: '[data-product-base]',
    unitWrapper: '[data-product-unit]',
    subPrices: '[data-subscription-watch-price]',
    subSelectors: '[data-subscription-selectors]',
    subsToggle: '[data-toggles-group]',
    subsChild: 'data-group-toggle',
    subDescription: '[data-plan-description]',
    remainingCount: '[data-remaining-count]',
    remainingWrapper: '[data-remaining-wrapper]',
    remainingJSON: '[data-product-remaining-json]',
    idInput: '[name="id"]',
    storeAvailabilityContainer: '[data-store-availability-container]',
    upsellButton: '[data-upsell-btn]',
    sectionNode: '.shopify-section',
    quickViewItem: '[data-quick-view-item]',
    notificationButtonText: '[data-notification-button-text]',
  };

  const classes$C = {
    hidden: 'hidden',
    variantSoldOut: 'variant--soldout',
    variantUnavailable: 'variant--unavailabe',
    productPriceSale: 'product__price--sale',
    priceWrapperHidden: 'product__price--hidden',
    remainingLow: 'count-is-low',
    remainingIn: 'count-is-in',
    remainingOut: 'count-is-out',
    remainingUnavailable: 'count-is-unavailable',
  };

  const attributes$x = {
    productImageId: 'data-image-id',
    tallLayout: 'data-tall-layout',
    dataEnableHistoryState: 'data-enable-history-state',
    notificationPopup: 'data-notification-popup',
  };

  class ProductAddForm {
    constructor(container) {
      this.container = container;
      this.product = this.container.querySelector(selectors$N.product);
      this.productForm = this.container.querySelector(selectors$N.productForm);
      this.tallLayout = this.container.getAttribute(attributes$x.tallLayout) === 'true';

      // Stop parsing if we don't have the product
      if (!this.product || !this.productForm) {
        const counter = new QuantityCounter(this.container);
        counter.init();
        return;
      }

      this.storeAvailabilityContainer = this.container.querySelector(selectors$N.storeAvailabilityContainer);
      this.enableHistoryState = this.container.getAttribute(attributes$x.dataEnableHistoryState) === 'true';
      this.hasUnitPricing = this.container.querySelector(selectors$N.unitWrapper);
      this.subSelectors = this.container.querySelector(selectors$N.subSelectors);
      this.subPrices = this.container.querySelector(selectors$N.subPrices);

      this.priceOffWrap = this.container.querySelector(selectors$N.priceOffWrap);
      this.priceOffAmount = this.container.querySelector(selectors$N.priceOffAmount);
      this.priceOffType = this.container.querySelector(selectors$N.priceOffType);
      this.planDecription = this.container.querySelector(selectors$N.subDescription);
      this.latestVariantId = '';
      this.latestVariantTitle = '';
      this.sellout = null;

      this.sessionStorage = window.sessionStorage;

      this.remainingWrapper = this.container.querySelector(selectors$N.remainingWrapper);

      if (this.remainingWrapper) {
        this.remainingMaxInt = parseInt(this.remainingWrapper.dataset.remainingMax, 10);
        this.remainingCount = this.container.querySelector(selectors$N.remainingCount);
        this.remainingJSONWrapper = this.container.querySelector(selectors$N.remainingJSON);
        this.remainingJSON = null;

        if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
          this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
        }
      }

      if (this.storeAvailabilityContainer) {
        this.storeAvailability = new StoreAvailability(this.storeAvailabilityContainer);
      }

      const counter = new QuantityCounter(this.container);
      counter.init();

      this.init();
    }

    init() {
      let productJSON = null;
      const productElemJSON = this.container.querySelector(selectors$N.productJson);

      if (productElemJSON) {
        productJSON = productElemJSON.innerHTML;
      }
      if (productJSON) {
        this.productJSON = JSON.parse(productJSON);
        this.linkForm();
        this.sellout = new SelloutVariants(this.container, this.productJSON);
      } else {
        console.error('Missing product JSON');
      }
    }

    destroy() {
      this.productForm.destroy();
    }

    linkForm() {
      this.productForm = new ProductForm(this.productForm, this.productJSON, {
        onOptionChange: this.onOptionChange.bind(this),
        onPlanChange: this.onPlanChange.bind(this),
      });
      this.pushState(this.productForm.getFormState());
      this.subsToggleListeners();
    }

    onOptionChange(evt) {
      this.pushState(evt.dataset);
      this.updateProductImage(evt);
    }

    onPlanChange(evt) {
      if (this.subPrices) {
        this.pushState(evt.dataset);
      }
    }

    pushState(formState) {
      this.productState = this.setProductState(formState);
      this.updateAddToCartState(formState);
      this.updateProductPrices(formState);
      this.updateSaleText(formState);
      this.updateSubscriptionText(formState);
      this.fireHookEvent(formState);
      this.updateRemaining(formState);
      this.sellout?.update(formState);
      if (this.enableHistoryState) {
        this.updateHistoryState(formState);
      }

      if (this.storeAvailability) {
        if (formState.variant) {
          this.storeAvailability.updateContent(formState.variant.id, this.productForm.product.title);
        } else {
          this.storeAvailability.clearContent();
        }
      }
    }

    updateAddToCartState(formState) {
      const variant = formState.variant;
      const priceWrapper = this.container.querySelectorAll(selectors$N.priceWrapper);
      const addToCart = this.container.querySelectorAll(selectors$N.addToCart);
      const addToCartText = this.container.querySelectorAll(selectors$N.addToCartText);
      const formWrapper = this.container.querySelectorAll(selectors$N.formWrapper);
      const buyItNow = this.container.querySelector(selectors$N.buyItNow);
      let addText = theme.strings.add_to_cart;

      if (this.productJSON.tags.includes(selectors$N.preOrderTag)) {
        addText = theme.strings.preorder;
      }

      // Price wrapper elements
      priceWrapper?.forEach((element) => {
        // Hide price if there is no variant
        element.classList.toggle(classes$C.priceWrapperHidden, !variant);
      });

      // ATC Button elements
      addToCart?.forEach((element) => {
        // Skip the upsell "add to cart" button
        if (element.matches(selectors$N.upsellButton)) return;

        element.disabled = true;
        buyItNow?.classList.add(classes$C.hidden);

        // No variant
        if (!variant) return;

        // Available variant
        element.disabled = false;
        if (variant.available) {
          buyItNow?.classList.remove(classes$C.hidden);
        }

        // Notification popup
        if (!element.hasAttribute(attributes$x.notificationPopup)) return;

        const notificationFormId = element.id.replace('AddToCart', 'NotificationForm');
        const formID = this.sessionStorage.getItem('notification_form_id');
        let notificationFormSubmitted = false;
        let variantId = variant.id;
        let variantTitle = variant.title;

        if (formID) {
          const sessionId = formID.substring(0, formID.lastIndexOf('--'));
          const sessionVariantId = formID.split('--').slice(-1)[0];
          notificationFormSubmitted = notificationFormId === sessionId;

          if (notificationFormSubmitted) {
            this.latestVariantId = variantId;
            this.latestVariantTitle = variantTitle;
            variantId = Number(sessionVariantId);

            this.productJSON.variants.forEach((variant) => {
              if (variant.id === variantId) {
                variantTitle = variant.title;
              }
            });
          }
        }

        let notificationPopupHtml = element.getAttribute(attributes$x.notificationPopup);
        const notificationButtonText = new DOMParser().parseFromString(notificationPopupHtml, 'text/html').querySelector(selectors$N.notificationButtonText)?.innerHTML;

        if (this.latestVariantId != '' && this.latestVariantTitle != '') {
          notificationPopupHtml = notificationPopupHtml.replaceAll(this.latestVariantId, variantId);
          notificationPopupHtml = notificationPopupHtml.replaceAll(this.latestVariantTitle, variantTitle);

          // Prevent updating of the "Notify me" button's text if the variant title matches part of it
          const updatedNotificationButtonText = new DOMParser().parseFromString(notificationPopupHtml, 'text/html').querySelector(selectors$N.notificationButtonText)?.innerHTML;
          notificationPopupHtml = notificationPopupHtml.replace(updatedNotificationButtonText, notificationButtonText);
        }

        element.setAttribute(attributes$x.notificationPopup, notificationPopupHtml);

        if (notificationFormSubmitted) {
          this.scrollToForm(this.product.closest(selectors$N.sectionNode));
          new NotificationPopup(element);
        }

        this.latestVariantId = variantId;
        this.latestVariantTitle = variantTitle;
      });

      // ATC Buttons' text elements
      addToCartText?.forEach((element) => {
        // No variant
        if (!variant) {
          element.innerHTML = theme.strings.unavailable;
          return;
        }

        // Unavailable variant
        if (!variant.available) {
          element.innerHTML = theme.strings.sold_out;

          if (element.parentNode.hasAttribute(attributes$x.notificationPopup)) {
            if (element.closest(selectors$N.quickViewItem)) return; // Disable 'notify me' text change for Quickview

            element.innerHTML = `${theme.strings.sold_out} - ${theme.strings.newsletter_product_availability}`;
          }

          return;
        }

        // Available variant
        element.innerHTML = addText;
      });

      // Form wrapper elements
      formWrapper?.forEach((element) => {
        // No variant
        if (!variant) {
          element.classList.add(classes$C.variantUnavailable);
          element.classList.remove(classes$C.variantSoldOut);
          return;
        }

        const formSelect = element.querySelector(selectors$N.originalSelectorId);
        if (formSelect) {
          formSelect.value = variant.id;
        }

        // Unavailable variant
        if (!variant.available) {
          element.classList.add(classes$C.variantSoldOut);
          element.classList.remove(classes$C.variantUnavailable);
          return;
        }

        // Available variant
        element.classList.remove(classes$C.variantSoldOut, classes$C.variantUnavailable);
      });
    }

    updateHistoryState(formState) {
      const variant = formState.variant;
      const plan = formState.plan;
      const location = window.location.href;
      if (variant && location.includes('/product')) {
        const url = new window.URL(location);
        const params = url.searchParams;
        params.set('variant', variant.id);
        if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
          params.set('selling_plan', plan.detail.id);
        } else {
          params.delete('selling_plan');
        }
        url.search = params.toString();
        const urlString = url.toString();
        window.history.replaceState({path: urlString}, '', urlString);
      }
    }

    updateRemaining(formState) {
      const variant = formState.variant;
      const remainingClasses = [classes$C.remainingIn, classes$C.remainingOut, classes$C.remainingUnavailable, classes$C.remainingLow];

      if (variant && this.remainingWrapper && this.remainingJSON) {
        const remaining = this.remainingJSON[variant.id];

        if (remaining === 'out' || remaining < 1) {
          this.remainingWrapper.classList.remove(...remainingClasses);
          this.remainingWrapper.classList.add(classes$C.remainingOut);
        }

        if (remaining === 'in' || remaining >= this.remainingMaxInt) {
          this.remainingWrapper.classList.remove(...remainingClasses);
          this.remainingWrapper.classList.add(classes$C.remainingIn);
        }

        if (remaining === 'low' || (remaining > 0 && remaining < this.remainingMaxInt)) {
          this.remainingWrapper.classList.remove(...remainingClasses);
          this.remainingWrapper.classList.add(classes$C.remainingLow);

          if (this.remainingCount) {
            this.remainingCount.innerHTML = remaining;
          }
        }
      } else if (!variant && this.remainingWrapper) {
        this.remainingWrapper.classList.remove(...remainingClasses);
        this.remainingWrapper.classList.add(classes$C.remainingUnavailable);
      }
    }

    getBaseUnit(variant) {
      return variant.unit_price_measurement.reference_value === 1
        ? variant.unit_price_measurement.reference_unit
        : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
    }

    subsToggleListeners() {
      const toggles = this.container.querySelectorAll(selectors$N.subsToggle);

      toggles.forEach((toggle) => {
        toggle.addEventListener(
          'change',
          function (e) {
            const val = e.target.value.toString();
            const selected = this.container.querySelector(`[${selectors$N.subsChild}="${val}"]`);
            const groups = this.container.querySelectorAll(`[${selectors$N.subsChild}]`);
            if (selected) {
              selected.classList.remove(classes$C.hidden);
              const first = selected.querySelector('[name="selling_plan"]');
              first.checked = true;
              first.dispatchEvent(new Event('change'));
            }
            groups.forEach((group) => {
              if (group !== selected) {
                group.classList.add(classes$C.hidden);
                const plans = group.querySelectorAll('[name="selling_plan"]');
                plans.forEach((plan) => {
                  plan.checked = false;
                  plan.dispatchEvent(new Event('change'));
                });
              }
            });
          }.bind(this)
        );
      });
    }

    updateSaleText(formState) {
      if (this.productState.planSale) {
        this.updateSaleTextSubscription(formState);
      } else if (this.productState.onSale) {
        this.updateSaleTextStandard(formState);
      } else if (this.priceOffWrap) {
        this.priceOffWrap.classList.add(classes$C.hidden);
      }
    }

    updateSaleTextStandard(formState) {
      if (!this.priceOffType) {
        return;
      }
      this.priceOffType.innerHTML = window.theme.strings.sale_badge_text || 'sale';
      const variant = formState.variant;
      if (window.theme.settings.savingBadgeType && window.theme.settings.savingBadgeType === 'percentage') {
        const discountFloat = (variant.compare_at_price - variant.price) / variant.compare_at_price;
        const discountInt = Math.floor(discountFloat * 100);
        this.priceOffAmount.innerHTML = `${discountInt}%`;
      } else {
        const discount = variant.compare_at_price - variant.price;
        this.priceOffAmount.innerHTML = themeCurrency.formatMoney(discount, theme.moneyFormat);
      }
      this.priceOffWrap.classList.remove(classes$C.hidden);
    }

    updateSaleTextSubscription(formState) {
      const variant = formState.variant;
      const variantFirstPlan = this.productForm.product.selling_plan_groups.find((plan) => plan.id === variant.selling_plan_allocations[0].selling_plan_group_id);
      const adjustment = formState.plan ? formState.plan.detail.price_adjustments[0] : variantFirstPlan.selling_plans[0].price_adjustments[0];
      const discount = adjustment.value || 0;
      const saleText = adjustment.value_type === 'percentage' ? `${discount}%` : themeCurrency.formatMoney(variant.price - discount, theme.moneyFormat);

      this.priceOffType.innerHTML = window.theme.strings.subscription || 'subscripton';
      this.priceOffAmount.innerHTML = saleText;
      this.priceOffWrap.classList.remove(classes$C.hidden);
    }

    updateSubscriptionText(formState) {
      if (formState.plan && this.planDecription && formState.plan.detail.description !== null) {
        this.planDecription.innerHTML = formState.plan.detail.description;
        this.planDecription.classList.remove(classes$C.hidden);
      } else if (this.planDecription) {
        this.planDecription.classList.add(classes$C.hidden);
      }
    }

    updateProductPrices(formState) {
      const variant = formState.variant;
      const plan = formState.plan;
      const priceWrappers = this.container.querySelectorAll(selectors$N.priceWrapper);

      priceWrappers.forEach((wrap) => {
        const comparePriceEl = wrap.querySelector(selectors$N.comparePrice);
        const productPriceEl = wrap.querySelector(selectors$N.productPrice);

        let comparePrice = '';
        let price = '';

        if (this.productState.available) {
          comparePrice = variant.compare_at_price;
          price = variant.price;
        }

        if (this.productState.hasPlan) {
          const allocationPrice = plan ? plan.allocation.price : variant.selling_plan_allocations[0].per_delivery_price;
          price = allocationPrice;
        }

        if (this.productState.planSale) {
          const allocationPrice = plan ? plan.allocation.price : variant.selling_plan_allocations[0].per_delivery_price;
          const allocationPriceCompare = plan ? plan.allocation.compare_at_price : variant.selling_plan_allocations[0].compare_at_price;
          comparePrice = allocationPriceCompare;
          price = allocationPrice;
        }

        if (comparePriceEl) {
          if (this.productState.onSale || this.productState.planSale) {
            comparePriceEl.classList.remove(classes$C.hidden);
            productPriceEl.classList.add(classes$C.productPriceSale);
          } else {
            comparePriceEl.classList.add(classes$C.hidden);
            productPriceEl.classList.remove(classes$C.productPriceSale);
          }
          comparePriceEl.innerHTML = theme.settings.currency_code_enable ? themeCurrency.formatMoney(comparePrice, theme.moneyWithCurrencyFormat) : themeCurrency.formatMoney(comparePrice, theme.moneyFormat);
        }

        if (price === 0) {
          productPriceEl.innerHTML = window.theme.strings.free;
        } else {
          productPriceEl.innerHTML = theme.settings.currency_code_enable ? themeCurrency.formatMoney(price, theme.moneyWithCurrencyFormat) : themeCurrency.formatMoney(price, theme.moneyFormat);
        }
      });

      if (this.hasUnitPricing) {
        this.updateProductUnits(formState);
      }
    }

    updateProductUnits(formState) {
      const variant = formState.variant;
      const plan = formState.plan;
      let unitPrice = null;

      if (variant && variant.unit_price) {
        unitPrice = variant.unit_price;
      }
      if (plan && plan?.allocation && plan?.allocation.unit_price) {
        unitPrice = plan.allocation.unit_price;
      }
      if (!plan && variant.selling_plan_allocations) {
        if (variant.selling_plan_allocations.length > 0) {
          const allocationUnitPrice = variant.selling_plan_allocations[0].unit_price;
          unitPrice = allocationUnitPrice;
        }
      }

      if (unitPrice) {
        const base = this.getBaseUnit(variant);
        const formattedPrice = unitPrice === 0 ? window.theme.strings.free : themeCurrency.formatMoney(unitPrice, theme.moneyFormat);
        this.container.querySelector(selectors$N.unitPrice).innerHTML = formattedPrice;
        this.container.querySelector(selectors$N.unitBase).innerHTML = base;
        showElement(this.container.querySelector(selectors$N.unitWrapper));
      } else {
        hideElement(this.container.querySelector(selectors$N.unitWrapper));
      }
    }

    fireHookEvent(formState) {
      const variant = formState.variant;

      // Hook for product variant change event
      this.container.dispatchEvent(
        new CustomEvent('theme:variant:change', {
          detail: {
            variant: variant,
          },
          bubbles: true,
        })
      );
    }

    /**
     * Tracks aspects of the product state that are relevant to UI updates
     * @param {object} evt - variant change event
     * @return {object} productState - represents state of variant + plans
     *  productState.available - current variant and selling plan options result in valid offer
     *  productState.soldOut - variant is sold out
     *  productState.onSale - variant is on sale
     *  productState.showUnitPrice - variant has unit price
     *  productState.requiresPlan - all the product variants requires a selling plan
     *  productState.hasPlan - there is a valid selling plan
     *  productState.planSale - plan has a discount to show next to price
     *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscribtion
     */
    setProductState(dataset) {
      const variant = dataset.variant;
      const plan = dataset.plan;

      const productState = {
        available: true,
        soldOut: false,
        onSale: false,
        showUnitPrice: false,
        requiresPlan: false,
        hasPlan: false,
        planPerDelivery: false,
        planSale: false,
      };

      if (!variant) {
        productState.available = false;
      } else {
        const requiresPlan = variant.requires_selling_plan || false;

        if (!variant.available) {
          productState.soldOut = true;
        }

        if (variant.compare_at_price > variant.price) {
          productState.onSale = true;
        }

        if (variant.unit_price) {
          productState.showUnitPrice = true;
        }

        if (this.product && this.product.requires_selling_plan) {
          productState.requiresPlan = true;
        }

        if (plan && this.subPrices) {
          productState.hasPlan = true;
          if (plan.allocation.per_delivery_price !== plan.allocation.price) {
            productState.planPerDelivery = true;
          }
          if (variant.price > plan.allocation.price) {
            productState.planSale = true;
          }
        }

        if (!plan && requiresPlan) {
          productState.hasPlan = true;
          if (variant.selling_plan_allocations[0].per_delivery_price !== variant.selling_plan_allocations[0].price) {
            productState.planPerDelivery = true;
          }
          if (variant.price > variant.selling_plan_allocations[0].price) {
            productState.planSale = true;
          }
        }
      }
      return productState;
    }

    updateProductImage(evt) {
      const variant = evt.dataset.variant;

      if (!variant || !variant?.featured_media) {
        return;
      }

      // Update variant image, if one is set
      const newImg = this.container.querySelector(`${selectors$N.productImage}[${attributes$x.productImageId}="${variant.featured_media.id}"]`);
      const newImageParent = newImg?.closest(selectors$N.productSlide);

      if (newImageParent) {
        const newImagePos = parseInt([...newImageParent.parentElement.children].indexOf(newImageParent));
        const imgSlider = this.container.querySelector(selectors$N.productMediaSlider);
        const flkty = Flickity.data(imgSlider);

        // Activate image slide in mobile view
        if (flkty && flkty.isActive) {
          const variantSlide = imgSlider.querySelector(`[data-id="${variant.featured_media.id}"]`);

          if (variantSlide) {
            const slideIndex = parseInt([...variantSlide.parentNode.children].indexOf(variantSlide));
            flkty.select(slideIndex);
          }
          return;
        }

        if (this.tallLayout) {
          // We know its a tall layout, if it's sticky
          // scroll to the images
          // Scroll to/reorder image unless it's the first photo on load
          const newImgTop = newImg.getBoundingClientRect().top;

          if (newImagePos === 0 && newImgTop + window.scrollY > window.pageYOffset) return;

          // Scroll to variant image
          document.dispatchEvent(
            new CustomEvent('theme:tooltip:close', {
              bubbles: false,
              detail: {
                hideTransition: false,
              },
            })
          );

          scrollTo(newImgTop);
        }
      }
    }

    /**
     * Scroll to the last submitted notification form
     */
    scrollToForm(section) {
      const headerHeight = document.querySelector(selectors$N.header)?.dataset.height;
      const isVisible = visibilityHelper.isElementPartiallyVisible(section) || visibilityHelper.isElementTotallyVisible(section);

      if (!isVisible) {
        setTimeout(() => {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top - headerHeight;

          window.scrollTo({
            top: sectionTop,
            left: 0,
            behavior: 'smooth',
          });
        }, 400);
      }
    }
  }

  const productFormSection = {
    onLoad() {
      this.section = new ProductAddForm(this.container);
    },
  };

  /**
   * Image Helper Functions
   * -----------------------------------------------------------------------------
   * https://github.com/Shopify/slate.git.
   *
   */

  /**
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }

    if (typeof src === 'undefined' || src === null) {
      src = window.theme.assets.noImage;
    }

    if (size === 'master') {
      return removeProtocol(src);
    }

    const match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif|webp)(\?v=\d+)?$/i);

    if (match) {
      const prefix = src.split(match[0]);
      const suffix = match[0];

      return removeProtocol(`${prefix[0]}_${size}${suffix}`);
    } else {
      return null;
    }
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  function fetchProduct(handle) {
    const requestRoute = `${theme.routes.root}products/${handle}.js`;

    return window
      .fetch(requestRoute)
      .then((response) => {
        return response.json();
      })
      .catch((e) => {
        console.error(e);
      });
  }

  const defaults = {
    color: 'ash',
  };

  const selectors$M = {
    swatch: '[data-swatch]',
    swatchColor: '[data-swatch-color]',
    productBlock: '[data-product-block]',
    productImage: '[data-product-image]',
    productImageSecondary: '[data-product-image-secondary]',
    productImageHover: '[data-product-image-hover]',
    quickView: '[data-button-quick-view]',
    gridImage: '[data-grid-image]',
    link: '[data-grid-link]',
    loadHovers: '[data-load-hovers]',
  };

  const classes$B = {
    mediaVisible: 'product__media--featured-visible',
    mediaHoverVisible: 'product__media__hover-img--visible',
    noImage: 'swatch__link--no-image',
    noOutline: 'no-outline',
  };

  const attributes$w = {
    swatch: 'data-swatch',
    handle: 'data-swatch-handle',
    label: 'data-swatch-label',
    image: 'data-swatch-image',
    imageId: 'data-swatch-image-id',
    variant: 'data-swatch-variant',
    index: 'data-swatch-index',
    swatchVariant: 'data-swatch-variant',
    variandId: 'data-variant-id',
    loaded: 'data-loaded',
    href: 'href',
    bgSet: 'data-bgset',
    aspectRatio: 'data-aspectratio',
    dataFetchedImage: 'data-fetched-image',
    dataFetchedImageIndex: 'data-fetched-image-index',
    dataGridImageDefault: 'data-grid-image-default',
    dataGridImageTarget: 'data-grid-image-target',
    dataGridImageTargetDefault: 'data-grid-image-target-default',
  };

  let swatches = {};

  class ColorMatch {
    constructor(options = {}) {
      this.settings = {
        ...defaults,
        ...options,
      };

      this.match = this.init();
    }

    getColor() {
      return this.match;
    }

    init() {
      const getColors = loadScript({json: theme.assets.swatches});
      return getColors
        .then((colors) => {
          return this.matchColors(colors, this.settings.color);
        })
        .catch((e) => {
          console.log('failed to load swatch colors script');
          console.log(e);
        });
    }

    matchColors(colors, name) {
      let bg = '#E5E5E5';
      let img = null;
      const path = theme.assets.base || '/';
      const comparisonName = name.toLowerCase().replace(/\s/g, '');
      const array = colors.colors;

      if (array) {
        let indexArray = null;

        const hexColorArr = array.filter((colorObj, index) => {
          const neatName = Object.keys(colorObj).toString().toLowerCase().replace(/\s/g, '');

          if (neatName === comparisonName) {
            indexArray = index;

            return colorObj;
          }
        });

        if (hexColorArr.length && indexArray !== null) {
          const value = Object.values(array[indexArray])[0];
          bg = value;

          if (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.svg')) {
            img = `${path}${value}`;
            bg = '#888888';
          }
        }
      }

      return {
        color: this.settings.color,
        path: img,
        hex: bg,
      };
    }
  }

  class Swatch {
    constructor(element) {
      this.element = element;
      this.swatchLink = this.element.nextElementSibling;
      this.colorString = element.getAttribute(attributes$w.swatch);
      this.image = this.element.getAttribute(attributes$w.image);
      this.imageId = this.element.getAttribute(attributes$w.imageId);
      this.variant = this.element.getAttribute(attributes$w.variant);
      this.outer = this.element.closest(selectors$M.productBlock);
      this.gridImage = null;
      this.imageDefault = null;
      this.hoverImages = [];
      this.loadHovers = null;

      const matcher = new ColorMatch({color: this.colorString});
      matcher.getColor().then((result) => {
        this.colorMatch = result;
        this.init();
      });
    }

    init() {
      this.setStyles();

      if (this.variant && this.outer) {
        this.handleHovers();
        this.handleClicks();
      }

      if (!this.image && this.swatchLink) {
        this.swatchLink.classList.add(classes$B.noImage);
      }
    }

    setStyles() {
      if (this.colorMatch && this.colorMatch.hex) {
        this.element.style.setProperty('--swatch', `${this.colorMatch.hex}`);
      }

      if (this.colorMatch && this.colorMatch.path) {
        this.element.style.setProperty('background-image', `url(${this.colorMatch.path})`);
      }
    }

    handleHovers() {
      // Load images on PGI swatch hover
      this.swatchLink.addEventListener('mouseenter', () => {
        this.imageReplace = null;

        if (this.imageId) {
          const target = this.outer.querySelector(`[${attributes$w.dataGridImageTarget}="${this.imageId}"]`);
          if (!target) {
            this.gridImage = this.outer.querySelector(selectors$M.gridImage);

            if (this.image && this.gridImage) {
              // Container width rounded to the nearest 180 pixels
              // Increses likelihood that the image will be cached
              const ratio = window.devicePixelRatio || 1;
              const pixels = this.gridImage.offsetWidth * ratio;
              const widthRounded = Math.ceil(pixels / 180) * 180;
              const defaultImageId = this.gridImage.hasAttribute(attributes$w.dataGridImageTargetDefault) ? this.gridImage.getAttribute(attributes$w.dataGridImageTargetDefault) : '';
              if (defaultImageId === this.imageId && this.gridImage.hasAttribute(attributes$w.dataGridImageDefault)) {
                // Get default loaded image
                this.imageReplace = this.gridImage.getAttribute(attributes$w.dataGridImageDefault);
                return;
              }

              if (this.element.hasAttribute(attributes$w.dataFetchedImage)) {
                // Get already loaded image
                this.imageReplace = this.element.getAttribute(attributes$w.dataFetchedImage);
              } else {
                // Fetch new image
                const sizedImage = getSizedImageUrl(this.image, `${widthRounded}x`);

                window
                  .fetch(sizedImage)
                  .then((response) => {
                    return response.blob();
                  })
                  .then((blob) => {
                    const objectURL = URL.createObjectURL(blob);
                    this.imageReplace = `url("${objectURL}")`;
                    this.element.setAttribute(attributes$w.dataFetchedImage, this.imageReplace);

                    if (
                      this.element.hasAttribute(attributes$w.index) &&
                      this.outer.hasAttribute(attributes$w.dataFetchedImageIndex) &&
                      parseInt(this.element.getAttribute(attributes$w.index)) === parseInt(this.outer.getAttribute(attributes$w.dataFetchedImageIndex))
                    ) {
                      this.replaceImages();

                      this.outer.removeAttribute(attributes$w.dataFetchedImageIndex);
                    }
                  })
                  .catch((error) => {
                    console.log(`Error: ${error}`);
                  });
              }
            }
          }
        }

        this.loadHovers = this.outer.querySelector(selectors$M.loadHovers);

        if (this.loadHovers && !this.loadHovers?.hasAttribute(attributes$w.loaded)) {
          const content = document.createElement('div');
          content.appendChild(this.loadHovers.querySelector('template').content.firstElementChild.cloneNode(true));
          this.loadHovers.appendChild(content);
          this.loadHovers.setAttribute(attributes$w.loaded, true);
        }
      });
    }

    handleClicks() {
      // Change PGI featured image on swatch click
      this.swatchLink.addEventListener('click', (event) => {
        const isFocusEnabled = !document.body.classList.contains(classes$B.noOutline);

        if (!isFocusEnabled) {
          event.preventDefault();
          this.updateImagesAndLinksOnEvent();
        }
      });

      this.swatchLink.addEventListener('keyup', (event) => {
        const isFocusEnabled = !document.body.classList.contains(classes$B.noOutline);

        if (event.code !== theme.keyboardKeys.ENTER && event.code !== theme.keyboardKeys.NUMPADENTER) {
          return;
        }

        if (!isFocusEnabled) {
          event.preventDefault();
          this.swatchLink.dispatchEvent(new Event('mouseenter', {bubbles: true}));
          this.updateImagesAndLinksOnEvent();
        }
      });
    }

    updateImagesAndLinksOnEvent() {
      this.updateLinks();
      this.replaceImages();
    }

    updateLinks() {
      this.linkElements = this.outer.querySelectorAll(selectors$M.link);
      this.quickView = this.outer.querySelector(selectors$M.quickView);

      // Update links
      if (this.linkElements.length) {
        this.linkElements.forEach((element) => {
          const destination = getUrlWithVariant(element.getAttribute('href'), this.variant);
          element.setAttribute('href', destination);
        });
      }

      // Change quickview variant with swatch one
      if (this.quickView && theme.settings.quickBuy === 'quick_buy') {
        this.quickView.setAttribute(attributes$w.variandId, this.variant);
      }
    }

    replaceImages() {
      this.imageSecondary = this.outer.querySelector(selectors$M.productImageSecondary);
      this.outer.removeAttribute(attributes$w.dataFetchedImageIndex);

      if (!this.imageReplace && this.element.hasAttribute(attributes$w.index)) {
        this.outer.setAttribute(attributes$w.dataFetchedImageIndex, parseInt(this.element.getAttribute(attributes$w.index)));
      }

      // Add new loaded image and sync with the secondary image for smooth animation
      if (this.imageReplace && this.gridImage && this.imageId) {
        this.gridImage.setAttribute(attributes$w.dataGridImageTarget, this.imageId);

        if (!this.gridImage.hasAttribute(attributes$w.dataGridImageDefault)) {
          this.gridImage.setAttribute(attributes$w.dataGridImageDefault, window.getComputedStyle(this.gridImage).backgroundImage);
        }

        const onAnimationEnd = () => {
          requestAnimationFrame(() => {
            this.gridImage.style.setProperty('background-image', this.imageReplace);

            requestAnimationFrame(() => {
              this.imageSecondary.classList.remove(classes$B.mediaVisible);
            });
          });

          this.imageSecondary.removeEventListener('animationend', onAnimationEnd);
        };

        requestAnimationFrame(() => {
          this.imageSecondary.classList.add(classes$B.mediaVisible);
          this.imageSecondary.style.setProperty('background-image', this.imageReplace);
        });

        this.imageSecondary.addEventListener('animationend', onAnimationEnd);
      }

      // Change all hover images classes
      if (theme.settings.productGridHover === 'image') {
        this.hoverImages = this.outer.querySelectorAll(selectors$M.productImageHover);
      }

      if (this.hoverImages.length > 1) {
        this.hoverImages.forEach((hoverImage) => {
          hoverImage.classList.remove(classes$B.mediaHoverVisible);

          if (hoverImage.getAttribute(attributes$w.variandId) === this.variant) {
            hoverImage.classList.add(classes$B.mediaHoverVisible);
          } else {
            this.hoverImages[0].classList.add(classes$B.mediaHoverVisible);
          }
        });
      }
    }
  }

  class GridSwatch extends HTMLElement {
    constructor() {
      super();

      this.handle = this.getAttribute(attributes$w.handle);
      this.label = this.getAttribute(attributes$w.label).trim().toLowerCase();

      fetchProduct(this.handle).then((product) => {
        this.product = product;
        this.colorOption = product.options.find((element) => {
          return element.name.toLowerCase() === this.label || null;
        });

        if (this.colorOption) {
          this.swatches = this.colorOption.values;
          this.init();
        }
      });
    }

    init() {
      this.swatchElements = this.querySelectorAll(selectors$M.swatch);

      this.swatchElements.forEach((el) => {
        new Swatch(el);
      });
    }
  }

  const makeSwatches = (container) => {
    swatches = [];
    const els = container.querySelectorAll(selectors$M.swatch);
    els.forEach((el) => {
      swatches.push(new Swatch(el));
    });
  };

  const swatchSection = {
    onLoad() {
      makeSwatches(this.container);
    },
  };

  const selectors$L = {
    form: 'form',
    popoutWrapper: '[data-popout]',
    popoutList: '[data-popout-list]',
    popoutToggle: '[data-popout-toggle]',
    popoutInput: '[data-popout-input]',
    popoutOptions: '[data-popout-option]',
    popoutText: '[data-popout-text]',
    ariaCurrent: '[aria-current]',
    productGridImage: '[data-product-image]',
    productGrid: '[data-product-grid-item]',
  };

  const classes$A = {
    listVisible: 'select-popout__list--visible',
    popoutAlternative: 'select-popout--alt',
    currentSuffix: '--current',
    visible: 'is-visible',
  };

  const attributes$v = {
    ariaCurrent: 'aria-current',
    ariaExpanded: 'aria-expanded',
    dataValue: 'data-value',
    popoutPrevent: 'data-popout-prevent',
    popoutQuantity: 'data-quantity-field',
    quickViewItem: 'data-quick-view-item',
  };

  let sections$v = {};

  class Popout {
    constructor(popout) {
      this.popout = popout;
      this.popoutList = this.popout.querySelector(selectors$L.popoutList);
      this.popoutToggle = this.popout.querySelector(selectors$L.popoutToggle);
      this.popoutText = this.popout.querySelector(selectors$L.popoutText);
      this.popoutInput = this.popout.querySelector(selectors$L.popoutInput);
      this.popoutOptions = this.popout.querySelectorAll(selectors$L.popoutOptions);
      this.popoutPrevent = this.popout.getAttribute(attributes$v.popoutPrevent) === 'true';
      this.popupToggleFocusoutEvent = (evt) => this.popupToggleFocusout(evt);
      this.popupListFocusoutEvent = (evt) => this.popupListFocusout(evt);
      this.popupToggleClickEvent = (evt) => this.popupToggleClick(evt);
      this.popoutKeyupEvent = (evt) => this.popoutKeyup(evt);
      this.popupOptionsClickEvent = (evt) => this.popupOptionsClick(evt);
      this._connectOptionsDispatchEvent = (evt) => this._connectOptionsDispatch(evt);
      this.bodyClick = this.bodyClick.bind(this);
      this.updatePopout = this.updatePopout.bind(this);

      this._connectOptions();
      this._connectToggle();
      this._onFocusOut();

      if (this.popoutInput && this.popoutInput.hasAttribute(attributes$v.popoutQuantity)) {
        document.addEventListener('theme:cart:update', this.updatePopout);
      }
    }

    unload() {
      if (this.popoutOptions.length) {
        this.popoutOptions.forEach((element) => {
          element.removeEventListener('theme:popout:click', this.popupOptionsClickEvent);
          element.removeEventListener('click', this._connectOptionsDispatchEvent);
        });
      }

      this.popoutToggle.removeEventListener('click', this.popupToggleClickEvent);
      this.popoutToggle.removeEventListener('focusout', this.popupToggleFocusoutEvent);
      this.popoutList.removeEventListener('focusout', this.popupListFocusoutEvent);
      this.popout.removeEventListener('keyup', this.popoutKeyupEvent);
      document.removeEventListener('theme:cart:update', this.updatePopout);
      document.body.removeEventListener('click', this.bodyClick);
    }

    popupToggleClick(evt) {
      const ariaExpanded = evt.currentTarget.getAttribute(attributes$v.ariaExpanded) === 'true';

      if (this.popoutList.closest(selectors$L.productGrid)) {
        const productGridItemImage = this.popoutList.closest(selectors$L.productGrid).querySelector(selectors$L.productGridImage);

        if (productGridItemImage) {
          productGridItemImage.classList.toggle(classes$A.visible, !ariaExpanded);
        }
      }

      evt.currentTarget.setAttribute(attributes$v.ariaExpanded, !ariaExpanded);
      this.popoutList.classList.toggle(classes$A.listVisible);
    }

    popupToggleFocusout(evt) {
      if (!evt.relatedTarget) {
        return;
      }

      const popoutLostFocus = this.popout.contains(evt.relatedTarget);
      const popoutFromQuickView = evt.relatedTarget.hasAttribute(attributes$v.quickViewItem);

      if (!popoutLostFocus && !popoutFromQuickView) {
        this._hideList();
      }
    }

    popupListFocusout(evt) {
      const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
      const isVisible = this.popoutList.classList.contains(classes$A.listVisible);

      if (isVisible && !childInFocus) {
        this._hideList();
      }
    }

    popupOptionsClick(evt) {
      const link = evt.target.closest(selectors$L.popoutOptions);
      if (link.attributes.href.value === '#') {
        evt.preventDefault();

        let attrValue = '';

        if (evt.currentTarget.getAttribute(attributes$v.dataValue)) {
          attrValue = evt.currentTarget.getAttribute(attributes$v.dataValue);
        }

        this.popoutInput.value = attrValue;

        if (this.popoutPrevent) {
          this.popoutInput.dispatchEvent(new Event('change'));

          if (!evt.detail.preventTrigger && this.popoutInput.hasAttribute(attributes$v.popoutQuantity)) {
            this.popoutInput.dispatchEvent(new Event('input'));
          }

          const currentElement = this.popoutList.querySelector(`[class*="${classes$A.currentSuffix}"]`);
          let targetClass = classes$A.currentSuffix;

          if (currentElement && currentElement.classList.length) {
            for (const currentElementClass of currentElement.classList) {
              if (currentElementClass.includes(classes$A.currentSuffix)) {
                targetClass = currentElementClass;
                break;
              }
            }
          }

          const listTargetElement = this.popoutList.querySelector(`.${targetClass}`);

          if (listTargetElement) {
            listTargetElement.classList.remove(`${targetClass}`);
            evt.currentTarget.parentElement.classList.add(`${targetClass}`);
          }

          const targetAttribute = this.popoutList.querySelector(selectors$L.ariaCurrent);

          if (targetAttribute) {
            targetAttribute.removeAttribute(attributes$v.ariaCurrent);
            evt.currentTarget.setAttribute(attributes$v.ariaCurrent, 'true');
          }

          if (attrValue !== '') {
            this.popoutText.textContent = attrValue;
          }

          this.popupToggleFocusout(evt);
          this.popupListFocusout(evt);
        } else {
          this._submitForm(attrValue);
        }
      }
    }

    updatePopout() {
      const targetElement = this.popoutList.querySelector(`[${attributes$v.dataValue}="${this.popoutInput.value}"]`);
      if (targetElement) {
        targetElement.dispatchEvent(
          new CustomEvent('theme:popout:click', {
            cancelable: true,
            bubbles: true,
            detail: {
              preventTrigger: true,
            },
          })
        );

        if (!targetElement.parentElement.nextSibling) {
          this.popout.classList.add(classes$A.popoutAlternative);
        }
      } else {
        this.popout.classList.add(classes$A.popoutAlternative);
      }
    }

    popoutKeyup(event) {
      if (event.code !== theme.keyboardKeys.ESCAPE) {
        return;
      }
      this._hideList();
      this.popoutToggle.focus();
    }

    bodyClick(event) {
      const isOption = this.popout.contains(event.target);
      const isVisible = this.popoutList.classList.contains(classes$A.listVisible);

      if (isVisible && !isOption) {
        this._hideList();
      }
    }

    _connectToggle() {
      this.popoutToggle.addEventListener('click', this.popupToggleClickEvent);
    }

    _connectOptions() {
      if (this.popoutOptions.length) {
        this.popoutOptions.forEach((element) => {
          element.addEventListener('theme:popout:click', this.popupOptionsClickEvent);
          element.addEventListener('click', this._connectOptionsDispatchEvent);
        });
      }
    }

    _connectOptionsDispatch(evt) {
      const event = new CustomEvent('theme:popout:click', {
        cancelable: true,
        bubbles: true,
        detail: {
          preventTrigger: false,
        },
      });

      if (!evt.target.dispatchEvent(event)) {
        evt.preventDefault();
      }
    }

    _onFocusOut() {
      this.popoutToggle.addEventListener('focusout', this.popupToggleFocusoutEvent);
      this.popoutList.addEventListener('focusout', this.popupListFocusoutEvent);
      this.popout.addEventListener('keyup', this.popoutKeyupEvent);

      document.body.addEventListener('click', this.bodyClick);
    }

    _submitForm() {
      const form = this.popout.closest(selectors$L.form);
      if (form) {
        form.submit();
      }
    }

    _hideList() {
      this.popoutList.classList.remove(classes$A.listVisible);
      this.popoutToggle.setAttribute(attributes$v.ariaExpanded, false);
    }
  }

  const popoutSection = {
    onLoad() {
      sections$v[this.id] = [];
      const wrappers = this.container.querySelectorAll(selectors$L.popoutWrapper);
      wrappers.forEach((wrapper) => {
        sections$v[this.id].push(new Popout(wrapper));
      });
    },
    onUnload() {
      sections$v[this.id].forEach((popout) => {
        if (typeof popout.unload === 'function') {
          popout.unload();
        }
      });
    },
  };

  const selectors$K = {
    tooltip: '[data-tooltip]',
    tooltipContainer: '[data-tooltip-container]',
    tooltipArrow: '[data-tooltip-arrow]',
    aos: '[data-aos]',
  };

  const classes$z = {
    root: 'tooltip-default',
    isAnimating: 'is-animating',
    visible: 'is-visible',
    hiding: 'is-hiding',
  };

  const attributes$u = {
    tooltip: 'data-tooltip',
    tooltipContainer: 'data-tooltip-container',
    tooltipStopMouseEnter: 'data-tooltip-stop-mouseenter',
  };

  const sections$u = {};

  class Tooltip {
    constructor(el) {
      this.tooltip = el;
      if (!this.tooltip.hasAttribute(attributes$u.tooltip)) {
        return;
      }

      this.rootClass = classes$z.root;
      this.isAnimatingClass = classes$z.isAnimating;
      this.label = this.tooltip.getAttribute(attributes$u.tooltip);
      this.transitionSpeed = 200;
      this.hideTransitionTimeout = 0;
      this.animatedContainer = this.tooltip.closest(selectors$K.aos);
      this.addPinEvent = () => this.addPin();
      this.addPinMouseEvent = () => this.addPin(true);
      this.removePinEvent = (event) => throttle(this.removePin(event), 50);
      this.removePinMouseEvent = (event) => this.removePin(event, true, true);
      this.init();
    }

    init() {
      if (!document.querySelector(selectors$K.tooltipContainer)) {
        const tooltipTemplate = `<div class="${this.rootClass}__inner"><div class="${this.rootClass}__arrow" data-tooltip-arrow></div><div class="${this.rootClass}__text"></div></div>`;
        const tooltipElement = document.createElement('div');
        tooltipElement.className = `${this.rootClass} ${this.isAnimatingClass}`;
        tooltipElement.setAttribute(attributes$u.tooltipContainer, '');
        tooltipElement.innerHTML = tooltipTemplate;
        document.body.appendChild(tooltipElement);
      }

      this.tooltip.addEventListener('mouseenter', this.addPinMouseEvent);
      this.tooltip.addEventListener('mouseleave', this.removePinMouseEvent);
      this.tooltip.addEventListener('theme:tooltip:init', this.addPinEvent);
      document.addEventListener('theme:tooltip:close', this.removePinEvent);

      const tooltipTarget = document.querySelector(selectors$K.tooltipContainer);

      if (theme.settings.animations && this.animatedContainer) {
        this.animatedContainer.addEventListener('transitionend', (event) => {
          // This will fire the event when the last transition end
          if (event.propertyName === 'transform') {
            tooltipTarget.classList.remove(classes$z.isAnimating);
          }
        });
      }
    }

    addPin(stopMouseEnter = false) {
      const tooltipTarget = document.querySelector(selectors$K.tooltipContainer);
      const tooltipTargetArrow = tooltipTarget.querySelector(selectors$K.tooltipArrow);

      if (tooltipTarget && ((stopMouseEnter && !this.tooltip.hasAttribute(attributes$u.tooltipStopMouseEnter)) || !stopMouseEnter)) {
        const tooltipTargetInner = tooltipTarget.querySelector(`.${this.rootClass}__inner`);
        const tooltipTargetText = tooltipTarget.querySelector(`.${this.rootClass}__text`);
        tooltipTargetText.textContent = this.label;

        const tooltipTargetWidth = tooltipTargetInner.offsetWidth;
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const tooltipTop = tooltipRect.top;
        const tooltipWidth = tooltipRect.width;
        const tooltipHeight = tooltipRect.height;
        const tooltipTargetPositionTop = tooltipTop + tooltipHeight + window.scrollY;
        let tooltipTargetPositionLeft = tooltipRect.left - tooltipTargetWidth / 2 + tooltipWidth / 2;
        let tooltipArrowPositionLeft = '50%';
        const tooltipLeftWithWidth = tooltipTargetPositionLeft + tooltipTargetWidth;
        const tooltipTargetWindowDifference = tooltipLeftWithWidth - window.innerWidth;

        if (tooltipTargetWindowDifference > 0) {
          tooltipTargetPositionLeft -= tooltipTargetWindowDifference;
        }

        if (tooltipTargetPositionLeft < 0) {
          tooltipArrowPositionLeft = `calc(50% + ${tooltipTargetPositionLeft}px)`;
          tooltipTargetPositionLeft = 0;
        }

        tooltipTargetArrow.style.left = tooltipArrowPositionLeft;
        tooltipTarget.style.transform = `translate(${tooltipTargetPositionLeft}px, ${tooltipTargetPositionTop}px)`;
        tooltipTarget.classList.remove(classes$z.hiding);
        tooltipTarget.classList.add(classes$z.visible);

        document.addEventListener('theme:scroll', this.removePinEvent);
      }
    }

    removePin(event, stopMouseEnter = false, hideTransition = false) {
      const tooltipTarget = document.querySelector(selectors$K.tooltipContainer);
      const tooltipVisible = tooltipTarget.classList.contains(classes$z.visible);

      if (tooltipTarget && ((stopMouseEnter && !this.tooltip.hasAttribute(attributes$u.tooltipStopMouseEnter)) || !stopMouseEnter)) {
        if (tooltipVisible && (hideTransition || event.detail.hideTransition)) {
          tooltipTarget.classList.add(classes$z.hiding);

          if (this.hideTransitionTimeout) {
            clearTimeout(this.hideTransitionTimeout);
          }

          this.hideTransitionTimeout = setTimeout(() => {
            tooltipTarget.classList.remove(classes$z.hiding);
          }, this.transitionSpeed);
        }

        tooltipTarget.classList.remove(classes$z.visible);
        tooltipTarget.style.transform = `translate(100%, 0)`;

        document.removeEventListener('theme:scroll', this.removePinEvent);
      }
    }

    unload() {
      this.tooltip.removeEventListener('mouseenter', this.addPinMouseEvent);
      this.tooltip.removeEventListener('mouseleave', this.removePinMouseEvent);
      this.tooltip.removeEventListener('theme:tooltip:init', this.addPinEvent);
      document.removeEventListener('theme:tooltip:close', this.removePinEvent);
      document.removeEventListener('theme:scroll', this.removePinEvent);
    }
  }

  const tooltip = {
    onLoad() {
      sections$u[this.id] = [];
      const tooltips = this.container.querySelectorAll(selectors$K.tooltip);
      tooltips.forEach((tooltip) => {
        sections$u[this.id].push(new Tooltip(tooltip));
      });
    },
    onUnload() {
      sections$u[this.id].forEach((tooltip) => {
        if (typeof tooltip.unload === 'function') {
          tooltip.unload();
        }
      });
    },
  };

  const selectors$J = {
    addToCart: '[data-add-to-cart]',
    deferredMedia: '[data-deferred-media]',
    deferredMediaButton: '[data-deferred-media-button]',
    popupClose: '[data-popup-close]',
    popout: '[data-popout]',
    quickViewInner: '[data-quick-view-inner]',
    quickViewItemHolder: '[data-quick-view-item-holder]',
    product: '[data-product]',
    productForm: '[data-product-form]',
    productMediaSlider: '[data-product-single-media-slider]',
    productMediaWrapper: '[data-product-single-media-wrapper]',
    productModel: '[data-model]',
    productJSON: '[data-product-json]',
    quickViewFootInner: '[data-quick-view-foot-inner]',
    shopTheLookThumb: '[data-shop-the-look-thumb]',
    tooltip: '[data-tooltip]',
    drawerToggle: '[data-drawer-toggle]',
  };

  const classes$y = {
    hasMediaActive: 'has-media-active',
    isActive: 'is-active',
    isLoading: 'is-loading',
    mediaHidden: 'media--hidden',
    noOutline: 'no-outline',
    notificationPopupVisible: 'notification-popup-visible',
    popupQuickViewAnimateIn: 'popup-quick-view--animate-in',
    popupQuickViewAnimateOut: 'popup-quick-view--animate-out',
    popupQuickViewAnimated: 'popup-quick-view--animated',
    popupQuickView: 'popup-quick-view',
    jsQuickViewVisible: 'js-quick-view-visible',
    jsQuickViewFromCart: 'js-quick-view-from-cart',
    drawerOpen: 'js-drawer-open',
  };

  const attributes$t = {
    id: 'id',
    mediaId: 'data-media-id',
    sectionId: 'data-section-id',
    handle: 'data-handle',
    loaded: 'loaded',
    tabindex: 'tabindex',
    quickViewOnboarding: 'data-quick-view-onboarding',
    hotspot: 'data-hotspot',
    hotspotRef: 'data-hotspot-ref',
  };

  const ids = {
    addToCartFormId: 'AddToCartForm--',
    addToCartId: 'AddToCart--',
  };

  class LoadQuickview {
    constructor(popup, pswpElement) {
      this.popup = popup;
      this.pswpElement = pswpElement;
      this.quickViewFoot = this.pswpElement.querySelector(selectors$J.quickViewFootInner);
      this.quickViewInner = this.pswpElement.querySelector(selectors$J.quickViewInner);
      this.product = this.pswpElement.querySelectorAll(selectors$J.product);
      this.flkty = [];
      this.videos = [];
      this.productForms = [];
      this.deferredMedias = this.pswpElement.querySelectorAll(selectors$J.deferredMedia);
      this.buttonsShopTheLookThumb = this.pswpElement.querySelectorAll(selectors$J.shopTheLookThumb);
      this.quickViewItemHolders = this.pswpElement.querySelectorAll(selectors$J.quickViewItemHolder);
      this.popupCloseButtons = this.quickViewInner.querySelectorAll(selectors$J.popupClose);
      this.a11y = a11y;

      this.prevent3dModelSubmitEvent = (event) => this.prevent3dModelSubmit(event);
      this.closeOnAnimationEndEvent = (event) => this.closeOnAnimationEnd(event);
      this.closeOnEscapeEvent = (event) => this.closeOnEscape(event);

      this.outerCloseEvent = (event) => {
        if (!this.quickViewInner.contains(event.target)) {
          // Check if quickview has drawer
          const drawer = this.quickViewInner.nextElementSibling;
          if (drawer && drawer.contains(event.target)) return;

          this.closePopup(event);
        }
      };

      this.product.forEach((item, index) => {
        const isQuickViewOnboarding = item.hasAttribute(attributes$t.quickViewOnboarding);

        if (!isQuickViewOnboarding) {
          this.initItems(item, index);
        }
      });

      this.init();
      this.initTooltips();
      this.initPopouts();
    }

    /*
     * Init tooltips for swatches
     */
    initTooltips() {
      this.tooltips = this.pswpElement.querySelectorAll(selectors$J.tooltip);
      this.tooltips.forEach((tooltip) => {
        new Tooltip(tooltip);
      });
    }

    /*
     * Init popouts
     */
    initPopouts() {
      this.popoutElements = this.pswpElement.querySelectorAll(selectors$J.popout);
      this.popouts = {};

      this.popoutElements?.forEach((popout, index) => {
        this.popouts[index] = new Popout(popout);
      });
    }

    handleDraggable(slider, draggableStatus) {
      if (!slider) return;

      slider.options.draggable = Boolean(draggableStatus);
      slider.updateDraggable();
    }

    initItems(item, index) {
      this.addFormSuffix(item);
      this.initProductSlider(item, index);
      this.initProductVideo(item);
      this.initProductModel(item);
      this.initShopifyXrLaunch(item);

      // Init swatches
      makeSwatches(item);

      // Init drawer
      const drawerToggles = this.pswpElement.querySelectorAll(selectors$J.drawerToggle);
      if (drawerToggles.length) {
        new Drawer(item);
      }

      // Wrap tables
      wrapElements(item);

      const productForm = new ProductAddForm(item.parentNode);
      this.productForms.push(productForm);

      if (Shopify.PaymentButton) {
        Shopify.PaymentButton.init();
      }

      item.classList.remove(classes$y.isLoading);
    }

    init() {
      // Prevent 3d models button redirecting to cart page when enabling/disabling the model a couple of times
      document.addEventListener('submit', this.prevent3dModelSubmitEvent);

      // Custom closing events
      this.popupCloseButtons.forEach((popupClose) => {
        popupClose.addEventListener('keyup', (event) => {
          if (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER || event.code === theme.keyboardKeys.SPACE) {
            this.closePopup(event);
          }
        });

        popupClose.addEventListener('click', (event) => {
          this.closePopup(event);
        });
      });

      this.pswpElement.addEventListener('click', this.outerCloseEvent);

      document.dispatchEvent(new CustomEvent('theme:popup:open', {bubbles: true}));

      this.popup.listen('preventDragEvent', (e, isDown, preventObj) => {
        preventObj.prevent = false;
      });

      this.pswpElement.addEventListener('mousedown', () => {
        this.popup.framework.unbind(window, 'pointermove pointerup pointercancel', this.popup);
      });

      // Opening event
      this.popup.listen('initialZoomInEnd', () => {
        document.body.classList.add(classes$y.jsQuickViewVisible);

        this.a11y.trapFocus({
          container: this.quickViewInner,
        });
      });

      this.pswpElement.addEventListener('animationend', this.closeOnAnimationEndEvent);

      this.popup.listen('destroy', () => {
        if (this.flkty.length > 0) {
          requestAnimationFrame(() => {
            this.flkty.forEach((slider) => slider.pausePlayer());
          });
        }
        document.body.classList.remove(classes$y.jsQuickViewVisible);
        document.removeEventListener('keyup', this.closeOnEscapeEvent);
        document.addEventListener('keyup', this.closeOnEscapeEvent);
        this.pswpElement.removeEventListener('click', this.outerCloseEvent);
        this.pswpElement.removeEventListener('animationend', this.closeOnAnimationEndEvent);
        document.removeEventListener('submit', this.prevent3dModelSubmitEvent);

        this.deferredMedias.forEach((deferredMedia) => {
          // Remove the 'loaded' attribute so the videos will can load properly when we reopening the quickview
          deferredMedia.removeAttribute(attributes$t.loaded);
        });
      });

      document.addEventListener('keyup', this.closeOnEscapeEvent);
      document.addEventListener('theme:cart:added', () => {
        if (this.pswpElement.classList.contains(classes$y.popupQuickView)) {
          this.pswpElement.classList.add(classes$y.popupQuickViewAnimateOut);
        }
      });

      this.animateInQuickview();

      // 'Shop the look' thumbnails nav
      this.initShopTheLookListeners();
    }

    initShopTheLookListeners() {
      this.buttonsShopTheLookThumb?.forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();

          const thumb = event.target.matches(selectors$J.shopTheLookThumb) ? event.target : event.target.closest(selectors$J.shopTheLookThumb);
          const holder = this.pswpElement.querySelector(`[${attributes$t.hotspot}="${thumb.getAttribute(attributes$t.hotspotRef)}"]`);

          if (thumb.classList.contains(classes$y.isActive) || !holder) return;

          // Handle sliders
          if (this.flkty.length > 0) {
            requestAnimationFrame(() => {
              this.flkty.forEach((slider) => {
                slider.resize();

                const allMediaItems = this.quickViewInner.querySelectorAll(selectors$J.productMediaWrapper);

                // Pause all media
                if (allMediaItems.length) {
                  allMediaItems.forEach((media) => {
                    media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
                    media.classList.add(classes$y.mediaHidden);
                  });
                }
              });
            });
          }

          // Active Quick View item class toggle
          holder.classList.add(classes$y.isActive);

          this.quickViewItemHolders.forEach((element) => {
            if (element !== holder) {
              element.classList.remove(classes$y.isActive);
            }
          });
        });
      });
    }

    // Prevents the 3d model buttons submitting the form
    prevent3dModelSubmit(event) {
      if (event.submitter.closest(selectors$J.deferredMedia) && event.submitter.closest(selectors$J.productForm)) {
        event.preventDefault();
      }
    }

    closeQuickviewOnMobile() {
      if (window.innerWidth < window.theme.sizes.large && document.body.classList.contains(classes$y.jsQuickViewVisible)) {
        this.popup.close();
      }
    }

    animateInQuickview() {
      this.pswpElement.classList.add(classes$y.popupQuickViewAnimateIn);

      this.quickViewFoot.addEventListener('animationend', (event) => {
        this.handleAnimatedState(event);
      });

      // Mobile
      this.pswpElement.addEventListener('animationend', (event) => {
        this.handleAnimatedState(event, true);
      });
    }

    handleAnimatedState(event, isMobileAnimation = false) {
      if (event.animationName == 'quickViewAnimateInUp') {
        if (isMobileAnimation && window.innerWidth >= window.theme.sizes.small) {
          // Checks mobile animation but it's not mobile screen size
          return;
        }

        this.pswpElement.classList.add(classes$y.popupQuickViewAnimated);
        this.pswpElement.classList.remove(classes$y.popupQuickViewAnimateIn);
        document.body.classList.remove(classes$y.jsQuickViewFromCart); // Clear the class that we are adding in quick-view-popup.js when the animation ends
      }
    }

    closePopup(event) {
      event?.preventDefault();
      const isNavDrawerOpen = document.body.classList.contains(classes$y.drawerOpen);

      if (isNavDrawerOpen) {
        document.dispatchEvent(new CustomEvent('theme:drawer:closing', {bubbles: true}));
      }

      this.pswpElement.classList.add(classes$y.popupQuickViewAnimateOut); // Adding this class triggers the 'animationend' event which calls closeOnAnimationEndEvent()

      if (this.productForms.length > 0) {
        this.productForms.forEach((form) => {
          form.destroy();
        });
      }
    }

    closeOnAnimationEnd(event) {
      if (event.animationName == 'quickViewAnimateOutRight' || event.animationName == 'quickViewAnimateOutDown') {
        this.popup.template.classList.remove(classes$y.popupQuickViewAnimateOut, classes$y.popupQuickViewAnimated);
        this.popup.close();
      }
    }

    closeOnEscape(event) {
      const isQuickViewVisible = document.body.classList.contains(classes$y.jsQuickViewVisible);
      const isNotificationVisible = document.body.classList.contains(classes$y.notificationPopupVisible);

      if (event.code === theme.keyboardKeys.ESCAPE && isQuickViewVisible && !isNotificationVisible) {
        this.closePopup(event);
      }
    }

    initProductSlider(item, index) {
      const slider = item.querySelector(selectors$J.productMediaSlider);
      const mediaItems = item.querySelectorAll(selectors$J.productMediaWrapper);

      if (mediaItems.length > 1) {
        const itemSlider = new Flickity(slider, {
          wrapAround: true,
          cellAlign: 'left',
          pageDots: false,
          prevNextButtons: true,
          adaptiveHeight: false,
          pauseAutoPlayOnHover: false,
          selectedAttraction: 0.2,
          friction: 1,
          autoPlay: false,
          on: {
            ready: () => {
              slider.setAttribute(attributes$t.tabindex, '-1');

              // This resize should happen when the show animation of the PhotoSwipe starts and after PhotoSwipe adds the custom 'popup--quickview' class with the mainClass option.
              // This class is changing the slider width with CSS and looks like this is happening after the slider loads which is breaking it. That's why we need to call the resize() method here.
              requestAnimationFrame(() => {
                itemSlider.resize();
              });
            },
            settle: () => {
              const currentSlide = itemSlider.selectedElement;
              const mediaId = currentSlide.getAttribute(attributes$t.mediaId);

              currentSlide.setAttribute(attributes$t.tabindex, '0');

              itemSlider.cells.forEach((slide) => {
                if (slide.element === currentSlide) {
                  return;
                }

                slide.element.setAttribute(attributes$t.tabindex, '-1');
              });

              this.switchMedia(item, mediaId);
            },
          },
        });

        this.flkty.push(itemSlider);

        // Toggle flickity draggable functionality based on media play/pause state
        if (mediaItems.length) {
          mediaItems.forEach((element) => {
            element.addEventListener('theme:media:play', () => {
              this.handleDraggable(this.flkty[index], false);
              element.closest(selectors$J.productMediaSlider).classList.add(classes$y.hasMediaActive);
            });

            element.addEventListener('theme:media:pause', () => {
              this.handleDraggable(this.flkty[index], true);
              element.closest(selectors$J.productMediaSlider).classList.remove(classes$y.hasMediaActive);
            });
          });
        }

        // iOS smooth scrolling fix
        flickitySmoothScrolling(slider);
      }
    }

    switchMedia(item, mediaId) {
      const allMediaItems = this.quickViewInner.querySelectorAll(selectors$J.productMediaWrapper);
      const selectedMedia = item.querySelector(`${selectors$J.productMediaWrapper}[${attributes$t.mediaId}="${mediaId}"]`);
      const isFocusEnabled = !document.body.classList.contains(classes$y.noOutline);

      // Pause other media
      if (allMediaItems.length) {
        allMediaItems.forEach((media) => {
          media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
          media.classList.add(classes$y.mediaHidden);
        });
      }

      if (isFocusEnabled) {
        selectedMedia.focus();
      }

      selectedMedia.closest(selectors$J.productMediaSlider).classList.remove(classes$y.hasMediaActive);
      selectedMedia.classList.remove(classes$y.mediaHidden);
      selectedMedia.dispatchEvent(new CustomEvent('theme:media:visible'), {bubbles: true});

      // If media is not loaded, trigger poster button click to load it
      const deferredMedia = selectedMedia.querySelector(selectors$J.deferredMedia);
      if (deferredMedia && deferredMedia.getAttribute(attributes$t.loaded) !== 'true') {
        selectedMedia.querySelector(selectors$J.deferredMediaButton).dispatchEvent(new Event('click'));
      }
    }

    initProductVideo(item) {
      const videos = new ProductVideo(item);

      this.videos.push(videos);
    }

    initProductModel(item) {
      const sectionId = item.getAttribute(attributes$t.sectionId);
      const modelItems = item.querySelectorAll(selectors$J.productModel);

      if (modelItems.length) {
        modelItems.forEach((element) => {
          theme.ProductModel.init(element, sectionId);
        });
      }
    }

    initShopifyXrLaunch(item) {
      document.addEventListener('shopify_xr_launch', () => {
        const currentMedia = item.querySelector(`${selectors$J.productModel}:not(.${classes$y.mediaHidden})`);
        currentMedia.dispatchEvent(new CustomEvent('xrLaunch'));
      });
    }

    addFormSuffix(item) {
      const sectionId = item.getAttribute(attributes$t.sectionId);
      const productObject = JSON.parse(item.querySelector(selectors$J.productJSON).innerHTML);

      const formSuffix = `${sectionId}-${productObject.handle}`;
      const productForm = item.querySelector(selectors$J.productForm);
      const addToCart = item.querySelector(selectors$J.addToCart);

      productForm.setAttribute(attributes$t.id, ids.addToCartFormId + formSuffix);
      addToCart.setAttribute(attributes$t.id, ids.addToCartId + formSuffix);
    }
  }

  const settings$4 = {
    unlockScrollDelay: 400,
  };

  const selectors$I = {
    popupContainer: '.pswp',
    popupCloseBtn: '.pswp__custom-close',
    popupIframe: 'iframe, video',
    popupCustomIframe: '.pswp__custom-iframe',
    popupThumbs: '.pswp__thumbs',
    popupButtons: '.pswp__button, .pswp__caption-close',
    product: '[data-product]',
    productJSON: '[data-product-json]',
  };

  const classes$x = {
    current: 'is-current',
    customLoader: 'pswp--custom-loader',
    customOpen: 'pswp--custom-opening',
    loader: 'pswp__loader',
    opened: 'pswp--open',
    popupCloseButton: 'pswp__button--close',
    notificationPopup: 'pswp--notification',
    quickviewPopup: 'popup-quick-view',
    isCartDrawerOpen: 'js-drawer-open-cart',
    quickViewAnimateOut: 'popup-quick-view--animate-out',
  };

  const attributes$s = {
    dataOptionClasses: 'data-pswp-option-classes',
    dataVideoType: 'data-video-type',
  };

  const loaderHTML = `<div class="${classes$x.loader}"><div class="loader loader--image"><div class="loader__image"></div></div></div>`;

  class LoadPhotoswipe {
    constructor(items, options = '', templateIndex = 0, triggerButton = null) {
      this.items = items;
      this.triggerBtn = triggerButton;
      this.pswpElements = document.querySelectorAll(selectors$I.popupContainer);
      this.pswpElement = this.pswpElements[templateIndex];
      this.popup = null;
      this.popupThumbs = null;
      this.popupThumbsContainer = this.pswpElement.querySelector(selectors$I.popupThumbs);
      this.closeBtn = this.pswpElement.querySelector(selectors$I.popupCloseBtn);
      const defaultOptions = {
        history: false,
        focus: false,
        mainClass: '',
      };
      this.options = options !== '' ? options : defaultOptions;
      this.onCloseCallback = () => this.onClose();
      this.dispatchPopupInitEventCallback = () => this.dispatchPopupInitEvent();
      this.setCurrentThumbCallback = () => this.setCurrentThumb();
      this.a11y = a11y;

      this.init();
    }

    init() {
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

      this.pswpElement.classList.add(classes$x.customOpen);

      this.initLoader();

      loadScript({url: window.theme.assets.photoswipe})
        .then(() => this.loadPopup())
        .catch((e) => console.error(e));
    }

    initLoader() {
      if (this.pswpElement.classList.contains(classes$x.customLoader) && this.options !== '' && this.options.mainClass) {
        this.pswpElement.setAttribute(attributes$s.dataOptionClasses, this.options.mainClass);
        let loaderElem = document.createElement('div');
        loaderElem.innerHTML = loaderHTML;
        loaderElem = loaderElem.firstChild;
        this.pswpElement.appendChild(loaderElem);
      } else {
        this.pswpElement.setAttribute(attributes$s.dataOptionClasses, '');
      }
    }

    loadPopup() {
      const PhotoSwipe = window.themePhotoswipe.PhotoSwipe.default;
      const PhotoSwipeUI = window.themePhotoswipe.PhotoSwipeUI.default;

      if (this.pswpElement.classList.contains(classes$x.customLoader)) {
        this.pswpElement.classList.remove(classes$x.customLoader);
      }

      this.pswpElement.classList.remove(classes$x.customOpen);

      this.popup = new PhotoSwipe(this.pswpElement, PhotoSwipeUI, this.items, this.options);

      this.popup.listen('afterInit', this.dispatchPopupInitEventCallback);
      this.popup.listen('imageLoadComplete', this.setCurrentThumbCallback);
      this.popup.listen('beforeChange', this.setCurrentThumbCallback);
      this.popup.listen('close', this.onCloseCallback);

      this.popup.init();

      this.initPopupCallback();
    }

    initPopupCallback() {
      if (this.isVideo) {
        this.hideUnusedButtons();
      }

      this.initVideo();
      this.thumbsActions();

      this.a11y.trapFocus({
        container: this.pswpElement,
      });

      if (this.pswpElement.classList.contains(classes$x.quickviewPopup)) {
        new LoadQuickview(this.popup, this.pswpElement);
      }

      if (this.pswpElement.classList.contains(classes$x.notificationPopup)) {
        new LoadNotification(this.popup, this.pswpElement);
      }

      this.closePopup = () => {
        if (this.pswpElement.classList.contains(classes$x.quickviewPopup)) {
          this.pswpElement.classList.add(classes$x.quickViewAnimateOut); // Close the Quickview popup accordingly
        } else {
          this.popup.close();
        }
      };

      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', this.closePopup);
      }

      // Close Quick view popup when product added to cart
      document.addEventListener('theme:cart:added', this.closePopup);
    }

    dispatchPopupInitEvent() {
      if (this.triggerBtn) {
        this.triggerBtn.dispatchEvent(new CustomEvent('theme:popup:init', {bubbles: true}));
      }
    }

    initVideo() {
      const videoContainer = this.pswpElement.querySelector(selectors$I.popupCustomIframe);
      if (videoContainer) {
        const videoType = videoContainer.getAttribute(attributes$s.dataVideoType);
        this.isVideo = true;

        if (videoType == 'youtube') {
          new LoadVideoYT(videoContainer.parentElement);
        } else if (videoType == 'vimeo') {
          new LoadVideoVimeo(videoContainer.parentElement);
        }
      }
    }

    thumbsActions() {
      if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
        this.popupThumbsContainer.addEventListener('wheel', (e) => this.stopDisabledScroll(e));
        this.popupThumbsContainer.addEventListener('mousewheel', (e) => this.stopDisabledScroll(e));
        this.popupThumbsContainer.addEventListener('DOMMouseScroll', (e) => this.stopDisabledScroll(e));

        this.popupThumbs = this.pswpElement.querySelectorAll(`${selectors$I.popupThumbs} > *`);
        this.popupThumbs.forEach((element, i) => {
          element.addEventListener('click', (e) => {
            e.preventDefault();
            element.parentElement.querySelector(`.${classes$x.current}`).classList.remove(classes$x.current);
            element.classList.add(classes$x.current);
            this.popup.goTo(i);
          });
        });
      }
    }

    hideUnusedButtons() {
      const buttons = this.pswpElement.querySelectorAll(selectors$I.popupButtons);
      buttons.forEach((element) => {
        if (!element.classList.contains(classes$x.popupCloseButton)) {
          element.style.display = 'none';
        }
      });
    }

    stopDisabledScroll(e) {
      e.stopPropagation();
    }

    onClose() {
      const popupIframe = this.pswpElement.querySelector(selectors$I.popupIframe);
      if (popupIframe) {
        popupIframe.parentNode.removeChild(popupIframe);
      }

      if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
        while (this.popupThumbsContainer.firstChild) {
          this.popupThumbsContainer.removeChild(this.popupThumbsContainer.firstChild);
        }
      }

      this.pswpElement.setAttribute(attributes$s.dataOptionClasses, '');
      const loaderElem = this.pswpElement.querySelector(`.${classes$x.loader}`);
      if (loaderElem) {
        this.pswpElement.removeChild(loaderElem);
      }

      if (!document.body.classList.contains(classes$x.isCartDrawerOpen)) {
        this.a11y.removeTrapFocus();
      }

      document.removeEventListener('theme:cart:added', this.closePopup);

      // Unlock scroll if only cart drawer is closed and there are no more popups opened
      setTimeout(() => {
        const recentlyOpenedPopups = this.recentlyOpenedPopupsCount();
        const isCartDrawerOpen = document.body.classList.contains(classes$x.isCartDrawerOpen);

        if (recentlyOpenedPopups === 0 && !isCartDrawerOpen) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        }
      }, settings$4.unlockScrollDelay);
    }

    recentlyOpenedPopupsCount() {
      let count = 0;

      this.pswpElements.forEach((popup) => {
        const isOpened = popup.classList.contains(classes$x.opened);

        if (isOpened) {
          count += 1;
        }
      });

      return count;
    }

    setCurrentThumb() {
      const hasThumbnails = this.popupThumbsContainer && this.popupThumbsContainer.firstChild;

      if (hasThumbnails) return;

      const lastCurrentThumb = this.pswpElement.querySelector(`${selectors$I.popupThumbs} > .${classes$x.current}`);
      if (lastCurrentThumb) {
        lastCurrentThumb.classList.remove(classes$x.current);
      }

      if (!this.popupThumbs) {
        return;
      }
      const currentThumb = this.popupThumbs[this.popup.getCurrentIndex()];
      currentThumb.classList.add(classes$x.current);
      this.scrollThumbs(currentThumb);
    }

    scrollThumbs(currentThumb) {
      const thumbsContainerLeft = this.popupThumbsContainer.scrollLeft;
      const thumbsContainerWidth = this.popupThumbsContainer.offsetWidth;
      const thumbsContainerPos = thumbsContainerLeft + thumbsContainerWidth;
      const currentThumbLeft = currentThumb.offsetLeft;
      const currentThumbWidth = currentThumb.offsetWidth;
      const currentThumbPos = currentThumbLeft + currentThumbWidth;

      if (thumbsContainerPos <= currentThumbPos || thumbsContainerPos > currentThumbLeft) {
        const currentThumbMarginLeft = parseInt(window.getComputedStyle(currentThumb).marginLeft);
        this.popupThumbsContainer.scrollTo({
          top: 0,
          left: currentThumbLeft - currentThumbMarginLeft,
          behavior: 'smooth',
        });
      }
    }
  }

  const settings$3 = {
    templateIndex: 0,
  };

  const selectors$H = {
    buttonQuickView: '[data-button-quick-view]',
    quickViewItemsTemplate: '[data-quick-view-items-template]',
    cartDrawer: '[data-cart-drawer]',
    shopTheLookQuickViewButton: '[data-shop-the-look-quick-view-button]',
    shopTheLookThumb: '[data-shop-the-look-thumb]',
    quickViewItemHolder: '[data-quick-view-item-holder]',
  };

  const classes$w = {
    loading: 'is-loading',
    isActive: 'is-active',
    quickViewFromCart: 'js-quick-view-from-cart',
    mainClass: 'popup-quick-view pswp--not-close-btn',
    shopTheLookPopupClass: 'popup-quick-view popup-quick-view--shop-the-look pswp--not-close-btn',
  };

  const attributes$r = {
    loaded: 'data-loaded',
    handle: 'data-handle',
    variantId: 'data-variant-id',
    shopTheLookQuickView: 'data-shop-the-look-quick-view',
    hotspot: 'data-hotspot',
    quickButtonInit: 'data-initialized',
  };

  const options = {
    history: false,
    focus: false,
    mainClass: classes$w.mainClass,
    showHideOpacity: false, // we need that off to control the animation ourselves
    closeOnVerticalDrag: false,
    closeOnScroll: false,
    modal: false,
    escKey: false,
  };

  class QuickViewPopup {
    constructor(container) {
      this.container = container;
      this.a11y = a11y;
      this.buttonsQuickView = this.container.querySelectorAll(selectors$H.buttonQuickView);
      this.buttonsShopTheLookQuickView = this.container.querySelectorAll(selectors$H.shopTheLookQuickViewButton);
      this.popupInitCallback = (trigger) => this.popupInit(trigger);

      this.buttonsQuickView?.forEach((button) => {
        if (!button.hasAttribute(attributes$r.quickButtonInit)) {
          button.addEventListener('click', (event) => this.initPhotoswipe(event));
          button.addEventListener('theme:popup:init', () => {
            button.classList.remove(classes$w.loading);

            if (button.hasAttribute(attributes$r.shopTheLookQuickView)) {
              this.popupInitCallback(button);
            }
          });
          button.setAttribute(attributes$r.quickButtonInit, '');
        }
      });

      this.buttonsShopTheLookQuickView?.forEach((button) => {
        button.addEventListener('click', () => {
          this.buttonsQuickView[0]?.dispatchEvent(new Event('click'));
        });
      });
    }

    popupInit(trigger) {
      // Handle active Quick View item
      const holder = this.loadPhotoswipe.pswpElement.querySelector(`[${attributes$r.hotspot}="${trigger.getAttribute(attributes$r.hotspot)}"]`);
      const quickViewItemHolders = this.loadPhotoswipe.pswpElement.querySelectorAll(selectors$H.quickViewItemHolder);

      holder.classList.add(classes$w.isActive);

      quickViewItemHolders.forEach((element) => {
        if (element !== holder) {
          element.classList.remove(classes$w.isActive);
        }
      });

      // Handle pointer events
      this.toggleQuickViewButtonsLoadingClasses(true);
      this.toggleQuickViewThumbsLoadingClasses(true);

      const onAnimationInEnd = (event) => {
        // Animation on open
        if (event.animationName === 'quickViewAnimateInUp') {
          requestAnimationFrame(() => {
            this.toggleQuickViewThumbsLoadingClasses(false);
          });
        }

        // Animation on close
        if (event.animationName === 'quickViewAnimateOutDown') {
          this.loadPhotoswipe.pswpElement.removeEventListener('animationend', onAnimationInEnd);
        }
      };

      this.loadPhotoswipe.pswpElement.addEventListener('animationend', onAnimationInEnd);

      this.loadPhotoswipe?.popup?.listen('destroy', () => {
        this.toggleQuickViewButtonsLoadingClasses(false);
        this.toggleQuickViewThumbsLoadingClasses(false);
      });
    }

    toggleQuickViewButtonsLoadingClasses(isLoading = true) {
      if (isLoading) {
        this.buttonsQuickView?.forEach((element) => {
          element.classList.add(classes$w.loading);
        });
        return;
      }

      this.buttonsQuickView?.forEach((element) => {
        element.classList.remove(classes$w.loading);
      });
    }

    toggleQuickViewThumbsLoadingClasses(isLoading = true) {
      this.buttonsShopTheLookThumb = this.loadPhotoswipe?.pswpElement.querySelectorAll(selectors$H.shopTheLookThumb);

      if (isLoading) {
        this.buttonsShopTheLookThumb?.forEach((element) => {
          element.classList.add(classes$w.loading);
        });
        return;
      }

      this.buttonsShopTheLookThumb?.forEach((element) => {
        element.classList.remove(classes$w.loading);
      });
    }

    initPhotoswipe(event) {
      event.preventDefault();

      const button = event.target.matches(selectors$H.buttonQuickView) ? event.target : event.target.closest(selectors$H.buttonQuickView);
      const isMobile = window.innerWidth < theme.sizes.small;
      let quickViewVariant = '';
      let isShopTheLookPopupTrigger = false;

      if (button.hasAttribute(attributes$r.shopTheLookQuickView)) {
        if (!isMobile) return;
        isShopTheLookPopupTrigger = true;
      }

      options.mainClass = classes$w.mainClass;
      button.classList.add(classes$w.loading);

      // Add class js-quick-view-from-cart to change the default Quick view animation
      if (button.closest(selectors$H.cartDrawer)) {
        document.body.classList.add(classes$w.quickViewFromCart);
      }

      // Set the trigger element before calling trapFocus
      this.a11y.state.trigger = button;

      if (button.hasAttribute(attributes$r.variantId)) {
        quickViewVariant = `&variant=${button.getAttribute(attributes$r.variantId)}`;
      }

      const productUrl = `${theme.routes.root}products/${button.getAttribute(attributes$r.handle)}?section_id=api-quickview${quickViewVariant}`;

      if (isShopTheLookPopupTrigger) {
        options.mainClass = classes$w.shopTheLookPopupClass;

        this.buttonsQuickView.forEach((element) => {
          element.classList.add(classes$w.loading);
        });

        const XMLS = new XMLSerializer();
        const quickViewItemsTemplate = this.container.querySelector(selectors$H.quickViewItemsTemplate).content.firstElementChild.cloneNode(true);

        const itemsData = XMLS.serializeToString(quickViewItemsTemplate);

        this.loadPhotoswipeWithTemplate(itemsData, button);
      } else {
        this.loadPhotoswipeFromFetch(productUrl, button);
      }
    }

    loadPhotoswipeWithTemplate(data, button) {
      const items = [
        {
          html: data,
        },
      ];

      this.loadPhotoswipe = new LoadPhotoswipe(items, options, settings$3.templateIndex, button);
    }

    loadPhotoswipeFromFetch(url, button) {
      fetch(url)
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          const items = [
            {
              html: data,
            },
          ];

          this.loadPhotoswipe = new LoadPhotoswipe(items, options, settings$3.templateIndex, button);
        })
        .catch((error) => console.log('error: ', error));
    }
  }

  const settings$2 = {
    cartDrawerEnabled: window.theme.settings.cartType === 'drawer',
    timers: {
      addProductTimeout: 1000,
    },
    animations: {
      data: 'data-aos',
      method: 'fade-up',
    },
  };

  const selectors$G = {
    outerSection: '[data-section-id]',
    aos: '[data-aos]',
    additionalCheckoutButtons: '[data-additional-checkout-button]',
    apiContent: '[data-api-content]',
    apiLineItems: '[data-api-line-items]',
    apiUpsellItems: '[data-api-upsell-items]',
    apiCartPrice: '[data-api-cart-price]',
    buttonAddToCart: '[data-add-to-cart]',
    upsellButtonByHandle: '[data-handle]',
    cartCloseError: '[data-cart-error-close]',
    cartDrawer: '[data-cart-drawer]',
    cartDrawerTemplate: '[data-cart-drawer-template]',
    cartDrawerToggle: '[data-cart-drawer-toggle]',
    cartDrawerBody: '[data-cart-drawer-body]',
    cartErrors: '[data-cart-errors]',
    cartForm: '[data-cart-form]',
    cartTermsCheckbox: '[data-cart-acceptance-checkbox]',
    cartCheckoutButtonWrapper: '[data-cart-checkout-buttons]',
    cartCheckoutButton: '[data-cart-checkout-button]',
    cartItemRemove: '[data-item-remove]',
    cartItemsQty: '[data-cart-items-qty]',
    cartTotal: '[data-cart-total]',
    cartTotalPrice: '[data-cart-total-price]',
    cartMessage: '[data-cart-message]',
    cartMessageDefault: '[data-message-default]',
    cartPage: '[data-cart-page]',
    cartProgress: '[data-cart-message-progress]',
    emptyMessage: '[data-empty-message]',
    buttonHolder: '[data-foot-holder]',
    item: '[data-cart-item]',
    itemsHolder: '[data-items-holder]',
    itemsWrapper: '[data-items-wrapper]',
    formCloseError: '[data-close-error]',
    formErrorsContainer: '[data-cart-errors-container]',
    upsellHolder: '[data-upsell-holder]',
    errorMessage: '[data-error-message]',
    termsErrorMessage: '[data-terms-error-message]',
    pairProductsHolder: '[data-pair-products-holder]',
    pairProducts: '[data-pair-products]',
    priceHolder: '[data-cart-price-holder]',
    leftToSpend: '[data-left-to-spend]',
    quickBuyForm: '[data-quickbuy-form]',
    qtyInput: '[data-quantity-field]',
    productMediaContainer: '[data-product-media-container]',
    formWrapper: '[data-form-wrapper]',
    productForm: '[data-product-form]',
    popupQuickView: '.popup-quick-view',
    popupClose: '[data-popup-close]',
    error: '[data-error]',
    quickViewOnboarding: '[data-quick-view-onboarding]',
    flickityEnabled: '.flickity-enabled',
  };

  const classes$v = {
    hidden: 'hidden',
    added: 'is-added',
    isHidden: 'is-hidden',
    cartDrawerOpen: 'js-drawer-open-cart',
    open: 'is-open',
    visible: 'is-visible',
    expanded: 'is-expanded',
    loading: 'is-loading',
    disabled: 'is-disabled',
    success: 'is-success',
    error: 'has-error',
    cartItems: 'cart__toggle--has-items',
    variantSoldOut: 'variant--soldout',
    removed: 'is-removed',
    aosAnimate: 'aos-animate',
    updated: 'is-updated',
    noOutline: 'no-outline',
    productGridImageError: 'product-grid-item__image--error',
    contentVisibilityHidden: 'cv-h',
  };

  const attributes$q = {
    shippingMessageLimit: 'data-limit',
    cartMessageValue: 'data-cart-message',
    cartTotal: 'data-cart-total',
    ariaExpanded: 'aria-expanded',
    disabled: 'disabled',
    value: 'value',
    dataId: 'data-id',
    item: 'data-item',
    itemIndex: 'data-item-index',
    itemTitle: 'data-item-title',
    atcTrigger: 'data-atc-trigger',
    upsellButton: 'data-upsell-btn',
    notificationPopup: 'data-notification-popup',
    sectionId: 'data-section-id',
  };

  let sections$t = {};

  class CartDrawer {
    constructor() {
      if (window.location.pathname === '/password') {
        return;
      }

      this.init();
    }

    init() {
      // DOM Elements
      this.cartToggleButtons = document.querySelectorAll(selectors$G.cartDrawerToggle);
      this.cartPage = document.querySelector(selectors$G.cartPage);
      this.cartDrawer = document.querySelector(selectors$G.cartDrawer);
      this.cart = this.cartDrawer || this.cartPage;

      this.cartCount = this.getCartItemCount();

      this.assignArguments();

      this.flktyUpsell = null;
      this.form = null;
      this.collapsible = null;
      this.a11y = a11y;

      this.build = this.build.bind(this);

      // AJAX request
      this.addToCart = this.addToCart.bind(this);
      this.updateCart = this.updateCart.bind(this);

      // Cart events
      this.openCartDrawer = this.openCartDrawer.bind(this);
      this.closeCartDrawer = this.closeCartDrawer.bind(this);
      this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
      this.formSubmitHandler = throttle(this.formSubmitHandler.bind(this), 50);
      this.closeCartError = () => {
        this.cartErrorHolder.classList.remove(classes$v.expanded);
      };
      this.cartDrawerCloseEvent = null;

      // Checking
      this.hasItemsInCart = this.hasItemsInCart.bind(this);
      this.isCartPage = Boolean(this.cart && this.cartDrawer === null);
      this.showAnimations = Boolean(document.body.dataset.animations === 'true');

      // Set classes
      this.toggleClassesOnContainers = this.toggleClassesOnContainers.bind(this);

      // Flags
      this.totalItems = 0;
      this.isCartDrawerOpen = false;
      this.isCartDrawerLoaded = false;
      this.cartDiscounts = 0;
      this.cartDrawerEnabled = settings$2.cartDrawerEnabled;
      this.cartAnimationTimer = 0;
      this.cartUpdateFailed = false;

      // Cart Events
      this.cartEvents();
      this.cartAddEvent();
      this.cartDrawerToggleEvents();

      // Init quantity for fields
      this.initQuantity();

      // Init collapsible function for the cart accordions
      if (this.buttonHolder) {
        this.collapsible = new Collapsible(this.buttonHolder);
      }

      if (this.isCartPage) {
        this.renderPairProducts();
      }

      document.addEventListener('theme:popup:open', this.closeCartDrawer);
    }

    /**
     * Assign cart constructor arguments on page load or after cart drawer is loaded
     *
     * @return  {Void}
     */
    assignArguments() {
      this.cartDrawerBody = document.querySelector(selectors$G.cartDrawerBody);
      this.emptyMessage = document.querySelector(selectors$G.emptyMessage);
      this.buttonHolder = document.querySelector(selectors$G.buttonHolder);
      this.itemsHolder = document.querySelector(selectors$G.itemsHolder);
      this.cartItemsQty = document.querySelector(selectors$G.cartItemsQty);
      this.itemsWrapper = document.querySelector(selectors$G.itemsWrapper);
      this.items = document.querySelectorAll(selectors$G.item);
      this.cartTotal = document.querySelector(selectors$G.cartTotal);
      this.cartTotalPrice = document.querySelectorAll(selectors$G.cartTotalPrice);
      this.cartMessage = document.querySelectorAll(selectors$G.cartMessage);
      this.cartOriginalTotal = document.querySelector(selectors$G.cartOriginalTotal);
      this.cartErrorHolder = document.querySelector(selectors$G.cartErrors);
      this.cartCloseErrorMessage = document.querySelector(selectors$G.cartCloseError);
      this.pairProductsHolder = document.querySelector(selectors$G.pairProductsHolder);
      this.pairProducts = document.querySelector(selectors$G.pairProducts);
      this.priceHolder = document.querySelector(selectors$G.priceHolder);
      this.upsellHolders = document.querySelectorAll(selectors$G.upsellHolder);
      this.cartTermsCheckbox = document.querySelector(selectors$G.cartTermsCheckbox);
      this.cartCheckoutButtonWrapper = document.querySelector(selectors$G.cartCheckoutButtonWrapper);
      this.cartCheckoutButton = document.querySelector(selectors$G.cartCheckoutButton);
      this.cartForm = document.querySelector(selectors$G.cartForm);
      this.cartItemCount = 0;
      this.subtotal = window.theme.subtotal;
      this.button = null;

      if (this.cartMessage.length > 0) {
        this.cartFreeLimitShipping = Number(this.cartMessage[0].getAttribute(attributes$q.shippingMessageLimit)) * 100 * window.Shopify.currency.rate;
      }

      this.updateProgress();
    }

    /**
     * Init quantity field functionality
     *
     * @return  {Void}
     */

    initQuantity() {
      this.items = document.querySelectorAll(selectors$G.item);

      this.items?.forEach((item) => {
        const quantity = new QuantityCounter(item, true);

        quantity.init();
        this.cartUpdateEvent(item);
      });
    }

    /**
     * Custom event who change the cart
     *
     * @return  {Void}
     */

    cartUpdateEvent(item) {
      item.addEventListener('theme:cart:update', (event) => {
        this.updateCart(
          {
            id: event.detail.id,
            quantity: event.detail.quantity,
          },
          item
        );
      });
    }

    /**
     * Cart events
     *
     * @return  {Void}
     */

    cartEvents() {
      const cartItemRemove = document.querySelectorAll(selectors$G.cartItemRemove);
      this.totalItems = cartItemRemove.length;

      cartItemRemove?.forEach((button) => {
        const item = button.closest(selectors$G.item);
        button.addEventListener('click', (event) => {
          event.preventDefault();

          if (button.classList.contains(classes$v.disabled)) return;

          this.updateCart(
            {
              id: item.getAttribute(attributes$q.dataId),
              quantity: 0,
            },
            item
          );
        });
      });

      if (this.cartCloseErrorMessage) {
        this.cartCloseErrorMessage.removeEventListener('click', this.closeCartError);
        this.cartCloseErrorMessage.addEventListener('click', this.closeCartError);
      }

      if (this.cartTermsCheckbox) {
        this.cartTermsCheckbox.removeEventListener('change', this.formSubmitHandler);
        this.cartCheckoutButtonWrapper.removeEventListener('click', this.formSubmitHandler);
        this.cartForm.removeEventListener('submit', this.formSubmitHandler);

        this.cartTermsCheckbox.addEventListener('change', this.formSubmitHandler);
        this.cartCheckoutButtonWrapper.addEventListener('click', this.formSubmitHandler);
        this.cartForm.addEventListener('submit', this.formSubmitHandler);
      }
    }

    /**
     * Cart event add product to cart
     *
     * @return  {Void}
     */

    cartAddEvent() {
      document.addEventListener('click', (event) => {
        const clickedElement = event.target;
        const isButtonATC = clickedElement?.matches(selectors$G.buttonAddToCart);
        const getButtonATC = clickedElement?.closest(selectors$G.buttonAddToCart);

        if (isButtonATC || getButtonATC) {
          event.preventDefault();

          this.button = isButtonATC ? clickedElement : getButtonATC;
          this.form = clickedElement.closest('form');
          this.formWrapper = this.button.closest(selectors$G.formWrapper);
          const isVariantSoldOut = this.formWrapper?.classList.contains(classes$v.variantSoldOut);
          const isButtonDisabled = this.button.hasAttribute(attributes$q.disabled);
          const isQuickViewOnboarding = this.button.closest(selectors$G.quickViewOnboarding);
          const hasDataAtcTrigger = this.button.hasAttribute(attributes$q.atcTrigger);
          const hasNotificationPopup = this.button.hasAttribute(attributes$q.notificationPopup);
          const hasFileInput = this.form?.querySelector('[type="file"]');

          if (isButtonDisabled || hasFileInput || isQuickViewOnboarding) return;

          // Notification popup
          if (isVariantSoldOut && hasNotificationPopup) {
            new NotificationPopup(this.button);
            return;
          }

          if (hasDataAtcTrigger) {
            this.a11y.state.trigger = this.button;
          }

          const formData = new FormData(this.form);
          this.addToCart(formData);

          // Hook for cart/add.js event
          document.dispatchEvent(
            new CustomEvent('theme:cart:add', {
              bubbles: true,
              detail: {
                selector: clickedElement,
              },
            })
          );
        }
      });
    }

    /**
     * Get response from the cart
     *
     * @return  {Void}
     */

    getCart() {
      // Render cart drawer if it exists but it's not loaded yet
      if (this.cartDrawer && !this.isCartDrawerLoaded) {
        const alwaysOpen = false;
        this.renderCartDrawer(alwaysOpen);
      }

      fetch(theme.routes.cart_url + '?section_id=api-cart-items')
        .then(this.handleErrors)
        .then((response) => response.text())
        .then((response) => {
          const element = document.createElement('div');
          element.innerHTML = response;

          const cleanResponse = element.querySelector(selectors$G.apiContent);
          this.build(cleanResponse);
        })
        .catch((error) => console.log(error));
    }

    /**
     * Add item(s) to the cart and show the added item(s)
     *
     * @param   {String}  data
     * @param   {DOM Element}  button
     *
     * @return  {Void}
     */

    addToCart(data) {
      if (this.cartDrawerEnabled && this.button) {
        this.button.classList.add(classes$v.loading);
        this.button.setAttribute(attributes$q.disabled, true);
      }

      fetch(theme.routes.cart_add_url, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/javascript',
        },
        body: data,
      })
        .then((response) => response.json())
        .then((response) => {
          this.button.disabled = true;
          this.addLoadingClass();

          if (response.status) {
            this.addToCartError(response);

            this.removeLoadingClass();

            return;
          }

          if (this.cartDrawerEnabled) {
            this.getCart();
          } else {
            window.location = theme.routes.cart_url;
          }
        })
        .catch((error) => console.log(error));
    }

    /**
     * Update cart
     *
     * @param   {Object}  updateData
     *
     * @return  {Void}
     */

    updateCart(updateData = {}, currentItem = null) {
      let updatedQuantity = updateData.quantity;
      if (currentItem !== null) {
        if (updatedQuantity) {
          currentItem.classList.add(classes$v.loading);
        } else {
          currentItem.classList.add(classes$v.removed);
        }
      }
      this.disableCartButtons();
      this.addLoadingClass();

      const newItem = this.cart.querySelector(`[${attributes$q.item}="${updateData.id}"]`) || currentItem;
      const lineIndex = newItem?.hasAttribute(attributes$q.itemIndex) ? parseInt(newItem.getAttribute(attributes$q.itemIndex)) : 0;
      const itemTitle = newItem?.hasAttribute(attributes$q.itemTitle) ? newItem.getAttribute(attributes$q.itemTitle) : null;

      if (lineIndex === 0) return;

      const data = {
        line: lineIndex,
        quantity: updatedQuantity,
      };

      fetch(theme.routes.cart_change_url, {
        method: 'post',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.status === 400) {
            const error = new Error(response.status);
            this.cartDrawerEnabled ? this.getCart() : (window.location = theme.routes.cart_url);
            throw error;
          }

          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);

          if (parsedState.errors) {
            this.cartUpdateFailed = true;
            this.updateErrorText(itemTitle);
            this.toggleErrorMessage();
            this.resetLineItem(currentItem);
            this.enableCartButtons();
            this.removeLoadingClass();

            return;
          }

          this.getCart();
        })
        .catch((error) => {
          console.log(error);
          this.enableCartButtons();
          this.removeLoadingClass();
        });
    }

    /**
     * Reset line item initial state
     *
     * @return  {Void}
     */
    resetLineItem(item) {
      const qtyInput = item.querySelector(selectors$G.qtyInput);
      const qty = qtyInput.getAttribute('value');
      qtyInput.value = qty;
      item.classList.remove(classes$v.loading);
    }

    /**
     * Disable cart buttons and inputs
     *
     * @return  {Void}
     */
    disableCartButtons() {
      const inputs = this.cart.querySelectorAll('input');
      const buttons = this.cart.querySelectorAll(`button, ${selectors$G.cartItemRemove}`);

      if (inputs.length) {
        inputs.forEach((item) => {
          item.classList.add(classes$v.disabled);
          item.blur();
          item.disabled = true;
        });
      }

      if (buttons.length) {
        buttons.forEach((item) => {
          item.setAttribute(attributes$q.disabled, true);
        });
      }
    }

    /**
     * Enable cart buttons and inputs
     *
     * @return  {Void}
     */
    enableCartButtons() {
      const inputs = this.cart.querySelectorAll('input');
      const buttons = this.cart.querySelectorAll(`button, ${selectors$G.cartItemRemove}`);

      if (inputs.length) {
        inputs.forEach((item) => {
          item.classList.remove(classes$v.disabled);
          item.disabled = false;
        });
      }

      if (buttons.length) {
        buttons.forEach((item) => {
          item.removeAttribute(attributes$q.disabled);
        });
      }
    }

    /**
     * Update error text
     *
     * @param   {String}  itemTitle
     *
     * @return  {Void}
     */

    updateErrorText(itemTitle) {
      this.cartErrorHolder.querySelector(selectors$G.errorMessage).innerText = itemTitle;
    }

    /**
     * Toggle error message
     *
     * @return  {Void}
     */

    toggleErrorMessage() {
      if (!this.cartErrorHolder) return;

      this.cartErrorHolder.classList.toggle(classes$v.expanded, this.cartUpdateFailed);

      // Reset cart error events flag
      this.cartUpdateFailed = false;
    }

    /**
     * Handle errors
     *
     * @param   {Object}  response
     *
     * @return  {Object}
     */

    handleErrors(response) {
      if (!response.ok) {
        return response.json().then(function (json) {
          const e = new FetchError({
            status: response.statusText,
            headers: response.headers,
            json: json,
          });
          throw e;
        });
      }
      return response;
    }

    /**
     * Add to cart error handle
     *
     * @param   {Object}  data
     * @param   {DOM Element/Null} button
     *
     * @return  {Void}
     */

    addToCartError(data) {
      const buttonQuickBuyForm = this.button.closest(selectors$G.quickBuyForm);
      const buttonUpsellHolder = this.button.closest(selectors$G.upsellHolder);
      const isFocusEnabled = !document.body.classList.contains(classes$v.noOutline);
      // holder: Product form containers or Upsell products in Cart form
      let holder = this.button.closest(selectors$G.productForm) ? this.button.closest(selectors$G.productForm) : this.button.closest(selectors$G.upsellHolder);
      let errorContainer = holder.querySelector(selectors$G.formErrorsContainer);

      // Upsell products in Cart form
      if (buttonUpsellHolder) {
        errorContainer = buttonUpsellHolder.querySelector(selectors$G.formErrorsContainer);
      }

      if (this.cartDrawerEnabled && this.button && this.button.closest(selectors$G.cartDrawer) !== null && !this.button.closest(selectors$G.cartDrawer)) {
        this.closeCartDrawer();
      }

      this.button.classList.remove(classes$v.loading);
      this.button.removeAttribute(attributes$q.disabled);

      // Error message content
      const closeErrorButton = buttonQuickBuyForm
        ? ''
        : `
      <button type="button" class="errors__button-close" data-close-error>
        ${theme.icons.close}
      </button>
    `;

      errorContainer.innerHTML = `
      <div class="errors" data-error>
        ${data.message}: ${data.description}
        ${closeErrorButton}
      </div>
    `;

      // Quick buy in PGI errors
      if (buttonQuickBuyForm) {
        const productMediaContainer = errorContainer.closest(selectors$G.productMediaContainer);
        productMediaContainer.classList.add(classes$v.productGridImageError);

        errorContainer.querySelector(selectors$G.error).addEventListener('animationend', () => {
          productMediaContainer.classList.remove(classes$v.productGridImageError);
          errorContainer.innerHTML = '';

          if (!isFocusEnabled) {
            document.activeElement.blur();
          }
        });
      } else {
        // PDP form, Quick view popup forms and Upsell sliders errors
        errorContainer.classList.add(classes$v.visible);
        errorContainer.addEventListener('transitionend', () => {
          this.resizeSliders(errorContainer);
        });

        this.handleCloseErrorMessages(errorContainer);
      }
    }

    /**
     * Handle close buttons in error messages containers
     *
     * @param   {Object}  The error container that holds the close button
     * @return  {Void}
     */
    handleCloseErrorMessages(container) {
      const formErrorClose = container.querySelector(selectors$G.formCloseError);

      formErrorClose.addEventListener('click', (event) => {
        const clickedElement = event.target;
        const isFormCloseError = clickedElement.matches(selectors$G.formCloseError) || clickedElement.closest(selectors$G.formCloseError);

        if (!isFormCloseError) return;

        event.preventDefault();
        container.classList.remove(classes$v.visible);
        container.querySelector(selectors$G.error).addEventListener('transitionend', () => {
          container.innerHTML = '';
          this.resizeSliders(clickedElement);
        });
      });
    }

    /**
     * Resize sliders height
     *
     * @param   {Object}  Element within the slider container that would be resized
     * @return  {Void}
     */
    resizeSliders(element) {
      const slider = element.closest(selectors$G.flickityEnabled);

      if (!slider) return;

      const flkty = Flickity.data(slider);
      requestAnimationFrame(() => flkty.resize());
    }

    /**
     * Render cart and define all elements after cart drawer is open for a first time
     *
     * @return  {Void}
     */
    renderCartDrawer(alwaysOpen = true) {
      const cartDrawerTemplate = document.querySelector(selectors$G.cartDrawerTemplate);

      if (!cartDrawerTemplate) {
        return;
      }

      // Append cart items HTML to the cart drawer container
      this.cartDrawer.innerHTML = cartDrawerTemplate.innerHTML;
      this.assignArguments();

      // Bind cart quantity events
      this.initQuantity();

      // Bind cart events
      this.cartEvents();

      // Init collapsible function for the cart drawer accordions
      if (this.buttonHolder) {
        this.collapsible = new Collapsible(this.buttonHolder);
      }

      // Bind cart drawer close button event
      this.cartDrawerToggle = this.cartDrawer.querySelector(selectors$G.cartDrawerToggle);
      this.cartDrawerToggle.addEventListener('click', this.cartDrawerToggleClickEvent);

      this.isCartDrawerLoaded = true;

      this.renderPairProducts();

      // Hook for cart drawer loaded event
      document.dispatchEvent(new CustomEvent('theme:cart:loaded', {bubbles: true}));

      // Open cart drawer after cart items and events are loaded
      if (alwaysOpen) {
        this.openCartDrawer();
      }
    }

    /**
     * Open cart dropdown and add class on body
     *
     * @return  {Void}
     */

    openCartDrawer() {
      if (this.isCartDrawerOpen) {
        return;
      }

      if (!this.isCartDrawerLoaded) {
        this.renderCartDrawer();
        return;
      }

      // Hook for cart drawer open event
      document.dispatchEvent(new CustomEvent('theme:cart:open', {bubbles: true}));
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.cartDrawer}));
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.cartDrawerBody}));

      document.body.classList.add(classes$v.cartDrawerOpen);
      this.cartDrawer.classList.add(classes$v.open);
      this.cartDrawer.classList.remove(classes$v.contentVisibilityHidden);

      // Cart elements opening animation
      this.cartDrawer.querySelectorAll(selectors$G.aos).forEach((item) => {
        requestAnimationFrame(() => {
          item.classList.add(classes$v.aosAnimate);
        });
      });

      this.cartToggleButtons.forEach((button) => {
        button.setAttribute(attributes$q.ariaExpanded, true);
      });

      this.a11y.trapFocus({
        container: this.cartDrawer,
      });

      // Observe Additional Checkout Buttons
      this.observeAdditionalCheckoutButtons();
      this.isCartDrawerOpen = true;
    }

    /**
     * Close cart dropdown and remove class on body
     *
     * @return  {Void}
     */

    closeCartDrawer() {
      if (!this.isCartDrawerOpen) {
        return;
      }

      // Hook for cart drawer close event
      document.dispatchEvent(new CustomEvent('theme:cart:close', {bubbles: true}));

      // Cart elements closing animation

      if (this.cartAnimationTimer) {
        clearTimeout(this.cartAnimationTimer);
      }

      this.cartAnimationTimer = setTimeout(() => {
        this.cartDrawer.querySelectorAll(selectors$G.aos).forEach((item) => {
          item.classList.remove(classes$v.aosAnimate);
        });
      }, 300);

      this.cartErrorHolder.classList.remove(classes$v.expanded);

      this.a11y.removeTrapFocus();

      this.cartToggleButtons.forEach((button) => {
        button.setAttribute(attributes$q.ariaExpanded, false);
      });

      document.body.classList.remove(classes$v.cartDrawerOpen);
      this.cartDrawer.classList.remove(classes$v.open);
      this.itemsHolder.classList.remove(classes$v.updated);

      const onCartDrawerTransitionEnd = (event) => {
        if (event.target !== this.cartDrawer) return;

        requestAnimationFrame(() => {
          this.cartDrawer.classList.add(classes$v.contentVisibilityHidden);
        });

        this.cartDrawer.removeEventListener('transitionend', onCartDrawerTransitionEnd);
      };

      this.cartDrawer.addEventListener('transitionend', onCartDrawerTransitionEnd);

      // Fixes header background update on cart-drawer close
      const isFocusEnabled = !document.body.classList.contains(classes$v.noOutline);
      if (!isFocusEnabled) {
        requestAnimationFrame(() => {
          document.activeElement.blur();
        });
      }

      // Enable page scroll right after the closing animation ends
      const timeout = 400;
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: timeout}));

      this.isCartDrawerOpen = false;
    }

    /**
     * Toggle cart dropdown
     *
     * @return  {Void}
     */

    toggleCartDrawer() {
      if (this.isCartDrawerOpen) {
        this.closeCartDrawer();
      } else {
        this.openCartDrawer();
      }
    }

    /**
     * Cart drawer toggle events
     *
     * @return  {Void}
     */

    cartDrawerToggleEvents() {
      if (!this.cartDrawer) return;

      // Close cart drawer on ESC key pressed
      this.cartDrawer.addEventListener('keyup', (event) => {
        if (event.code === theme.keyboardKeys.ESCAPE) {
          this.closeCartDrawer();
        }
      });

      // Define cart drawer toggle button click event
      this.cartDrawerToggleClickEvent = (event) => {
        event.preventDefault();
        const button = event.target;

        if (button.getAttribute(attributes$q.ariaExpanded) === 'false') {
          this.a11y.state.trigger = button;
        }

        this.toggleCartDrawer();
      };

      // Define cart drawer close event
      this.cartDrawerCloseEvent = (event) => {
        const isCartDrawerToggle = event.target.matches(selectors$G.cartDrawerToggle);
        const isCartDrawerChild = document.querySelector(selectors$G.cartDrawer).contains(event.target);
        const isPopupQuickView = event.target.closest(selectors$G.popupQuickView);

        if (!isCartDrawerToggle && !isCartDrawerChild && !isPopupQuickView) {
          this.closeCartDrawer();
        }
      };

      // Bind cart drawer toggle buttons click event
      this.cartToggleButtons.forEach((button) => {
        button.addEventListener('click', this.cartDrawerToggleClickEvent);
      });

      // Close drawers on click outside
      //   Replaced 'click' with 'mousedown' as a quick and simple fix to the dragging issue on the upsell slider
      //   which was causing the cart-drawer to close when we start dragging the slider and finish our drag outside the cart-drawer
      //   which was triggering the 'click' event
      document.addEventListener('mousedown', this.cartDrawerCloseEvent);
    }

    /**
     * Toggle classes on different containers and messages
     *
     * @return  {Void}
     */

    toggleClassesOnContainers() {
      const that = this;

      this.emptyMessage.classList.toggle(classes$v.hidden, that.hasItemsInCart());
      this.buttonHolder.classList.toggle(classes$v.hidden, !that.hasItemsInCart());
      this.itemsHolder.classList.toggle(classes$v.hidden, !that.hasItemsInCart());
      this.cartItemsQty.classList.toggle(classes$v.hidden, !that.hasItemsInCart());
    }

    /**
     * Build cart depends on results
     *
     * @param   {Object}  data
     *
     * @return  {Void}
     */

    build(data) {
      const cartItemsData = data.querySelector(selectors$G.apiLineItems);
      const upsellItemsData = data.querySelector(selectors$G.apiUpsellItems);
      const cartEmptyData = Boolean(cartItemsData === null && upsellItemsData === null);
      const priceData = data.querySelector(selectors$G.apiCartPrice);
      const cartTotal = data.querySelector(selectors$G.cartTotal);

      if (this.priceHolder && priceData) {
        this.priceHolder.innerHTML = priceData.innerHTML;
      }

      if (cartEmptyData) {
        this.itemsHolder.innerHTML = data;

        if (this.pairProductsHolder) {
          this.pairProductsHolder.innerHTML = '';
        }
      } else {
        this.itemsHolder.innerHTML = cartItemsData.innerHTML;

        if (this.pairProductsHolder) {
          this.pairProductsHolder.innerHTML = upsellItemsData.innerHTML;
        }

        this.renderPairProducts();
      }

      this.newTotalItems = cartItemsData && cartItemsData.querySelectorAll(selectors$G.item).length ? cartItemsData.querySelectorAll(selectors$G.item).length : 0;
      this.subtotal = cartTotal && cartTotal.hasAttribute(attributes$q.cartTotal) ? parseInt(cartTotal.getAttribute(attributes$q.cartTotal)) : 0;
      this.cartCount = this.getCartItemCount();

      if (this.cartMessage.length > 0) {
        this.updateProgress();
      }

      this.cartToggleButtons.forEach((button) => {
        button.classList.remove(classes$v.cartItems);

        if (this.newTotalItems > 0) {
          button.classList.add(classes$v.cartItems);
        }
      });

      this.toggleErrorMessage();
      this.updateItemsQuantity(this.cartCount);

      // Update cart total price
      this.cartTotalPrice.forEach((item) => {
        item.innerHTML = this.subtotal === 0 ? window.theme.strings.free : themeCurrency.formatMoney(this.subtotal, theme.moneyWithCurrencyFormat);
      });

      if (this.totalItems !== this.newTotalItems) {
        this.totalItems = this.newTotalItems;

        this.toggleClassesOnContainers();
      }

      // Add class "is-updated" line items holder to reduce cart items animation delay via CSS variables
      if (this.isCartDrawerOpen) {
        this.itemsHolder.classList.add(classes$v.updated);
      }

      this.cartEvents();
      this.initQuantity();
      this.enableCartButtons();
      this.resetButtonClasses();
      this.removeLoadingClass();

      document.dispatchEvent(new CustomEvent('theme:cart:added', {bubbles: true}));

      if (this.cartDrawer) {
        this.openCartDrawer();
      }
    }

    /**
     * Get cart item count
     *
     * @return  {Void}
     */

    getCartItemCount() {
      // Returning 0 and not the actual cart items count is done only for when "Cart type" settings are set to "Page"
      // The actual count is necessary only when we build and render the cart/cart-drawer after we get a response from the Cart API
      if (!this.cart) return 0;
      return Array.from(this.cart.querySelectorAll(selectors$G.qtyInput)).reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
    }

    /**
     * Check for items in the cart
     *
     * @return  {Void}
     */

    hasItemsInCart() {
      return this.totalItems > 0;
    }

    /**
     * Show/hide free shipping message
     *
     * @param   {Number}  total
     *
     * @return  {Void}
     */

    freeShippingMessageHandle(total) {
      if (this.cartMessage.length > 0) {
        document.querySelectorAll(selectors$G.cartMessage).forEach((message) => {
          const hasFreeShipping = message.hasAttribute(attributes$q.cartMessageValue) && message.getAttribute(attributes$q.cartMessageValue) === 'true' && total !== 0;
          const cartMessageDefault = message.querySelector(selectors$G.cartMessageDefault);

          message.classList.toggle(classes$v.success, total >= this.cartFreeLimitShipping && hasFreeShipping);
          message.classList.toggle(classes$v.isHidden, total === 0);
          cartMessageDefault.classList.toggle(classes$v.isHidden, total >= this.cartFreeLimitShipping);
        });
      }
    }

    /**
     * Update progress when update cart
     *
     * @return  {Void}
     */

    updateProgress() {
      const newPercentValue = (this.subtotal / this.cartFreeLimitShipping) * 100;
      const leftToSpend = theme.settings.currency_code_enable
        ? themeCurrency.formatMoney(this.cartFreeLimitShipping - this.subtotal, theme.moneyWithCurrencyFormat)
        : themeCurrency.formatMoney(this.cartFreeLimitShipping - this.subtotal, theme.moneyFormat);

      if (this.cartMessage.length > 0) {
        document.querySelectorAll(selectors$G.cartMessage).forEach((message) => {
          const cartMessageProgressItems = message.querySelectorAll(selectors$G.cartProgress);
          const leftToSpendMessage = message.querySelector(selectors$G.leftToSpend);

          if (leftToSpendMessage) {
            leftToSpendMessage.innerHTML = leftToSpend.replace('.00', '').replace(',00', '');
          }

          if (cartMessageProgressItems.length) {
            cartMessageProgressItems.forEach((cartMessageProgress, index) => {
              cartMessageProgress.classList.toggle(classes$v.isHidden, this.subtotal / this.cartFreeLimitShipping >= 1);
              cartMessageProgress.style.setProperty('--progress-width', `${newPercentValue}%`);
              if (index === 0) {
                cartMessageProgress.setAttribute(attributes$q.value, newPercentValue);
              }
            });
          }

          this.freeShippingMessageHandle(this.subtotal);
        });
      }
    }

    /**
     * Render Upsell Products
     */
    renderPairProducts() {
      this.flktyUpsell = null;
      this.pairProductsHolder = document.querySelector(selectors$G.pairProductsHolder);
      this.pairProducts = document.querySelector(selectors$G.pairProducts);
      this.upsellHolders = document.querySelectorAll(selectors$G.upsellHolder);

      if (this.pairProductsHolder === null || this.pairProductsHolder === undefined) {
        return;
      }

      // Upsell slider
      const that = this;
      if (this.upsellHolders.length > 1) {
        this.flktyUpsell = new Flickity(this.pairProducts, {
          wrapAround: true,
          pageDots: true,
          adaptiveHeight: true,
          prevNextButtons: false,
          on: {
            ready: function () {
              new QuickViewPopup(that.cart);
              this.reloadCells();
              requestAnimationFrame(() => this.resize());
            },
          },
        });

        return;
      }

      // Single upsell item
      new QuickViewPopup(this.cart);
    }

    updateItemsQuantity(itemsQty) {
      let oneItemText = theme.strings.cart_items_one;
      let manyItemsText = theme.strings.cart_items_many;
      oneItemText = oneItemText.split('}}')[1];
      manyItemsText = manyItemsText.split('}}')[1];

      if (this.cartItemsQty) {
        this.cartItemsQty.textContent = itemsQty === 1 ? `${itemsQty} ${oneItemText}` : `${itemsQty} ${manyItemsText}`;
      }
    }

    observeAdditionalCheckoutButtons() {
      // identify an element to observe
      const additionalCheckoutButtons = this.cart.querySelector(selectors$G.additionalCheckoutButtons);
      if (additionalCheckoutButtons) {
        // create a new instance of `MutationObserver` named `observer`,
        // passing it a callback function
        const observer = new MutationObserver(() => {
          this.a11y.removeTrapFocus();
          this.a11y.trapFocus({
            container: this.cart,
          });
          observer.disconnect();
        });

        // call `observe()` on that MutationObserver instance,
        // passing it the element to observe, and the options object
        observer.observe(additionalCheckoutButtons, {subtree: true, childList: true});
      }
    }

    formSubmitHandler() {
      const termsAccepted = document.querySelector(selectors$G.cartTermsCheckbox).checked;
      const termsError = document.querySelector(selectors$G.termsErrorMessage);

      // Disable form submit if terms and conditions are not accepted
      if (!termsAccepted) {
        if (document.querySelector(selectors$G.termsErrorMessage).length > 0) {
          return;
        }

        termsError.innerText = theme.strings.cart_acceptance_error;
        this.cartCheckoutButton.setAttribute(attributes$q.disabled, true);
        termsError.classList.add(classes$v.expanded);
      } else {
        termsError.classList.remove(classes$v.expanded);
        this.cartCheckoutButton.removeAttribute(attributes$q.disabled);
      }
    }

    resetButtonClasses() {
      const buttons = document.querySelectorAll(selectors$G.buttonAddToCart);
      if (buttons) {
        buttons.forEach((button) => {
          if (button.classList.contains(classes$v.loading)) {
            button.classList.remove(classes$v.loading);
            button.classList.add(classes$v.success);

            setTimeout(() => {
              button.removeAttribute(attributes$q.disabled);
              button.classList.remove(classes$v.success);
            }, settings$2.timers.addProductTimeout);
          }
        });
      }
    }

    addLoadingClass() {
      if (this.cartDrawer) {
        this.cartDrawer.classList.add(classes$v.loading);
      } else if (this.itemsWrapper) {
        this.itemsWrapper.classList.add(classes$v.loading);
      }
    }

    removeLoadingClass() {
      if (this.cartDrawer) {
        this.cartDrawer.classList.remove(classes$v.loading);
      } else if (this.itemsWrapper) {
        this.itemsWrapper.classList.remove(classes$v.loading);
      }
    }

    unload() {
      if (this.cartDrawerToggle) {
        this.cartDrawerToggle.removeEventListener('click', this.cartDrawerToggleClickEvent);
      }

      this.cartToggleButtons.forEach((button) => {
        button.removeEventListener('click', this.cartDrawerToggleClickEvent);
      });

      // Close drawers on click outside
      document.removeEventListener('mousedown', this.cartDrawerCloseEvent);

      if (this.collapsible !== null) {
        this.collapsible.onUnload();
      }
    }
  }

  const cartDrawer = {
    onLoad() {
      sections$t[this.id] = new CartDrawer();
    },
    onUnload() {
      if (typeof sections$t[this.id].unload === 'function') {
        sections$t[this.id].unload();
      }
    },
  };
  register('cart-template', cartDrawer);

  const selectors$F = {
    scrollToTop: '[data-scroll-top-button]',
  };
  const classes$u = {
    isVisible: 'is-visible',
  };

  // Scroll to top button
  const scrollTopButton = document.querySelector(selectors$F.scrollToTop);
  if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    });
    document.addEventListener(
      'scroll',
      throttle(() => {
        scrollTopButton.classList.toggle(classes$u.isVisible, window.pageYOffset > window.innerHeight);
      }, 150)
    );
  }

  const selectors$E = {
    details: 'details',
    popdownBody: '[data-popdown-body]',
    popdownClose: '[data-popdown-close]',
    popdownToggle: '[data-popdown-toggle]',
    searchFormInner: '[data-search-form-inner]',
    input: 'input:not([type="hidden"])',
    popularSearchesLink: '[data-popular-searches-link]',
    header: '[data-site-header]',
    nav: '[data-nav]',
    navItemsCompress: '[data-nav-items-compress]',
    navIcons: '[data-nav-icons]',
    mobileMenu: '[data-mobile-menu]',
    predictiveSearch: 'predictive-search',
    searchForm: 'search-form',
  };

  const attributes$p = {
    popdownInHeader: 'data-popdown-in-header',
    popdownInPage: 'data-popdown-in-page',
    searchPerformed: 'data-search-performed',
  };

  const classes$t = {
    searchOpened: 'search-opened',
    headerMenuOpened: 'site-header--menu-opened',
    navCompress: 'nav--compress',
  };

  class SearchPopdown extends HTMLElement {
    constructor() {
      super();
      this.isPopdownInHeader = this.hasAttribute(attributes$p.popdownInHeader);
      this.isPopdownInPage = this.hasAttribute(attributes$p.popdownInPage);
      this.popdownBody = this.querySelector(selectors$E.popdownBody);
      this.popdownClose = this.querySelector(selectors$E.popdownClose);
      this.searchFormInner = this.querySelector(selectors$E.searchFormInner);
      this.popularSearchesLink = this.querySelectorAll(selectors$E.popularSearchesLink);
      this.searchFormWrapper = this.querySelector(selectors$E.searchForm) ? this.querySelector(selectors$E.searchForm) : this.querySelector(selectors$E.predictiveSearch);
      this.predictiveSearch = this.searchFormWrapper.matches(selectors$E.predictiveSearch);
      this.header = document.querySelector(selectors$E.header);
      this.headerSection = this.header?.parentNode;
      this.nav = this.header?.querySelector(selectors$E.nav);
      this.mobileMenu = this.headerSection?.querySelector(selectors$E.mobileMenu);
      this.a11y = a11y;
      this.ensureClosingOnResizeEvent = () => this.ensureClosingOnResize();

      if (this.isPopdownInHeader) {
        this.details = this.querySelector(selectors$E.details);
        this.popdownToggle = this.querySelector(selectors$E.popdownToggle);
      }
    }

    connectedCallback() {
      if (this.isPopdownInHeader) {
        this.details.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
        this.popdownClose.addEventListener('click', () => this.close());
        this.popdownToggle.addEventListener('click', (event) => this.onPopdownToggleClick(event));
        this.popdownToggle.setAttribute('role', 'button');
      }

      if (this.isPopdownInPage) {
        this.popdownClose.addEventListener('click', () => this.triggerPopdownClose());
        this.searchFormWrapper.addEventListener('focusout', () => this.onFocusOut());
        this.searchFormWrapper.input.addEventListener('click', (event) => this.triggerPopdownOpen(event));
      }

      this.searchFormInner.addEventListener('transitionend', (event) => {
        if (event.target === this.searchFormInner && this.details.hasAttribute('open') && this.details.getAttribute('open') == 'false') {
          this.onClose();
        }
      });

      this.popularSearchesLink.forEach((element) => {
        element.addEventListener('click', (event) => {
          event.preventDefault();
          const popularSearchText = event.target.textContent;

          this.searchFormWrapper.input.value = popularSearchText;
          this.searchFormWrapper.submit();
        });
      });
    }

    onPopdownToggleClick(event) {
      event.preventDefault();
      event.target.closest(selectors$E.details).hasAttribute('open') ? this.close() : this.open(event);
    }

    onBodyClick(event) {
      const isTargetInPopdown = this.contains(event.target);
      const isHeaderMenuOpened = this.header?.classList.contains(classes$t.headerMenuOpened);

      if (isHeaderMenuOpened || isTargetInPopdown) return;
      if (!isTargetInPopdown) this.close();
    }

    onFocusOut() {
      if (!this.predictiveSearch) return;

      requestAnimationFrame(() => {
        if (!this.searchFormWrapper.contains(document.activeElement)) {
          this.searchFormWrapper.close();
        }
      });
    }

    triggerPopdownOpen(event) {
      const isSearchPageWithoutTerms = this.closest(`[${attributes$p.searchPerformed}="false"]`);
      const isTouch = matchMedia('(pointer:coarse)').matches;
      const viewportMobile = window.innerWidth < theme.sizes.small;
      const shouldOpenPopdownOnTouchDevice = isTouch || viewportMobile;
      const shouldOpenPopdownOnNoTerms = isSearchPageWithoutTerms != null;

      if (!this.nav || !this.mobileMenu) return;

      if (shouldOpenPopdownOnTouchDevice || shouldOpenPopdownOnNoTerms) {
        event.preventDefault();

        const isNavCompressed = this.nav.classList.contains(classes$t.navCompress);
        let popdownToggle = this.mobileMenu.querySelector(selectors$E.popdownToggle);

        if (!isTouch) {
          popdownToggle = isNavCompressed
            ? this.nav.querySelector(`${selectors$E.navItemsCompress} ${selectors$E.popdownToggle}`)
            : this.nav.querySelector(`${selectors$E.navIcons} ${selectors$E.popdownToggle}`);
        }

        setTimeout(() => {
          popdownToggle?.dispatchEvent(new Event('click', {bubbles: true}));
        }, 300);
      }
    }

    open(event) {
      this.onBodyClickEvent = (event) => this.onBodyClick(event);
      event.target.closest(selectors$E.details).setAttribute('open', '');
      this.searchFormWrapper.input.setAttribute('aria-expanded', true);

      document.body.classList.add(classes$t.searchOpened);
      document.body.addEventListener('click', this.onBodyClickEvent);
      document.addEventListener('theme:resize', this.ensureClosingOnResizeEvent);
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));

      this.a11y.state.trigger = event.target;

      // Safari opening transition fix
      requestAnimationFrame(() => {
        // Firefox opening transition fix (single requestAnimationFrame method does not work everytime)
        requestAnimationFrame(() => {
          event.target.closest(selectors$E.details).setAttribute('open', 'true');
          this.a11y.trapFocus({
            container: this.searchFormInner,
          });
        });
      });
    }

    close() {
      this.a11y.removeTrapFocus();
      this.details.setAttribute('open', 'false');
      if (this.predictiveSearch) this.searchFormWrapper.close();
      this.searchFormWrapper.handleFocusableDescendants(true);
    }

    triggerPopdownClose() {
      if (this.predictiveSearch) this.searchFormWrapper.close();

      if (this.searchFormWrapper.popularSearches) {
        requestAnimationFrame(() => document.activeElement.blur());
      }
    }

    onClose() {
      this.details.removeAttribute('open');
      document.dispatchEvent(new CustomEvent('theme:search:close', {bubbles: true}));
      document.body.classList.remove(classes$t.searchOpened);
      document.body.removeEventListener('click', this.onBodyClickEvent);
      document.removeEventListener('theme:resize', this.ensureClosingOnResizeEvent);
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }

    ensureClosingOnResize() {
      // Due to having multiple <search-popdown> elements in `.mobile-menu`, `.nav--default` or `.nav--compress` parents,
      // the element can become hidden when the browser is resized
      // `transitionend` event is then not fired and the closing methods are not finished properly
      const isElementHiddenFromView = this.offsetParent === null;
      if (!isElementHiddenFromView) return;

      this.onClose();
    }
  }

  customElements.define('search-popdown', SearchPopdown);

  theme.ProductModel = (function () {
    let modelJsonSections = {};
    let models = {};
    let xrButtons = {};

    const selectors = {
      productMediaWrapper: '[data-product-single-media-wrapper]',
      mediaGroup: '[data-product-single-media-group]',
      productXr: '[data-shopify-xr]',
      mediaId: 'data-media-id',
      model3d: 'data-shopify-model3d-id',
      modelViewer: 'model-viewer',
      modelJson: '#ModelJson-',
      deferredMedia: '[data-deferred-media]',
      deferredMediaButton: '[data-deferred-media-button]',
    };
    const classes = {
      isLoading: 'is-loading',
      mediaHidden: 'media--hidden',
    };

    function init(mediaContainer, sectionId) {
      modelJsonSections[sectionId] = {
        loaded: false,
      };

      const deferredMediaButton = mediaContainer.querySelector(selectors.deferredMediaButton);

      if (deferredMediaButton) {
        deferredMediaButton.addEventListener('click', loadContent.bind(this, mediaContainer, sectionId));
      }
    }

    function loadContent(mediaContainer, sectionId) {
      if (mediaContainer.querySelector(selectors.deferredMedia).getAttribute('loaded')) {
        return;
      }

      mediaContainer.classList.add(classes.isLoading);
      const content = document.createElement('div');
      content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
      const modelViewerElement = content.querySelector('model-viewer');
      const deferredMedia = mediaContainer.querySelector(selectors.deferredMedia);
      deferredMedia.appendChild(modelViewerElement);
      deferredMedia.setAttribute('loaded', true);
      const mediaId = mediaContainer.dataset.mediaId;
      const modelId = modelViewerElement.dataset.modelId;
      const xrButton = mediaContainer.closest(selectors.mediaGroup).parentElement.querySelector(selectors.productXr);
      xrButtons[sectionId] = {
        element: xrButton,
        defaultId: modelId,
      };

      models[mediaId] = {
        modelId: modelId,
        mediaId: mediaId,
        sectionId: sectionId,
        container: mediaContainer,
        element: modelViewerElement,
      };

      if (!window.ShopifyXR) {
        window.Shopify.loadFeatures([
          {
            name: 'shopify-xr',
            version: '1.0',
            onLoad: setupShopifyXr,
          },
          {
            name: 'model-viewer-ui',
            version: '1.0',
            onLoad: setupModelViewerUi,
          },
        ]);
      } else {
        setupModelViewerUi();
      }
    }

    function setupShopifyXr(errors) {
      if (errors) {
        console.warn(errors);
        return;
      }
      if (!window.ShopifyXR) {
        document.addEventListener('shopify_xr_initialized', function () {
          setupShopifyXr();
        });
        return;
      }

      for (const sectionId in modelJsonSections) {
        if (modelJsonSections.hasOwnProperty(sectionId)) {
          const modelSection = modelJsonSections[sectionId];

          if (modelSection.loaded) {
            continue;
          }

          const modelJson = document.querySelector(`${selectors.modelJson}${sectionId}`);

          if (modelJson) {
            window.ShopifyXR.addModels(JSON.parse(modelJson.innerHTML));
            modelSection.loaded = true;
          }
        }
      }

      window.ShopifyXR.setupXRElements();
    }

    function setupModelViewerUi(errors) {
      if (errors) {
        console.warn(errors);
        return;
      }

      for (const key in models) {
        if (models.hasOwnProperty(key)) {
          const model = models[key];
          if (!model.modelViewerUi) {
            model.modelViewerUi = new Shopify.ModelViewerUI(model.element);
            setupModelViewerListeners(model);
          }
        }
      }
    }

    function setupModelViewerListeners(model) {
      const xrButton = xrButtons[model.sectionId];
      model.container.addEventListener('theme:media:visible', function () {
        xrButton.element.setAttribute(selectors.model3d, model.modelId);

        if (window.theme.touch) {
          return;
        }

        model.modelViewerUi.play();
        model.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
      });

      model.container.addEventListener('theme:media:hidden', function () {
        model.modelViewerUi.pause();
      });

      model.container.addEventListener('xrLaunch', function () {
        model.modelViewerUi.pause();
      });

      model.element.addEventListener('load', () => {
        xrButton.element.setAttribute(selectors.model3d, model.modelId);
        model.container.classList.remove(classes.isLoading);
        model.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
      });

      model.element.addEventListener('shopify_model_viewer_ui_toggle_play', function () {
        pauseOtherMedia(model.mediaId);
        setTimeout(() => {
          // Timeout to trigger play event after pause events
          model.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
        }, 50);
      });
      model.element.addEventListener('shopify_model_viewer_ui_toggle_pause', function () {
        model.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
      });

      pauseOtherMedia(model.mediaId);
    }

    function pauseOtherMedia(mediaId) {
      const currentMedia = `[${selectors.mediaId}="${mediaId}"]`;
      const otherMedia = document.querySelectorAll(`${selectors.productMediaWrapper}:not(${currentMedia})`);

      if (otherMedia.length) {
        otherMedia.forEach((media) => {
          media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
          media.classList.add(classes.mediaHidden);
        });
      }
    }

    function removeSectionModels(sectionId) {
      for (const key in models) {
        if (models.hasOwnProperty(key)) {
          const model = models[key];
          if (model.sectionId === sectionId) {
            delete models[key];
          }
        }
      }
      delete modelJsonSections[sectionId];
      delete theme.mediaInstances[sectionId];
    }

    return {
      init: init,
      loadContent: loadContent,
      removeSectionModels: removeSectionModels,
    };
  })();

  const selectors$D = {
    rangeSlider: '[data-range-slider]',
    rangeDotLeft: '[data-range-left]',
    rangeDotRight: '[data-range-right]',
    rangeLine: '[data-range-line]',
    rangeHolder: '[data-range-holder]',
    dataMin: 'data-se-min',
    dataMax: 'data-se-max',
    dataMinValue: 'data-se-min-value',
    dataMaxValue: 'data-se-max-value',
    dataStep: 'data-se-step',
    dataFilterUpdate: 'data-range-filter-update',
    priceMin: '[data-field-price-min]',
    priceMax: '[data-field-price-max]',
  };

  const classes$s = {
    isInitialized: 'is-initialized',
  };

  class RangeSlider {
    constructor(container) {
      this.container = container;
      this.init();
      this.initListener = () => this.init();

      document.addEventListener('theme:filters:init', this.initListener);
    }

    init() {
      this.slider = this.container.querySelector(selectors$D.rangeSlider);

      if (!this.slider) {
        return;
      }

      this.resizeFilters = debounce(this.reset.bind(this), 50);

      this.onMoveEvent = (event) => this.onMove(event);
      this.onStopEvent = (event) => this.onStop(event);
      this.onStartEvent = (event) => this.onStart(event);
      this.startX = 0;
      this.x = 0;

      // retrieve touch button
      this.touchLeft = this.slider.querySelector(selectors$D.rangeDotLeft);
      this.touchRight = this.slider.querySelector(selectors$D.rangeDotRight);
      this.lineSpan = this.slider.querySelector(selectors$D.rangeLine);

      // get some properties
      this.min = parseFloat(this.slider.getAttribute(selectors$D.dataMin));
      this.max = parseFloat(this.slider.getAttribute(selectors$D.dataMax));

      this.step = 0.0;

      // normalize flag
      this.normalizeFact = 20;

      // retrieve default values
      let defaultMinValue = this.min;
      if (this.slider.hasAttribute(selectors$D.dataMinValue)) {
        defaultMinValue = parseFloat(this.slider.getAttribute(selectors$D.dataMinValue));
      }
      let defaultMaxValue = this.max;

      if (this.slider.hasAttribute(selectors$D.dataMaxValue)) {
        defaultMaxValue = parseFloat(this.slider.getAttribute(selectors$D.dataMaxValue));
      }

      // check values are correct
      if (defaultMinValue < this.min) {
        defaultMinValue = this.min;
      }

      if (defaultMaxValue > this.max) {
        defaultMaxValue = this.max;
      }

      if (defaultMinValue > defaultMaxValue) {
        defaultMinValue = defaultMaxValue;
      }

      if (this.slider.getAttribute(selectors$D.dataStep)) {
        this.step = Math.abs(parseFloat(this.slider.getAttribute(selectors$D.dataStep)));
      }

      // initial reset
      this.reset();
      window.addEventListener('theme:resize', this.resizeFilters);

      // usefull values, min, max, normalize fact is the width of both touch buttons
      this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
      this.selectedTouch = null;
      this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;

      // set defualt values
      this.setMinValue(defaultMinValue);
      this.setMaxValue(defaultMaxValue);

      // link events
      this.touchLeft.addEventListener('mousedown', this.onStartEvent);
      this.touchRight.addEventListener('mousedown', this.onStartEvent);
      this.touchLeft.addEventListener('touchstart', this.onStartEvent, {passive: true});
      this.touchRight.addEventListener('touchstart', this.onStartEvent, {passive: true});

      // initialize
      this.slider.classList.add(classes$s.isInitialized);
    }

    reset() {
      this.touchLeft.style.left = '0px';
      this.touchRight.style.left = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
      this.lineSpan.style.marginLeft = '0px';
      this.lineSpan.style.width = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
      this.startX = 0;
      this.x = 0;

      this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
      this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;
    }

    setMinValue(minValue) {
      const ratio = (minValue - this.min) / (this.max - this.min);
      this.touchLeft.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact))) + 'px';
      this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
      this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
      this.slider.setAttribute(selectors$D.dataMinValue, minValue);
    }

    setMaxValue(maxValue) {
      const ratio = (maxValue - this.min) / (this.max - this.min);
      this.touchRight.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact)) + this.normalizeFact) + 'px';
      this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
      this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
      this.slider.setAttribute(selectors$D.dataMaxValue, maxValue);
    }

    onStart(event) {
      // Prevent default dragging of selected content
      event.preventDefault();
      let eventTouch = event;

      if (event.touches) {
        eventTouch = event.touches[0];
      }

      if (event.currentTarget === this.touchLeft) {
        this.x = this.touchLeft.offsetLeft;
      } else if (event.currentTarget === this.touchRight) {
        this.x = this.touchRight.offsetLeft;
      }

      this.startX = eventTouch.pageX - this.x;
      this.selectedTouch = event.currentTarget;
      document.addEventListener('mousemove', this.onMoveEvent);
      document.addEventListener('mouseup', this.onStopEvent);
      document.addEventListener('touchmove', this.onMoveEvent, {passive: true});
      document.addEventListener('touchend', this.onStopEvent, {passive: true});
    }

    onMove(event) {
      let eventTouch = event;

      if (event.touches) {
        eventTouch = event.touches[0];
      }

      this.x = eventTouch.pageX - this.startX;

      if (this.selectedTouch === this.touchLeft) {
        if (this.x > this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10) {
          this.x = this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10;
        } else if (this.x < 0) {
          this.x = 0;
        }

        this.selectedTouch.style.left = this.x + 'px';
      } else if (this.selectedTouch === this.touchRight) {
        if (this.x < this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10) {
          this.x = this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10;
        } else if (this.x > this.maxX) {
          this.x = this.maxX;
        }
        this.selectedTouch.style.left = this.x + 'px';
      }

      // update line span
      this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
      this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';

      // write new value
      this.calculateValue();

      // call on change
      if (this.slider.getAttribute('on-change')) {
        const fn = new Function('min, max', this.slider.getAttribute('on-change'));
        fn(this.slider.getAttribute(selectors$D.dataMinValue), this.slider.getAttribute(selectors$D.dataMaxValue));
      }

      this.onChange(this.slider.getAttribute(selectors$D.dataMinValue), this.slider.getAttribute(selectors$D.dataMaxValue));
    }

    onStop(event) {
      document.removeEventListener('mousemove', this.onMoveEvent);
      document.removeEventListener('mouseup', this.onStopEvent);
      document.removeEventListener('touchmove', this.onMoveEvent, {passive: true});
      document.removeEventListener('touchend', this.onStopEvent, {passive: true});

      this.selectedTouch = null;

      // write new value
      this.calculateValue();

      // call did changed
      this.onChanged(this.slider.getAttribute(selectors$D.dataMinValue), this.slider.getAttribute(selectors$D.dataMaxValue));
    }

    onChange(min, max) {
      const rangeHolder = this.slider.closest(selectors$D.rangeHolder);
      if (rangeHolder) {
        const priceMin = rangeHolder.querySelector(selectors$D.priceMin);
        const priceMax = rangeHolder.querySelector(selectors$D.priceMax);

        if (priceMin && priceMax) {
          priceMin.value = parseInt(min);
          priceMax.value = parseInt(max);
        }
      }
    }

    onChanged(min, max) {
      if (this.slider.hasAttribute(selectors$D.dataFilterUpdate)) {
        this.slider.dispatchEvent(new CustomEvent('theme:filter:range-update', {bubbles: true}));
      }
    }

    calculateValue() {
      const newValue = (this.lineSpan.offsetWidth - this.normalizeFact) / this.initialValue;
      let minValue = this.lineSpan.offsetLeft / this.initialValue;
      let maxValue = minValue + newValue;

      minValue = minValue * (this.max - this.min) + this.min;
      maxValue = maxValue * (this.max - this.min) + this.min;

      if (this.step !== 0.0) {
        let multi = Math.floor(minValue / this.step);
        minValue = this.step * multi;

        multi = Math.floor(maxValue / this.step);
        maxValue = this.step * multi;
      }

      if (this.selectedTouch === this.touchLeft) {
        this.slider.setAttribute(selectors$D.dataMinValue, minValue);
      }

      if (this.selectedTouch === this.touchRight) {
        this.slider.setAttribute(selectors$D.dataMaxValue, maxValue);
      }
    }

    unload() {
      document.removeEventListener('theme:filters:init', this.initListener);
      window.removeEventListener('theme:resize', this.resizeFilters);
    }
  }

  const selectors$C = {
    slider: '[data-slider]',
    productMediaContainer: '[data-product-media-container]',
    productMediaSlider: '[data-product-media-slideshow]',
    productMediaSlide: '[data-product-media-slideshow-slide]',
    progressBar: '[data-product-slideshow-progress]',
    flickityButton: '.flickity-button',
    popupProduct: '[data-product]',
    popupClose: '[data-popup-close]',
  };

  const classes$r = {
    fill: 'fill',
    quickViewVisible: 'js-quick-view-visible',
  };

  const sections$s = {};

  class ProductGrid {
    constructor(container) {
      this.container = container;
      this.body = document.body;
      this.sliders = this.container.querySelectorAll(selectors$C.slider);

      if (theme.settings.productGridHover === 'slideshow' && !window.theme.touch) {
        this.productGridSlideshow();
      }

      new QuickViewPopup(this.container);
    }

    /* Product grid slideshow */
    productGridSlideshow() {
      const productMediaSlider = this.container.querySelectorAll(selectors$C.productMediaSlider);
      const linkedImages = this.container.querySelectorAll(selectors$C.productMediaContainer);

      if (productMediaSlider.length) {
        productMediaSlider.forEach((slider) => {
          const mediaContainer = slider.closest(selectors$C.productMediaContainer);
          const progressBar = mediaContainer.querySelector(selectors$C.progressBar);
          const countImages = slider.querySelectorAll(selectors$C.productMediaSlide).length;
          const autoplaySpeed = 2200;
          const draggable = !this.sliders.length; // Enable dragging if only layout is not Carousel
          let flkty = new Flickity.data(slider);
          let timer = 0;
          let cellSelector = selectors$C.productMediaSlide;

          if (!flkty.isActive && countImages > 1) {
            flkty = new Flickity(slider, {
              draggable: draggable,
              cellSelector: cellSelector,
              contain: true,
              wrapAround: true,
              imagesLoaded: true,
              lazyLoad: true,
              pageDots: false,
              prevNextButtons: false,
              adaptiveHeight: false,
              pauseAutoPlayOnHover: false,
              selectedAttraction: 0.2,
              friction: 1,
              on: {
                ready: () => {
                  this.container.style.setProperty('--autoplay-speed', `${autoplaySpeed}ms`);
                },
                change: () => {
                  if (timer) {
                    clearTimeout(timer);
                  }

                  progressBar.classList.remove(classes$r.fill);

                  requestAnimationFrame(() => {
                    progressBar.classList.add(classes$r.fill);
                  });

                  timer = setTimeout(() => {
                    progressBar.classList.remove(classes$r.fill);
                  }, autoplaySpeed);
                },
                dragEnd: () => {
                  flkty.playPlayer();
                },
              },
            });

            if (!window.theme.touch) {
              mediaContainer.addEventListener('mouseenter', () => {
                progressBar.classList.add(classes$r.fill);

                if (timer) {
                  clearTimeout(timer);
                }

                timer = setTimeout(() => {
                  progressBar.classList.remove(classes$r.fill);
                }, autoplaySpeed);

                flkty.options.autoPlay = autoplaySpeed;
                flkty.playPlayer();
              });
              mediaContainer.addEventListener('mouseleave', () => {
                flkty.stopPlayer();
                if (timer) {
                  clearTimeout(timer);
                }
                progressBar.classList.remove(classes$r.fill);
              });
            }
          }
        });
      }

      // Prevent page redirect on slideshow arrow click
      if (linkedImages.length) {
        linkedImages.forEach((item) => {
          item.addEventListener('click', (e) => {
            if (e.target.matches(selectors$C.flickityButton)) {
              e.preventDefault();
            }
          });
        });
      }
    }

    /**
     * Quickview popup close function
     */
    popupClose() {
      const popupProduct = document.querySelector(selectors$C.popupProduct);
      if (popupProduct) {
        const popupClose = popupProduct.querySelector(selectors$C.popupClose);
        popupClose.dispatchEvent(new Event('click'));
      }
    }

    /**
     * Event callback for Theme Editor `section:block:select` event
     */
    onBlockSelect() {
      if (this.body.classList.contains(classes$r.quickViewVisible)) {
        this.popupClose();
      }
    }

    /**
     * Event callback for Theme Editor `section:deselect` event
     */
    onDeselect() {
      if (this.body.classList.contains(classes$r.quickViewVisible)) {
        this.popupClose();
      }
    }

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload() {
      if (this.body.classList.contains(classes$r.quickViewVisible)) {
        this.popupClose();
      }
    }
  }

  const productGrid = {
    onLoad() {
      sections$s[this.id] = new ProductGrid(this.container);
    },
    onBlockSelect() {
      sections$s[this.id].onBlockSelect();
    },
    onDeselect() {
      sections$s[this.id].onDeselect();
    },
    onUnload() {
      sections$s[this.id].onUnload();
    },
  };

  const selectors$B = {
    ajaxinateContainer: '#AjaxinateLoop',
    ajaxinatePagination: '#AjaxinatePagination',
  };

  let sections$r = {};

  class Ajaxify {
    constructor(container) {
      this.container = container;
      this.endlessScroll = null;

      if (theme.settings.enableInfinityScroll) {
        this.init();
      }
    }

    init() {
      this.loadMoreFix();
      this.endlessScroll = new Ajaxinate({
        container: selectors$B.ajaxinateContainer,
        pagination: selectors$B.ajaxinatePagination,
        method: 'scroll',
      });
    }

    loadMoreFix() {
      // Fix ajaxinate in theme editor
      Ajaxinate.prototype.loadMore = function loadMore() {
        this.request = new XMLHttpRequest();

        this.request.onreadystatechange = function success() {
          if (!this.request.responseXML) {
            return;
          }
          if (!this.request.readyState === 4 || !this.request.status === 200) {
            return;
          }

          const newContainer = this.request.responseXML.querySelector(this.settings.container);
          const newPagination = this.request.responseXML.querySelector(this.settings.pagination);

          this.containerElement.insertAdjacentHTML('beforeend', newContainer.innerHTML);

          if (typeof newPagination === 'undefined' || newPagination === null) {
            this.removePaginationElement();
          } else {
            this.paginationElement.innerHTML = newPagination.innerHTML;

            if (this.settings.callback && typeof this.settings.callback === 'function') {
              this.settings.callback(this.request.responseXML);
            }

            this.initialize();
          }
        }.bind(this);

        this.request.open('GET', this.nextPageUrl, true);
        this.request.responseType = 'document';
        this.request.send();
      };
    }

    unload() {
      if (this.endlessScroll) {
        this.endlessScroll.destroy();
      }
    }
  }

  const ajaxify = {
    onLoad() {
      sections$r = new Ajaxify(this.container);
    },
    onUnload: function () {
      if (typeof sections$r.unload === 'function') {
        sections$r.unload();
      }
    },
  };

  const settings$1 = {
    loadingTimeout: 300,
  };

  const selectors$A = {
    buttons: 'button',
    toggleFilters: '[data-toggle-filters]',
    closeFilters: '[data-close-filters]',
    openFilters: '[data-open-filters]',
    collectionWrapper: '[data-collection-wrapper]',
    collapsibleTrigger: '[data-collapsible-trigger]',
    sortToggle: '[data-sort-toggle]',
    collectionSortOptions: '[data-collection-sort-options]',
    inputs: 'input, select, label, textarea',
    inputSort: '[data-input-sort]',
    filters: '[data-collection-filters]',
    filtersWrapper: '[data-collection-filters-wrapper]',
    filtersList: '[data-collection-filters-list]',
    filtersStickyBar: '[data-collection-sticky-bar]',
    filter: '[data-collection-filter]',
    filterTag: '[data-collection-filter-tag]',
    filterTagButton: '[data-collection-filter-tag-button]',
    filtersForm: '[data-collection-filters-form]',
    filterResetButton: '[data-filter-reset-button]',
    filterTagClearButton: '[data-filter-tag-reset-button]',
    popupsSection: '[data-section-type="popups"]',
    productGrid: '[data-collection-products]',
    productsCount: '[data-products-count]',
    priceMin: '[data-field-price-min]',
    priceMax: '[data-field-price-max]',
    rangeMin: '[data-se-min-value]',
    rangeMax: '[data-se-max-value]',
    rangeMinValue: 'data-se-min-value',
    rangeMaxValue: 'data-se-max-value',
    rangeMinDefault: 'data-se-min',
    rangeMaxDefault: 'data-se-max',
    tooltip: '[data-tooltip]',
    showMore: '[data-show-more]',
    showMoreActions: '[data-show-more-actions]',
    showMoreContainer: '[data-show-more-container]',
    showMoreTrigger: '[data-show-more-trigger]',
  };

  const classes$q = {
    isActive: 'is-active',
    isExpanded: 'is-expanded',
    isVisible: 'is-visible',
    isLoading: 'is-loading',
    popupVisible: 'popup--visible',
    collectionFiltersVisible: 'collection__filters--visible',
    collectionSortOptionWrapperVisible: 'collection__sort__option-wrapper--visible',
    hidden: 'is-hidden',
  };

  const attributes$o = {
    filterActive: 'data-filter-active',
    preventScrollLock: 'data-prevent-scroll-lock',
    filtersDefaultState: 'data-filters-default-state',
    tabIndex: 'tabindex',
    ariaExpanded: 'aria-expanded',
  };

  const sections$q = {};

  class Filters {
    constructor(container) {
      this.container = container;
      this.sectionId = container.dataset.sectionId;
      this.enableFilters = container.dataset.enableFilters === 'true';
      this.enableSorting = container.dataset.enableSorting === 'true';
      this.filterMode = container.dataset.filterMode;
      this.collectionHandle = this.container.dataset.collection;
      this.productGrid = this.container.querySelector(selectors$A.productGrid);
      this.productsCount = this.container.querySelector(selectors$A.productsCount);
      this.groupTagFilters = this.container.querySelectorAll(selectors$A.filter);
      this.filters = this.container.querySelector(selectors$A.filters);
      this.filterTriggers = this.container.querySelectorAll(selectors$A.collapsibleTrigger);
      this.filtersStickyBar = this.container.querySelector(selectors$A.filtersStickyBar);
      this.filtersForm = this.container.querySelector(selectors$A.filtersForm);
      this.inputSort = this.container.querySelectorAll(selectors$A.inputSort);
      this.sortToggle = this.container.querySelector(selectors$A.sortToggle);
      this.collectionSortOptions = this.container.querySelector(selectors$A.collectionSortOptions);
      this.a11y = a11y;
      this.filterData = [];
      this.rangeSlider = null;
      this.sortDropdownEvent = () => this.sortDropdownToggle();
      this.onTabHandlerEvent = (event) => this.onTabHandler(event);
      this.updateCollectionFormSortEvent = (event) => this.updateCollectionFormSort(event);
      this.bodyClickEvent = (event) => this.bodyClick(event);
      this.onFilterResetClick = this.onFilterResetClick.bind(this);
      this.onFilterTagResetClick = this.onFilterTagResetClick.bind(this);
      this.onFilterTagClearClick = this.onFilterTagClearClick.bind(this);
      this.onFilterToggleClick = this.onFilterToggleClick.bind(this);
      this.onKeyUpHandler = this.onKeyUpHandler.bind(this);
      this.updateRangeEvent = this.updateRange.bind(this);
      this.debouncedSubmitEvent = debounce((event) => {
        this.onSubmitHandler(event);
      }, 500);
      this.debouncedSortEvent = debounce((event) => {
        this.onSortChange(event);
      }, 500);
      this.productGridEvents = {};

      if (this.filters) {
        this.hideFiltersDrawer = this.hideFiltersDrawer.bind(this);
        this.showFiltersDrawer = this.showFiltersDrawer.bind(this);
        this.resizeEvent = debounce(() => {
          this.filtersResizeEvents();
        }, 500);
        this.filtersResizeEvents();
        document.addEventListener('theme:resize:width', this.resizeEvent);
      }

      this.initTagFilters();
      this.initFacetedFilters();
      this.bindToggleButtonsEvents();
      this.bindFilterButtonsEvents();
      this.initProductGridEvents(theme.settings.enableInfinityScroll);

      makeSwatches(this.container);
      this.collapsible = new Collapsible(this.container);

      // Update css variable for collection sticky bar height
      setVars();

      window.addEventListener('popstate', this.onHistoryChange.bind(this));

      this.sortToggle?.addEventListener('click', this.sortDropdownEvent);

      document.addEventListener('click', this.bodyClickEvent);

      this.filterShowMore();
    }

    /*
     * Init faceted filters
     */
    initFacetedFilters() {
      if (this.filterMode == 'tag' || this.filterMode == 'group' || !this.enableFilters) {
        return;
      }

      this.rangeSlider = new RangeSlider(this.container);
    }

    /*
     * Init tooltips for swatches
     */
    initTooltips() {
      this.tooltips = this.container.querySelectorAll(selectors$A.tooltip);

      if (window.innerWidth < theme.sizes.small) {
        this.tooltips = this.productGrid?.querySelectorAll(selectors$A.tooltip);
      }

      this.tooltips?.forEach((tooltip) => {
        new Tooltip(tooltip);
      });
    }

    /*
     * Price range slider update
     */
    updateRange() {
      const rangeMin = this.filtersForm.querySelector(selectors$A.rangeMin);
      const rangeMax = this.filtersForm.querySelector(selectors$A.rangeMax);
      const priceMin = this.filtersForm.querySelector(selectors$A.priceMin);
      const priceMax = this.filtersForm.querySelector(selectors$A.priceMax);

      if (rangeMin.hasAttribute(selectors$A.rangeMinValue) && rangeMax.hasAttribute(selectors$A.rangeMaxValue)) {
        const priceMinValue = parseFloat(priceMin.placeholder, 10);
        const priceMaxValue = parseFloat(priceMax.placeholder, 10);
        const rangeMinValue = parseFloat(rangeMin.getAttribute(selectors$A.rangeMinValue), 10);
        const rangeMaxValue = parseFloat(rangeMax.getAttribute(selectors$A.rangeMaxValue), 10);

        if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
          priceMin.value = parseInt(rangeMinValue);
          priceMax.value = parseInt(rangeMaxValue);

          this.filtersForm.dispatchEvent(new Event('input', {bubbles: true}));
        }
      }
    }

    /*
     * Render product grid and filters on form submission
     */
    onSubmitHandler(event) {
      event.preventDefault();
      const formData = new FormData(this.filtersForm);
      const searchParams = new URLSearchParams(formData);

      // if submitted price equal to price range min and max remove price parameters
      const rangeMin = this.filtersForm.querySelector(selectors$A.rangeMin);
      const rangeMax = this.filtersForm.querySelector(selectors$A.rangeMax);
      const priceMin = this.filtersForm.querySelector(selectors$A.priceMin);
      const priceMax = this.filtersForm.querySelector(selectors$A.priceMax);
      const checkElements = rangeMin && rangeMax && priceMin && priceMax;

      if (checkElements && rangeMin.hasAttribute(selectors$A.rangeMinDefault) && rangeMax.hasAttribute(selectors$A.rangeMaxDefault)) {
        const rangeMinDefault = parseFloat(rangeMin.getAttribute(selectors$A.rangeMinDefault), 10);
        const rangeMaxDefault = parseFloat(rangeMax.getAttribute(selectors$A.rangeMaxDefault), 10);
        const priceMinValue = !priceMin.value ? rangeMinDefault : parseFloat(priceMin.value, 10);
        const priceMaxValue = !priceMax.value ? rangeMaxDefault : parseFloat(priceMax.value, 10);

        if (priceMinValue <= rangeMinDefault && priceMaxValue >= rangeMaxDefault) {
          searchParams.delete('filter.v.price.gte');
          searchParams.delete('filter.v.price.lte');
        }
      }

      this.renderSection(searchParams.toString(), event);
    }

    /*
     * Call renderSection on history change
     */
    onHistoryChange(event) {
      if (!this.filters) {
        return;
      }

      const searchParams = event.state?.searchParams || '';
      this.renderSection(searchParams, null, false);
    }

    /*
     * Render section on history change or filter/sort change event
     */
    renderSection(searchParams, event, updateURLHash = true) {
      this.startLoading();
      const url = `${window.location.pathname}?section_id=${this.sectionId}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;
      this.filterData.some(filterDataUrl) ? this.renderSectionFromCache(filterDataUrl, event) : this.renderSectionFromFetch(url, event);

      if (updateURLHash) {
        this.updateURLHash(searchParams);
      }
    }

    /*
     * Render section from fetch call
     */
    renderSectionFromFetch(url) {
      fetch(url)
        .then((response) => response.text())
        .then((responseText) => {
          const html = responseText;
          this.filterData = [...this.filterData, {html, url}];
          this.inputSort = this.container.querySelectorAll(selectors$A.inputSort);
          this.renderFilters(html);
          this.bindFilterButtonsEvents();
          this.hideFiltersOnMobile();
          this.renderProductGrid(html);
          this.updateProductsCount(html);
          this.finishLoading();
          this.mobileFiltersScrollLock();
        });
    }

    /*
     * Render section from Cache
     */
    renderSectionFromCache(filterDataUrl, event) {
      const html = this.filterData.find(filterDataUrl).html;
      this.renderFilters(html, event);
      this.hideFiltersOnMobile();
      this.renderProductGrid(html);
      this.updateProductsCount(html);
      this.finishLoading();
      this.mobileFiltersScrollLock();
    }

    /*
     * Render product grid items on fetch call
     */
    renderProductGrid(html) {
      const newProductGrid = new DOMParser().parseFromString(html, 'text/html').querySelector(selectors$A.productGrid);

      if (!newProductGrid) {
        return;
      }

      this.productGrid.innerHTML = newProductGrid.innerHTML;

      this.initProductGridEvents(theme.settings.enableInfinityScroll);
      this.filterShowMore();
    }

    /*
     * Update total number of products on fetch call
     */
    updateProductsCount(html) {
      const newProductsCount = new DOMParser().parseFromString(html, 'text/html').querySelector(selectors$A.productsCount);

      if (!newProductsCount) {
        return;
      }

      this.productsCount.innerHTML = newProductsCount.innerHTML;
    }

    /*
     * Render filters on fetch call
     */
    renderFilters(html) {
      const newFilters = new DOMParser().parseFromString(html, 'text/html').querySelector(selectors$A.filters);

      if (!newFilters) {
        return;
      }

      this.filters.innerHTML = newFilters.innerHTML;
      this.filtersForm = document.querySelector(selectors$A.filtersForm);
      this.bindFilterButtonsEvents();
      this.bindToggleButtonsEvents();
      makeSwatches(this.container);
      this.collapsible = new Collapsible(this.container);

      // Init price range slider
      document.dispatchEvent(new CustomEvent('theme:filters:init', {bubbles: true}));
    }

    /*
     * Update URL when filter/sort is changed
     */
    updateURLHash(searchParams) {
      history.pushState({searchParams}, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
    }

    /*
     * Bind filter buttons events
     */
    bindFilterButtonsEvents() {
      if (this.inputSort.length > 0) {
        this.inputSort.forEach((input) => {
          input.addEventListener('change', this.updateCollectionFormSortEvent);
        });
      }

      if (this.filtersForm) {
        this.filtersForm.addEventListener('input', this.debouncedSubmitEvent.bind(this));

        this.filtersForm.addEventListener('theme:filter:range-update', this.updateRangeEvent);
      }

      if (this.collectionSortOptions) {
        this.collectionSortOptions.addEventListener('keyup', this.onTabHandlerEvent);
      }

      if (this.filterMode == 'tag' || this.filterMode == 'group' || !this.enableFilters) {
        return;
      }

      this.container.querySelectorAll(selectors$A.filterResetButton).forEach((button) => {
        button.addEventListener('click', this.onFilterResetClick, {once: true});
      });
    }

    /*
     * Render products on specific filter click event
     */
    onFilterResetClick(event) {
      event.preventDefault();
      this.renderSection(new URL(event.currentTarget.href).searchParams.toString());
    }

    /*
     * Bind filter title click events to toggle options visibility
     */
    bindToggleButtonsEvents() {
      this.container.querySelectorAll(selectors$A.toggleFilters).forEach((button) => {
        button.addEventListener('click', this.onFilterToggleClick);
      });
      this.container.querySelectorAll(selectors$A.closeFilters).forEach((button) => {
        button.addEventListener('click', this.hideFiltersDrawer);
      });
      this.container.querySelectorAll(selectors$A.openFilters).forEach((button) => {
        button.addEventListener('click', this.showFiltersDrawer);
      });

      this.container.querySelector(selectors$A.collectionWrapper)?.addEventListener('keyup', this.onKeyUpHandler);
    }

    onTabHandler(event) {
      if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
        const newSortValue = event.target.previousElementSibling.value;

        this.filtersForm.querySelectorAll(selectors$A.inputSort).forEach((input) => {
          if (input.checked) {
            input.checked = false;
          }
          if (input.value === newSortValue) {
            input.checked = true;
          }
        });

        this.filtersForm.dispatchEvent(new Event('input', {bubbles: true}));
        event.target.dispatchEvent(new Event('click', {bubbles: true}));
      }
    }

    /*
     * Event handler on user ESC key press
     */
    onKeyUpHandler(event) {
      if (event.code === theme.keyboardKeys.ESCAPE) {
        this.hideFiltersDrawer();
      }
    }

    /*
     * Toggle filter options on title click
     */
    onFilterToggleClick(event) {
      event.preventDefault();
      setVars(); // Update css variables for correct filters drawer height

      const filtersVisible = this.filters.classList.contains(classes$q.collectionFiltersVisible);

      filtersVisible ? this.hideFiltersDrawer() : this.showFiltersDrawer();
    }

    sortDropdownToggle() {
      if (!this.collectionSortOptions) return;

      this.collectionSortOptions.classList.toggle(classes$q.collectionSortOptionWrapperVisible);
    }

    /*
     * Close the sort dropdown on button click outside the dropdown (for desktop)
     */
    bodyClick(event) {
      if (!this.collectionSortOptions) return;

      const isSortBar = this.sortToggle.contains(event.target);
      const isVisible = this.collectionSortOptions.classList.contains(classes$q.collectionSortOptionWrapperVisible);

      if (isVisible && !isSortBar) {
        this.sortDropdownToggle();
      }
    }

    updateCollectionFormSort(event) {
      const target = event.target;
      const newSortValue = target.value;
      const secondarySortBy = target.closest(selectors$A.collectionSortOptions);

      this.container.querySelectorAll(selectors$A.inputSort).forEach((input) => {
        if (input.value === newSortValue) {
          input.checked = true;
        }
      });

      if (secondarySortBy !== null) {
        this.filtersForm.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }

    /*
     * Scroll down and open collection filters if they are hidden
     */
    showFiltersDrawer() {
      const instance = this;

      this.a11y.state.trigger = document.querySelector(selectors$A.toggleFilters);

      // Trap focus
      this.a11y.trapFocus({
        container: instance.filters,
      });

      this.mobileFiltersScrollLock();
    }

    /*
     * Scroll lock activation for filters drawer (on mobile)
     */
    mobileFiltersScrollLock() {
      // Open filters and scroll lock if only they are hidden on lower sized screens
      if (window.innerWidth < theme.sizes.small) {
        const scrollableElement = document.querySelector(selectors$A.filtersList);

        if (!this.filters.classList.contains(classes$q.collectionFiltersVisible)) {
          this.filters.classList.add(classes$q.collectionFiltersVisible);
        }

        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: scrollableElement}));
      }
    }

    /*
     * Hide filter accordion elements on mobile
     */
    hideFiltersOnMobile() {
      const filterTriggers = this.container.querySelectorAll(`${selectors$A.collapsibleTrigger}:not(${selectors$A.showMoreTrigger})`);

      if (window.innerWidth < theme.sizes.small) {
        requestAnimationFrame(() => {
          filterTriggers.forEach((element) => {
            const isFilterActive = element.getAttribute(attributes$o.filterActive) === 'true';

            if (element.classList.contains(classes$q.isExpanded) && !isFilterActive) {
              element.dispatchEvent(new Event('click'));
            }
          });
        });
      }
    }

    /*
     * Show filter accordion elements on desktop if they should be opened by default
     */
    showFiltersOnDesktop() {
      const filterTriggers = this.container.querySelectorAll(`${selectors$A.collapsibleTrigger}:not(${selectors$A.showMoreTrigger})`);

      // "Default filter layout" states
      const filtersDefaultState = this.container.getAttribute(attributes$o.filtersDefaultState);
      const openFirstFilterOnly = filtersDefaultState === 'first-open';
      const openAllFilters = filtersDefaultState === 'open';
      const closeAllFilters = filtersDefaultState === 'closed';
      // When sorting is enabled the first `${filterTrigger}` element on mobile is a 'Sort by' button
      const firstTriggerIndex = this.enableSorting ? 1 : 0;

      filterTriggers.forEach((element, index) => {
        const isCurrentFilterExpanded = element.classList.contains(classes$q.isExpanded);
        const isCurrentFilterActive = element.getAttribute(attributes$o.filterActive) === 'true';
        // 'first-open' state conditions
        const isFirstClosed = !isCurrentFilterExpanded && index === firstTriggerIndex;
        const allElseExpanded = isCurrentFilterExpanded && index !== firstTriggerIndex;
        const shouldOpenFirst = openFirstFilterOnly && isFirstClosed;
        const shouldCloseAllExceptFirst = openFirstFilterOnly && allElseExpanded;
        // 'open' state conditions
        const shouldOpenAllClosedOnes = openAllFilters && !isCurrentFilterExpanded;
        const shouldOpenActiveOnes = isCurrentFilterActive && !isCurrentFilterExpanded && openAllFilters;
        // 'close' state conditions
        const shouldCloseExpandedOnes = closeAllFilters && isCurrentFilterExpanded;

        if (isCurrentFilterActive && !shouldOpenActiveOnes) return;

        if (shouldCloseExpandedOnes || shouldOpenFirst || shouldCloseAllExceptFirst || shouldOpenAllClosedOnes || shouldOpenActiveOnes) {
          element.dispatchEvent(new Event('click'));
        }
      });
    }

    /*
     * Hide filters drawer
     */
    hideFiltersDrawer() {
      let filtersVisible = this.filters.classList.contains(classes$q.collectionFiltersVisible);
      let loading = this.container.classList.contains(classes$q.isLoading);

      if (filtersVisible) {
        this.filters.classList.remove(classes$q.collectionFiltersVisible);
        this.a11y.removeTrapFocus();
      }

      // Enable page scroll if no loading state
      if (!loading) {
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: settings$1.loadingTimeout}));
      }
    }

    /*
     * Hiding the filters drawer on desktop & hiding the filters on mobile (showing only filter title)
     */
    filtersResizeEvents() {
      if (window.innerWidth >= theme.sizes.small) {
        this.showFiltersOnDesktop();
        this.hideFiltersDrawer();
      } else {
        this.hideFiltersOnMobile();
      }
    }

    /*
     * Show more functionality
     */
    filterShowMore() {
      this.showMore = this.container.querySelectorAll(selectors$A.showMore);
      if (this.showMore.length === 0) return;

      this.showMore.forEach((element) => {
        const filterCollapsibleTrigger = element.querySelector(selectors$A.collapsibleTrigger);
        const showMoreActions = element.querySelector(selectors$A.showMoreActions);

        if (!showMoreActions) return;

        const showMoreTrigger = showMoreActions.querySelector(selectors$A.showMoreTrigger);
        const showMoreContainer = showMoreActions.querySelector(selectors$A.showMoreContainer);
        const focusable = showMoreContainer.querySelectorAll(window.theme.focusable);
        const isShowMoreContainerExpanded = showMoreContainer.getAttribute(attributes$o.ariaExpanded) === 'true';

        if (!isShowMoreContainerExpanded) {
          focusable.forEach((item) => {
            item.setAttribute(attributes$o.tabIndex, '-1');
          });
        }

        showMoreTrigger.addEventListener('keyup', (event) => {
          if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
            this.updateShowMoreFocusableElements(event, focusable);
          }
        });
        showMoreTrigger.addEventListener('click', (event) => {
          this.updateShowMoreFocusableElements(event, focusable);
        });

        filterCollapsibleTrigger.addEventListener('keyup', (event) => {
          if (event.code === theme.keyboardKeys.SPACE || event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER) {
            this.updateCollapsedContainerFocusableElements(filterCollapsibleTrigger, showMoreTrigger, focusable);
          }
        });
        filterCollapsibleTrigger.addEventListener('click', () => {
          this.updateCollapsedContainerFocusableElements(filterCollapsibleTrigger, showMoreTrigger, focusable);
        });
      });
    }

    /*
     * A11y: Update tabindex for all focusable elements in show-more collapsible containers,
     * on opening and closing events of their parent collapsible container
     * Solves wrongful tabbing in cases where a collapsible content is opened,
     * but it is located in another parent collapsible container that is closed
     */
    updateCollapsedContainerFocusableElements(filterCollapsibleTrigger, showMoreTrigger, focusable) {
      requestAnimationFrame(() => {
        const isFilterExpanded = filterCollapsibleTrigger.getAttribute(attributes$o.ariaExpanded) === 'true';
        const isShowMoreExpanded = showMoreTrigger.getAttribute(attributes$o.ariaExpanded) === 'true';

        focusable.forEach((item) => {
          if (!isFilterExpanded && isShowMoreExpanded) {
            item.setAttribute(attributes$o.tabIndex, '-1');
          }

          if (isFilterExpanded && isShowMoreExpanded) {
            item.removeAttribute(attributes$o.tabIndex);
          }
        });
      });
    }

    /*
     * A11y: Update tabindex for all focusable elements in show-more collapsible containers on opening and closing events
     * Double requestAnimationFrame method is used to make sure the collapsible content has already been expanded
     */
    updateShowMoreFocusableElements(event, focusable) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const isExpanded = event.target.getAttribute(attributes$o.ariaExpanded) === 'true';

          focusable.forEach((item, index) => {
            if (isExpanded) {
              item.removeAttribute(attributes$o.tabIndex);

              if (index === 0) item.focus();
              return;
            }
            item.setAttribute(attributes$o.tabIndex, '-1');
          });
        });
      });
    }

    /*
     * Init functions required when "Filter by tag/group" is selected from Collection page -> Collection pages -> Filter mode
     */
    initTagFilters() {
      if ((this.filterMode != 'tag' && this.filterMode != 'group') || !this.enableFilters) {
        return;
      }

      this.tags = this.container.dataset.tags.split('+').filter((item) => item);
      this.bindFilterTagButtonsEvents();
      this.bindSortChangeEvent();
    }

    /*
     * Render products when tag filter is selected
     */
    renderTagFiltersProducts(url) {
      this.startLoading();

      if (typeof this.endlessCollection === 'object') {
        this.endlessCollection.unload();
      }

      fetch(url)
        .then((response) => response.text())
        .then((responseText) => {
          const html = responseText;
          const parsedData = new DOMParser().parseFromString(html, 'text/html');
          const productsHTML = parsedData.querySelector(selectors$A.productGrid).innerHTML;
          const filtersHTML = parsedData.querySelector(selectors$A.filters).innerHTML;

          this.productGrid.innerHTML = productsHTML;
          this.filters.innerHTML = filtersHTML;
          this.inputSort = this.container.querySelectorAll(selectors$A.inputSort);
          this.filtersForm = document.querySelector(selectors$A.filtersForm);
          this.filterData = [...this.filterData, {html, url}];
          this.alreadyClicked = false;

          this.bindFilterTagButtonsEvents();
          this.bindFilterButtonsEvents();
          this.bindSortChangeEvent();
          this.bindToggleButtonsEvents();
          this.initProductGridEvents(theme.settings.enableInfinityScroll);
          this.updateProductsCount(html);
          this.mobileFiltersScrollLock();
          this.hideFiltersOnMobile();
          makeSwatches(this.container);
          this.collapsible = new Collapsible(this.container);
          this.filterShowMore();

          // Update page URL if supported by the browser
          if (history.replaceState) {
            window.history.pushState({path: url}, '', url);
          }
        })
        .catch((error) => {
          this.finishLoading();
          console.log(`Error: ${error}`);
        });
    }

    /*
     * Bind Filter by tag buttons
     */
    bindFilterTagButtonsEvents() {
      this.container.querySelectorAll(selectors$A.filterTagButton).forEach((button) => {
        button.addEventListener('click', this.onFilterTagButtonClick.bind(this));
      });

      this.container.querySelectorAll(selectors$A.filterTagClearButton).forEach((button) => {
        button.addEventListener('click', this.onFilterTagClearClick);
      });

      this.container.querySelectorAll(selectors$A.filterResetButton).forEach((button) => {
        button.addEventListener('click', this.onFilterTagResetClick);
      });
    }

    /*
     * Bind input Sort by change event for "filters by tag/group" only
     */
    bindSortChangeEvent() {
      this.container.querySelectorAll(selectors$A.inputSort).forEach((input) => {
        input.addEventListener('input', this.debouncedSortEvent.bind(this));
      });
    }

    /*
     * Filter by tag buttons click event
     */
    onFilterTagButtonClick(event) {
      event.preventDefault();
      if (this.alreadyClicked) {
        return;
      }
      this.alreadyClicked = true;
      const button = event.currentTarget;
      const selectedTag = button.dataset.tag;
      let isTagSelected = button.parentNode.classList.contains(classes$q.isActive);

      if (isTagSelected) {
        let tagIndex = this.tags.indexOf(selectedTag);

        button.parentNode.classList.remove(classes$q.isActive);

        if (tagIndex > -1) {
          this.tags.splice(tagIndex, 1);
        }
      } else {
        button.parentNode.classList.add(classes$q.isActive);

        this.tags.push(selectedTag);
      }

      let url = this.collectionHandle + '/' + this.tags.join('+') + '?sort_by=' + this.getSortValue();

      // Close filters dropdown on tag select
      this.container.querySelector(selectors$A.filter).classList.remove(classes$q.isExpanded);
      this.container.querySelector(selectors$A.filter).setAttribute(attributes$o.ariaExpanded, false);
      this.container.setAttribute('data-tags', '[' + this.tags + ']');
      this.renderTagFiltersProducts(url);
    }

    /*
     * Remove a specific tag filter
     */
    onFilterTagClearClick(event) {
      event.preventDefault();
      if (this.alreadyClicked) {
        return;
      }
      this.alreadyClicked = true;
      const button = event.currentTarget;
      const selectedTag = button.dataset.tag;
      const tagIndex = this.tags.indexOf(selectedTag);

      if (tagIndex > -1) {
        this.tags.splice(tagIndex, 1);
      }
      const url = this.collectionHandle + '/' + this.tags.join('+') + '?sort_by=' + this.getSortValue();

      this.container.setAttribute('data-tags', '[' + this.tags + ']');
      this.renderTagFiltersProducts(url);
    }

    /*
     * Re-render products with the new sort option selected
     */
    onSortChange() {
      let url = this.collectionHandle + '/' + this.tags.join('+') + '?sort_by=' + this.getSortValue();

      this.renderTagFiltersProducts(url);
    }

    /*
     * Get the selected sort option value
     */
    getSortValue() {
      let sortValue = '';
      this.inputSort.forEach((input) => {
        if (input.checked) {
          sortValue = input.value;
        }
      });

      return sortValue;
    }

    /*
     * Filter by tag reset button click event
     */
    onFilterTagResetClick(event) {
      event?.preventDefault();

      if (this.alreadyClicked) {
        return;
      }
      this.alreadyClicked = true;

      this.container.querySelectorAll(selectors$A.filterTag).forEach((element) => {
        element.classList.remove(classes$q.isActive);
      });

      this.container.querySelectorAll(selectors$A.filter).forEach((element) => {
        element.classList.remove(classes$q.isExpanded);
        element.setAttribute(attributes$o.ariaExpanded, false);
      });

      // Reset saved tags
      this.tags = [];
      this.container.setAttribute('data-tags', '');

      let url = this.collectionHandle + '/?sort_by=' + this.getSortValue();

      this.renderTagFiltersProducts(url);
    }

    /*
     * Get products container top position
     */
    getProductsOffsetTop() {
      return this.productGrid.getBoundingClientRect().top - document.body.getBoundingClientRect().top - this.filtersStickyBar.offsetHeight;
    }

    /*
     * Get collection page sticky bar top position
     */
    getStickyBarOffsetTop() {
      return this.filtersStickyBar.getBoundingClientRect().top - document.body.getBoundingClientRect().top;
    }

    /*
     * Init all the events required on product grid items
     */
    initProductGridEvents(infinityScroll) {
      this.productGridEvents = new ProductGrid(this.container);

      this.initTooltips();

      if (infinityScroll) {
        this.initInfinityScroll();
        return;
      }

      // Stop loading animation
      setTimeout(() => {
        this.finishLoading();
      }, settings$1.loadingTimeout * 1.5);
    }

    /*
     * Init Infinity scroll functionality
     */
    initInfinityScroll() {
      if (typeof this.endlessCollection === 'object') {
        this.endlessCollection.unload();
      }
      this.endlessCollection = new Ajaxify(this.container);

      this.endlessCollection.endlessScroll.settings.callback = () => {
        this.initProductGridEvents(false);
      };
    }

    /*
     * Show loading animation and lock body scroll
     */
    startLoading() {
      this.container.classList.add(classes$q.isLoading);

      if (window.innerWidth >= theme.sizes.small) {
        document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
      }

      let productsTop = this.getProductsOffsetTop();

      window.scrollTo({
        top: productsTop,
        left: 0,
        behavior: 'smooth',
      });
    }

    /*
     * Hide loading animation and unlock body scroll
     */
    finishLoading() {
      const popups = document.querySelectorAll(`${selectors$A.popupsSection} .${classes$q.popupVisible}`);
      const isPopupActive = popups.length > 0;

      this.container.classList.remove(classes$q.isLoading);

      // Unlock the scroll unless there is a visible popup or there are only popups of types 'bar' and 'cookie'
      if (isPopupActive) {
        let preventScrollPopupsCount = 0;
        [...popups].forEach((popup) => {
          if (popup.hasAttribute(attributes$o.preventScrollLock)) {
            preventScrollPopupsCount += 1;
          }
        });

        if (preventScrollPopupsCount === popups.length) {
          document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: settings$1.loadingTimeout}));
        }
      } else if (window.innerWidth >= theme.sizes.small) {
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true, detail: settings$1.loadingTimeout}));
      }
    }

    /*
     * On block:deselect event
     */
    onDeselect() {
      if (this.productGridEvents) {
        this.productGridEvents.onDeselect();
      }
    }

    /*
     * On section:unload event
     */
    onUnload() {
      if (typeof this.endlessCollection === 'object') {
        this.endlessCollection.unload();
      }

      if (this.productGridEvents) {
        this.productGridEvents.onUnload();
      }

      if (this.collapsible) {
        this.collapsible.onUnload();
      }

      if (this.rangeSlider) {
        this.rangeSlider.unload();
      }

      if (this.filters) {
        document.removeEventListener('theme:resize:width', this.resizeEvent);
      }
      document.removeEventListener('click', this.bodyClickEvent);

      if (this.groupTagFilters.length > 0) {
        this.onFilterTagResetClick();
      }
    }
  }

  const filters = {
    onLoad() {
      sections$q[this.id] = new Filters(this.container);
    },
    onDeselect() {
      sections$q[this.id].onDeselect();
    },
    onUnload() {
      sections$q[this.id].onUnload();
    },
  };

  register('collection-template', filters);

  const selectors$z = {
    templateAddresses: '.template-customers-addresses',
    accountForm: '[data-form]',
    addressNewForm: '[data-form-new]',
    btnNew: '[data-button-new]',
    btnEdit: '[data-button-edit]',
    btnDelete: '[data-button-delete]',
    btnCancel: '[data-button-cancel]',
    editAddress: 'data-form-edit',
    addressCountryNew: 'AddressCountryNew',
    addressProvinceNew: 'AddressProvinceNew',
    addressProvinceContainerNew: 'AddressProvinceContainerNew',
    addressCountryOption: '[data-country-option]',
    addressCountry: 'AddressCountry',
    addressProvince: 'AddressProvince',
    addressProvinceContainer: 'AddressProvinceContainer',
    requiredInputs: 'input[type="text"]:not(.optional)',
  };

  const attributes$n = {
    dataFormId: 'data-form-id',
  };

  const classes$p = {
    hidden: 'is-hidden',
    validation: 'validation--showup',
  };

  class Addresses {
    constructor(section) {
      this.section = section;
      this.addressNewForm = this.section.querySelector(selectors$z.addressNewForm);
      this.accountForms = this.section.querySelectorAll(selectors$z.accountForm);

      this.init();
      this.validate();
    }

    init() {
      if (this.addressNewForm) {
        const section = this.section;
        const newAddressForm = this.addressNewForm;
        this.customerAddresses();

        const newButtons = section.querySelectorAll(selectors$z.btnNew);
        if (newButtons.length) {
          newButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
              e.preventDefault();
              button.classList.add(classes$p.hidden);
              newAddressForm.classList.remove(classes$p.hidden);
            });
          });
        }

        const editButtons = section.querySelectorAll(selectors$z.btnEdit);
        if (editButtons.length) {
          editButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
              e.preventDefault();
              const formId = this.getAttribute(attributes$n.dataFormId);
              section.querySelector(`[${selectors$z.editAddress}="${formId}"]`).classList.toggle(classes$p.hidden);
            });
          });
        }

        const deleteButtons = section.querySelectorAll(selectors$z.btnDelete);
        if (deleteButtons.length) {
          deleteButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
              e.preventDefault();
              const formId = this.getAttribute(attributes$n.dataFormId);
              if (confirm(theme.strings.delete_confirm)) {
                Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
              }
            });
          });
        }

        const cancelButtons = section.querySelectorAll(selectors$z.btnCancel);
        if (cancelButtons.length) {
          cancelButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
              e.preventDefault();
              this.closest(selectors$z.accountForm).classList.add(classes$p.hidden);
              document.querySelector(selectors$z.btnNew).classList.remove(classes$p.hidden);
            });
          });
        }
      }
    }

    customerAddresses() {
      // Initialize observers on address selectors, defined in shopify_common.js
      if (Shopify.CountryProvinceSelector) {
        new Shopify.CountryProvinceSelector(selectors$z.addressCountryNew, selectors$z.addressProvinceNew, {
          hideElement: selectors$z.addressProvinceContainerNew,
        });
      }

      // Initialize each edit form's country/province selector
      const countryOptions = this.section.querySelectorAll(selectors$z.addressCountryOption);
      countryOptions.forEach((element) => {
        const formId = element.getAttribute(attributes$n.dataFormId);
        const countrySelector = `${selectors$z.addressCountry}_${formId}`;
        const provinceSelector = `${selectors$z.addressProvince}_${formId}`;
        const containerSelector = `${selectors$z.addressProvinceContainer}_${formId}`;

        new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
          hideElement: containerSelector,
        });
      });
    }

    validate() {
      this.accountForms.forEach((accountForm) => {
        const form = accountForm.querySelector('form');
        const inputs = form.querySelectorAll(selectors$z.requiredInputs);

        form.addEventListener('submit', (event) => {
          let isEmpty = false;

          // Display notification if input is empty
          inputs.forEach((input) => {
            if (!input.value) {
              input.nextElementSibling.classList.add(classes$p.validation);
              isEmpty = true;
            } else {
              input.nextElementSibling.classList.remove(classes$p.validation);
            }
          });

          if (isEmpty) {
            event.preventDefault();
          }
        });
      });
    }
  }

  const template = document.querySelector(selectors$z.templateAddresses);
  if (template) {
    new Addresses(template);
  }

  const selectors$y = {
    form: '[data-account-form]',
    showReset: '[data-show-reset]',
    hideReset: '[data-hide-reset]',
    recover: '[data-recover-password]',
    login: '[data-login-form]',
    recoverSuccess: '[data-recover-success]',
    recoverSuccessText: '[data-recover-success-text]',
    recoverHash: '#recover',
  };

  const classes$o = {
    hidden: 'is-hidden',
  };

  class Login {
    constructor(form) {
      this.form = form;
      this.showButton = form.querySelector(selectors$y.showReset);
      this.hideButton = form.querySelector(selectors$y.hideReset);
      this.recover = form.querySelector(selectors$y.recover);
      this.login = form.querySelector(selectors$y.login);
      this.success = form.querySelector(selectors$y.recoverSuccess);
      this.successText = form.querySelector(selectors$y.recoverSuccessText);
      this.init();
    }

    init() {
      if (window.location.hash == selectors$y.recoverHash) {
        this.showRecoverPasswordForm();
      } else {
        this.hideRecoverPasswordForm();
      }

      if (this.success) {
        this.successText.classList.remove(classes$o.hidden);
      }

      this.showButton.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          this.showRecoverPasswordForm();
        },
        false
      );
      this.hideButton.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          this.hideRecoverPasswordForm();
        },
        false
      );
    }

    showRecoverPasswordForm() {
      this.recover.classList.remove(classes$o.hidden);
      this.login.classList.add(classes$o.hidden);
      window.location.hash = selectors$y.recoverHash;
      return false;
    }

    hideRecoverPasswordForm() {
      this.login.classList.remove(classes$o.hidden);
      this.recover.classList.add(classes$o.hidden);
      window.location.hash = '';
      return false;
    }
  }

  const loginForm = document.querySelector(selectors$y.form);
  if (loginForm) {
    new Login(loginForm);
  }

  register('search-template', filters);

  const selectors$x = {
    frame: '[data-ticker-frame]',
    scale: '[data-ticker-scale]',
    text: '[data-ticker-text]',
    clone: 'data-clone',
  };

  const attributes$m = {
    speed: 'data-marquee-speed',
  };

  const classes$n = {
    animationClass: 'ticker--animated',
    unloadedClass: 'ticker--unloaded',
    comparitorClass: 'ticker__comparitor',
  };

  const settings = {
    moveTime: 1.63, // 100px going to move for 1.63s
    space: 100, // 100px
  };

  class Ticker {
    constructor(el, stopClone = false) {
      this.frame = el;
      this.stopClone = stopClone;
      this.scale = this.frame.querySelector(selectors$x.scale);
      this.text = this.frame.querySelector(selectors$x.text);

      this.comparitor = this.text.cloneNode(true);
      this.comparitor.classList.add(classes$n.comparitorClass);
      this.frame.appendChild(this.comparitor);
      this.scale.classList.remove(classes$n.unloadedClass);
      this.resizeEvent = debounce(() => this.checkWidth(), 100);
      this.listen();
    }

    listen() {
      document.addEventListener('theme:resize:width', this.resizeEvent);
      this.checkWidth();
    }

    checkWidth() {
      const padding = window.getComputedStyle(this.frame).paddingLeft.replace('px', '') * 2;

      if (this.frame.clientWidth - padding < this.comparitor.clientWidth || this.stopClone) {
        this.text.classList.add(classes$n.animationClass);
        if (this.scale.childElementCount === 1) {
          this.clone = this.text.cloneNode(true);
          this.clone.setAttribute(selectors$x.clone, '');
          this.scale.appendChild(this.clone);

          if (this.stopClone) {
            for (let index = 0; index < 10; index++) {
              const cloneSecond = this.text.cloneNode(true);
              cloneSecond.setAttribute(selectors$x.clone, '');
              this.scale.appendChild(cloneSecond);
            }
          }

          let frameSpeed = this.frame.getAttribute(attributes$m.speed);
          if (frameSpeed === null) {
            frameSpeed = 100;
          }
          const speed = settings.moveTime * (100 / parseInt(frameSpeed, 10));
          const animationTimeFrame = (this.text.clientWidth / settings.space) * speed;

          this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);
        }
      } else {
        this.text.classList.add(classes$n.animationClass);
        let clone = this.scale.querySelector(`[${selectors$x.clone}]`);
        if (clone) {
          this.scale.removeChild(clone);
        }
        this.text.classList.remove(classes$n.animationClass);
      }
    }

    unload() {
      document.removeEventListener('theme:resize:width', this.resizeEvent);
    }
  }

  const selectors$w = {
    bar: '[data-bar]',
    barSlide: '[data-slide]',
    topBarSlide: '[data-top-bar-slide]',
    frame: '[data-ticker-frame]',
    slider: '[data-slider]',
    tickerScale: '[data-ticker-scale]',
    tickerText: '[data-ticker-text]',
  };

  const attributes$l = {
    slide: 'data-slide',
    speed: 'data-slider-speed',
    stop: 'data-stop',
    style: 'style',
    dataTargetReferrer: 'data-target-referrer',
  };

  const classes$m = {
    desktop: 'desktop',
    mobile: 'mobile',
    tickerAnimated: 'ticker--animated',
  };

  const sections$p = {};

  class AnnouncementBar {
    constructor(container) {
      this.barHolder = container;
      this.locationPath = location.href;
      this.slides = this.barHolder.querySelectorAll(selectors$w.barSlide);
      this.slider = this.barHolder.querySelector(selectors$w.slider);
      this.flkty = null;

      this.init();
    }

    init() {
      this.removeAnnouncement();

      if (this.slider) {
        this.initSlider();
        document.addEventListener('theme:resize:width', this.initSlider.bind(this));
      }

      if (!this.slider) {
        this.initTickers(true);
        this.tickerAnimationPause();
      }
    }

    /**
     * Delete announcement which has a target referrer attribute and it is not contained in page URL
     */
    removeAnnouncement() {
      for (let i = 0; i < this.slides.length; i++) {
        const element = this.slides[i];

        if (!element.hasAttribute(attributes$l.dataTargetReferrer)) {
          continue;
        }

        if (this.locationPath.indexOf(element.getAttribute(attributes$l.dataTargetReferrer)) === -1 && !window.Shopify.designMode) {
          element.parentNode.removeChild(element);
        }
      }
    }

    /**
     * Init slider
     */
    initSlider() {
      const slides = this.slider.querySelectorAll(selectors$w.barSlide);

      if (slides) {
        let slideSelector = `${selectors$w.barSlide}`;

        if (window.innerWidth < theme.sizes.small) {
          slideSelector = `${selectors$w.barSlide}:not(.${classes$m.desktop})`;
        } else {
          slideSelector = `${selectors$w.barSlide}:not(.${classes$m.mobile})`;
        }

        if (this.flkty != null) {
          this.flkty.destroy();
        }

        this.flkty = new Flickity(this.slider, {
          cellSelector: slideSelector,
          pageDots: false,
          prevNextButtons: false,
          wrapAround: true,
          autoPlay: parseInt(this.slider.getAttribute(attributes$l.speed), 10),
          on: {
            ready: () => {
              setTimeout(() => {
                this.slider.dispatchEvent(
                  new CustomEvent('slider-is-loaded', {
                    bubbles: true,
                    detail: {
                      slider: this,
                    },
                  })
                );
              }, 10);
            },
          },
        });
        this.flkty.reposition();
      }

      this.slider.addEventListener('slider-is-loaded', () => {
        this.initTickers();
      });
    }

    /**
     * Init tickers in sliders
     */
    initTickers(stopClone = false) {
      const frames = this.barHolder.querySelectorAll(selectors$w.frame);

      frames.forEach((element) => {
        new Ticker(element, stopClone);

        const slides = element.querySelectorAll(selectors$w.barSlide);
        if (slides.length !== 0) {
          const slidesMobile = element.querySelectorAll(`${selectors$w.barSlide}.${classes$m.mobile}`);
          const slidesDesktop = element.querySelectorAll(`${selectors$w.barSlide}.${classes$m.desktop}`);

          if (slides.length === slidesMobile.length) {
            element.parentNode.classList.add(classes$m.mobile);
          } else if (slides.length === slidesDesktop.length) {
            element.parentNode.classList.add(classes$m.desktop);
          }
        }
      });
    }

    toggleTicker(e, isStoped) {
      const tickerScale = e.target.closest(selectors$w.tickerScale);
      const element = document.querySelector(`[${attributes$l.slide}="${e.detail.blockId}"]`);

      if (isStoped && element) {
        tickerScale.setAttribute(attributes$l.stop, '');
        tickerScale.querySelectorAll(selectors$w.tickerText).forEach((textHolder) => {
          textHolder.classList.remove(classes$m.tickerAnimated);
          textHolder.style.transform = `translate3d(${-(element.offsetLeft - parseInt(getComputedStyle(element).marginLeft, 10))}px, 0, 0)`;
        });
      }

      if (!isStoped && element) {
        tickerScale.querySelectorAll(selectors$w.tickerText).forEach((textHolder) => {
          textHolder.classList.add(classes$m.tickerAnimated);
          textHolder.removeAttribute(attributes$l.style);
        });
        tickerScale.removeAttribute(attributes$l.stop);
      }
    }

    tickerAnimationPause() {
      let hoverTimer = 0;
      let isHovered = false;
      const tickerContainer = this.barHolder.querySelector(selectors$w.topBarSlide);

      tickerContainer.addEventListener('mouseenter', () => {
        isHovered = true;

        hoverTimer = setTimeout(() => {
          if (isHovered) {
            tickerContainer.querySelectorAll(selectors$w.tickerText).forEach((element) => {
              element.style.animationPlayState = 'paused';
            });
          }

          clearTimeout(hoverTimer);
        }, 500);
      });

      tickerContainer.addEventListener('mouseleave', () => {
        isHovered = false;

        tickerContainer.querySelectorAll(selectors$w.tickerText).forEach((element) => {
          element.style.animationPlayState = 'running';
        });
      });
    }

    onBlockSelect(evt) {
      const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

      if (this.slider && this.flkty !== null) {
        this.flkty.select(index);
        this.flkty.pausePlayer();
      }
      if (!this.slider) {
        this.toggleTicker(evt, true);
      }
    }

    onBlockDeselect(evt) {
      if (this.slider && this.flkty !== null) {
        this.flkty.unpausePlayer();
      }
      if (!this.slider) {
        this.toggleTicker(evt, false);
      }
    }

    onUnload() {
      document.removeEventListener('theme:resize:width', this.initSlider.bind(this));
    }
  }

  const bar = {
    onLoad() {
      sections$p[this.id] = [];
      const element = this.container.querySelector(selectors$w.bar);
      if (element) {
        sections$p[this.id].push(new AnnouncementBar(element));
      }
    },
    onBlockSelect(e) {
      if (sections$p[this.id].length) {
        sections$p[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockSelect(e);
          }
        });
      }
    },
    onBlockDeselect(e) {
      if (sections$p[this.id].length) {
        sections$p[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockDeselect(e);
          }
        });
      }
    },
  };

  register('announcement-bar', bar);
  register('marquee', bar);

  const selectors$v = {
    trigger: '[data-collapsible-trigger]',
  };

  const classes$l = {
    isExpanded: 'is-expanded',
  };

  const accordionSection = {
    onBlockSelect(e) {
      const trigger = e.target.querySelector(selectors$v.trigger);
      requestAnimationFrame(() => {
        if (!trigger.classList.contains(classes$l.isExpanded)) {
          trigger.dispatchEvent(new Event('click'));
        }
      });
    },
  };

  register('accordions', [accordionSection, collapsible]);

  const selectors$u = {
    button: '[data-share-button]',
    tooltip: '[data-share-button-tooltip]',
  };

  const classes$k = {
    visible: 'is-visible',
    hiding: 'is-hiding',
  };

  const sections$o = {};

  class ShareButton {
    constructor(container) {
      this.container = container;
      this.button = this.container.querySelector(selectors$u.button);
      this.tooltip = this.container.querySelector(selectors$u.tooltip);
      this.transitionSpeed = 200;
      this.hideTransitionTimeout = 0;
      this.init();
    }

    init() {
      if (this.button) {
        this.button.addEventListener('click', () => {
          let targetUrl = window.location.href;
          if (this.button.dataset.shareLink) {
            targetUrl = this.button.dataset.shareLink;
          }

          if (!this.tooltip.classList.contains(classes$k.visible)) {
            navigator.clipboard.writeText(targetUrl).then(() => {
              this.tooltip.classList.add(classes$k.visible);
              setTimeout(() => {
                this.tooltip.classList.add(classes$k.hiding);
                this.tooltip.classList.remove(classes$k.visible);

                if (this.hideTransitionTimeout) {
                  clearTimeout(this.hideTransitionTimeout);
                }

                this.hideTransitionTimeout = setTimeout(() => {
                  this.tooltip.classList.remove(classes$k.hiding);
                }, this.transitionSpeed);
              }, 1500);
            });
          }
        });
      }
    }
  }

  const shareButton = {
    onLoad() {
      sections$o[this.id] = new ShareButton(this.container);
    },
  };

  register('article', [shareButton]);

  const selectors$t = {
    videoPlay: '[data-video-play]',
  };

  const attributes$k = {
    videoPlayValue: 'data-video-play',
  };

  class VideoPlay {
    constructor(container) {
      this.container = container;
      this.videoPlay = this.container.querySelectorAll(selectors$t.videoPlay);
      this.a11y = a11y;

      this.init();
    }

    init() {
      if (this.videoPlay.length) {
        this.videoPlay.forEach((element) => {
          element.addEventListener('click', (e) => {
            if (element.hasAttribute(attributes$k.videoPlayValue) && element.getAttribute(attributes$k.videoPlayValue).trim() !== '') {
              e.preventDefault();

              const items = [
                {
                  html: element.getAttribute(attributes$k.videoPlayValue),
                },
              ];
              this.a11y.state.trigger = element;
              new LoadPhotoswipe(items);
            }
          });
        });
      }
    }
  }

  const videoPlay = {
    onLoad() {
      new VideoPlay(this.container);
    },
  };

  const selectors$s = {
    header: '[data-site-header]',
    main: '[data-main]',
  };

  let sections$n = {};

  class ZoomAnimation {
    constructor(container) {
      this.container = container;
      this.header = document.querySelector(selectors$s.header);

      this.init();
    }

    init() {
      if (this.container.dataset.zoomAnimation !== 'true') {
        return;
      }

      // Target element to be observed.
      const observedElement = this.container;
      const firstSection = document.body.querySelector(selectors$s.main).children[0];
      const isFirstSection = this.container.parentNode === firstSection;
      const hasTransparentHeader = this.header?.dataset.transparent == 'true';

      const renderZoomEffect = () => {
        const headerHeight = isFirstSection & hasTransparentHeader ? 0 : parseInt(this.header?.dataset.height || this.header?.offsetHeight);
        const rect = observedElement.getBoundingClientRect();
        const sectionHeight = observedElement.offsetHeight;
        const scrolled = isFirstSection ? headerHeight - rect.top : headerHeight - rect.top + window.innerHeight;
        const scrolledPercentage = scrolled / sectionHeight;
        let transitionSpeed = 0.1; // Set value between 0 and 1. Bigger value will make the zoom more aggressive
        if (isFirstSection) {
          transitionSpeed *= 1.5;
        }

        let scale = 1 + scrolledPercentage * transitionSpeed;

        // Prevent image scale down under 100%
        scale = scale > 1 ? scale : 1;
        observedElement.style.setProperty('--scale', scale);
      };

      renderZoomEffect();

      this.zoomOnScrollEvent = throttle(renderZoomEffect, 5);

      // Intersection Observer Configuration
      const observerOptions = {
        root: null,
        rootMargin: '0px', // important: needs units on all values
        threshold: 0,
      };

      // Intersection Observer Callback Function
      const intersectionCallback = (entry) => {
        if (entry[0].isIntersecting) {
          window.addEventListener('scroll', this.zoomOnScrollEvent);
        } else {
          window.removeEventListener('scroll', this.zoomOnScrollEvent);
        }
      };

      // Intersection Observer Constructor.
      const observer = new IntersectionObserver(intersectionCallback, observerOptions);

      observer.observe(observedElement);
    }

    onUnload() {
      if (this.zoomOnScrollEvent !== null) {
        window.removeEventListener('scroll', this.zoomOnScrollEvent);
      }
    }
  }

  const zoomAnimation = {
    onLoad() {
      sections$n[this.id] = new ZoomAnimation(this.container);
    },
    onUnload() {
      sections$n[this.id].onUnload();
    },
  };

  register('banner-image', [zoomAnimation, videoPlay]);

  const selectors$r = {
    banner: '[data-banner]',
    slider: '[data-slider]',
    sliderMedia: '[data-banners-media]',
  };

  const attributes$j = {
    index: 'data-index',
    singleImage: 'data-slider-single-image',
  };

  let sections$m = {};

  class BannerWithTextColumns {
    constructor(section) {
      this.container = section.container;
      this.slider = this.container.querySelector(selectors$r.slider);
      this.singleImageEnabled = this.slider?.hasAttribute(attributes$j.singleImage);
      this.banners = this.container.querySelectorAll(selectors$r.banner);
      this.links = this.container.querySelectorAll('a');
      this.sliderMedia = this.container.querySelector(selectors$r.sliderMedia);
      this.flkty = null;
      this.flktyMedia = null;
      this.sliderResizeEvent = () => this.resizeSlider();

      if (!this.slider) return;

      this.initSliders();

      document.addEventListener('theme:resize:width', this.sliderResizeEvent);
    }

    initSliders() {
      if (this.slider.children.length <= 1) return;

      let isDraggable = window.innerWidth < window.theme.sizes.small;

      if (this.sliderMedia.children.length > 1) {
        this.flktyMedia = new Flickity(this.sliderMedia, {
          draggable: false,
          wrapAround: false,
          fade: true,
          prevNextButtons: false,
          adaptiveHeight: false,
          pageDots: false,
          setGallerySize: false,
        });

        flickitySmoothScrolling(this.sliderMedia);
      }

      this.flkty = new Flickity(this.slider, {
        draggable: isDraggable,
        prevNextButtons: false,
        pageDots: true,
        cellAlign: 'left',
        adaptiveHeight: false,
        imagesLoaded: true,
        lazyLoad: true,
        on: {
          ready: () => {
            this.links.forEach((link) => {
              link.addEventListener('focus', () => {
                const selectedIndex = Number(link.closest(selectors$r.banner).getAttribute(attributes$j.index));

                if (window.innerWidth >= theme.sizes.small) {
                  this.syncContent(selectedIndex);
                }
              });
            });

            this.banners.forEach((slide) => {
              slide.addEventListener('mouseenter', () => {
                const selectedIndex = Number(slide.getAttribute(attributes$j.index));

                if (window.innerWidth >= theme.sizes.small && !window.theme.touch) {
                  this.syncContent(selectedIndex);
                }
              });

              slide.addEventListener('pointerup', () => {
                const selectedIndex = Number(slide.getAttribute(attributes$j.index));

                if (window.innerWidth >= theme.sizes.small && window.theme.touch) {
                  this.syncContent(selectedIndex);
                }
              });
            });
          },
          change: (index) => {
            if (window.innerWidth < theme.sizes.small && !this.singleImageEnabled) {
              this.flktyMedia.select(index);
            }
          },
        },
      });

      flickitySmoothScrolling(this.slider);
    }

    syncContent(index = 0) {
      this.flkty.selectCell(index);

      if (this.flktyMedia) {
        this.flktyMedia.selectCell(index);
      }
    }

    resizeSlider() {
      if (this.flkty) {
        this.flkty.resize();
        this.toggleDraggable();
      }

      if (this.flktyMedia) {
        this.flktyMedia.resize();
      }
    }

    toggleDraggable() {
      this.flkty.options.draggable = window.innerWidth < window.theme.sizes.small;
      this.flkty.updateDraggable();
    }

    onBlockSelect(evt) {
      const selectedIndex = parseInt([...evt.target.parentNode.children].indexOf(evt.target));
      if (this.flktyMedia) {
        this.flktyMedia.selectCell(selectedIndex);
      }
    }

    onUnload() {
      document.removeEventListener('theme:resize:width', this.sliderResizeEvent);
    }
  }

  const BannerWithTextColumnsSection = {
    onLoad() {
      sections$m[this.id] = new BannerWithTextColumns(this);
    },
    onBlockSelect(e) {
      sections$m[this.id].onBlockSelect(e);
    },
  };

  register('banner-with-text-columns', BannerWithTextColumnsSection);

  register('blog-posts', ajaxify);

  const selectors$q = {
    slider: '[data-slider]',
    sliderItem: '[data-slider-item]',
    sliderItemImage: '[data-media-container]',
    links: 'a, button',
    flickityButton: '.flickity-button',
  };

  const classes$j = {
    carouselInactive: 'carousel--inactive',
  };

  const attributes$i = {
    tabIndex: 'tabindex',
  };

  const sections$l = {};

  class ColumnsWithImage {
    constructor(section) {
      this.container = section.container;
      this.slider = this.container.querySelector(selectors$q.slider);
      this.flkty = null;
      this.gutter = 0;
      this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
      this.listen();
    }

    initSlider() {
      this.slider.classList.remove(classes$j.carouselInactive);

      this.flkty = new Flickity(this.slider, {
        pageDots: false,
        cellAlign: 'left',
        groupCells: true,
        contain: true,
        on: {
          ready: () => {
            this.setSliderArrowsPosition(this.slider);
            setTimeout(() => {
              this.changeTabIndex();
            }, 0);
          },
          change: () => {
            this.changeTabIndex();
          },
        },
      });
    }

    destroySlider() {
      this.slider.classList.add(classes$j.carouselInactive);

      if (this.flkty !== null) {
        this.flkty.destroy();
        this.flkty = null;
      }
    }

    checkSlidesSize() {
      const sliderItemStyle = this.container.querySelector(selectors$q.sliderItem).currentStyle || window.getComputedStyle(this.container.querySelector(selectors$q.sliderItem));
      this.gutter = parseInt(sliderItemStyle.marginRight);
      const containerWidth = this.slider.offsetWidth;
      const itemsWidth = this.getItemsWidth();
      const itemsOverflowViewport = containerWidth < itemsWidth;

      if (window.innerWidth >= theme.sizes.small && itemsOverflowViewport) {
        this.initSlider();
      } else {
        this.destroySlider();
      }
    }

    changeTabIndex() {
      const selectedElementsIndex = this.flkty.selectedIndex;

      this.flkty.slides.forEach((slide, index) => {
        slide.cells.forEach((cell) => {
          cell.element.querySelectorAll(selectors$q.links).forEach((link) => {
            link.setAttribute(attributes$i.tabIndex, selectedElementsIndex === index ? '0' : '-1');
          });
        });
      });
    }

    getItemsWidth() {
      let itemsWidth = 0;
      const slides = this.slider.querySelectorAll(selectors$q.sliderItem);
      if (slides.length) {
        slides.forEach((item) => {
          itemsWidth += item.offsetWidth + this.gutter;
        });
      }

      return itemsWidth;
    }

    listen() {
      if (this.slider) {
        this.checkSlidesSize();
        document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
      }
    }

    setSliderArrowsPosition(slider) {
      const arrows = slider.querySelectorAll(selectors$q.flickityButton);
      const image = slider.querySelector(selectors$q.sliderItemImage);

      if (arrows.length && image) {
        arrows.forEach((arrow) => {
          arrow.style.top = `${image.offsetHeight / 2}px`;
        });
      }
    }

    onBlockSelect(evt) {
      if (this.flkty !== null) {
        const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));
        const slidesPerPage = parseInt(this.flkty.slides[0].cells.length);
        const groupIndex = Math.floor(index / slidesPerPage);

        this.flkty.select(groupIndex);
      } else {
        const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
        const sliderPadding = parseInt(sliderStyle.paddingLeft);
        const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

        // Native scroll to item
        this.slider.scrollTo({
          top: 0,
          left: blockPositionLeft,
          behavior: 'smooth',
        });
      }
    }

    onUnload() {
      document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
    }
  }

  const ColumnsWithImageSection = {
    onLoad() {
      sections$l[this.id] = new ColumnsWithImage(this);
    },
    onUnload(e) {
      sections$l[this.id].onUnload(e);
    },
    onBlockSelect(e) {
      sections$l[this.id].onBlockSelect(e);
    },
  };

  register('columns-with-image', [ColumnsWithImageSection, videoPlay]);

  const selectors$p = {
    formMessageClose: '[data-form-message-close]',
    formMessageWrapper: '[data-form-message]',
  };

  const classes$i = {
    hideDown: 'hide-down',
    notificationVisible: 'notification-visible',
  };

  let sections$k = {};

  class ContactForm {
    constructor(section) {
      this.container = section.container;
      this.closeButton = this.container.querySelector(selectors$p.formMessageClose);
      this.messageWrapper = this.container.querySelector(selectors$p.formMessageWrapper);

      if (this.messageWrapper) {
        this.hidePopups();
        this.closeFormMessage();
        this.autoHideMessage();
      }
    }

    hidePopups() {
      document.body.classList.add(classes$i.notificationVisible);
    }

    showPopups() {
      document.body.classList.remove(classes$i.notificationVisible);
    }

    closeFormMessage() {
      this.closeButton.addEventListener('click', this.closeMessage.bind(this));
    }

    closeMessage(e) {
      e.preventDefault();
      this.messageWrapper.classList.add(classes$i.hideDown);
      this.showPopups();
    }

    autoHideMessage() {
      setTimeout(() => {
        this.messageWrapper.classList.add(classes$i.hideDown);
        this.showPopups();
      }, 10000);
    }
  }

  const contactFormSection = {
    onLoad() {
      sections$k[this.id] = new ContactForm(this);
    },
  };

  register('contact-form', contactFormSection);

  const selectors$o = {
    videoId: '[data-video-id]',
    videoPlayer: '[data-video-player]',
    videoTemplate: '[data-video-template]',
    videoAutoplay: '[data-video-autoplay]',
    videoWrapper: '[data-video-wrapper]',
  };

  const classes$h = {
    loading: 'is-loading',
  };

  const sections$j = {};

  class VideoBackground {
    constructor(container) {
      this.container = container;
      this.videoId = this.container.querySelector(selectors$o.videoId);
      this.videoPlayer = this.container.querySelector(selectors$o.videoPlayer);
      this.videoTemplate = this.container.querySelector(selectors$o.videoTemplate);
      this.init();
    }

    init() {
      if (!this.videoId) return;

      /*
        Observe video element and pull it out from its template tag
      */
      const videoObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const videoMarkup = this.videoTemplate.innerHTML;
              this.videoPlayer.innerHTML = videoMarkup;
              this.video = this.container.querySelector(selectors$o.videoAutoplay);
              this.videoPlayer.classList.remove(classes$h.loading);

              this.listen();

              // Stop observing element after it was animated
              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '300px',
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        }
      );

      videoObserver.observe(this.videoPlayer);
    }

    listen() {
      // Force video autoplay on iOS when Low Power Mode is On
      this.container.addEventListener(
        'touchstart',
        () => {
          this.video.play();
        },
        {passive: true}
      );
    }
  }

  const videoBackground = {
    onLoad() {
      sections$j[this.id] = [];
      const videoWrappers = this.container.querySelectorAll(selectors$o.videoWrapper);
      videoWrappers.forEach((videoWrapper) => {
        sections$j[this.id].push(new VideoBackground(videoWrapper));
      });
    },
  };

  class PopupCookie {
    constructor(name, value) {
      this.configuration = {
        expires: null, // session cookie
        path: '/',
        domain: window.location.hostname,
        sameSite: 'none',
        secure: true,
      };
      this.name = name;
      this.value = value;
    }

    write() {
      const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row) => row.startsWith(this.name));
      if (hasCookie || document.cookie.indexOf('; ') === -1) {
        document.cookie = `${this.name}=${this.value}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
      }
    }

    read() {
      if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
        const returnCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith(this.name))
          .split('=')[1];

        return returnCookie;
      } else {
        return false;
      }
    }

    destroy() {
      if (document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
        document.cookie = `${this.name}=null; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}; sameSite=${this.configuration.sameSite}; secure=${this.configuration.secure}`;
      }
    }
  }

  const selectors$n = {
    newsletterForm: '[data-newsletter-form]',
    popup: '[data-popup]',
  };

  const classes$g = {
    success: 'has-success',
    error: 'has-error',
  };

  const attributes$h = {
    storageNewsletterFormId: 'newsletter_form_id',
  };

  const sections$i = {};

  class Newsletter {
    constructor(newsletter) {
      this.newsletter = newsletter;
      this.sessionStorage = window.sessionStorage;
      this.popup = this.newsletter.closest(selectors$n.popup);
      this.stopSubmit = true;
      this.isChallengePage = false;
      this.formID = null;
      this.formIdSuccess = null;

      this.checkForChallengePage();

      this.newsletterSubmit = (e) => this.newsletterSubmitEvent(e);

      if (!this.isChallengePage) {
        this.init();
      }
    }

    init() {
      this.newsletter.addEventListener('submit', this.newsletterSubmit);

      this.showMessage();
    }

    newsletterSubmitEvent(e) {
      if (this.stopSubmit) {
        e.preventDefault();

        this.removeStorage();
        this.writeStorage();
        this.stopSubmit = false;
        this.newsletter.submit();
      }
    }

    checkForChallengePage() {
      this.isChallengePage = window.location.pathname === theme.routes.root + 'challenge';
    }

    writeStorage() {
      if (this.sessionStorage !== undefined) {
        this.sessionStorage.setItem(attributes$h.storageNewsletterFormId, this.newsletter.id);
      }
    }

    readStorage() {
      this.formID = this.sessionStorage.getItem(attributes$h.storageNewsletterFormId);
    }

    removeStorage() {
      this.sessionStorage.removeItem(attributes$h.storageNewsletterFormId);
    }

    showMessage() {
      this.readStorage();

      if (this.newsletter.id === this.formID) {
        const newsletter = document.getElementById(this.formID);
        const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
        const submissionFailure = window.location.search.indexOf('accepts_marketing') !== -1;

        if (submissionSuccess) {
          newsletter.classList.remove(classes$g.error);
          newsletter.classList.add(classes$g.success);

          if (this.popup) {
            this.cookie = new PopupCookie(this.popup.dataset.cookieName, 'user_has_closed');
            this.cookie.write();
          }
        } else if (submissionFailure) {
          newsletter.classList.remove(classes$g.success);
          newsletter.classList.add(classes$g.error);
        }

        if (submissionSuccess || submissionFailure) {
          this.scrollToForm(newsletter);
        }
      }
    }

    /**
     * Scroll to the last submitted newsletter form
     */
    scrollToForm(newsletter) {
      const rect = newsletter.getBoundingClientRect();
      const isVisible = visibilityHelper.isElementPartiallyVisible(newsletter) || visibilityHelper.isElementTotallyVisible(newsletter);

      if (!isVisible) {
        setTimeout(() => {
          window.scrollTo({
            top: rect.top,
            left: 0,
            behavior: 'smooth',
          });
        }, 400);
      }
    }

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload() {
      this.newsletter.removeEventListener('submit', this.newsletterSubmit);
    }
  }

  const newsletterSection = {
    onLoad() {
      sections$i[this.id] = [];
      const newsletters = this.container.querySelectorAll(selectors$n.newsletterForm);
      newsletters.forEach((form) => {
        sections$i[this.id].push(new Newsletter(form));
      });
    },
    onUnload() {
      sections$i[this.id].forEach((form) => {
        if (typeof form.onUnload === 'function') {
          form.onUnload();
        }
      });
    },
  };

  const selectors$m = {
    product: '[data-product]',
    productSlider: '[data-slider]',
    productSlide: '[data-slide]',
    productGridItemImage: '[data-product-media-container]',
    flickityButton: '.flickity-button',
    item: '[data-slide]',
    links: 'a, button',
  };

  const attributes$g = {
    tabIndex: 'tabindex',
  };

  const sections$h = {};

  class CustomContent {
    constructor(container) {
      this.container = container;
      this.product = this.container.querySelectorAll(selectors$m.product);
      this.productSlider = this.container.querySelectorAll(selectors$m.productSlider);
      this.checkSliderOnResize = () => this.checkSlider();
      this.flkty = [];
      this.videoObj = [];
      this.quickViewObj = [];

      this.listen();
    }

    checkSlider() {
      if (window.innerWidth >= theme.sizes.small) {
        this.productSlider.forEach((slider) => {
          this.initProductSlider(slider);
        });
      } else {
        this.productSlider.forEach((slider) => {
          this.destroyProductSlider(slider);
        });
      }
    }

    initProductSlider(slider) {
      const slidesCount = slider.querySelectorAll(selectors$m.productSlide).length;
      const sliderId = slider.dataset.slider;

      if (slidesCount > 1) {
        if (this.flkty[sliderId] === undefined || !this.flkty[sliderId].isActive) {
          this.flkty[sliderId] = new Flickity(slider, {
            prevNextButtons: true,
            pageDots: true,
            wrapAround: true,
            on: {
              ready: () => {
                this.setSliderArrowsPosition(slider);
              },
              change: (index) => {
                this.flkty[sliderId].cells.forEach((slide, i) => {
                  slide.element.querySelectorAll(selectors$m.links).forEach((link) => {
                    link.setAttribute(attributes$g.tabIndex, i === index ? '0' : '-1');
                  });
                });
              },
            },
          });
        } else {
          this.setSliderArrowsPosition(slider);
        }
      }
    }

    destroyProductSlider(slider) {
      const sliderId = slider.dataset.slider;

      if (typeof this.flkty[sliderId] === 'object') {
        this.flkty[sliderId].destroy();
      }
    }

    setSliderArrowsPosition(slider) {
      const arrows = slider.querySelectorAll(selectors$m.flickityButton);
      const image = slider.querySelector(selectors$m.productGridItemImage);

      if (arrows.length && image) {
        arrows.forEach((arrow) => {
          arrow.style.top = `${image.offsetHeight / 2}px`;
        });
      }
    }

    listen() {
      this.checkSlider();
      document.addEventListener('theme:resize:width', this.checkSliderOnResize);
    }

    onUnload() {
      if (this.flkty) {
        for (const key in this.flkty) {
          if (this.flkty.hasOwnProperty(key)) {
            this.flkty[key].destroy();
          }
        }
      }

      document.removeEventListener('theme:resize:width', this.checkSliderOnResize);
    }
  }

  const CustomContentSection = {
    onLoad() {
      sections$h[this.id] = new CustomContent(this.container);
    },
    onUnload(e) {
      sections$h[this.id].onUnload(e);
    },
  };

  register('custom-content', [CustomContentSection, newsletterSection, videoPlay, videoBackground, productGrid]);

  const selectors$l = {
    slider: '[data-slider]',
    sliderItem: '[data-slide]',
    productGridItemImage: '[data-product-media-container]',
    links: 'a, button',
    flickityButton: '.flickity-button',
    promo: '[data-promo]',
  };

  const classes$f = {
    carousel: 'carousel',
    carouselInactive: 'carousel--inactive',
    isLastSlideVisible: 'is-last-slide-visible',
    featuredCollection: 'featured-collection',
    promoFullWidth: 'collection-promo--full',
    promoTwoItemsWidth: 'collection-promo--two-columns',
  };

  const attributes$f = {
    sliderId: 'data-slider-id',
    showImage: 'data-slider-show-image',
    tabIndex: 'tabindex',
  };

  const sections$g = {};

  class GridSlider {
    constructor(container) {
      this.container = container;
      this.columns = parseInt(this.container.dataset.columns);
      this.sliders = this.container.querySelectorAll(selectors$l.slider);
      this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
      this.resetSliderEvent = (e) => this.resetSlider(e);
      this.flkty = [];
      this.listen();

      this.handleLastSlideOverlayOnMobile();
    }

    initSlider(slider) {
      const sliderId = slider.getAttribute(attributes$f.sliderId);
      slider.classList.remove(classes$f.carouselInactive);

      if (this.flkty[sliderId] === undefined || !this.flkty[sliderId].isActive) {
        this.flkty[sliderId] = new Flickity(slider, {
          pageDots: false,
          cellSelector: selectors$l.sliderItem,
          cellAlign: 'left',
          groupCells: true,
          contain: true,
          wrapAround: false,
          adaptiveHeight: false,
          on: {
            ready: () => {
              this.setSliderArrowsPosition(slider);
              setTimeout(() => {
                this.changeTabIndex(slider);
              }, 0);
            },
            change: () => {
              this.changeTabIndex(slider);
            },
          },
        });

        this.handleLastSlideOverlayOnTablet(slider);
      } else {
        this.setSliderArrowsPosition(slider);
      }
    }

    destroySlider(slider) {
      const sliderId = slider.getAttribute(attributes$f.sliderId);

      if (slider.classList.contains(classes$f.carousel)) {
        slider.classList.add(classes$f.carouselInactive);
      }

      if (typeof this.flkty[sliderId] === 'object') {
        this.flkty[sliderId].destroy();
      }
    }

    // Move slides to their initial position
    resetSlider(e) {
      const slider = e.target;
      const sliderId = slider.getAttribute(attributes$f.sliderId);

      if (typeof this.flkty[sliderId] === 'object') {
        this.flkty[sliderId].select(0, false, true);
      } else {
        slider.scrollTo({
          left: 0,
          behavior: 'instant',
        });
      }
    }

    checkSlidesSize() {
      if (this.sliders.length) {
        this.sliders.forEach((slider) => {
          const columns = this.columns;
          const isDesktop = window.innerWidth >= theme.sizes.large;
          const isTablet = window.innerWidth >= theme.sizes.small && window.innerWidth < theme.sizes.large;
          const slides = slider.querySelectorAll(selectors$l.sliderItem);
          let itemsCount = slides.length;
          const promos = slider.querySelectorAll(selectors$l.promo);
          let checkForSlider = false;

          // If there are promos in the grid with different width
          if (promos.length && isDesktop) {
            promos.forEach((promo) => {
              if (promo.classList.contains(classes$f.promoFullWidth)) {
                itemsCount += columns - 1;
              } else if (promo.classList.contains(classes$f.promoTwoItemsWidth)) {
                itemsCount += 1;
              }
            });
          }

          // If tab collection has show image enabled
          if (slider.hasAttribute(attributes$f.showImage)) {
            itemsCount += 1;
          }

          // If list collection
          if (!columns) {
            const sliderComputedStyle = window.getComputedStyle(slider, null);
            let sliderWidth = slider.clientWidth;
            sliderWidth -= parseFloat(sliderComputedStyle.paddingLeft) + parseFloat(sliderComputedStyle.paddingRight);

            checkForSlider = this.getSlidesWidth(slides) > sliderWidth;
          } else {
            checkForSlider = itemsCount > columns;
          }

          if ((isDesktop && checkForSlider) || (isTablet && itemsCount > 2)) {
            this.initSlider(slider);
          } else {
            this.destroySlider(slider);
          }
        });
      }
    }

    changeTabIndex(slider) {
      const sliderId = slider.getAttribute(attributes$f.sliderId);
      const selectedElementsIndex = this.flkty[sliderId].selectedIndex;

      this.flkty[sliderId].slides.forEach((slide, index) => {
        slide.cells.forEach((cell) => {
          cell.element.querySelectorAll(selectors$l.links).forEach((link) => {
            link.setAttribute(attributes$f.tabIndex, selectedElementsIndex === index ? '0' : '-1');
          });
        });
      });
    }

    getSlidesWidth(slides) {
      let slidesTotalWidth = 0;

      if (slides.length) {
        slides.forEach((slide) => {
          slidesTotalWidth += slide.offsetWidth;
        });
      }
      return slidesTotalWidth;
    }

    setSliderArrowsPosition(slider) {
      const arrows = slider.querySelectorAll(selectors$l.flickityButton);
      const image = slider.querySelector(selectors$l.productGridItemImage);

      if (arrows.length && image) {
        arrows.forEach((arrow) => {
          arrow.style.top = `${image.offsetHeight / 2}px`;
        });
      }
    }

    handleLastSlideOverlayOnTablet(slider) {
      const sliderId = slider.getAttribute(attributes$f.sliderId);

      this.flkty[sliderId].on('select', () => {
        const isTablet = window.innerWidth >= theme.sizes.small && window.innerWidth < theme.sizes.large;

        if (!isTablet) return;

        const selectedIndex = this.flkty[sliderId].selectedIndex;
        const sliderGroups = this.flkty[sliderId].slides.length - 1;
        const isLastSliderGroup = sliderGroups === selectedIndex;

        slider.parentNode.classList.toggle(classes$f.isLastSlideVisible, isLastSliderGroup);
      });
    }

    handleLastSlideOverlayOnMobile() {
      this.sliders.forEach((slider) => {
        slider.addEventListener('scroll', (event) => {
          const isMobile = window.innerWidth < theme.sizes.small;

          if (!isMobile) return;

          const offsetWidth = event.target.offsetWidth;
          const lastSlide = Array.from(slider.children).pop();
          const rect = lastSlide.getBoundingClientRect();
          const isLastSlideVisible = rect.left + 80 < offsetWidth; // 80px is enough to negate the small visible part of the slide on the right

          slider.parentNode.classList.toggle(classes$f.isLastSlideVisible, isLastSlideVisible);
        });
      });
    }

    listen() {
      if (this.sliders.length) {
        this.checkSlidesSize();
        document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);

        this.sliders.forEach((slider) => {
          slider.addEventListener('theme:tab:change', this.resetSliderEvent);
        });
      }
    }

    /**
     * Event callback for Theme Editor `section:block:select` event
     */
    onBlockSelect(evt) {
      const slider = evt.target.closest(selectors$l.slider);
      const flkty = Flickity.data(slider) || null;

      if (!slider) {
        return;
      }

      let parent = evt.target.parentNode;
      let target = evt.target;

      if (this.container.classList.contains(classes$f.featuredCollection)) {
        // In Featured collection section the shopify block attributes are on inner element
        parent = parent.parentNode;
        target = target.parentNode;
      }

      if (flkty !== null && flkty.isActive) {
        const index = parseInt([...parent.children].indexOf(target));
        const slidesPerPage = parseInt(flkty.slides[0].cells.length);
        const groupIndex = Math.floor(index / slidesPerPage);

        flkty.select(groupIndex);
      } else {
        const sliderStyle = slider.currentStyle || window.getComputedStyle(slider);
        const sliderPadding = parseInt(sliderStyle.paddingLeft);
        const blockPositionLeft = target.offsetLeft - sliderPadding;

        // Native scroll to item
        slider.scrollTo({
          top: 0,
          left: blockPositionLeft,
          behavior: 'smooth',
        });
      }
    }

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload() {
      if (this.flkty) {
        for (const key in this.flkty) {
          if (this.flkty.hasOwnProperty(key)) {
            this.flkty[key].destroy();
          }
        }
      }

      document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);

      if (this.sliders.length) {
        this.sliders.forEach((slider) => {
          slider.removeEventListener('theme:tab:change', this.resetSliderEvent);
        });
      }
    }
  }

  const gridSlider = {
    onLoad() {
      sections$g[this.id] = [];
      const els = this.container.querySelectorAll(selectors$l.slider);
      els.forEach((el) => {
        sections$g[this.id].push(new GridSlider(this.container));
      });
    },
    onUnload() {
      sections$g[this.id].forEach((el) => {
        if (typeof el.onUnload === 'function') {
          el.onUnload();
        }
      });
    },
    onBlockSelect(e) {
      sections$g[this.id].forEach((el) => {
        if (typeof el.onBlockSelect === 'function') {
          el.onBlockSelect(e);
        }
      });
    },
  };

  register('featured-collection', [productGrid, tooltip, gridSlider]);

  register('featured-video', [videoPlay, videoBackground]);

  const selectors$k = {
    trigger: '[data-collapsible-trigger-mobile]',
  };

  const classes$e = {
    isExpanded: 'is-expanded',
  };

  const footerAccordionSection = {
    onBlockSelect(e) {
      const trigger = e.target.querySelector(selectors$k.trigger);
      requestAnimationFrame(() => {
        if (trigger && !trigger.classList.contains(classes$e.isExpanded)) {
          trigger.dispatchEvent(new Event('click'));
        }
      });
    },
    onBlockDeselect(e) {
      const trigger = e.target.querySelector(selectors$k.trigger);
      requestAnimationFrame(() => {
        if (trigger && trigger.classList.contains(classes$e.isExpanded)) {
          trigger.dispatchEvent(new Event('click'));
        }
      });
    },
  };

  register('footer', [popoutSection, newsletterSection, collapsible, footerAccordionSection]);

  const selectors$j = {
    disclosureWrappper: '[data-hover-disclosure]',
    header: '[data-site-header]',
    link: '[data-top-link]',
    headerBackground: '[data-header-background]',
    navItem: '[data-nav-item]',
  };

  const classes$d = {
    isVisible: 'is-visible',
    grandparent: 'grandparent',
    headerMenuOpened: 'site-header--menu-opened',
    hasScrolled: 'has-scrolled',
  };

  const attributes$e = {
    disclosureToggle: 'data-hover-disclosure-toggle',
    ariaHasPopup: 'aria-haspopup',
    ariaExpanded: 'aria-expanded',
    ariaControls: 'aria-controls',
  };

  let sections$f = {};

  class HoverDisclosure {
    constructor(el) {
      this.disclosure = el;
      this.header = el.closest(selectors$j.header);
      this.key = this.disclosure.id;
      this.trigger = document.querySelector(`[${attributes$e.disclosureToggle}='${this.key}']`);
      this.link = this.trigger.querySelector(selectors$j.link);
      this.grandparent = this.trigger.classList.contains(classes$d.grandparent);
      this.background = document.querySelector(selectors$j.headerBackground);
      this.trigger.setAttribute(attributes$e.ariaHasPopup, true);
      this.trigger.setAttribute(attributes$e.ariaExpanded, false);
      this.trigger.setAttribute(attributes$e.ariaControls, this.key);
      this.dropdown = this.trigger.querySelector(selectors$j.disclosureWrappper);

      this.connectHoverToggle();
      this.handleTablets();
    }

    showDisclosure() {
      this.hasScrolled = document.body.classList.contains(classes$d.hasScrolled);
      this.headerHeight = this.hasScrolled ? window.stickyHeaderHeight : this.header.offsetHeight;

      if (this.grandparent) {
        this.dropdown.style.height = 'auto';
        this.dropdownHeight = this.dropdown.offsetHeight;
      } else {
        this.dropdownHeight = this.headerHeight;
      }

      this.background.style.setProperty('--header-background-height', `${this.dropdownHeight}px`);

      // Set accessibility and classes
      this.trigger.setAttribute(attributes$e.ariaExpanded, true);
      this.trigger.classList.add(classes$d.isVisible);
      this.header.classList.add(classes$d.headerMenuOpened);
    }

    hideDisclosure() {
      this.background.style.removeProperty('--header-background-height');

      this.trigger.classList.remove(classes$d.isVisible);
      this.trigger.setAttribute(attributes$e.ariaExpanded, false);
      this.header.classList.remove(classes$d.headerMenuOpened);
    }

    handleTablets() {
      // first click opens the popup, second click opens the link
      this.trigger.addEventListener('touchstart', (e) => {
        const isOpen = this.trigger.classList.contains(classes$d.isVisible);
        if (!isOpen) {
          e.preventDefault();

          // Hide the rest of the active nav items
          const activeNavItems = this.header.querySelectorAll(`.${classes$d.isVisible}${selectors$j.navItem}`);

          if (activeNavItems.length > 0) {
            activeNavItems.forEach((item) => {
              if (item !== this.trigger) {
                item.dispatchEvent(new Event('mouseleave', {bubbles: true}));

                const onTransitionEnd = () => {
                  requestAnimationFrame(() => {
                    this.showDisclosure();
                  });

                  item.removeEventListener('transitionend', onTransitionEnd);
                };

                item.addEventListener('transitionend', onTransitionEnd);
              }
            });

            return;
          }

          this.showDisclosure();
        }
      });
    }

    connectHoverToggle() {
      this.trigger.addEventListener('mouseenter', () => this.showDisclosure());
      this.link.addEventListener('focus', () => this.showDisclosure());

      this.trigger.addEventListener('mouseleave', () => this.hideDisclosure());
      this.trigger.addEventListener('focusout', (event) => {
        const inMenu = this.trigger.contains(event.relatedTarget);

        if (!inMenu) {
          this.hideDisclosure();
        }
      });
      this.disclosure.addEventListener('keyup', (event) => {
        if (event.code !== theme.keyboardKeys.ESCAPE) {
          return;
        }
        this.hideDisclosure();
      });
    }

    onBlockSelect(event) {
      if (this.disclosure.contains(event.target)) {
        this.showDisclosure(event);
      }
    }

    onBlockDeselect(event) {
      if (this.disclosure.contains(event.target)) {
        this.hideDisclosure();
      }
    }
  }

  const hoverDisclosure = {
    onLoad() {
      sections$f[this.id] = [];
      const disclosures = this.container.querySelectorAll(selectors$j.disclosureWrappper);

      disclosures.forEach((el) => {
        sections$f[this.id].push(new HoverDisclosure(el));
      });
    },
    onBlockSelect(evt) {
      sections$f[this.id].forEach((el) => {
        if (typeof el.onBlockSelect === 'function') {
          el.onBlockSelect(evt);
        }
      });
    },
    onBlockDeselect(evt) {
      sections$f[this.id].forEach((el) => {
        if (typeof el.onBlockDeselect === 'function') {
          el.onBlockDeselect(evt);
        }
      });
    },
  };

  const selectors$i = {
    header: '[data-site-header]',
    announcementBar: '[data-announcement-wrapper]',
    collectionFilters: '[data-collection-filters]',
    logo: '[data-logo]',
    logoTextLink: '[data-logo-text-link]',
    mobileNavDropdownTrigger: '[data-collapsible-trigger]',
    navDrawer: '#nav-drawer',
    drawer: '[data-drawer]',
    drawerToggle: '[data-drawer-toggle]',
    popdownToggle: '[data-popdown-toggle]',
    mobileMenu: '[data-mobile-menu]',
    nav: '[data-nav]',
    navIcons: '[data-nav-icons]',
    navItem: '[data-nav-item]',
    navLinkMobile: '[data-nav-link-mobile]',
    navSearchOpen: '[data-nav-search-open]',
    wrapper: '[data-wrapper]',
    headerBackground: '[data-header-background]',
    cartPage: '[data-cart-page]',
    widthContent: '[data-takes-space]',
  };

  const classes$c = {
    jsDrawerOpenAll: ['js-drawer-open', 'js-drawer-open-cart', 'js-quick-view-visible'],
    headerTransparent: 'site-header--transparent',
    headerLoading: 'site-header--loading',
    headerHovered: 'site-header--hovered',
    headerMenuOpened: 'site-header--menu-opened',
    hasScrolled: 'has-scrolled',
    hideHeader: 'hide-header',
    navCompress: 'nav--compress',
    logoCompress: 'logo--compress',
    isVisible: 'is-visible',
    isOpen: 'is-open',
    searchOpened: 'search-opened',
    noOutline: 'no-outline',
    cloneClass: 'js__header__clone',
  };

  const attributes$d = {
    navAlignment: 'data-nav-alignment',
  };

  const sections$e = {};

  class Header {
    constructor(container) {
      this.container = container;
      this.background = document.querySelector(selectors$i.headerBackground);
      this.header = container;
      this.headerSection = container.parentNode;
      this.headerWrapper = container.querySelector(selectors$i.wrapper);
      this.logo = container.querySelector(selectors$i.logo);
      this.logoTextLink = container.querySelector(selectors$i.logoTextLink);
      this.nav = container.querySelector(selectors$i.nav);
      this.navIcons = container.querySelector(selectors$i.navIcons);
      this.headerStateEvent = (event) => this.headerState(event);
      this.handleTouchstartEvent = (event) => this.handleTouchstart(event);
      this.updateBackgroundHeightEvent = (event) => this.updateBackgroundHeight(event);

      initTransparentHeader();

      this.minWidth = this.getMinWidth();
      this.checkWidthEvent = () => this.checkWidth();
      this.listenWidth();
      this.initMobileNav();
      this.handleTextLinkLogos();
      this.initStickyHeader();
      this.handleBackgroundEvents();

      if (!document.querySelector(selectors$i.cartPage)) {
        window.cart = new CartDrawer();
      }

      document.body.addEventListener('touchstart', this.handleTouchstartEvent, {passive: true});
    }

    handleTouchstart(event) {
      const isInHeader = this.header.contains(event.target);
      const activeNavItem = this.header.querySelector(`.${classes$c.isVisible}${selectors$i.navItem}`);

      if (!isInHeader && activeNavItem) {
        activeNavItem.dispatchEvent(new Event('mouseleave', {bubbles: true}));
      }
    }

    handleTextLinkLogos() {
      if (this.logoTextLink === null) return;

      const headerHeight = this.header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--header-sticky-height', `${headerHeight}px`);
    }

    initStickyHeader() {
      this.hasScrolled = false;
      this.hasCollectionFilters = document.querySelector(selectors$i.collectionFilters);
      this.position = this.header.dataset.position;

      const shouldShowCompactHeader = this.position === 'fixed' && !this.hasCollectionFilters;
      if (shouldShowCompactHeader) {
        this.header.classList.remove(classes$c.headerLoading);
        this.headerState();
        document.addEventListener('theme:scroll', this.headerStateEvent);
        return;
      }

      document.body.classList.remove(classes$c.hasScrolled);
      if (window.isHeaderTransparent) {
        this.header.classList.add(classes$c.headerTransparent);
      }
      this.header.classList.remove(classes$c.headerLoading);
    }

    // Switch to "compact" header on scroll
    headerState(event) {
      const headerHeight = parseInt(this.header.dataset.height || this.header.offsetHeight);
      const announcementBar = document.querySelector(selectors$i.announcementBar);
      const announcementHeight = announcementBar ? announcementBar.offsetHeight : 0;
      const pageOffset = headerHeight + announcementHeight;
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollUp = event && event.detail && event.detail.up;

      // Show compact header when scroll down
      this.hasScrolled = currentScrollTop > pageOffset;
      document.body.classList.toggle(classes$c.hasScrolled, this.hasScrolled);

      // Hide compact header when scroll back to top
      const hideHeaderThreshold = pageOffset + window.stickyHeaderHeight;
      const bellowThreshold = currentScrollTop < hideHeaderThreshold;
      const shouldHideHeader = bellowThreshold && scrollUp;
      document.body.classList.toggle(classes$c.hideHeader, shouldHideHeader);

      if (window.isHeaderTransparent) {
        const shouldShowTransparentHeader = !this.hasScrolled || shouldHideHeader;
        this.header.classList.toggle(classes$c.headerTransparent, shouldShowTransparentHeader);
      }

      // Update header background height if users scroll the page with their mouse over the header or over an opened nav menu
      if (this.header.classList.contains(classes$c.headerHovered)) {
        const currentHeight = this.hasScrolled ? window.stickyHeaderHeight : headerHeight;
        this.background.style.setProperty('--header-background-height', `${currentHeight}px`);

        const activeNavItem = this.header.querySelector(`.${classes$c.isVisible}${selectors$i.navItem}`);
        if (activeNavItem) {
          activeNavItem.dispatchEvent(new Event('mouseenter', {bubbles: true}));
        }
      }
    }

    handleBackgroundEvents() {
      this.headerWrapper.addEventListener('mouseenter', this.updateBackgroundHeightEvent);

      this.headerWrapper.addEventListener('mouseleave', this.updateBackgroundHeightEvent);

      this.header.addEventListener('focusout', this.updateBackgroundHeightEvent);

      document.addEventListener('theme:cart:close', this.updateBackgroundHeightEvent);

      // Helps fixing Safari issues with background not being updated on search close and mouse over the header
      document.addEventListener('theme:search:close', this.updateBackgroundHeightEvent);
    }

    updateBackgroundHeight(event) {
      const isDesktop = matchMedia('(pointer:fine)').matches;
      const isFocusEnabled = !document.body.classList.contains(classes$c.noOutline);
      const isNotTabbingOnDesktop = isDesktop && !isFocusEnabled;

      if (!event) return;

      // Update header background height on:
      // 'mouseenter' event
      if (event.type === 'mouseenter') {
        let popupsVisible = false;

        classes$c.jsDrawerOpenAll.forEach((popupClass) => {
          if (document.body.classList.contains(popupClass)) {
            popupsVisible = true;
          }
        });

        // Prevent background update:
        // On visible popups
        if (popupsVisible) return;

        // Update header background height:
        this.headerHeight = this.hasScrolled ? window.stickyHeaderHeight : this.header.offsetHeight;

        this.header.classList.add(classes$c.headerHovered);

        if (!this.header.classList.contains(classes$c.headerMenuOpened)) {
          this.background.style.setProperty('--header-background-height', `${this.headerHeight}px`);
        }

        return;
      }

      // Remove header background and handle focus on:
      // 'mouseleave' event
      // 'theme:cart:close' event
      // 'theme:search:close' event
      // 'focusout' event

      if (event.type === 'focusout' && !isDesktop) return;
      if (event.type === 'theme:search:close' && !isNotTabbingOnDesktop) return;
      if (this.hasScrolled) return;

      requestAnimationFrame(() => {
        const focusOutOfHeader = document.activeElement.closest(selectors$i.header) === null;
        const isSearchOpened = document.body.classList.contains(classes$c.searchOpened);

        if (isSearchOpened) return;

        if (event.type === 'focusout') {
          if (!focusOutOfHeader) return;
        }

        this.header.classList.remove(classes$c.headerHovered);
        this.background.style.setProperty('--header-background-height', '0px');

        if (!isFocusEnabled) {
          document.activeElement.blur();
        }
      });
    }

    listenWidth() {
      document.addEventListener('theme:resize', this.checkWidthEvent);
      this.checkWidth();
    }

    checkWidth() {
      if (window.innerWidth < this.minWidth) {
        this.nav.classList.add(classes$c.navCompress);
        this.logo.classList.add(classes$c.logoCompress);
      } else {
        this.nav.classList.remove(classes$c.navCompress);
        this.logo.classList.remove(classes$c.logoCompress);
      }
    }

    getMinWidth() {
      const headerWrapperStyles = this.headerWrapper.currentStyle || window.getComputedStyle(this.headerWrapper);
      const headerPaddings = parseInt(headerWrapperStyles.paddingLeft) * 2;
      const comparitor = this.header.cloneNode(true);
      comparitor.classList.add(classes$c.cloneClass);
      document.body.appendChild(comparitor);
      const wideElements = comparitor.querySelectorAll(selectors$i.widthContent);
      const navAlignment = this.header.getAttribute(attributes$d.navAlignment);
      const minWidth = _sumSplitWidths(wideElements, navAlignment);

      document.body.removeChild(comparitor);

      return minWidth + wideElements.length * 20 + headerPaddings;
    }

    initMobileNav() {
      // Search popdown link
      this.mobileMenu = this.headerSection.querySelector(selectors$i.mobileMenu);
      this.navDrawer = this.headerSection.querySelector(selectors$i.navDrawer);
      this.drawerToggle = this.navDrawer.querySelector(selectors$i.drawerToggle);
      this.navSearchOpen = this.navDrawer.querySelectorAll(selectors$i.navSearchOpen);

      this.navSearchOpen?.forEach((element) => {
        element.addEventListener('click', (event) => {
          event.preventDefault();

          const drawer = this.drawerToggle.closest(`${selectors$i.drawer}.${classes$c.isOpen}`);
          const isMobile = matchMedia('(pointer:coarse)').matches;
          const popdownToggle = isMobile ? this.mobileMenu.querySelector(selectors$i.popdownToggle) : this.nav.querySelector(selectors$i.popdownToggle);

          this.drawerToggle.dispatchEvent(new Event('click', {bubbles: true}));

          const onDrawerTransitionEnd = (e) => {
            if (e.target !== drawer) return;
            requestAnimationFrame(() => popdownToggle.dispatchEvent(new Event('click', {bubbles: true})));
            drawer.removeEventListener('transitionend', onDrawerTransitionEnd);
          };

          drawer.addEventListener('transitionend', onDrawerTransitionEnd);
        });
      });

      // First item in dropdown menu
      if (theme.settings.mobileMenuBehaviour === 'link') {
        return;
      }

      const navMobileLinks = this.headerSection.querySelectorAll(selectors$i.navLinkMobile);
      if (navMobileLinks.length) {
        navMobileLinks.forEach((link) => {
          link.addEventListener('click', (e) => {
            const hasDropdown = link.parentNode.querySelectorAll(selectors$i.mobileNavDropdownTrigger).length;
            const dropdownTrigger = link.nextElementSibling;

            if (hasDropdown) {
              e.preventDefault();
              dropdownTrigger.dispatchEvent(new Event('click'), {bubbles: true});
            }
          });
        });
      }
    }

    onUnload() {
      // Reset variables so that the proper ones are applied before saving in the Theme editor
      // Necessary only when they were previously updated in `handleTextLinkLogos()` function
      document.documentElement.style.removeProperty('--header-height');
      document.documentElement.style.removeProperty('--header-sticky-height');

      this.initStickyHeader();
      document.body.classList.remove(...classes$c.jsDrawerOpenAll);
      document.removeEventListener('theme:scroll', this.headerStateEvent);
      document.removeEventListener('theme:resize', this.checkWidthEvent);
      document.removeEventListener('theme:cart:close', this.updateBackgroundHeightEvent);
      document.removeEventListener('theme:search:close', this.updateBackgroundHeightEvent);
      document.body.removeEventListener('touchstart', this.handleTouchstartEvent);
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

      if (typeof window.cart.unload === 'function') {
        window.cart.unload();
      }
    }
  }

  function _sumSplitWidths(nodes, alignment) {
    let arr = [];
    nodes.forEach((el) => {
      arr.push(el.clientWidth);
    });
    let [logoWidth, navWidth, iconsWidth] = arr;

    // Check if nav is left and set correct width
    if (alignment === 'left') {
      const tempWidth = logoWidth;
      logoWidth = navWidth;
      navWidth = tempWidth;
    }

    if (alignment !== 'right') {
      if (logoWidth > iconsWidth) {
        iconsWidth = logoWidth;
      } else {
        logoWidth = iconsWidth;
      }
    }

    return logoWidth + navWidth + iconsWidth;
  }

  const headerSection = {
    onLoad() {
      sections$e[this.id] = new Header(this.container);
    },
    onUnload() {
      sections$e[this.id].onUnload();
    },
  };

  register('header', [headerSection, hoverDisclosure, drawer]);

  const selectors$h = {
    slider: '[data-slider]',
  };

  let sections$d = {};

  class IconsRow {
    constructor(section) {
      this.container = section.container;
      this.slider = this.container.querySelector(selectors$h.slider);
    }

    onBlockSelect(evt) {
      const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
      const sliderPadding = parseInt(sliderStyle.paddingLeft);
      const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

      this.slider.scrollTo({
        top: 0,
        left: blockPositionLeft,
        behavior: 'smooth',
      });
    }
  }

  const iconsRowSection = {
    onLoad() {
      sections$d[this.id] = new IconsRow(this);
    },
    onBlockSelect(e) {
      sections$d[this.id].onBlockSelect(e);
    },
  };

  register('icons-row', iconsRowSection);

  const selectors$g = {
    item: '[data-accordion-item]',
    button: '[data-accordion-button]',
  };

  const classes$b = {
    isExpanded: 'is-expanded',
  };

  const sections$c = {};

  class ImageAccordions {
    constructor(section) {
      this.container = section.container;
      this.imageAccordionsItems = this.container.querySelectorAll(selectors$g.item);
      this.buttons = this.container.querySelectorAll(selectors$g.button);
      this.accordionExpandEvent = (item) => this.accordionExpand(item);
      this.accordionFocusEvent = (item) => this.accordionFocus(item);

      this.init();
    }

    init() {
      this.imageAccordionsItems.forEach((item) => {
        item.addEventListener('mouseenter', this.accordionExpandEvent.bind(this, item));
      });

      this.buttons.forEach((button) => {
        button.addEventListener('focusin', this.accordionFocusEvent.bind(this, button));
      });
    }

    accordionExpand(item) {
      if (!item.classList.contains(classes$b.isExpanded)) {
        this.imageAccordionsItems.forEach((item) => {
          item.classList.remove(classes$b.isExpanded);
        });
        item.classList.add(classes$b.isExpanded);
      }
    }

    accordionFocus(button) {
      button.closest(selectors$g.item).dispatchEvent(new Event('mouseenter'));
    }

    onBlockSelect(evt) {
      const element = evt.target;
      if (element) {
        element.dispatchEvent(new Event('mouseenter'));
      }
    }
  }

  const imageAccordionsSection = {
    onLoad() {
      sections$c[this.id] = new ImageAccordions(this);
    },
    onBlockSelect(evt) {
      sections$c[this.id].onBlockSelect(evt);
    },
  };

  register('image-accordions', imageAccordionsSection);

  register('image-with-text', videoPlay);

  register('list-collections', gridSlider);

  const sections$b = {};

  const selectors$f = {
    slider: '[data-slider-gallery]',
    sliderNav: '[data-slider-info]',
    item: '[data-slide-item]',
  };

  class Locations {
    constructor(section) {
      this.container = section.container;
      this.slider = this.container.querySelector(selectors$f.slider);
      this.sliderNav = this.container.querySelector(selectors$f.sliderNav);

      this.initSlider();
    }

    initSlider() {
      const slidesCount = this.container.querySelectorAll(selectors$f.item).length;
      let flkty = Flickity.data(this.slider) || null;
      let flktyNav = Flickity.data(this.sliderNav) || null;

      if (slidesCount <= 1) {
        return;
      }

      flkty = new Flickity(this.slider, {
        fade: true,
        wrapAround: true,
        adaptiveHeight: true,
        prevNextButtons: false,
        pageDots: false,
      });

      // iOS smooth scrolling fix
      flickitySmoothScrolling(this.slider);

      flktyNav = new Flickity(this.sliderNav, {
        fade: true,
        wrapAround: true,
        imagesLoaded: true,
        lazyLoad: true,
        asNavFor: this.slider,
        prevNextButtons: true,
        pageDots: false,
      });

      // Trigger text change on image move/drag
      flktyNav.on('change', () => {
        flkty.selectCell(flktyNav.selectedIndex);
      });

      // Trigger text change on image move/drag
      flkty.on('change', () => {
        flktyNav.selectCell(flkty.selectedIndex);
      });
    }

    onBlockSelect(evt) {
      const flkty = Flickity.data(this.slider) || null;
      const flktyNav = Flickity.data(this.sliderNav) || null;
      const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

      if (flkty !== null) {
        flkty.select(index);
      }
      if (flktyNav !== null) {
        flktyNav.select(index);
      }
    }
  }

  const LocationsSection = {
    onLoad() {
      sections$b[this.id] = new Locations(this);
    },
    onBlockSelect(e) {
      sections$b[this.id].onBlockSelect(e);
    },
  };

  register('locations', LocationsSection);

  const sections$a = {};

  const selectors$e = {
    slider: '[data-slider]',
    sliderItem: '[data-slide-item]',
    pointer: '[data-pointer]',
    productGridItemImage: '[data-product-media-container]',
    quickViewItemHolder: '[data-quick-view-item-holder]',
    flickityButton: '.flickity-button',
    links: 'a, button',
    tooltip: '[data-tooltip]',
  };

  const attributes$c = {
    pointer: 'data-pointer',
    hotspot: 'data-hotspot',
    tabIndex: 'tabindex',
  };

  const classes$a = {
    productGridItemImageHover: 'product-grid-item__image--hovered',
    pointerSelected: 'pointer--selected',
    isSelected: 'is-selected',
    isActive: 'is-active',
    popupOpen: 'pswp--open',
  };

  class Look {
    constructor(container) {
      this.container = container;
      this.slider = this.container.querySelector(selectors$e.slider);
      this.slides = this.container.querySelectorAll(selectors$e.sliderItem);
      this.pointers = this.container.querySelectorAll(selectors$e.pointer);
      this.flkty = null;
      this.observer = null;

      this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
      this.pointersInit = (event) => this.dotPointers(event);
      this.pointersOver = (event) => this.dotPointerIn(event);
      this.pointersOut = (event) => this.dotPointerOut(event);

      this.debouncedBlockSelectCallback = debounce((event) => this.debouncedBlockSelect(event), 500);

      this.quickViewPopup = new QuickViewPopup(this.container);
      this.listen();
    }

    listen() {
      if (this.slider) {
        this.checkSlidesSize();
        document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
      }

      if (this.pointers.length > 0) {
        this.pointers.forEach((pointer) => {
          pointer.addEventListener('click', this.pointersInit);
          pointer.addEventListener('mouseover', this.pointersOver);
          pointer.addEventListener('mouseleave', this.pointersOut);
        });
      }
    }

    checkSlidesSize() {
      const isDesktop = window.innerWidth >= theme.sizes.small;

      this.initTooltips();

      if (isDesktop) {
        if (this.slides.length > 2) {
          this.initSlider();
        } else {
          this.destroySlider();
          this.slidesTabIndex();
        }

        return;
      }

      if (!isDesktop && this.slides.length > 1) {
        this.initSlider();

        return;
      }

      this.destroySlider();
    }

    initTooltips() {
      this.tooltips = this.container.querySelectorAll(selectors$e.tooltip);
      this.tooltips.forEach((tooltip) => {
        new Tooltip(tooltip);
      });
    }

    initSlider() {
      if (this.flkty === null) {
        this.flkty = new Flickity(this.slider, {
          prevNextButtons: true,
          wrapAround: true,
          adaptiveHeight: false,
          cellAlign: 'left',
          groupCells: false,
          contain: true,
          on: {
            ready: () => {
              this.slidesTabIndex();
              this.setSliderArrowsPosition();
              this.dotPointers();
            },
            change: () => {
              this.slidesTabIndex();
              this.dotPointers();
            },
          },
        });

        return;
      }

      this.setSliderArrowsPosition();
    }

    setSliderArrowsPosition() {
      const isDesktop = window.innerWidth >= theme.sizes.small;

      if (!isDesktop) return;

      const arrows = this.slider.querySelectorAll(selectors$e.flickityButton);
      const image = this.slider.querySelector(selectors$e.productGridItemImage);

      if (arrows.length && image) {
        arrows.forEach((arrow) => {
          arrow.style.top = `${image.offsetHeight / 2}px`;
        });
      }
    }

    slidesTabIndex() {
      if (this.slides.length < 3) {
        this.slider.querySelectorAll(selectors$e.links).forEach((link) => {
          link.setAttribute(attributes$c.tabIndex, '0');
        });

        return;
      }

      const slider = Flickity.data(this.slider);

      slider.cells.forEach((slide) => {
        slide.element.querySelectorAll(selectors$e.links).forEach((link) => {
          link.setAttribute(attributes$c.tabIndex, '-1');
        });
      });

      slider.cells.forEach((slide) => {
        if (slide.element.classList.contains(classes$a.isSelected)) {
          slide.element.querySelectorAll(selectors$e.links).forEach((link) => {
            link.setAttribute(attributes$c.tabIndex, '0');
          });

          // Used to add tabindex = 0 to the other slide element that's visible as well, but is not marked as selected
          const secondaryElement = slide.element.nextSibling ? slide.element.nextSibling : slide.element.parentNode.firstChild;

          secondaryElement.querySelectorAll(selectors$e.links).forEach((link) => {
            link.setAttribute(attributes$c.tabIndex, '0');
          });
        }
      });
    }

    destroySlider() {
      if (typeof this.flkty === 'object' && this.flkty !== null) {
        this.flkty.destroy();
        this.flkty = null;
      }
    }

    dotPointers(event) {
      if (this.pointers.length === 0) return;

      this.pointers.forEach((button) => {
        button.classList.remove(classes$a.pointerSelected);
      });

      if (event) {
        const dotIndex = event.target.getAttribute(attributes$c.pointer);

        this.flkty?.select(dotIndex);

        return;
      }

      const slideIndex = this.flkty == null ? 0 : this.flkty.selectedIndex;

      if (slideIndex >= 0) {
        this.pointers[slideIndex].classList.add(classes$a.pointerSelected);
      }
    }

    dotPointerIn(event) {
      const dotIndex = event.target.getAttribute(attributes$c.pointer);
      const image = this.slides[dotIndex].querySelector(selectors$e.productGridItemImage);
      const isTouch = matchMedia('(pointer:coarse)').matches;
      const isMobile = window.innerWidth < theme.sizes.small;
      if (!isMobile && !isTouch) {
        this.observeImage(image);
      }

      this.pointers.forEach((pointer) => {
        pointer.style.setProperty('--look-animation', 'none');
      });
    }

    dotPointerOut(event) {
      const dotIndex = event.target.getAttribute(attributes$c.pointer);
      const image = this.slides[dotIndex].querySelector(selectors$e.productGridItemImage);
      image.classList.remove(classes$a.productGridItemImageHover);
      image.dispatchEvent(new Event('mouseleave'));
      if (this.observer) {
        this.observer.disconnect();
      }

      this.pointers.forEach((pointer) => {
        pointer.style.removeProperty('--look-animation');
      });
    }

    observeImage(image) {
      this.observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            const target = entry.target;
            const outsideWrapper = entry.intersectionRatio == 0;

            if (!outsideWrapper) {
              target.dispatchEvent(new Event('mouseenter'));
              target.classList.add(classes$a.productGridItemImageHover);
            }
          });
        },
        {
          root: this.slider,
          threshold: [0.95, 1],
        }
      );
      this.observer.observe(image);
    }

    triggerClick(target) {
      requestAnimationFrame(() => target.dispatchEvent(new Event('click')));
    }

    destroyQuickViewPopup() {
      const pswpElement = this.quickViewPopup?.loadPhotoswipe?.pswpElement;
      if (!pswpElement) return;
      if (pswpElement.classList.contains(classes$a.popupOpen)) {
        this.quickViewPopup.loadPhotoswipe.popup.close();
      }
    }

    /**
     * Event callback for Theme Editor `shopify:block:select` event
     * The timeouts here are necessary for issues with selecting blocks from one `Shop the look` section to another
     */
    onBlockSelect(event) {
      this.debouncedBlockSelectCallback(event);
    }

    debouncedBlockSelect(event) {
      const pswpElement = this.quickViewPopup?.loadPhotoswipe?.pswpElement;

      // No popup element
      if (!pswpElement) {
        setTimeout(() => this.triggerClick(event.target), 400);
        return;
      }

      setTimeout(() => {
        // Popup initialized
        if (pswpElement.classList.contains(classes$a.popupOpen)) {
          // Popup opened
          const holder = this.quickViewPopup.loadPhotoswipe.pswpElement.querySelector(`[${attributes$c.hotspot}="${event.target.getAttribute(attributes$c.hotspot)}"]`);
          const quickViewItemHolders = this.quickViewPopup.loadPhotoswipe.pswpElement.querySelectorAll(selectors$e.quickViewItemHolder);

          holder.classList.add(classes$a.isActive);

          quickViewItemHolders.forEach((element) => {
            if (element !== holder) {
              element.classList.remove(classes$a.isActive);
            }
          });
        } else {
          // Popup closed
          this.triggerClick(event.target);
        }
      });
    }

    /**
     * Event callback for Theme Editor `shopify:section:unload` event
     */
    onUnload() {
      this.destroyQuickViewPopup();
      document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
    }

    /**
     * Event callback for Theme Editor `shopify:section:deselect` event
     */
    onDeselect() {
      this.destroyQuickViewPopup();
    }
  }

  const lookSection = {
    onLoad() {
      sections$a[this.id] = new Look(this.container);
    },
    onUnload() {
      sections$a[this.id].onUnload();
    },
    onBlockSelect(event) {
      sections$a[this.id].onBlockSelect(event);
    },
    onDeselect() {
      sections$a[this.id].onDeselect();
    },
  };

  register('look', [lookSection, productGrid]);

  const selectors$d = {
    grid: '[data-grid]',
  };

  const mosaicSection = {
    onBlockSelect(e) {
      const grid = e.target.closest(selectors$d.grid);
      const wrapperStyle = grid.currentStyle || window.getComputedStyle(grid);
      const wrapperPadding = parseInt(wrapperStyle.paddingLeft);
      const blockPositionLeft = e.target.offsetLeft - wrapperPadding;

      // Native scroll to item
      grid.scrollTo({
        top: 0,
        left: blockPositionLeft,
        behavior: 'smooth',
      });
    },
  };

  register('mosaic', mosaicSection);

  register('newsletter', newsletterSection);

  register('overlapping-images', videoPlay);

  const selectors$c = {
    toggleAdmin: '[data-toggle-admin]',
    toggleNewsletter: '[data-toggle-newsletter]',
    adminForm: '[data-form-admin]',
    newsletterForm: '[data-form-newsletter]',
  };

  let sections$9 = {};

  class Password {
    constructor(section) {
      this.container = section.container;
      this.toggleAdmin = this.container.querySelector(selectors$c.toggleAdmin);
      this.toggleNewsletter = this.container.querySelector(selectors$c.toggleNewsletter);
      this.adminForm = this.container.querySelector(selectors$c.adminForm);
      this.newsletterForm = this.container.querySelector(selectors$c.newsletterForm);
      this.adminErrors = this.adminForm.querySelector('.errors');
      this.newsletterErrors = this.newsletterForm.querySelector('.errors');

      this.init();
    }

    init() {
      this.toggleAdmin.addEventListener('click', (e) => {
        e.preventDefault();
        this.showPasswordForm();
      });

      this.toggleNewsletter.addEventListener('click', (e) => {
        e.preventDefault();
        this.hidePasswordForm();
      });

      if (window.location.hash == '#login' || this.adminErrors) {
        this.showPasswordForm();
      } else {
        this.hidePasswordForm();
      }
    }

    showPasswordForm() {
      showElement(this.adminForm);
      hideElement(this.newsletterForm);
      window.location.hash = '#login';
    }

    hidePasswordForm() {
      showElement(this.newsletterForm);
      hideElement(this.adminForm);
      window.location.hash = '';
    }
  }

  const passwordSection = {
    onLoad() {
      sections$9[this.id] = new Password(this);
    },
  };

  register('password-template', passwordSection);

  const selectors$b = {
    largePromo: '[data-large-promo]',
    largePromoInner: '[data-large-promo-inner]',
    tracking: '[data-tracking-consent]',
    trackingInner: '[data-tracking-consent-inner]',
    trackingAccept: '[data-confirm-cookies]',
    popupBar: '[data-popup-bar]',
    popupBarHolder: '[data-popup-bar-holder]',
    popupBarToggle: '[data-popup-bar-toggle]',
    popupBody: '[data-popup-body]',
    popupClose: '[data-popup-close]',
    popupUnderlay: '[data-popup-underlay]',
    newsletterForm: '[data-newsletter-form]',
  };

  const attributes$b = {
    cookieName: 'data-cookie-name',
    targetReferrer: 'data-target-referrer',
    preventScrollLock: 'data-prevent-scroll-lock',
  };

  const classes$9 = {
    success: 'has-success',
    error: 'has-error',
    selected: 'selected',
    hasBlockSelected: 'has-block-selected',
    expanded: 'popup--expanded',
    visible: 'popup--visible',
    mobile: 'mobile',
    desktop: 'desktop',
    popupBar: 'popup--bar',
    barIsVisible: 'popup-bar-is-visible',
  };

  let sections$8 = {};
  let scrollLockTimer = 0;
  let activePopups = 0;
  let popups = [];

  class DelayShow {
    constructor(popupContainer, popup) {
      this.popupContainer = popupContainer;
      this.popup = popup;
      this.popupBody = popup.querySelector(selectors$b.popupBody);
      this.delay = popupContainer.dataset.popupDelay;
      this.isSubmitted = window.location.href.indexOf('accepts_marketing') !== -1 || window.location.href.indexOf('customer_posted=true') !== -1;
      this.a11y = a11y;
      this.showPopupOnScrollEvent = () => this.showPopupOnScroll();

      if (this.delay === 'always' || this.isSubmitted) {
        this.always();
      }

      if (this.delay && this.delay.includes('delayed') && !this.isSubmitted) {
        const seconds = this.delay.includes('_') ? parseInt(this.delay.split('_')[1]) : 10;
        this.delayed(seconds);
      }

      if (this.delay === 'bottom' && !this.isSubmitted) {
        this.bottom();
      }

      if (this.delay === 'idle' && !this.isSubmitted) {
        this.idle();
      }
    }

    always() {
      this.showPopup();
    }

    delayed(seconds = 10) {
      setTimeout(() => {
        // Show popup after specific seconds
        this.showPopup();
      }, seconds * 1000);
    }

    // Scroll to the bottom of the page
    bottom() {
      document.addEventListener('theme:scroll', this.showPopupOnScrollEvent);
    }

    // Idle for 1 min
    idle() {
      const isTargetValid = this.checkPopupTarget() === true;
      if (!isTargetValid) {
        return;
      }

      let timer = 0;
      let idleTime = 60000;
      const documentEvents = ['mousemove', 'mousedown', 'click', 'touchmove', 'touchstart', 'touchend', 'keydown', 'keypress'];
      const windowEvents = ['load', 'resize', 'scroll'];

      const startTimer = () => {
        timer = setTimeout(() => {
          timer = 0;
          this.showPopup();
        }, idleTime);

        documentEvents.forEach((eventType) => {
          document.addEventListener(eventType, resetTimer);
        });

        windowEvents.forEach((eventType) => {
          window.addEventListener(eventType, resetTimer);
        });
      };

      const resetTimer = () => {
        if (timer) {
          clearTimeout(timer);
        }

        documentEvents.forEach((eventType) => {
          document.removeEventListener(eventType, resetTimer);
        });

        windowEvents.forEach((eventType) => {
          window.removeEventListener(eventType, resetTimer);
        });

        startTimer();
      };

      startTimer();
    }

    showPopup() {
      // Push every popup in array, so we can focus the next one, after closing each
      const popupElement = {id: this.popup.id, body: this.popupBody};
      popups.push(popupElement);

      const isTargetValid = this.checkPopupTarget() === true;

      if (isTargetValid) {
        activePopups += 1;
        this.popup.classList.add(classes$9.visible);
        if (this.popup.classList.contains(classes$9.popupBar)) {
          document.body.classList.add(classes$9.barIsVisible);
        }

        this.a11y.trapFocus({
          container: this.popupBody,
        });

        // The scroll is not locking if data-prevent-scroll-lock is added to the Popup container
        if (this.popup.hasAttribute(attributes$b.preventScrollLock)) {
          return false;
        }

        this.scrollLock();
      }
    }

    checkPopupTarget() {
      const targetMobile = this.popup.parentNode.classList.contains(classes$9.mobile);
      const targetDesktop = this.popup.parentNode.classList.contains(classes$9.desktop);

      if ((targetMobile && window.innerWidth >= theme.sizes.small) || (targetDesktop && window.innerWidth < theme.sizes.small)) {
        return false;
      } else {
        return true;
      }
    }

    scrollLock() {
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popupBody}));
    }

    showPopupOnScroll() {
      if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
        this.showPopup();
        document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
      }
    }

    onUnload() {
      document.removeEventListener('theme:scroll', this.showPopupOnScrollEvent);
    }
  }

  class TargetReferrer {
    constructor(el) {
      this.popupContainer = el;
      this.locationPath = location.href;

      if (!this.popupContainer.hasAttribute(attributes$b.targetReferrer)) {
        return false;
      }

      if (this.locationPath.indexOf(this.popupContainer.getAttribute(attributes$b.targetReferrer)) === -1 && !window.Shopify.designMode) {
        this.popupContainer.parentNode.removeChild(this.popupContainer);
      }
    }
  }

  class LargePopup {
    constructor(el) {
      this.popupContainer = el;
      this.popup = this.popupContainer.querySelector(selectors$b.largePromoInner);
      this.popupBody = this.popup.querySelector(selectors$b.popupBody);
      this.popupId = this.popup.id;
      this.close = this.popup.querySelector(selectors$b.popupClose);
      this.underlay = this.popup.querySelector(selectors$b.popupUnderlay);
      this.form = this.popup.querySelector(selectors$b.newsletterForm);
      this.cookie = new PopupCookie(this.popupContainer.dataset.cookieName, 'user_has_closed');
      this.isTargeted = new TargetReferrer(this.popupContainer);
      this.a11y = a11y;

      this.init();
    }

    init() {
      const cookieExists = this.cookie.read() !== false;

      if (!cookieExists || window.Shopify.designMode) {
        if (!window.Shopify.designMode) {
          new DelayShow(this.popupContainer, this.popup);
        } else {
          this.showPopup();
        }

        if (this.form) {
          setTimeout(() => {
            if (this.form.classList.contains(classes$9.success)) {
              this.showPopupIfNoCookie();
              activePopups -= 1;
            }
          });
        }

        this.initClosers();
      }
    }

    checkPopupTarget() {
      const targetMobile = this.popup.parentNode.classList.contains(classes$9.mobile);
      const targetDesktop = this.popup.parentNode.classList.contains(classes$9.desktop);

      if ((targetMobile && window.innerWidth >= theme.sizes.small) || (targetDesktop && window.innerWidth < theme.sizes.small)) {
        return false;
      } else {
        return true;
      }
    }

    showPopupIfNoCookie() {
      this.showPopup();
    }

    initClosers() {
      this.close.addEventListener('click', this.closePopup.bind(this));
      this.underlay.addEventListener('click', this.closePopup.bind(this));
      this.popupContainer.addEventListener('keyup', (event) => {
        if (event.code === theme.keyboardKeys.ESCAPE) {
          this.closePopup(event);
        }
      });
    }

    closePopup(event) {
      event.preventDefault();
      this.hidePopup();
      this.cookie.write();
    }

    scrollLock() {
      this.resetScrollUnlock();
      this.a11y.trapFocus({
        container: this.popupBody,
      });
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popupBody}));
    }

    scrollUnlock() {
      this.resetScrollUnlock();

      // Unlock scrollbar after popup animation completes
      scrollLockTimer = setTimeout(() => {
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }, 300);
    }

    resetScrollUnlock() {
      if (scrollLockTimer) {
        clearTimeout(scrollLockTimer);
      }
    }

    showPopup() {
      const isTargetValid = this.checkPopupTarget() === true;
      const popupElement = {id: this.popupId, body: this.popup};
      popups.push(popupElement);
      if (isTargetValid) {
        activePopups += 1;
        this.popup.classList.add(classes$9.visible);
        this.scrollLock();
      }
    }

    hidePopup() {
      this.popup.classList.remove(classes$9.visible);
      const popupIndex = popups.findIndex((x) => x.id === this.popupId);
      activePopups -= 1;
      popups.splice(popupIndex, 1);

      if (activePopups == 1 && document.body.classList.contains(classes$9.barIsVisible)) {
        this.scrollUnlock();
      } else if (activePopups < 1) {
        this.scrollUnlock();
        this.a11y.removeTrapFocus();
      } else if (popups.length > 0) {
        const nextPopup = popups[popups.length - 1].body;
        this.a11y.trapFocus({
          container: nextPopup,
        });
      }
    }

    onBlockSelect(evt) {
      if (this.popupContainer.contains(evt.target) && !this.popup.classList.contains(classes$9.visible)) {
        this.popup.classList.add(classes$9.selected);
        this.popupContainer.classList.add(classes$9.hasBlockSelected);
        this.showPopup();
      }
    }

    onBlockDeselect(evt) {
      if (this.popupContainer.contains(evt.target)) {
        this.popup.classList.remove(classes$9.selected);
        this.popupContainer.classList.remove(classes$9.hasBlockSelected);
        this.hidePopup();
      }
    }

    onUnload() {
      this.scrollUnlock();
    }

    onDeselect() {
      this.popup.classList.remove(classes$9.selected);
      this.popupContainer.classList.remove(classes$9.hasBlockSelected);
      this.hidePopup();
    }
  }

  class Tracking {
    constructor(el) {
      this.popupContainer = el;
      this.popup = this.popupContainer.querySelector(selectors$b.trackingInner);
      this.popupId = this.popup.id;
      this.close = this.popup.querySelector(selectors$b.popupClose);
      this.acceptButton = this.popup.querySelector(selectors$b.trackingAccept);
      this.enable = this.popupContainer.dataset.enable === 'true';
      this.a11y = a11y;

      window.Shopify.loadFeatures(
        [
          {
            name: 'consent-tracking-api',
            version: '0.1',
          },
        ],
        (error) => {
          if (error) {
            throw error;
          }

          const userCanBeTracked = window.Shopify.customerPrivacy.userCanBeTracked();
          const userTrackingConsent = window.Shopify.customerPrivacy.getTrackingConsent();

          this.enableTracking = !userCanBeTracked && userTrackingConsent === 'no_interaction' && this.enable;

          if (window.Shopify.designMode) {
            this.enableTracking = true;
          }

          this.init();
        }
      );
    }

    init() {
      if (this.enableTracking) {
        this.showPopup();
      }

      this.clickEvents();
    }

    clickEvents() {
      this.close.addEventListener('click', (event) => {
        event.preventDefault();

        window.Shopify.customerPrivacy.setTrackingConsent(false, () => this.hidePopup());
      });

      this.acceptButton.addEventListener('click', (event) => {
        event.preventDefault();

        window.Shopify.customerPrivacy.setTrackingConsent(true, () => this.hidePopup());
      });

      document.addEventListener('trackingConsentAccepted', () => {
        console.log('trackingConsentAccepted event fired');
      });
    }

    showPopup() {
      const popupElement = {id: this.popupId, body: this.popup};
      popups.push(popupElement);
      this.popup.classList.add(classes$9.visible);
      this.a11y.trapFocus({
        container: this.popup,
      });
    }

    hidePopup() {
      this.popup.classList.remove(classes$9.visible);
      const popupIndex = popups.findIndex((x) => x.id === this.popupId);
      popups.splice(popupIndex, 1);

      if (activePopups < 1) {
        this.a11y.removeTrapFocus();
      } else if (popups.length > 0) {
        const nextPopup = popups[popups.length - 1].body;
        this.a11y.trapFocus({
          container: nextPopup,
        });
      }
    }

    onBlockSelect(evt) {
      if (this.popupContainer.contains(evt.target) && this.enableTracking && !this.popup.classList.contains(classes$9.visible)) {
        this.showPopup();
        this.popup.classList.add(classes$9.selected);
        this.popup.parentNode.classList.add(classes$9.hasBlockSelected);
      }
    }

    onBlockDeselect(evt) {
      if (this.popupContainer.contains(evt.target)) {
        this.popup.classList.remove(classes$9.selected);
        this.popupContainer.classList.remove(classes$9.hasBlockSelected);
        this.hidePopup();
      }
    }

    onDeselect() {
      this.popup.classList.remove(classes$9.selected);
      this.popupContainer.classList.remove(classes$9.hasBlockSelected);
      this.hidePopup();
    }
  }

  class PopupBar {
    constructor(el) {
      this.popupContainer = el;
      this.popup = this.popupContainer.querySelector(selectors$b.popupBarHolder);
      this.popupBody = this.popup.querySelector(selectors$b.popupBody);
      this.popupId = this.popup.id;
      this.close = this.popup.querySelector(selectors$b.popupClose);
      this.underlay = this.popup.querySelector(selectors$b.popupUnderlay);
      this.toggle = this.popup.querySelector(selectors$b.popupBarToggle);
      this.cookie = new PopupCookie(this.popupContainer.dataset.cookieName, 'user_has_closed');
      this.form = this.popup.querySelector(selectors$b.newsletterForm);
      this.isTargeted = new TargetReferrer(this.popupContainer);
      this.a11y = a11y;

      this.init();
    }

    init() {
      const cookieExists = this.cookie.read() !== false;

      if (!cookieExists || window.Shopify.designMode) {
        if (!window.Shopify.designMode) {
          new DelayShow(this.popupContainer, this.popup);
        } else {
          this.showPopup();
        }

        this.initPopupToggleButton();
        this.initClosers();

        if (this.form) {
          setTimeout(() => {
            if (this.form.classList.contains(classes$9.success)) {
              this.showPopupIfNoCookie();
            }

            if (this.form.classList.contains(classes$9.error)) {
              // Expand popup if form has error
              this.toggle.dispatchEvent(new Event('click'));
            }
          });
        }
      }
    }

    checkPopupTarget() {
      const targetMobile = this.popup.parentNode.classList.contains(classes$9.mobile);
      const targetDesktop = this.popup.parentNode.classList.contains(classes$9.desktop);

      if ((targetMobile && window.innerWidth >= theme.sizes.small) || (targetDesktop && window.innerWidth < theme.sizes.small)) {
        return false;
      } else {
        return true;
      }
    }

    showPopupIfNoCookie() {
      this.showPopup();
      this.toggle.dispatchEvent(new Event('click'));
    }

    initPopupToggleButton() {
      this.toggle.addEventListener('click', (event) => {
        event.preventDefault();

        this.popup.classList.toggle(classes$9.expanded);

        if (this.popup.classList.contains(classes$9.expanded)) {
          this.scrollLock();
        } else {
          this.scrollUnlock();
        }
      });
    }

    showPopup() {
      const popupElement = {id: this.popupId, body: this.popup};
      popups.push(popupElement);
      this.a11y.trapFocus({
        container: this.popupBody,
      });
      const isTargetValid = this.checkPopupTarget() === true;
      if (isTargetValid) {
        activePopups += 1;
        document.body.classList.add(classes$9.barIsVisible);
        this.popup.classList.add(classes$9.visible);
      }
    }

    hidePopup() {
      this.popup.classList.remove(classes$9.visible);
      document.body.classList.remove(classes$9.barIsVisible);
      const popupIndex = popups.findIndex((x) => x.id === this.popupId);
      popups.splice(popupIndex, 1);

      if (activePopups >= 1) {
        activePopups -= 1;
      }

      if (activePopups < 1) {
        this.scrollUnlock();
        this.a11y.removeTrapFocus();
      } else if (popups.length > 0) {
        const nextPopup = popups[popups.length - 1].body;
        this.a11y.trapFocus({
          container: nextPopup,
        });
      }
    }

    initClosers() {
      this.close.addEventListener('click', this.closePopup.bind(this));
      this.underlay.addEventListener('click', () => this.toggle.dispatchEvent(new Event('click')));
      this.popupContainer.addEventListener('keyup', (event) => {
        if (event.code === theme.keyboardKeys.ESCAPE) {
          this.popup.classList.remove(classes$9.expanded);
          this.scrollUnlock();
        }
      });
    }

    closePopup(event) {
      event.preventDefault();

      this.cookie.write();
      this.hidePopup();
    }

    scrollLock() {
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popupBody}));
    }

    scrollUnlock() {
      this.resetScrollUnlock();

      // Unlock scrollbar after popup animation completes
      scrollLockTimer = setTimeout(() => {
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }, 300);
    }

    resetScrollUnlock() {
      if (scrollLockTimer) {
        clearTimeout(scrollLockTimer);
      }
    }

    onBlockSelect(evt) {
      if (this.popupContainer.contains(evt.target) && !this.popup.classList.contains(classes$9.visible)) {
        this.showPopup();
        this.popup.classList.add(classes$9.expanded);
        this.popup.classList.add(classes$9.selected);
        this.popup.parentNode.classList.add(classes$9.hasBlockSelected);
        this.resetScrollUnlock();
        this.scrollLock();
      }
    }

    onBlockDeselect(evt) {
      if (this.popupContainer.contains(evt.target)) {
        this.popup.classList.remove(classes$9.expanded);
        this.popup.classList.remove(classes$9.selected);
        this.popup.parentNode.classList.remove(classes$9.hasBlockSelected);
        this.hidePopup();
      }
    }

    onUnload() {
      this.scrollUnlock();
    }

    onDeselect() {
      this.popup.classList.remove(classes$9.expanded);
      this.popup.classList.remove(classes$9.selected);
      this.popup.parentNode.classList.remove(classes$9.hasBlockSelected);
      this.hidePopup();
    }
  }

  const popupSection = {
    onLoad() {
      sections$8[this.id] = [];

      if (window.Shopify.designMode) {
        activePopups = 0;
      }

      const popupsLarge = this.container.querySelectorAll(selectors$b.largePromo);
      if (popupsLarge.length) {
        popupsLarge.forEach((el) => {
          sections$8[this.id].push(new LargePopup(el));
        });
      }

      const popupBars = this.container.querySelectorAll(selectors$b.popupBar);
      if (popupBars.length) {
        popupBars.forEach((el) => {
          sections$8[this.id].push(new PopupBar(el));
        });
      }

      const cookiesPopups = this.container.querySelectorAll(selectors$b.tracking);
      if (cookiesPopups.length) {
        cookiesPopups.forEach((el) => {
          sections$8[this.id].push(new Tracking(el));
        });
      }
    },
    onDeselect() {
      sections$8[this.id].forEach((el) => {
        if (typeof el.onDeselect === 'function') {
          el.onDeselect();
        }
      });
    },
    onBlockSelect(evt) {
      sections$8[this.id].forEach((el) => {
        if (typeof el.onBlockSelect === 'function') {
          el.onBlockSelect(evt);
        }
      });
    },
    onBlockDeselect(evt) {
      sections$8[this.id].forEach((el) => {
        if (typeof el.onBlockDeselect === 'function') {
          el.onBlockDeselect(evt);
        }
      });
    },
    onUnload(evt) {
      sections$8[this.id].forEach((el) => {
        if (typeof el.onUnload === 'function') {
          el.onUnload(evt);
        }
      });
    },
  };

  register('popups', [popupSection, newsletterSection]);

  const selectors$a = {
    pressItems: '[data-press-items]',
    logoSlider: '[data-logo-slider]',
    logoSlide: '[data-logo-slide]',
    links: 'a, button',
  };

  const attributes$a = {
    logoSlide: 'data-logo-index',
    tabIndex: 'tabindex',
  };

  let sections$7 = {};

  class Press {
    constructor(section) {
      this.container = section.container;
      this.slider = this.container.querySelector(selectors$a.pressItems);
      this.sliderNav = this.container.querySelector(selectors$a.logoSlider);
      this.sliderResizeEvent = () => this.checkSlides();

      this.initSlider();
      this.checkSlides();

      window.addEventListener('load', this.resizeSlider.bind(this));
      document.addEventListener('theme:resize:width', this.sliderResizeEvent);
    }

    checkSlides() {
      const containerWidth = this.container.offsetWidth;
      const slides = this.container.querySelectorAll(selectors$a.logoSlide);
      const sliderNav = Flickity.data(this.sliderNav) || null;

      if (sliderNav !== null) {
        sliderNav.options.draggable = false;
        sliderNav.options.wrapAround = false;
        sliderNav.options.contain = true;

        if (this.getSlidesWidth() > containerWidth && slides.length > 2) {
          sliderNav.options.draggable = true;
          sliderNav.options.wrapAround = true;
          sliderNav.options.contain = false;
        }
        sliderNav.resize();
        sliderNav.updateDraggable();
      }
    }

    getSlidesWidth() {
      const slides = this.container.querySelectorAll(selectors$a.logoSlide);
      let slidesTotalWidth = 0;

      if (slides.length) {
        slides.forEach((slide) => {
          slidesTotalWidth += slide.offsetWidth;
        });
      }
      return slidesTotalWidth;
    }

    /* Init slider */
    initSlider() {
      let flkty = Flickity.data(this.slider) || null;
      let flktyNav = Flickity.data(this.sliderNav) || null;

      flkty = new Flickity(this.slider, {
        fade: true,
        wrapAround: true,
        adaptiveHeight: true,
        prevNextButtons: false,
        pageDots: false,
      });

      flktyNav = new Flickity(this.sliderNav, {
        draggable: false,
        wrapAround: false,
        contain: true,
        imagesLoaded: true,
        lazyLoad: true,
        asNavFor: this.slider,
        prevNextButtons: false,
        adaptiveHeight: false,
        pageDots: false,
        on: {
          ready: () => {
            const slides = this.container.querySelectorAll(selectors$a.logoSlide);
            slides.forEach((slide) => {
              // Change slide text on logo change for a11y reasons
              slide.addEventListener('keyup', (event) => {
                if (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER || event.code === theme.keyboardKeys.SPACE) {
                  const selectedIndex = Number(slide.getAttribute(attributes$a.logoSlide));
                  flkty.selectCell(selectedIndex);
                }
              });
            });
          },
        },
      });

      // iOS smooth scrolling fix
      flickitySmoothScrolling(this.slider);
      flickitySmoothScrolling(this.sliderNav);

      // Trigger text change on image move/drag
      flktyNav.on('change', (index) => {
        flkty.selectCell(index);
      });

      // Trigger text change on image move/drag
      flkty.on('change', (index) => {
        flktyNav.selectCell(index);

        flkty.cells.forEach((slide, i) => {
          slide.element.querySelectorAll(selectors$a.links).forEach((link) => {
            link.setAttribute(attributes$a.tabIndex, i === index ? '0' : '-1');
          });
        });
      });
    }

    // slider height fix on window load
    resizeSlider() {
      const hasSlider = Flickity.data(this.slider);

      if (hasSlider) {
        hasSlider.resize();
      }
    }

    onBlockSelect(evt) {
      const slider = Flickity.data(this.slider) || null;
      const sliderNav = Flickity.data(this.sliderNav) || null;
      const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

      if (slider !== null) {
        slider.select(index);
      }

      if (sliderNav !== null) {
        sliderNav.select(index);
      }
    }

    onUnload() {
      document.removeEventListener('theme:resize:width', this.sliderResizeEvent);
    }
  }

  const pressSection = {
    onLoad() {
      sections$7[this.id] = new Press(this);
    },
    onUnload(e) {
      sections$7[this.id].onUnload(e);
    },
    onBlockSelect(e) {
      sections$7[this.id].onBlockSelect(e);
    },
  };

  register('press', pressSection);

  const selectors$9 = {
    slideshow: '[data-product-single-media-slider]',
    productInfo: '[data-product-info]',
    headerSticky: '[data-header-sticky]',
    headerHeight: '[data-header-height]',
  };

  const classes$8 = {
    sticky: 'is-sticky',
  };

  const attributes$9 = {
    stickyEnabled: 'data-sticky-enabled',
  };

  window.theme.variables = {
    productPageSticky: false,
  };

  const sections$6 = {};

  class ProductSticky {
    constructor(section) {
      this.container = section.container;
      this.stickyEnabled = this.container.getAttribute(attributes$9.stickyEnabled) === 'true';
      this.productInfo = this.container.querySelector(selectors$9.productInfo);
      this.stickyScrollTop = 0;
      this.scrollLastPosition = 0;
      this.stickyDefaultTop = 0;
      this.currentPoint = 0;
      this.defaultTopBottomSpacings = 30;
      this.scrollTop = window.scrollY;
      this.scrollDirectionDown = true;
      this.requestAnimationSticky = null;
      this.stickyFormLoad = true;
      this.stickyFormLastHeight = null;
      this.onChangeCounter = 0;
      this.scrollEvent = (e) => this.scrollEvents(e);
      this.resizeEvent = (e) => this.resizeEvents(e);

      this.init();
    }

    init() {
      if (this.stickyEnabled) {
        this.stickyScrollCheck();

        document.addEventListener('theme:resize', this.resizeEvent);
      }

      this.initSticky();
    }

    initSticky() {
      if (theme.variables.productPageSticky) {
        this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());

        this.productInfo.addEventListener('theme:form:sticky', (e) => {
          this.removeAnimationFrame();

          this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
        });

        document.addEventListener('theme:scroll', this.scrollEvent);
      }
    }

    scrollEvents(e) {
      if (e.detail !== null) {
        this.scrollTop = e.detail.position;
        this.scrollDirectionDown = e.detail.down;
      }

      if (!this.requestAnimationSticky) {
        this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition());
      }
    }

    resizeEvents() {
      this.stickyScrollCheck();

      document.removeEventListener('theme:scroll', this.scrollEvent);

      this.initSticky();
    }

    stickyScrollCheck() {
      const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const isDesktop = windowWidth >= window.theme.sizes.large;
      const targetProductInfo = this.container.querySelector(selectors$9.productInfo);

      if (!targetProductInfo) return;

      if (isDesktop) {
        const productInfo = this.container.querySelector(selectors$9.productInfo);
        const slideshow = this.container.querySelector(selectors$9.slideshow);

        if (!productInfo || !slideshow) return;
        const productCopyHeight = productInfo.offsetHeight;
        const productImagesHeight = slideshow.offsetHeight;

        // Is the product form and description taller than window space
        // Is also shorter than the window and images
        if (productCopyHeight < productImagesHeight) {
          theme.variables.productPageSticky = true;
          targetProductInfo.classList.add(classes$8.sticky);
        } else {
          theme.variables.productPageSticky = false;
          targetProductInfo.classList.remove(classes$8.sticky);
        }
      } else {
        theme.variables.productPageSticky = false;
        targetProductInfo.classList.remove(classes$8.sticky);
      }
    }

    calculateStickyPosition(e = null) {
      const eventExist = Boolean(e && e.detail);
      const isAccordion = Boolean(eventExist && e.detail.element && e.detail.element === 'accordion');
      const productInfoHeight = this.productInfo.offsetHeight;
      const heightDifference = window.innerHeight - productInfoHeight - this.defaultTopBottomSpacings;
      const scrollDifference = Math.abs(this.scrollTop - this.scrollLastPosition);

      if (this.scrollDirectionDown) {
        this.stickyScrollTop -= scrollDifference;
      } else {
        this.stickyScrollTop += scrollDifference;
      }

      if (this.stickyFormLoad) {
        if (document.querySelector(selectors$9.headerSticky) && document.querySelector(selectors$9.headerHeight)) {
          this.stickyDefaultTop = parseInt(document.querySelector(selectors$9.headerHeight).getBoundingClientRect().height);
        } else {
          this.stickyDefaultTop = this.defaultTopBottomSpacings;
        }

        this.stickyScrollTop = this.stickyDefaultTop;
      }

      this.stickyScrollTop = Math.min(Math.max(this.stickyScrollTop, heightDifference), this.stickyDefaultTop);

      const differencePoint = this.stickyScrollTop - this.currentPoint;
      this.currentPoint = this.stickyFormLoad ? this.stickyScrollTop : this.currentPoint + differencePoint * 0.5;

      this.productInfo.style.setProperty('--sticky-top', `${this.currentPoint}px`);

      this.scrollLastPosition = this.scrollTop;
      this.stickyFormLoad = false;

      if (
        (isAccordion && this.onChangeCounter <= 10) ||
        (isAccordion && this.stickyFormLastHeight !== productInfoHeight) ||
        (this.stickyScrollTop !== this.currentPoint && this.requestAnimationSticky)
      ) {
        if (isAccordion) {
          this.onChangeCounter += 1;
        }

        if (isAccordion && this.stickyFormLastHeight !== productInfoHeight) {
          this.onChangeCounter = 11;
        }

        this.requestAnimationSticky = requestAnimationFrame(() => this.calculateStickyPosition(e));
      } else if (this.requestAnimationSticky) {
        this.removeAnimationFrame();
      }

      this.stickyFormLastHeight = productInfoHeight;
    }

    removeAnimationFrame() {
      if (this.requestAnimationSticky) {
        cancelAnimationFrame(this.requestAnimationSticky);
        this.requestAnimationSticky = null;
        this.onChangeCounter = 0;
      }
    }

    onUnload() {
      if (this.stickyEnabled) {
        document.removeEventListener('theme:resize', this.resizeEvent);
      }

      if (theme.variables.productPageSticky) {
        document.removeEventListener('theme:scroll', this.scrollEvent);
      }
    }
  }

  const productStickySection = {
    onLoad() {
      sections$6[this.id] = new ProductSticky(this);
    },
    onUnload() {
      sections$6[this.id].onUnload();
    },
  };

  const selectors$8 = {
    mediaContainer: '[data-product-single-media-group]',
    productMediaSlider: '[data-product-single-media-slider]',
    zoomWrapper: '[data-zoom-wrapper]',
  };

  const classes$7 = {
    popupClass: 'pswp-zoom-gallery',
    popupClassNoThumbs: 'pswp-zoom-gallery--single',
    isMoving: 'is-moving',
  };

  const attributes$8 = {
    dataImageWidth: 'data-image-width',
    dataImageHeight: 'data-image-height',
  };

  class Zoom {
    constructor(container) {
      this.container = container;
      this.mediaContainer = this.container.querySelector(selectors$8.mediaContainer);
      this.slider = this.container.querySelector(selectors$8.productMediaSlider);
      this.zoomWrappers = this.container.querySelectorAll(selectors$8.zoomWrapper);
      this.zoomEnable = this.mediaContainer.dataset.gallery === 'true';
      this.a11y = a11y;

      if (this.zoomEnable) {
        this.init();
      }
    }

    init() {
      if (this.zoomWrappers.length) {
        this.zoomWrappers.forEach((element, i) => {
          element.addEventListener('click', (e) => {
            e.preventDefault();

            const isMoving = this.slider && this.slider.classList.contains(classes$7.isMoving);

            if (!isMoving) {
              this.a11y.state.trigger = element;
              this.createZoom(i);
            }
          });
        });
      }
    }

    createZoom(indexImage) {
      const instance = this;
      let items = [];
      let counter = 0;

      this.zoomWrappers.forEach((elementImage) => {
        const imgSrc = elementImage.getAttribute('href');
        const imgWidth = parseInt(elementImage.getAttribute(attributes$8.dataImageWidth));
        const imgHeight = parseInt(elementImage.getAttribute(attributes$8.dataImageHeight));

        items.push({
          src: imgSrc,
          w: imgWidth,
          h: imgHeight,
          msrc: imgSrc,
        });

        counter += 1;
        if (instance.zoomWrappers.length === counter) {
          let popupClass = `${classes$7.popupClass}`;

          if (counter === 1) {
            popupClass = `${classes$7.popupClass} ${classes$7.popupClassNoThumbs}`;
          }
          const options = {
            barsSize: {top: 60, bottom: 60},
            history: false,
            focus: false,
            index: indexImage,
            mainClass: popupClass,
            showHideOpacity: true,
            showAnimationDuration: 250,
            hideAnimationDuration: 250,
            closeOnScroll: false,
            closeOnVerticalDrag: false,
            captionEl: false,
            closeEl: true,
            closeElClasses: ['caption-close'],
            tapToClose: false,
            clickToCloseNonZoomable: false,
            maxSpreadZoom: 2,
            loop: true,
            spacing: 0,
            allowPanToNext: true,
            pinchToClose: false,
          };

          new LoadPhotoswipe(items, options);
        }
      });
    }
  }

  const selectors$7 = {
    complementaryProducts: '[data-complementary-products]',
    buttonQuickView: '[data-button-quick-view]',
  };

  const attributes$7 = {
    url: 'data-url',
  };

  class ComplementaryProducts extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);

        if (this.hasAttribute(attributes$7.url) && this.getAttribute(attributes$7.url) !== '') {
          fetch(this.getAttribute(attributes$7.url))
            .then((response) => response.text())
            .then((text) => {
              const html = document.createElement('div');
              html.innerHTML = text;
              const recommendations = html.querySelector(selectors$7.complementaryProducts);

              if (recommendations && recommendations.innerHTML.trim().length) {
                this.innerHTML = recommendations.innerHTML;
              }

              if (html.querySelector(selectors$7.buttonQuickView)) {
                new QuickViewPopup(this);
              }
            })
            .catch((e) => {
              console.error(e);
            });
        }
      };

      new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
    }
  }

  const selectors$6 = {
    option: '[data-option]',
    popout: '[data-popout]',
    productMediaSlider: '[data-product-single-media-slider]',
    productMediaThumb: '[data-thumbnail-id]',
    productMediaThumbs: '[data-product-single-media-thumbs]',
    productMediaWrapper: '[data-product-single-media-wrapper]',
    productModel: '[data-model]',
    productSingleThumbnailLink: '.product-single__thumbnail-link',
    deferredMedia: '[data-deferred-media]',
    deferredMediaButton: '[data-deferred-media-button]',
    modalScrollContainer: '[data-tabs-holder]',
    tooltip: '[data-tooltip]',
    productRating: '[data-product-rating]',
    productReviews: '#shopify-product-reviews',
    links: 'a, button',
    upsellProduct: '[data-upsell-holder]',
    upsellProductSlider: '[data-upsell-slider]',
    featureSlider: '[data-slider]',
  };

  const classes$6 = {
    featuredProduct: 'featured-product',
    featuredProductOnboarding: 'featured-product--onboarding',
    hasMediaActive: 'has-media-active',
    isSelected: 'is-selected',
    mediaHidden: 'media--hidden',
    noOutline: 'no-outline',
    hasPopup: 'has-popup',
    isMoving: 'is-moving',
  };

  const attributes$6 = {
    mediaId: 'data-media-id',
    sectionId: 'data-section-id',
    thumbId: 'data-thumbnail-id',
    dataTallLayout: 'data-tall-layout',
    loaded: 'loaded',
    tabindex: 'tabindex',
  };

  const sections$5 = {};

  class Product {
    constructor(section) {
      this.container = section.container;
      this.sectionId = this.container.getAttribute(attributes$6.sectionId);
      this.tallLayout = this.container.getAttribute(attributes$6.dataTallLayout) === 'true';
      this.featureSliders = this.container.querySelectorAll(selectors$6.featureSlider);
      this.flkty = null;
      this.flktyNav = null;
      this.isFlickityDragging = false;
      this.enableHistoryState = !this.container.classList.contains(classes$6.featuredProduct);
      this.checkSliderOnResize = () => this.checkSlider();
      this.flktyNavOnResize = () => this.resizeFlickityNav();

      this.scrollToReviews();
      this.initUpsellSlider();
      this.initFeatureSlider();

      new QuickViewPopup(this.container);

      // Skip initialization of product form, slider and media functions if section has onboarding content only
      if (this.container.classList.contains(classes$6.featuredProductOnboarding)) {
        return;
      }

      new Zoom(this.container);

      this.productSlider();
      this.initMediaSwitch();
      this.initProductVideo();
      this.initProductModel();
      this.initShopifyXrLaunch();
    }

    productSlider() {
      this.checkSlider();
      document.addEventListener('theme:resize:width', this.checkSliderOnResize);
    }

    checkSlider() {
      if (!this.tallLayout || window.innerWidth < theme.sizes.large) {
        this.initProductSlider();
        return;
      }

      this.destroyProductSlider();
    }

    resizeFlickityNav() {
      if (this.flktyNav !== null) {
        this.flktyNav.resize();
      }
    }

    /* Product Slider */
    initProductSlider() {
      const slider = this.container.querySelector(selectors$6.productMediaSlider);
      const thumbs = this.container.querySelector(selectors$6.productMediaThumbs);
      const media = this.container.querySelectorAll(selectors$6.productMediaWrapper);

      if (media.length > 1) {
        this.flkty = new Flickity(slider, {
          wrapAround: true,
          pageDots: false,
          adaptiveHeight: true,
          on: {
            ready: () => {
              slider.setAttribute(attributes$6.tabindex, '-1');

              media.forEach((item) => {
                if (!item.classList.contains(classes$6.isSelected)) {
                  const links = item.querySelectorAll(selectors$6.links);
                  if (links.length) {
                    links.forEach((link) => {
                      link.setAttribute(attributes$6.tabindex, '-1');
                    });
                  }
                }
              });
            },
            dragStart: () => {
              slider.classList.add(classes$6.isMoving);
            },
            dragMove: () => {
              // Prevent lightbox trigger on dragMove
              this.isFlickityDragging = true;
            },
            staticClick: () => {
              this.isFlickityDragging = false;
            },
            settle: (index) => {
              const currentSlide = this.flkty.selectedElement;
              const mediaId = currentSlide.getAttribute(attributes$6.mediaId);

              this.flkty.cells.forEach((slide, i) => {
                const links = slide.element.querySelectorAll(selectors$6.links);
                if (links.length) {
                  links.forEach((link) => {
                    link.setAttribute(attributes$6.tabindex, i === index ? '0' : '-1');
                  });
                }
              });
              this.switchMedia(mediaId);
              slider.classList.remove(classes$6.isMoving);
            },
          },
        });

        // Toggle flickity draggable functionality based on media play/pause state
        if (media.length) {
          media.forEach((el) => {
            el.addEventListener('theme:media:play', () => {
              this.flkty.options.draggable = false;
              this.flkty.updateDraggable();
              el.closest(selectors$6.productMediaSlider).classList.add(classes$6.hasMediaActive);
            });

            el.addEventListener('theme:media:pause', () => {
              this.flkty.options.draggable = true;
              this.flkty.updateDraggable();
              el.closest(selectors$6.productMediaSlider).classList.remove(classes$6.hasMediaActive);
            });
          });
        }

        // iOS smooth scrolling fix
        flickitySmoothScrolling(slider);

        if (thumbs !== null) {
          this.flktyNav = new Flickity(thumbs, {
            asNavFor: slider,
            contain: true,
            pageDots: false,
            prevNextButtons: false,
            resize: true,
            on: {
              ready: () => {
                thumbs.setAttribute(attributes$6.tabindex, '-1');
              },
            },
          });

          if (this.flktyNav !== null) {
            document.addEventListener('theme:resize:width', this.flktyNavOnResize);
          }

          // iOS smooth scrolling fix
          flickitySmoothScrolling(thumbs);

          // Disable link click
          const thumbLinks = this.container.querySelectorAll(selectors$6.productSingleThumbnailLink);
          if (thumbLinks.length) {
            thumbLinks.forEach((el) => {
              el.addEventListener('click', (e) => {
                e.preventDefault();
              });
            });
          }
        }
      }
    }

    destroyProductSlider() {
      if (this.flkty !== null) {
        this.flkty.destroy();
        this.flktyNav.destroy();

        this.flkty = null;
        this.flktyNav = null;
      }
    }

    /* Upsell Products Slider */
    initUpsellSlider() {
      const slider = this.container.querySelector(selectors$6.upsellProductSlider);
      const items = this.container.querySelectorAll(selectors$6.upsellProduct);

      if (items.length > 1) {
        const flktyUpsell = new Flickity(slider, {
          wrapAround: true,
          pageDots: true,
          adaptiveHeight: true,
          prevNextButtons: false,
        });

        flktyUpsell.on('change', (index) => {
          flktyUpsell.cells.forEach((slide, i) => {
            const links = slide.element.querySelectorAll(selectors$6.links);
            if (links.length) {
              links.forEach((link) => {
                link.setAttribute(attributes$6.tabindex, i === index ? '0' : '-1');
              });
            }
          });
        });
      }
    }

    /* Feature Block Slider */
    initFeatureSlider() {
      this.featureSliders.forEach((featureSliders) => {
        const featureSlideIndex = Array.from(featureSliders.children);

        if (featureSlideIndex.length > 1) {
          this.flktyFeature = new Flickity(featureSliders, {
            wrapAround: true,
            pageDots: true,
            adaptiveHeight: true,
            prevNextButtons: false,
          });
        }
      });
    }

    handleMediaFocus(event) {
      // Do nothing unless ENTER or TAB key are pressed
      if (event.code !== theme.keyboardKeys.ENTER && event.code !== theme.keyboardKeys.TAB) {
        return;
      }

      const mediaId = event.currentTarget.getAttribute(attributes$6.thumbId);
      const activeSlide = this.container.querySelector(`[${attributes$6.mediaId}="${mediaId}"]`);
      const slideIndex = parseInt([...activeSlide.parentNode.children].indexOf(activeSlide));
      const slider = this.container.querySelector(selectors$6.productMediaSlider);
      const sliderNav = this.container.querySelector(selectors$6.productMediaThumbs);
      const flkty = Flickity.data(slider) || null;
      const flktyNav = Flickity.data(sliderNav) || null;

      // Go to the related slide media
      if (flkty && flkty.isActive && slideIndex > -1 && (event.code === theme.keyboardKeys.ENTER || event.code === theme.keyboardKeys.NUMPADENTER)) {
        flkty.select(slideIndex);
      }

      // Move thumbs to the selected one
      if (flktyNav && flktyNav.isActive && slideIndex > -1) {
        flktyNav.select(slideIndex);
      }
    }

    switchMedia(mediaId) {
      const mediaItems = document.querySelectorAll(`${selectors$6.productMediaWrapper}`);
      const selectedMedia = this.container.querySelector(`${selectors$6.productMediaWrapper}[${attributes$6.mediaId}="${mediaId}"]`);
      const isFocusEnabled = !document.body.classList.contains(classes$6.noOutline);

      // Pause other media
      if (mediaItems.length) {
        mediaItems.forEach((media) => {
          media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
          media.classList.add(classes$6.mediaHidden);
        });
      }

      if (isFocusEnabled) {
        selectedMedia.focus();
      }

      selectedMedia.closest(selectors$6.productMediaSlider).classList.remove(classes$6.hasMediaActive);
      selectedMedia.classList.remove(classes$6.mediaHidden);
      selectedMedia.dispatchEvent(new CustomEvent('theme:media:visible'), {bubbles: true});

      // If media is not loaded, trigger poster button click to load it
      const deferredMedia = selectedMedia.querySelector(selectors$6.deferredMedia);
      if (deferredMedia && deferredMedia.getAttribute(attributes$6.loaded) !== 'true') {
        selectedMedia.querySelector(selectors$6.deferredMediaButton).dispatchEvent(new Event('click'));
      }
    }

    initMediaSwitch() {
      const productThumbImages = this.container.querySelectorAll(selectors$6.productMediaThumb);
      if (productThumbImages.length) {
        productThumbImages.forEach((el) => {
          el.addEventListener('keyup', this.handleMediaFocus.bind(this));
          el.addEventListener('click', (e) => {
            e.preventDefault();
          });
        });
      }
    }

    initProductVideo() {
      this.videos = new ProductVideo(this.container);
    }

    initProductModel() {
      const modelItems = this.container.querySelectorAll(selectors$6.productModel);
      if (modelItems.length) {
        modelItems.forEach((element) => {
          theme.ProductModel.init(element, this.sectionId);
        });
      }
    }

    initShopifyXrLaunch() {
      document.addEventListener('shopify_xr_launch', () => {
        const currentMedia = this.container.querySelector(`${selectors$6.productModel}:not(.${classes$6.mediaHidden})`);
        currentMedia.dispatchEvent(new CustomEvent('xrLaunch'));
      });
    }

    onUnload() {
      if (this.flktyNav !== null) {
        document.removeEventListener('theme:resize:width', this.flktyNavOnResize);
      }

      document.removeEventListener('theme:resize:width', this.checkSliderOnResize);
    }

    scrollToReviews() {
      const productRating = this.container.querySelector(selectors$6.productRating);
      const events = ['click', 'keydown'];

      if (!productRating) {
        return;
      }

      events.forEach((eventName) => {
        productRating.addEventListener(eventName, (event) => {
          if ((event.code !== theme.keyboardKeys.ENTER && event.code !== theme.keyboardKeys.NUMPADENTER) || event.type != 'click') {
            const reviewsContainer = document.querySelector(selectors$6.productReviews);

            if (!reviewsContainer) {
              return;
            }

            reviewsContainer.scrollIntoView({behavior: 'smooth'});
          }
        });
      });
    }

    onBlockSelect(event) {
      const flkty = Flickity.data(event.target.closest(selectors$6.featureSlider));
      const index = parseInt([...event.target.parentNode.children].indexOf(event.target));

      if (flkty) {
        flkty.select(index);
      }
    }
  }

  const productSection = {
    onLoad() {
      sections$5[this.id] = new Product(this);
    },
    onUnload: function () {
      sections$5[this.id].onUnload();
    },
    onBlockSelect(event) {
      sections$5[this.id].onBlockSelect(event);
    },
  };

  register('product-template', [productFormSection, productSection, swatchSection, shareButton, collapsible, tooltip, popoutSection, drawer, productStickySection]);
  register('featured-product', [productFormSection, productSection, swatchSection, shareButton, collapsible, tooltip, popoutSection, drawer, productStickySection]);

  if (!customElements.get('complementary-products')) {
    customElements.define('complementary-products', ComplementaryProducts);
  }

  const classes$5 = {
    isDisabled: 'is-disabled',
  };

  const attributes$5 = {
    circleTextParallax: 'data-circle-text-parallax',
  };

  class CircleText {
    constructor(el) {
      this.circleText = el;
      this.rotateDegree = 70;
      this.adjustRotateDegree = this.rotateDegree / 2; // We use this to keep the image upright when scrolling and it gets to the middle of the page

      this.scrollEvent = () => this.updateParallax();
      this.init();
    }

    init() {
      if (this.circleText.hasAttribute(attributes$5.circleTextParallax)) {
        document.addEventListener('theme:scroll', this.scrollEvent);
      }
    }

    updateParallax() {
      if (this.circleText.classList.contains(classes$5.isDisabled)) return;

      const windowHeight = Math.round(window.innerHeight);
      const scrollTop = Math.round(window.scrollY);
      const scrollBottom = scrollTop + windowHeight;
      const elementOffsetTopPoint = Math.round(this.circleText.getBoundingClientRect().top + scrollTop);
      const elementHeight = this.circleText.offsetHeight;
      const elementOffsetBottomPoint = elementOffsetTopPoint + elementHeight;
      const isBottomOfElementPassed = elementOffsetBottomPoint < scrollTop;
      const isTopOfElementReached = elementOffsetTopPoint < scrollBottom;
      const isInView = isTopOfElementReached && !isBottomOfElementPassed;

      if (isInView) {
        const scrollProgress = scrollBottom - elementOffsetTopPoint - elementHeight / 2;
        const percentage = (scrollProgress * 100) / windowHeight;
        let angle = ((this.rotateDegree * percentage) / 100) * -1; // The -1 negates the value to have it rotate counterclockwise

        if (percentage > 0) {
          this.circleText.style.transform = `rotate(${this.adjustRotateDegree + angle}deg)`;
        }
      }
    }

    unload() {
      document.removeEventListener('theme:scroll', this.scrollEvent);
    }
  }

  const attributes$4 = {
    href: 'href',
    mediaId: 'data-media-id',
    deferredMediaLoaded: 'data-deferred-media-loaded',
  };

  const selectors$5 = {
    deferredMedia: '[data-deferred-media]',
    deferredMediaButton: '[data-deferred-media-button]',
    productContentWrapper: '[data-product-content-wrapper]',
    productMediaWrapper: '[data-product-single-media-wrapper]',
    productModel: '[data-model]',
    productLink: '[data-product-link]',
    productSingleMediaImage: '[data-product-single-media-image]',
    sliderContents: '[data-slider-contents]',
    sliderImages: '[data-slider-images]',
    tabButton: '[data-tab-button]',
    tabItem: '[data-tab-item]',
    circleText: '[data-circle-text]',
  };

  const classes$4 = {
    aosAnimate: 'aos-animate',
    tabButtonActive: 'products-list__nav__button--active',
    tabItemActive: 'products-list__item--active',
    mediaHidden: 'media--hidden',
    isDisabled: 'is-disabled',
  };

  const sections$4 = {};

  class ProductsList {
    constructor(section) {
      this.container = section.container;
      this.sectionId = this.container.dataset.sectionId;
      this.tabButtons = this.container.querySelectorAll(selectors$5.tabButton);
      this.tabItems = this.container.querySelectorAll(selectors$5.tabItem);
      this.slidersImages = this.container.querySelectorAll(selectors$5.sliderImages);
      this.slidersContents = this.container.querySelectorAll(selectors$5.sliderContents);
      this.videos = [];
      this.flktyImages = [];
      this.flktyContent = [];
      this.sliderResizeEvent = () => this.resizeSlider();

      this.initButtons();
      this.initSliders();
      this.initProductVideos();
      this.initProductModel();
      this.initShopifyXrLaunch();
      this.initCircleText();
      this.listen();
    }

    listen() {
      if (this.slidersImages.length > 0 || this.slidersContents.length > 0) {
        document.addEventListener('theme:resize', this.sliderResizeEvent);
      }
    }

    resizeSlider() {
      if (this.flktyImages.length > 0) {
        requestAnimationFrame(() => {
          this.flktyImages.forEach((flktyImages) => flktyImages.resize());
        });
      }

      if (this.flktyContent.length > 0) {
        requestAnimationFrame(() => {
          this.flktyContent.forEach((flktyContent) => flktyContent.resize());
        });
      }
    }

    initButtons() {
      if (this.tabButtons.length) {
        this.tabButtons.forEach((tabButton) => {
          tabButton.addEventListener('click', (e) => {
            if (tabButton.classList.contains(classes$4.tabButtonActive)) {
              return;
            }

            const currentTabAnchor = tabButton.getAttribute(attributes$4.href);
            const currentTab = this.container.querySelector(currentTabAnchor);
            const currentMedia = currentTab.querySelector(selectors$5.productMediaWrapper);
            const mediaId = currentMedia ? currentMedia.dataset.mediaId : null;
            const currentCircleText = currentTab.querySelector(selectors$5.circleText);

            this.tabButtons.forEach((button) => {
              button.classList.remove(classes$4.tabButtonActive);
            });
            this.tabItems.forEach((item) => {
              const circleText = item.querySelector(selectors$5.circleText);
              item.classList.remove(classes$4.tabItemActive);
              circleText?.classList.add(classes$4.isDisabled);

              if (theme.settings.animations) {
                item.querySelectorAll(`.${classes$4.aosAnimate}`).forEach((element) => {
                  element.classList.remove(classes$4.aosAnimate);
                  setTimeout(() => {
                    element.classList.add(classes$4.aosAnimate);
                  });
                });
              }
            });

            tabButton.classList.add(classes$4.tabButtonActive);
            currentTab.classList.add(classes$4.tabItemActive);

            document.dispatchEvent(new Event('theme:resize')); // Trigger theme:resize event to refresh the slider height

            if (currentCircleText) {
              currentCircleText.classList.remove(classes$4.isDisabled);
              document.dispatchEvent(new Event('theme:scroll')); // Trigger theme:scroll event to refresh the circle-text values
            }

            this.handleProductVideos(currentTab, mediaId);

            e.preventDefault();
          });
        });
      }
    }

    initSliders() {
      this.slidersImages.forEach((sliderImages, idx) => {
        const contentsElement = sliderImages.closest(selectors$5.tabItem).querySelector(selectors$5.sliderContents);

        const flktyImages = new Flickity(sliderImages, {
          fade: true,
          pageDots: false,
          prevNextButtons: true,
          wrapAround: true,
          adaptiveHeight: true,
          asNavFor: contentsElement,
          on: {
            change: (index) => {
              if (this.flktyContent.length > 0) {
                this.flktyContent[idx].select(index);
              }
            },
          },
        });

        flktyImages.on('settle', (index) => {
          const elements = sliderImages.querySelectorAll(selectors$5.productMediaWrapper);

          for (let i = 0; i < elements.length; i++) {
            if (i === index) {
              elements[i].querySelector(selectors$5.productSingleMediaImage).removeAttribute('tabindex');
            } else {
              elements[i].querySelector(selectors$5.productSingleMediaImage).setAttribute('tabindex', '-1');
            }
          }
        });

        this.flktyImages.push(flktyImages);
      });

      this.slidersContents.forEach((sliderContent) => {
        const flktyContent = new Flickity(sliderContent, {
          fade: true,
          pageDots: false,
          prevNextButtons: false,
          wrapAround: true,
          adaptiveHeight: true,
        });

        flktyContent.on('settle', (index) => {
          const elements = sliderContent.querySelectorAll(selectors$5.productContentWrapper);

          for (let i = 0; i < elements.length; i++) {
            if (i === index) {
              elements[i].querySelectorAll(selectors$5.productLink).forEach((element) => {
                element.removeAttribute('tabindex');
              });
            } else {
              elements[i].querySelectorAll(selectors$5.productLink).forEach((element) => {
                element.setAttribute('tabindex', '-1');
              });
            }
          }
        });

        this.flktyContent.push(flktyContent);
      });
    }

    initProductVideos() {
      this.tabItems.forEach((item) => {
        if (item.classList.contains(classes$4.tabItemActive)) {
          this.handleProductVideos(item);
        }
      });
    }

    loadVideos(container, mediaId = null) {
      const videoObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const productVideo = new ProductVideo(container);

              this.videos.push(productVideo);
              container.setAttribute(attributes$4.deferredMediaLoaded, '');
              this.playToggle(mediaId);

              observer.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '300px',
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        }
      );

      videoObserver.observe(container);
    }

    handleProductVideos(container, mediaId = null) {
      if (!container.hasAttribute(attributes$4.deferredMediaLoaded)) {
        this.loadVideos(container, mediaId);
        return;
      }

      this.playToggle(mediaId);
    }

    playToggle(mediaId) {
      this.videos.forEach((element) => {
        if (typeof element.pauseContainerMedia === 'function' && mediaId) {
          element.pauseContainerMedia(mediaId, this.container);
          this.switchMedia(mediaId);
        }

        if (!mediaId && Object.keys(element.players).length === 0) {
          this.pauseContainerMedia(this.container);
        }
      });
    }

    switchMedia(mediaId) {
      const selectedMedia = this.container.querySelector(`${selectors$5.productMediaWrapper}[${attributes$4.mediaId}="${mediaId}"]`);
      const isFocusEnabled = !document.body.classList.contains(classes$4.noOutline);

      if (isFocusEnabled) {
        selectedMedia.focus();
      }

      selectedMedia.classList.remove(classes$4.mediaHidden);
      selectedMedia.dispatchEvent(new CustomEvent('theme:media:visible'), {bubbles: true});
    }

    pauseContainerMedia(container) {
      const mediaItems = container.querySelectorAll(selectors$5.productMediaWrapper);

      if (mediaItems.length === 0) return;

      mediaItems.forEach((media) => {
        media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
        media.classList.add(classes$4.mediaHidden);
      });
    }

    initProductModel() {
      const modelItems = this.container.querySelectorAll(selectors$5.productModel);
      if (modelItems.length) {
        modelItems.forEach((element) => {
          theme.ProductModel.init(element, this.sectionId);
        });
      }
    }

    initShopifyXrLaunch() {
      document.addEventListener('shopify_xr_launch', () => {
        const currentMedia = this.container.querySelector(`${selectors$5.productModel}:not(.${classes$4.mediaHidden})`);
        currentMedia.dispatchEvent(new CustomEvent('xrLaunch'));
      });
    }

    initCircleText() {
      const elements = this.container.querySelectorAll(selectors$5.circleText);

      elements.forEach((circleText) => {
        new CircleText(circleText);
      });
    }

    onBlockSelect(evt) {
      // Show selected tab
      evt.target.dispatchEvent(new Event('click'));
    }

    onUnload() {
      if (this.slidersImages.length > 0 || this.slidersContents.length > 0) {
        document.removeEventListener('theme:resize', this.sliderResizeEvent);
      }
    }
  }

  const productsListSection = {
    onLoad() {
      sections$4[this.id] = new ProductsList(this);
    },
    onUnload() {
      sections$4[this.id].onUnload();
    },
    onBlockSelect(e) {
      sections$4[this.id].onBlockSelect(e);
    },
  };

  register('products-list', productsListSection);

  const selectors$4 = {
    product: '[data-product-block]',
    relatedProducts: '[data-related-products]',
  };

  const attributes$3 = {
    sectionId: 'data-section-id',
    productId: 'data-product-id',
    limit: 'data-limit',
  };

  const sections$3 = {};

  class RelatedProducts {
    constructor(container) {
      this.container = container;
      this.relatedProducts = this.container.querySelector(selectors$4.relatedProducts);

      this.init();
    }

    init() {
      const sectionId = this.container.getAttribute(attributes$3.sectionId);
      const productId = this.container.getAttribute(attributes$3.productId);
      const limit = this.container.getAttribute(attributes$3.limit);
      const requestUrl = `${theme.routes.product_recommendations_url}?section_id=${sectionId}&limit=${limit}&product_id=${productId}`;

      fetch(requestUrl)
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          const createdElement = document.createElement('div');
          createdElement.innerHTML = data;
          const inner = createdElement.querySelector(selectors$4.relatedProducts);

          if (inner.querySelectorAll(selectors$4.product).length) {
            this.relatedProducts.innerHTML = inner.innerHTML;

            this.productGrid = new ProductGrid(this.container);
            this.gridSlider = new GridSlider(this.container);
          }
        });
    }

    /**
     * Event callback for Theme Editor `section:deselect` event
     */
    onDeselect() {
      if (this.productGrid) {
        this.productGrid.onDeselect();
      }
    }

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload() {
      if (this.productGrid) {
        this.productGrid.onUnload();
      }

      if (this.gridSlider) {
        this.gridSlider.onUnload();
      }
    }
  }

  const RelatedProductsSection = {
    onLoad() {
      sections$3[this.id] = new RelatedProducts(this.container);
    },
    onDeselect() {
      sections$3[this.id].onDeselect();
    },
    onUnload() {
      sections$3[this.id].onUnload();
    },
  };

  register('related-products', RelatedProductsSection);

  const sections$2 = {};

  const selectors$3 = {
    slider: '[data-slider]',
    sliderItem: '[data-item]',
    buttonProductsShow: '[data-button-show]',
    buttonProductsHide: '[data-button-hide]',
    itemProducts: '[data-item-products]',
    itemProductSlider: '[data-item-products-slider]',
    itemProduct: '[data-item-product]',
    links: 'a, button',
  };

  const classes$3 = {
    itemActive: 'blog-item--active',
    itemProductsVisible: 'blog-item__products--visible',
    featuredBlogSlider: 'shoppable-blog__slider',
    flickityEnabled: 'flickity-enabled',
    isSelected: 'is-selected',
  };

  const attributes$2 = {
    slider: 'data-slider',
    slidePosition: 'data-slide-position',
    sectionId: 'data-section-id',
    tabIndex: 'tabindex',
  };

  class ShoppableBlog {
    constructor(section) {
      this.container = section.container;
      this.flkty = null;
      this.slider = this.container.querySelector(selectors$3.slider);
      this.checkSlidesSizeOnResize = () => this.checkSlidesSize();
      this.isFullWidth = this.container.hasAttribute(attributes$2.fullWidth);
      this.gutter = 0;
      this.a11y = a11y;
      this.clickOutsideItemEvent = (e) => {
        const clickOutsideSliderItem = !(e.target.matches(selectors$3.sliderItem) || e.target.closest(selectors$3.sliderItem));

        if (clickOutsideSliderItem) {
          const sliderItem = this.container.querySelectorAll(selectors$3.sliderItem);
          if (sliderItem.length) {
            sliderItem.forEach((item) => {
              const itemProducts = item.querySelector(selectors$3.itemProducts);
              if (itemProducts) {
                itemProducts.classList.remove(classes$3.itemProductsVisible);

                this.changeTabIndex(itemProducts);
              }
              item.classList.remove(classes$3.itemActive);
            });
          }
        }
      };

      this.bindButtons();
      this.listen();
    }

    initSlider() {
      this.flkty = new Flickity(this.slider, {
        prevNextButtons: true,
        pageDots: false,
        cellAlign: 'left',
        wrapAround: false,
        groupCells: true,
        contain: true,
        on: {
          ready: () => {
            this.handleFocus();
          },
        },
      });

      this.flkty.on('change', () => {
        const slides = this.container.querySelectorAll(selectors$3.sliderItem);

        this.handleFocus();

        if (slides.length) {
          slides.forEach((el) => {
            const itemProducts = el.querySelector(selectors$3.itemProducts);

            el.classList.remove(classes$3.itemActive);

            if (itemProducts) {
              el.querySelector(selectors$3.itemProducts).classList.remove(classes$3.itemProductsVisible);
            }
          });
        }

        if (this.flkty && !this.flkty.options.draggable) {
          this.flkty.options.draggable = true;
          this.flkty.updateDraggable();
        }
      });
    }

    destroySlider() {
      if (this.flkty !== null) {
        this.flkty.destroy();
        this.flkty = null;
      }
    }

    checkSlidesSize() {
      const sliderItemStyle = this.container.querySelector(selectors$3.sliderItem).currentStyle || window.getComputedStyle(this.container.querySelector(selectors$3.sliderItem));
      this.gutter = parseInt(sliderItemStyle.marginRight);
      const containerWidth = this.slider.offsetWidth + this.gutter;
      const itemsWidth = this.getItemsWidth();
      const itemsOverflowViewport = containerWidth < itemsWidth;

      if (window.innerWidth >= theme.sizes.small && itemsOverflowViewport) {
        this.initSlider();
      } else {
        this.destroySlider();
      }
    }

    getItemsWidth() {
      let itemsWidth = 0;
      const slides = this.slider.querySelectorAll(selectors$3.sliderItem);
      if (slides.length) {
        slides.forEach((item) => {
          itemsWidth += item.offsetWidth + this.gutter;
        });
      }

      return itemsWidth;
    }

    bindButtons() {
      const itemProductSlider = this.container.querySelectorAll(selectors$3.itemProductSlider);
      const buttonProductsShow = this.container.querySelectorAll(selectors$3.buttonProductsShow);
      const buttonProductsHide = this.container.querySelectorAll(selectors$3.buttonProductsHide);

      if (buttonProductsShow.length) {
        buttonProductsShow.forEach((button) => {
          button.addEventListener('click', (e) => {
            e.preventDefault();

            this.container.querySelectorAll(selectors$3.sliderItem).forEach((item) => {
              const itemProducts = item.querySelector(selectors$3.itemProducts);
              item.classList.remove(classes$3.itemActive);

              if (itemProducts) {
                itemProducts.classList.remove(classes$3.itemProductsVisible);

                this.changeTabIndex(itemProducts);
              }
            });

            const item = button.closest(selectors$3.sliderItem);
            const itemProducts = item.querySelector(selectors$3.itemProducts);
            item.classList.add(classes$3.itemActive);

            if (itemProducts) {
              itemProducts.classList.add(classes$3.itemProductsVisible);
              this.changeTabIndex(itemProducts, 'enable');

              const itemProductsSlider = itemProducts.querySelector(selectors$3.itemProductSlider);
              const allSlides = itemProductsSlider.querySelectorAll(selectors$3.itemProduct);
              const sliderActive = itemProductsSlider.classList.contains(classes$3.flickityEnabled);

              if (sliderActive) {
                const currentSlide = itemProductsSlider.querySelector(`.${classes$3.isSelected}`);
                const currentSlideIndex = currentSlide.getAttribute(attributes$2.slidePosition);

                allSlides.forEach((slide, i) => {
                  slide.setAttribute(attributes$2.tabIndex, i === currentSlideIndex ? '0' : '-1');
                });
              }
            }

            if (this.flkty !== null) {
              this.flkty.options.draggable = false;
              this.flkty.updateDraggable();
            }

            this.a11y.state.trigger = button;
          });
        });
      }

      if (buttonProductsHide.length) {
        buttonProductsHide.forEach((button) => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            const item = button.closest(selectors$3.sliderItem);
            const itemProducts = item.querySelector(selectors$3.itemProducts);
            item.classList.remove(classes$3.itemActive);

            if (itemProducts) {
              itemProducts.classList.remove(classes$3.itemProductsVisible);

              this.changeTabIndex(itemProducts);
            }

            if (this.flkty !== null) {
              this.flkty.options.draggable = true;
              this.flkty.updateDraggable();
            }

            this.a11y.state.trigger.focus();
          });
        });
      }

      if (itemProductSlider.length) {
        itemProductSlider.forEach((slider) => {
          const countSlides = slider.querySelectorAll(selectors$3.itemProduct).length;

          if (countSlides > 1) {
            const flktyProducts = new Flickity(slider, {
              prevNextButtons: true,
              contain: true,
              pageDots: false,
              wrapAround: true,
              on: {
                change: (index) => {
                  flktyProducts.cells.forEach((slide, i) => {
                    slide.element.querySelectorAll(selectors$3.links).forEach((link) => {
                      link.setAttribute(attributes$2.tabIndex, i === index ? '0' : '-1');
                    });
                  });
                },
              },
            });
          }
        });
      }

      this.slider.addEventListener('keyup', (event) => {
        if (event.code === theme.keyboardKeys.ESCAPE) {
          const sliderItem = event.target.hasAttribute(attributes$2.slider)
            ? event.target.querySelectorAll(selectors$3.sliderItem)
            : event.target.closest(selectors$3.slider).querySelectorAll(selectors$3.sliderItem);

          if (sliderItem.length) {
            sliderItem.forEach((item) => {
              const itemProducts = item.querySelector(selectors$3.itemProducts);
              item.classList.remove(classes$3.itemActive);
              if (itemProducts) {
                itemProducts.classList.remove(classes$3.itemProductsVisible);

                this.changeTabIndex(itemProducts);
              }
            });

            if (this.flkty) {
              this.flkty.options.draggable = true;
              this.flkty.updateDraggable();
            }
          }

          this.a11y.state.trigger.focus();
        }
      });
    }

    handleFocus() {
      const sliderItems = this.container.querySelectorAll(selectors$3.sliderItem);

      if (sliderItems.length) {
        sliderItems.forEach((item) => {
          const selected = item.classList.contains(classes$3.isSelected);
          const itemProducts = item.querySelector(selectors$3.itemProducts);

          if (!selected) {
            this.changeTabIndex(item);

            if (itemProducts) {
              itemProducts.classList.remove(classes$3.itemProductsVisible);
            }
          } else {
            this.changeTabIndex(item, 'enable');

            if (itemProducts) {
              this.changeTabIndex(itemProducts);
            }
          }
        });
      }
    }

    listen() {
      if (this.slider) {
        this.checkSlidesSize();
        document.addEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
      }

      document.addEventListener('mousedown', this.clickOutsideItemEvent);
    }

    changeTabIndex(items, state = '') {
      const tabIndex = state === 'enable' ? '0' : '-1';
      items.querySelectorAll(selectors$3.links).forEach((link) => {
        link.setAttribute(attributes$2.tabIndex, tabIndex);
      });
    }

    onBlockSelect(evt) {
      if (this.flkty !== null) {
        const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));
        const slidesPerPage = parseInt(this.flkty.slides[0].cells.length);
        const groupIndex = Math.floor(index / slidesPerPage);

        this.flkty.select(groupIndex);
      } else {
        const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
        const sliderPadding = parseInt(sliderStyle.paddingLeft);
        const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

        // Native scroll to item
        this.slider.scrollTo({
          top: 0,
          left: blockPositionLeft,
          behavior: 'smooth',
        });
      }
    }

    onUnload() {
      document.removeEventListener('theme:resize:width', this.checkSlidesSizeOnResize);
      document.removeEventListener('mousedown', this.clickOutsideItemEvent);
    }
  }

  const shoppableBlogSection = {
    onLoad() {
      sections$2[this.id] = new ShoppableBlog(this);
    },
    onUnload(e) {
      sections$2[this.id].onUnload(e);
    },
    onBlockSelect(e) {
      sections$2[this.id].onBlockSelect(e);
    },
  };

  register('shoppable-blog', shoppableBlogSection);

  const selectors$2 = {
    arrowScrollDown: '[data-scroll-down]',
    header: '[data-site-header]',
    item: '[data-slide]',
    links: 'a, button',
    slider: '[data-slider]',
  };

  const attributes$1 = {
    style: 'data-style',
    currentStyle: 'data-current-style',
    tabIndex: 'tabindex',
    slidePosition: 'data-slide-position',
  };

  const classes$2 = {
    headerFixed: 'site-header--fixed',
  };

  const sections$1 = {};

  class Slider {
    constructor(section) {
      this.container = section.container;
      this.header = document.querySelector(selectors$2.header);
      this.flkty = null;
      this.resizeEvent = () => {
        this.flkty.resize();
      };

      this.initSlider();
      this.bindScrollButton();
    }

    initSlider() {
      const slidesCount = this.container.querySelectorAll(selectors$2.item).length;
      const duration = parseInt(this.container.dataset.duration);
      const pageDots = this.container.dataset.pageDots === 'true' && slidesCount > 1;
      const prevNextButtons = this.container.dataset.navArrows === 'true' && slidesCount > 1;
      let autoplay = this.container.dataset.autoplay === 'true';

      if (autoplay) {
        autoplay = duration;
      }

      if (slidesCount > 1) {
        this.flkty = new Flickity(this.container, {
          fade: true,
          cellSelector: selectors$2.item,
          autoPlay: autoplay,
          wrapAround: true,
          adaptiveHeight: true,
          setGallerySize: true,
          imagesLoaded: true,
          pageDots: pageDots,
          prevNextButtons: prevNextButtons,
          on: {
            ready: () => {
              const currentStyle = this.container.querySelector(`${selectors$2.item}[${attributes$1.slidePosition}="1"]`).getAttribute(attributes$1.style);
              this.container.setAttribute(attributes$1.currentStyle, currentStyle);
              requestAnimationFrame(this.resizeEvent);
              document.addEventListener('theme:vars', this.resizeEvent); // Update slideshow height after height vars init
            },
            change: (index) => {
              const currentSlide = this.flkty.selectedElement;
              const currentStyle = currentSlide.getAttribute(attributes$1.style);

              this.container.setAttribute(attributes$1.currentStyle, currentStyle);

              this.flkty.cells.forEach((slide, i) => {
                slide.element.querySelectorAll(selectors$2.links).forEach((link) => {
                  link.setAttribute(attributes$1.tabIndex, i === index ? '0' : '-1');
                });
              });
            },
          },
        });

        // iOS smooth scrolling fix
        flickitySmoothScrolling(this.container);
      } else if (slidesCount === 1) {
        const currentStyle = this.container.querySelector(selectors$2.item).getAttribute(attributes$1.style);
        this.container.setAttribute(attributes$1.currentStyle, currentStyle);
      }
    }

    // Scroll down function
    bindScrollButton() {
      const arrowDown = this.container.querySelector(selectors$2.arrowScrollDown);

      if (arrowDown) {
        arrowDown.addEventListener('click', (e) => {
          e.preventDefault();

          const headerHeight = this.header.classList.contains(classes$2.headerFixed) ? 60 : 0;
          const scrollToPosition = parseInt(Math.ceil(this.container.offsetTop + this.container.offsetHeight - headerHeight));

          window.scrollTo({
            top: scrollToPosition,
            left: 0,
            behavior: 'smooth',
          });
        });
      }
    }

    onBlockSelect(evt) {
      const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));

      if (this.flkty !== null) {
        this.flkty.select(index);
        this.flkty.pausePlayer();
      }
    }

    onBlockDeselect(evt) {
      const autoplay = evt.target.closest(selectors$2.slider).dataset.autoplay === 'true';
      if (autoplay && this.flkty !== null) {
        this.flkty.playPlayer();
      }
    }

    onReorder() {
      if (this.flkty !== null) {
        this.flkty.resize();
      }
    }

    onUnload() {
      if (this.flkty !== null) {
        document.removeEventListener('theme:vars', this.resizeEvent);
        this.flkty.destroy();
        this.flkty = null;
      }
    }
  }

  const slider = {
    onLoad() {
      sections$1[this.id] = new Slider(this);
    },
    onReorder(e) {
      sections$1[this.id].onReorder(e);
    },
    onUnload(e) {
      sections$1[this.id].onUnload(e);
    },
    onBlockSelect(e) {
      sections$1[this.id].onBlockSelect(e);
    },
    onBlockDeselect(e) {
      sections$1[this.id].onBlockDeselect(e);
    },
  };

  register('slider', [slider, videoPlay, zoomAnimation]);

  register('subcollections', gridSlider);

  register('tab-collections', [productGrid, gridSlider, tabs]);

  const sections = {};

  const selectors$1 = {
    slider: '[data-slider]',
    item: '[data-item]',
  };

  const classes$1 = {
    flickityEnabled: 'flickity-enabled',
  };

  const attributes = {
    sectionId: 'data-section-id',
  };

  class Testimonials {
    constructor(section) {
      this.container = section.container;
      this.sectionId = this.container.getAttribute(attributes.sectionId);
      this.slider = this.container.querySelector(selectors$1.slider);
      this.sliderResizeEvent = () => this.initSlider();
      this.flkty = null;
      this.initSlider();

      document.addEventListener('theme:resize:width', this.sliderResizeEvent);
    }

    initSlider() {
      const slidesCount = this.slider.querySelectorAll(selectors$1.item).length;
      let flickityEnabled = this.slider.classList.contains(classes$1.flickityEnabled);

      // Destroy slider if there are 3 slides on desktop or 2 on tablet
      // Use native scrolling on mobile
      if ((slidesCount == 2 && window.innerWidth >= theme.sizes.small) || slidesCount == 1 || window.innerWidth < theme.sizes.small) {
        if (flickityEnabled) {
          this.flkty.destroy();
        }

        return;
      }

      this.flkty = new Flickity(this.slider, {
        cellSelector: selectors$1.item,
        prevNextButtons: true,
        pageDots: false,
        groupCells: true,
        cellAlign: 'left',
        contain: true,
        adaptiveHeight: false,
      });

      this.flkty.resize();
      const isLargerThanVw = this.flkty.slideableWidth > this.flkty.size.width;
      // Destroy slider if slidable container is smaller than the slider's container width
      if (!isLargerThanVw) {
        this.flkty.destroy();
      }
    }

    onBlockSelect(evt) {
      if (this.flkty !== null) {
        const index = parseInt([...evt.target.parentNode.children].indexOf(evt.target));
        const slidesPerPage = parseInt(this.flkty.slides[0].cells.length);
        const groupIndex = Math.floor(index / slidesPerPage);

        this.flkty.select(groupIndex);
      } else {
        const sliderStyle = this.slider.currentStyle || window.getComputedStyle(this.slider);
        const sliderPadding = parseInt(sliderStyle.paddingLeft);
        const blockPositionLeft = evt.target.offsetLeft - sliderPadding;

        // Native scroll to item
        this.slider.scrollTo({
          top: 0,
          left: blockPositionLeft,
          behavior: 'smooth',
        });
      }
    }

    onUnload() {
      document.removeEventListener('theme:resize:width', this.sliderResizeEvent);
    }
  }

  const TestimonialsSection = {
    onLoad() {
      sections[this.id] = new Testimonials(this);
    },
    onUnload(e) {
      sections[this.id].onUnload(e);
    },
    onBlockSelect(e) {
      sections[this.id].onBlockSelect(e);
    },
  };

  register('testimonials', TestimonialsSection);

  const classes = {
    noOutline: 'no-outline',
  };

  const selectors = {
    inPageLink: '[data-skip-content]',
    linkesWithOnlyHash: 'a[href="#"]',
  };

  class Accessibility {
    constructor() {
      this.init();
    }

    init() {
      // this.a11y = a11y;

      // DOM Elements
      this.body = document.body;
      this.inPageLink = document.querySelector(selectors.inPageLink);
      this.linkesWithOnlyHash = document.querySelectorAll(selectors.linkesWithOnlyHash);

      // Flags
      this.isFocused = false;

      // A11Y init methods
      this.focusHash();
      this.bindInPageLinks();

      // Events
      this.clickEvents();
      this.focusEvents();
      this.focusEventsOff();
    }

    /**
     * Clicked events accessibility
     *
     * @return  {Void}
     */

    clickEvents() {
      if (this.inPageLink) {
        this.inPageLink.addEventListener('click', (event) => {
          event.preventDefault();
        });
      }

      if (this.linkesWithOnlyHash) {
        this.linkesWithOnlyHash.forEach((item) => {
          item.addEventListener('click', (event) => {
            event.preventDefault();
          });
        });
      }
    }

    /**
     * Focus events
     *
     * @return  {Void}
     */

    focusEvents() {
      document.addEventListener('keyup', (event) => {
        if (event.code !== theme.keyboardKeys.TAB) {
          return;
        }

        this.body.classList.remove(classes.noOutline);
        this.isFocused = true;
      });
    }

    /**
     * Focus events off
     *
     * @return  {Void}
     */

    focusEventsOff() {
      document.addEventListener('mousedown', () => {
        this.body.classList.add(classes.noOutline);
        this.isFocused = false;
      });
    }

    /**
     * Moves focus to an HTML element
     * eg for In-page links, after scroll, focus shifts to content area so that
     * next `tab` is where user expects. Used in bindInPageLinks()
     * eg move focus to a modal that is opened. Used in trapFocus()
     *
     * @param {Element} container - Container DOM element to trap focus inside of
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     */

    forceFocus(element, options) {
      options = options || {};

      var savedTabIndex = element.tabIndex;

      element.tabIndex = -1;
      element.dataset.tabIndex = savedTabIndex;
      element.focus();
      if (typeof options.className !== 'undefined') {
        element.classList.add(options.className);
      }
      element.addEventListener('blur', callback);

      function callback(event) {
        event.target.removeEventListener(event.type, callback);

        element.tabIndex = savedTabIndex;
        delete element.dataset.tabIndex;
        if (typeof options.className !== 'undefined') {
          element.classList.remove(options.className);
        }
      }
    }

    /**
     * If there's a hash in the url, focus the appropriate element
     * This compensates for older browsers that do not move keyboard focus to anchor links.
     * Recommendation: To be called once the page in loaded.
     *
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     * @param {string} options.ignore - Selector for elements to not include.
     */

    focusHash(options) {
      options = options || {};
      let hash = window.location.hash;

      if (typeof theme.settings.newHash !== 'undefined') {
        hash = theme.settings.newHash;
        window.location.hash = `#${hash}`;
      }
      const element = document.getElementById(hash.slice(1));

      // if we are to ignore this element, early return
      if (element && options.ignore && element.matches(options.ignore)) {
        return false;
      }

      if (hash && element) {
        this.forceFocus(element, options);
      }
    }

    /**
     * When an in-page (url w/hash) link is clicked, focus the appropriate element
     * This compensates for older browsers that do not move keyboard focus to anchor links.
     * Recommendation: To be called once the page in loaded.
     *
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     * @param {string} options.ignore - CSS selector for elements to not include.
     */

    bindInPageLinks(options) {
      options = options || {};
      const links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

      function queryCheck(selector) {
        return document.getElementById(selector) !== null;
      }

      return links.filter((link) => {
        if (link.hash === '#' || link.hash === '') {
          return false;
        }

        if (options.ignore && link.matches(options.ignore)) {
          return false;
        }

        if (!queryCheck(link.hash.substr(1))) {
          return false;
        }

        var element = document.querySelector(link.hash);

        if (!element) {
          return false;
        }

        link.addEventListener('click', () => {
          this.forceFocus(element, options);
        });

        return true;
      });
    }
  }

  const getScrollbarWidth = () => {
    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  };

  document.documentElement.style.setProperty('--scrollbar-width', `${getScrollbarWidth()}px`);

  document.addEventListener('DOMContentLoaded', function () {
    // Load all registered sections on the page.
    load('*');

    const showAnimations = document.body.dataset.animations === 'true';
    if (showAnimations) {
      AOS.init({
        once: true,
        offset: 50,
        duration: 600,
        startEvent: 'load',
      });
    }

    new Accessibility();

    if (!customElements.get('product-grid-item-swatch') && window.theme.settings.enableColorSwatchesCollection) {
      customElements.define('product-grid-item-swatch', GridSwatch);
    }

    // Safari smoothscroll polyfill
    const hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;

    if (!hasNativeSmoothScroll) {
      loadScript({url: theme.assets.smoothscroll});
    }
  });

})(themeVendor.ScrollLock, themeVendor.Flickity, themeVendor.themeCurrency, themeVendor.ajaxinate, themeVendor.AOS);
