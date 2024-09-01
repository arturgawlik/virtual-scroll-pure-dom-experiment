import { VScroll as v2 } from "./v-scroll-2.js";

const vScroll = new v2("vscroll-root", 200, prepareListToRender());

function prepareListToRender() {
  const list = [];
  for (let index = 0; index < 10; index++) {
    list.push(
      `${index}. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolore dolorum adipisci quisquam, modi reiciendis explicabo nam, ea nulla nemo error eligendi amet eius. Repellendus rem esse incidunt, nemo ratione libero.`
    );
  }

  return list;
}
