import { throttle, debounce } from "./utils.js";

const isBoolean = (a, b) => typeof a === "boolean" || typeof b === "boolean";

const compareBooleans = (a, b, direction) => {
  const aBool = a === true || a === "true" || a === 1;
  const bBool = b === true || b === "true" || b === 1;
  return direction === "asc" ? aBool - bBool : bBool - aBool;
};

const createElement = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
};

export class GridComponent {
  constructor(container, fetchData, config) {
    this.container = container;
    this.fetchData = fetchData;
    this.config = config;

    this.originalData = [];
    this.data = [];
    this.filteredData = [];
    this.sortState = {};

    this.bufferSize = 5;
    this.rowHeight = 0;
    this.visibleRowsCount = 0;

    this.rowPool = [];  // Pool for reusable rows

    this.handleSearch = debounce(this.filterData.bind(this), 100);
  }

  async init() {
    try {
      await this.loadData();
      this.renderTable();
      this.setupEvents();
    } catch (err) {
      console.error("Failed to fetch data", err);
      this.toggleNoDataMessage(true);
    }
  }

  async loadData() {
    this.data = await this.fetchData();
    this.originalData = [...this.data];
    this.filteredData = [...this.data];
  }

  renderTable() {
    const wrapper = createElement("div", "table-scroll");
    this.table = createElement("table");
    this.tbody = createElement("tbody");
    this.spacer = createElement("div", "spacer");
  
    this.table.appendChild(this.createHeader());
    this.table.appendChild(this.tbody);
    wrapper.append(this.table, this.spacer);
    this.container.appendChild(wrapper);
  
    this.calculateRowHeight();
    this.calculateVisibleRows();
  
    // 👇 Create reusable rows initially
    const totalRows = this.visibleRowsCount * 3; // viewport + buffer rows
    for (let i = 0; i < totalRows; i++) {
      const row = createElement("tr");
      this.config.forEach(() => {
        const td = createElement("td");
        row.appendChild(td);
      });
      this.tbody.appendChild(row);
    }
  
    this.updateSpacerHeight();
    this.updateRows(0);
  }
  
  createHeader() {
    const thead = createElement("thead");
    const row = createElement("tr");

    this.config.forEach(col => {
      const th = createElement("th");
      th.textContent = col.column;  //Name, Age 
      Object.assign(th.style, {
        minWidth: col.minWidth,
        maxWidth: col.maxWidth,
      });

      if (col.sortable) this.addSortIcon(th, col);
      if (col.customSortGroups) this.addSortDropdown(th, col);

      const resizer = createElement("div", "resizer");
      this.initResizer(resizer, th); //attach resize behaviour and add it to the header cell 
      th.appendChild(resizer);
      row.appendChild(th);
    });

    thead.appendChild(row);
    return thead;
  }

  addSortIcon(th, col) {
    const icon = createElement("span", "sort-icon", col.sortIcons?.default || "");
    th.classList.add("sortable");
    th.appendChild(icon);
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handleSortClick(col);
    });
  }

  addSortDropdown(th, col) {
    const wrapper = createElement("div", "dropdown-wrapper");
    const icon = createElement("span", "dropdown-toggle", col.dropdownIcon);
    const menu = createElement("ul", "dropdown-menu");

    col.customSortGroups.forEach(group => {   //group: 10-20
      const li = createElement("li", "", group.label);
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        const val = col.dataIndex;  //column keys: name, age and address 
        this.filteredData = this.data.filter(d => d[val] >= group.range[0] && d[val] <= group.range[1]);
        this.updateDisplay();
        menu.classList.remove("visible"); //closes a dropdown after a selection is made 
      });
      menu.appendChild(li);
    });

    wrapper.append(icon, menu);
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("visible"); //if menu is hidden , show it , menu is visible , hide it 
    });
    document.addEventListener("click", () => menu.classList.remove("visible")); //click event on entire page , menu will automatically close if click outside 

    th.appendChild(wrapper);
  }

  initResizer(resizer, th) {
    let startX, startWidth;

    resizer.addEventListener("mousedown", (e) => {
      startX = e.pageX;
      startWidth = th.offsetWidth;

      const move = (e) => th.style.width = `${startWidth + (e.pageX - startX)}px`;
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });
  }

  handleSortClick(col) {
    const current = this.sortState[col.dataIndex];
    this.sortState = { [col.dataIndex]: current === "asc" ? "desc" : "asc" };
    this.sortData(col.dataIndex, this.sortState[col.dataIndex]);
    this.updateSortIcons();
    this.updateDisplay();
  }

  sortData(key, direction) {
    const col = this.config.find(c => c.dataIndex === key);
    this.filteredData.sort((a, b) => {
      let valA = a[key], valB = b[key];

      if (col.customSort) return col.customSort(valA, valB, direction);
      if (isBoolean(valA, valB)) return compareBooleans(valA, valB, direction);
      if (valA == null || valB == null) return valA == null ? 1 : -1;
      if (typeof valA === "number" && typeof valB === "number")
        return direction === "asc" ? valA - valB : valB - valA;

      return direction === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  updateSortIcons() {
    const headers = this.container.querySelectorAll("thead th");
    headers.forEach((th, i) => {
      const col = this.config[i];
      if (col.sortable) {
        const icon = th.querySelector(".sort-icon");
        const dir = this.sortState[col.dataIndex];
        icon.textContent = dir === "asc" ? col.sortIcons.asc : dir === "desc" ? col.sortIcons.desc : col.sortIcons.default;
      }
    });
  }

  createRow(item) {
    let row = this.rowPool.pop();
  
    if (!row) {
      row = createElement("tr");
      this.config.forEach(col => {
        const td = createElement("td");
        const rendered = col.render(item[col.dataIndex]);
        if (rendered instanceof Node) td.appendChild(rendered);
        else td.textContent = rendered;
        row.appendChild(td);
      });
    } else {
      this.config.forEach((col, index) => {
        const td = row.children[index]; 
        const rendered = col.render(item[col.dataIndex]);
        if (rendered instanceof Node) {
          td.textContent = "";  
          td.appendChild(rendered);
        } else {
          td.textContent = rendered;
        }
      });
    }
  
    return row;
  }
  
  updateRows(start = 0) {
    start = Math.max(0, start);
    const end = Math.min(this.filteredData.length, start + this.visibleRowsCount * 3);
    const visibleData = this.filteredData.slice(start, end);
    const rows = Array.from(this.tbody.children);
  
    rows.forEach((row, index) => {
      const dataItem = visibleData[index];
  
      if (dataItem) {
        row.style.display = "";
        this.config.forEach((col, colIndex) => {
          const cell = row.children[colIndex];
          const rendered = col.render ? col.render(dataItem[col.dataIndex]) : dataItem[col.dataIndex];
  
          cell.textContent = "";
          if (rendered instanceof Node) {
            cell.appendChild(rendered);
          } else {
            cell.textContent = rendered;
          }
        });
      } else {
        row.style.display = "none"; 
      }
    });
  
    this.tbody.style.transform = `translateY(${start * this.rowHeight}px)`;
  }

  calculateRowHeight() {
    this.rowHeight = this.tbody.querySelector("tr")?.offsetHeight || 50;
  }

  calculateVisibleRows() {
    const wrapper = this.container.querySelector(".table-scroll");
    this.visibleRowsCount = Math.ceil(wrapper.clientHeight / this.rowHeight);
  }

  updateSpacerHeight() {
    this.spacer.style.height = `${this.filteredData.length * this.rowHeight}px`;
  }

  updateDisplay() {
    this.toggleNoDataMessage(this.filteredData.length === 0); //no rows to show otherwise it hides it 
    this.updateSpacerHeight();
    this.updateRows(0, this.visibleRowsCount * 2);
  }

  setupEvents() {
    this.setupVirtualScroll();
    this.setupSearch();
    this.setupReset();
  }

  setupVirtualScroll() {
    const wrapper = this.container.querySelector(".table-scroll");
    wrapper.addEventListener("scroll", throttle(() => {
      const scrollTop = wrapper.scrollTop;
      const start = Math.floor(scrollTop / this.rowHeight) - this.bufferSize;
      const end = start + this.visibleRowsCount + this.bufferSize * 2;
      this.updateRows(start, end);
    }, 50));
  }

  setupSearch() {
    this.searchElement = document.querySelector(".search-bar input");
    this.searchElement?.addEventListener("input", (e) => this.handleSearch(e.target.value));
  }

  setupReset() {
    this.resetButton = document.querySelector(".reset-btn");
    this.resetButton?.addEventListener("click", () => this.resetSearchAndSort());
  }

  resetSearchAndSort() {
    this.searchElement.value = "";
    this.filteredData = [...this.originalData];
    this.sortState = {};
    this.updateSortIcons();
    this.updateDisplay();
    document.activeElement.blur();
  }

  filterData(keyword) {
    const keys = this.config.filter(c => c.filterable).map(c => c.dataIndex);
    this.filteredData = this.data.filter(item =>
      keys.some(key => String(item[key]).toLowerCase().includes(keyword.toLowerCase()))
    );
    this.updateDisplay();
  }

  toggleNoDataMessage(show, message = "No Data Found") {
    const wrapper = this.container.querySelector(".table-scroll");
    let msg = wrapper.querySelector(".no-data-message");

    if (!msg && show) {
      msg = createElement("div", "no-data-message", message);
      wrapper.appendChild(msg);
    }

    if (msg) msg.classList.toggle("visible", show); //if show is true , adds visible class or not hide it .
  }

}
