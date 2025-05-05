import { createElement } from "../utils/createElement.js";
import { debounce } from "../utils/debounce.js";
import { toggleNoDataMessage } from "../utils/noData.js";

export class GlobalSearch {
  constructor(container, data, rowsComponent, sortManager) {
    this.container = container;
    this.data = data;
    this.rowsComponent = rowsComponent;
    this.sortManager = sortManager;
    this.filteredData = data;

    this.debouncedHandleSearch = debounce(this.handleSearch.bind(this), 50);

  }

  renderSearchUI(targetTh) {
    let existing = targetTh.querySelector(".search-wrapper");
    if (existing) {
      existing.classList.toggle("visible");
      return;
    }

    const wrapper = createElement("div", "search-wrapper");
    const input = createElement("input");
    input.type = "text";
    input.placeholder = "Search...";

    const resetBtn = createElement("button", "", "Reset");

    input.addEventListener("input", (e) => this.debouncedHandleSearch(e.target.value));
    resetBtn.addEventListener("click", () => {
      input.value = "";
      this.resetSearch();
    });

    wrapper.append(input, resetBtn);
    targetTh.appendChild(wrapper);
  }

  handleSearch(query) {
    const lowerQuery = query.toLowerCase();

    this.filteredData = this.data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(lowerQuery)
      )
    );

    this.rowsComponent.filteredData = this.filteredData;
    toggleNoDataMessage(this.container, this.filteredData.length === 0);
    this.rowsComponent.updateSpacerHeight();
    this.rowsComponent.updateRows(0);
  }

  resetSearch() {
    this.filteredData = [...this.data];
    this.rowsComponent.filteredData = this.filteredData;
    toggleNoDataMessage(this.container, false);
    this.rowsComponent.updateSpacerHeight();
    this.rowsComponent.updateRows(0);
  
    this.sortManager.sortState = {};   
    this.sortManager.updateSortIcons();
  }
  
}
