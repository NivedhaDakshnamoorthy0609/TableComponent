import { createElement } from "./createElement.js";

export function  toggleNoDataMessage(container,show, message = "No Data Found") {  
    const wrapper = container.querySelector(".table-scroll"); 
    let msg = wrapper.querySelector(".no-data-message");

    if (!msg && show) {
      msg = createElement("div", "no-data-message", message);
      wrapper.appendChild(msg);
    }

    if (msg) msg.classList.toggle("visible", show);
}