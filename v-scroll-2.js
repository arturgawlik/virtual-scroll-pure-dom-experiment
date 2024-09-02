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
    const bottomElHeight =
      oneListElementHeight *
      (this.#listToRender.length - elementsCountToRender);
    this.#bottomEl.style.height = `${bottomElHeight}px`;

    // after initiall render we are adding intersection observer to each one of rendered elements
    // with callback that will move element to the other side and update content + adjust top/bottom container height
    const observer = new IntersectionObserver(
      (entries) => {
        entries.length > 10 && console.log(entries.length);
        for (const entry of entries) {
          const isVisible = entry.isIntersecting;
          if (!isVisible) {
            const element = entry.target;
            const isFirstElement = Boolean(element.nextElementSibling);
            if (isFirstElement) {
              // move element to the end
              this.#elementsContainerEl.append(element);

              // adjust top container height
              const topHeightStr = this.#topEl.style.height;
              const topHeight = Number(topHeightStr.replace("px", ""));
              const newTopHeight = topHeight + oneListElementHeight;
              this.#topEl.style.height = `${newTopHeight}px`;

              // adjust bottom container height
              const bottomHeightStr = this.#bottomEl.style.height;
              const bottomHeight = Number(bottomHeightStr.replace("px", ""));
              const newBottomHeight = bottomHeight - oneListElementHeight;
              this.#bottomEl.style.height = `${newBottomHeight}px`;

              // update content of the element
              const [currentlyLastElementContentIndex] = Array.from(
                this.#listElements.keys()
              )
                .toSorted((a, b) => a - b)
                .slice(-1);
              const newLastElementContentIndex =
                currentlyLastElementContentIndex + 1;
              const newLastElementContent =
                this.#listToRender[newLastElementContentIndex];
              element.textContent = newLastElementContent;

              // update list listElements map
              const currentElementContentIndex = Array.from(
                this.#listElements.keys()
              ).toSorted((a, b) => a - b)[0];
              this.#listElements.delete(currentElementContentIndex);
              this.#listElements.set(newLastElementContentIndex, element);
            } else {
              // move element to the start
              this.#elementsContainerEl.prepend(element);

              // adjust top container height
              const topHeightStr = this.#topEl.style.height;
              const topHeight = Number(topHeightStr.replace("px", ""));
              const newTopHeight = topHeight - oneListElementHeight;
              this.#topEl.style.height = `${newTopHeight}px`;

              // adjust bottom container height`
              const bottomHeightStr = this.#bottomEl.style.height;
              const bottomHeight = Number(bottomHeightStr.replace("px", ""));
              const newBottomHeight = bottomHeight + oneListElementHeight;
              this.#bottomEl.style.height = `${newBottomHeight}px`;

              // update content of the element
              const currentlyFirstElementContentIndex = Array.from(
                this.#listElements.keys()
              ).toSorted((a, b) => a - b)[0];
              const newFirstElementContentIndex =
                currentlyFirstElementContentIndex - 1;
              const newLastElementContent =
                this.#listToRender[newFirstElementContentIndex];
              element.textContent = newLastElementContent;

              // update list listElements map
              const [currentElementContentIndex] = Array.from(
                this.#listElements.keys()
              )
                .toSorted((a, b) => a - b)
                .slice(-1);
              this.#listElements.delete(currentElementContentIndex);
              this.#listElements.set(newFirstElementContentIndex, element);
            }
          }
        }
      },
      {
        root: this.#rootEl,
        threshold: 0, // want to be notified when element is not visible anymore
      }
    );
    for (const [_key, value] of this.#listElements) {
      observer.observe(value);
    }
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
