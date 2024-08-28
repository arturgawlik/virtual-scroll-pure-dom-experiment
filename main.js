const MAX_CONTAINER_HEIGHT = 200;

const [ulElem] = document.getElementsByTagName("ul");
const containerElem = document.getElementById("container");
const liElems = [];
const elementsToRender = [];

function populateElementsToRender() {
  for (let index = 0; index < 100_000; index++) {
    elementsToRender.push(
      index +
        ". Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolore dolorum adipisci quisquam, modi reiciendis explicabo nam, ea nulla nemo error eligendi amet eius. Repellendus rem esse incidunt, nemo ratione libero."
    );
  }
}
populateElementsToRender();

function render() {
  while (true) {
    if (viewportFilled()) {
      break;
    }

    const liElem = createNewLiElem();
    liElem.innerText = elementsToRender[liElems.length];
    ulElem.appendChild(liElem);

    liElems.push(liElem);

    if (liElems.length === 1) {
      adjustScrollHeight();
    }
  }
}
render();
containerElem.addEventListener("wheel", render);

function adjustScrollHeight() {
  const allLiHeight = liElems[0].offsetHeight * elementsToRender.length;

  ulElem.style.height = `${allLiHeight}px`;
  containerElem.style.height = `${MAX_CONTAINER_HEIGHT}px`;
}

/**
 * @param {HTMLUListElement} el
 */
function isElementVisible(el) {
  var rect = el.getBoundingClientRect();
  var elemTop = rect.top;
  var elemBottom = rect.bottom;

  // Only completely visible elements return true:
  var isVisible = elemTop >= 0 && elemBottom <= window.innerHeight;
  // Partially visible elements return true:
  //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
  return isVisible;
}

function getAllVisibleLiElemetsHeight() {
  return liElems.filter(isElementVisible).reduce((height, liElem) => {
    height += liElem.offsetHeight;
    return height;
  }, 0);
}

function viewportFilled() {
  const liElementsHeight = getAllVisibleLiElemetsHeight();
  return liElementsHeight >= MAX_CONTAINER_HEIGHT;
}

function createNewLiElem() {
  return document.createElement("li");
}
