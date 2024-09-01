export class VScroll {
  /**
   * Root element passed to constructor
   * @type {HTMLElement | null}
   */
  #rootEl = null;

  /**
   * Height of root element passed to constructor
   * @type {number | null}
   */
  #rootHeight = null;

  /**
   * Container above elements
   * @type {HTMLElement | null}
   */
  #topEl = null;

  /**
   * Container for actuall elements
   * @type {HTMLElement | null}
   */
  #elementsContainerEl = null;

  /**
   * Container below elements
   * @type {HTMLElement | null}
   */
  #bottomEl = null;

  /**
   * Elements that are actually rendered in the list. Should be reused when user is scrolling through list.
   * @type {Map<number, HTMLElement>}
   */
  #listElements = new Map();

  /**
   * List of all elements that should be displayed
   * @type {string[] | null}
   */
  #listToRender = null;

  /**
   * @param {string} rootId id of DOM element which will be scroll root element
   * @param {number} rootHeight in pixels
   * @param {string[]} listToRender elements to render in container
   */
  constructor(rootId, rootHeight, listToRender) {
    this.#rootEl = document.getElementById(rootId);
    this.#rootEl.style.overflowY = "auto";
    if (!this.#rootEl) {
      throw new Error(`Can't find root element with id "${rootId}"`);
    }

    if (!rootHeight || rootHeight <= 0) {
      throw new Error(
        `rootHeight must be greater that 0. Recived "${rootHeight}"`
      );
    }
    this.#rootHeight = rootHeight;

    if (!listToRender || !listToRender.length) {
      throw new Error(
        `listToRender must have at least one element to render. Recived "${listToRender}"`
      );
    }
    this.#listToRender = listToRender;

    this.#setDesiredHeightOnRootEl();
    this.#renderContainers();
    this.#initialRender();
  }

  /**
   * Render three internal containers:
   * 1. top container - for reserving space above elements
   * 2. elements container - for actual conatiner for rendered elements
   * 3. bottom container - for reserving space below elements
   */
  #renderContainers() {
    this.#topEl = document.createElement("div");
    this.#rootEl.appendChild(this.#topEl);
    this.#elementsContainerEl = document.createElement("div");
    this.#rootEl.appendChild(this.#elementsContainerEl);
    this.#bottomEl = document.createElement("div");
    this.#rootEl.appendChild(this.#bottomEl);
  }

  #setDesiredHeightOnRootEl() {
    this.#rootEl.style.height = `${this.#rootHeight}px`;
  }

  /**
   * Initially renders elements that will be later reused when user will scrolling through list.
   */
  #initialRender() {
    const [firstContent] = this.#listToRender;
    const firstElement = document.createElement("div");
    firstElement.textContent = firstContent;
    this.#elementsContainerEl.appendChild(firstElement);
    this.#listElements.set(0, firstElement);

    // after first element rendered we are able to calculate height's
    const { height: oneListElementHeight } =
      firstElement.getBoundingClientRect();

    // then we can calculate how much elements needs to be rendered to fullfill container
    const elementsCountToRender = Math.ceil(
      this.#rootHeight / oneListElementHeight
    );

    // and renders elements
    for (let i = 1; i < elementsCountToRender; i++) {
      const element = document.createElement("div");
      element.textContent = this.#listToRender[i];
      this.#elementsContainerEl.appendChild(element);
      this.#listElements.set(i, element);
    }

    // finally we can adjust bottom placeholder container
    const bottomElHeight = oneListElementHeight * this.#listToRender.length;
    this.#bottomEl.style.height = `${bottomElHeight}px`;
  }

  /**
   * Moves elements + adjust container's height's
   */
  #render() {
    /*
        TODO: use IntersectionObserver to determin when element dispears from screen
        and when it does then move it to the other side with updated content.
        Additionaly when elements are moved then also top/bottom container should have adjusted its heights.
    */
  }
}
