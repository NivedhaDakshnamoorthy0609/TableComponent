import { HeaderComponent } from "./header.js";
import { createElement } from "../utils/createElement.js";
import { RowsComponent } from "./rows.js";
import { throttle } from "../utils/throttle.js";
import { sortManager } from "../utils/sort.js";
import { GlobalSearch } from "./search.js";

export class GridComponent {
  constructor(container, fetchData, config) {
    this.container = container;
    this.fetchData = fetchData;
    this.config = config;

    this.originalData = [];
    this.data = [];
    this.filteredData = [];
  }

  async init() {
    try {
      await this.loadData();
      this.renderTable();
      this.setupEvents();
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  }

  async loadData() {
    this.data = await this.fetchData();
    this.originalData = [...this.data];
    this.filteredData = [...this.data];
  }

  renderTable() {
    const wrapper = createElement("div", "table-container");
  
    this.tbody = createElement("tbody");
    this.spacer = createElement("div", "spacer");
  
    this.rowsComponent = new RowsComponent(
      this.tbody,
      this.config,
      this.container,
      this.filteredData,
      this.spacer
    );
  
    this.sortManager = new sortManager(
      this.container,
      this.config,
      this.filteredData,
      this.rowsComponent
    );
  
    this.searchManager = new GlobalSearch(
      this.container,
      this.data,
      this.rowsComponent,
      this.sortManager
    );
  
    const headerTable = createElement("table", "header-table");
    const thead = new HeaderComponent(
      this.config,
      this.container,
      this.rowsComponent,
      this.sortManager,
      this.filteredData,
      this.data,
      this.searchManager
    ).render();
    headerTable.appendChild(thead);
  
    const scrollWrapper = createElement("div", "table-scroll");
    const bodyTable = createElement("table", "body-table");
  
    bodyTable.appendChild(this.tbody);
    scrollWrapper.append(bodyTable, this.spacer);
  
    wrapper.appendChild(headerTable);
    wrapper.appendChild(scrollWrapper);
    this.container.appendChild(wrapper);
  
    this.rowsComponent.calculateVisibleRows();
  
    const totalRows = this.rowsComponent.visibleRowsCount * 3;
    for (let i = 0; i < totalRows; i++) {
      const row = createElement("tr");
      this.config.forEach(() => {
        const td = createElement("td");
        row.appendChild(td);
      });
      this.tbody.appendChild(row);
    }
  
    this.rowsComponent.updateSpacerHeight();
    this.rowsComponent.updateRows(0);
  
    const bodyTableWrapper = scrollWrapper.querySelector(".body-table");
    const headerTableWrapper = wrapper.querySelector(".header-table");
  
    bodyTableWrapper.addEventListener("scroll", () => {
      headerTableWrapper.scrollLeft = bodyTableWrapper.scrollLeft;
    });
  }

  setupEvents() {
    this.setupVirtualScroll();
  }

  setupVirtualScroll() {
    const wrapper = this.container.querySelector(".table-scroll");
    wrapper.addEventListener("scroll", throttle(() => {
      const scrollTop = wrapper.scrollTop;
      const start = Math.floor(scrollTop / this.rowsComponent.rowHeight) - this.rowsComponent.bufferSize;
      const end = start + this.rowsComponent.visibleRowsCount + this.bufferSize * 2;
      this.rowsComponent.updateRows(start, end);
    }, 50));
  }

}