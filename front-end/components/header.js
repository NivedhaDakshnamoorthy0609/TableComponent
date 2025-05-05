import { createElement } from "../utils/createElement.js";
import { toggleNoDataMessage } from "../utils/noData.js";

export class HeaderComponent {
    constructor(config, container, rowsComponent, sortManager, filteredData, data, searchManager) {
        this.config = config;
        this.container = container;
        this.rowsComponent = rowsComponent;
        this.sortManager = sortManager;
        this.filteredData = filteredData;
        this.data = data;
        this.searchManager = searchManager;

        this.searchRowVisible = false;
        this.searchRowElement = null;
    }

    addSortIcon(th, col) {
        const icon = createElement("span", "sort-icon", col.sortIcons?.default || "");
        th.classList.add("sortable");
        th.appendChild(icon);
        icon.addEventListener("click", (e) => {
            e.stopPropagation();
            this.sortManager.handleSortClick(col);
        });
    }

    addSortDropdown(th, col) {
        const wrapper = createElement("div", "dropdown-wrapper");
        const icon = createElement("span", "dropdown-toggle", col.dropdownIcon);
        const menu = createElement("ul", "dropdown-menu");

        col.customSortGroups.forEach(group => {
            const li = createElement("li", "", group.label);
            li.addEventListener("click", (e) => {
                e.stopPropagation();
                const val = col.dataIndex;
                const filtered = this.data.filter(d => d[val] >= group.range[0] && d[val] <= group.range[1]);

                this.filteredData = filtered;
                this.rowsComponent.filteredData = filtered;

                toggleNoDataMessage(this.container, this.filteredData.length === 0);
                this.rowsComponent.updateSpacerHeight();
                this.rowsComponent.updateRows(0);
                menu.classList.remove("visible");
            });
            menu.appendChild(li);
        });

        wrapper.append(icon, menu);
        icon.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.toggle("visible");
        });
        document.addEventListener("click", () => menu.classList.remove("visible"));

        th.appendChild(wrapper);
    }

    initResizer(resizer, th, index) {
        let startX, startWidth;
   
        resizer.addEventListener("mousedown", (e) => {
            startX = e.pageX;
            startWidth = th.offsetWidth;
   
            const move = (e) => {
                const newWidth = startWidth + (e.pageX - startX);
                th.style.width = `${newWidth}px`;
                const rows = this.rowsComponent.tbody.querySelectorAll("tr");
                rows.forEach(row => {
                    row.children[index].style.width = `${newWidth}px`;
                });
            };
   
            const up = () => {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
            };
   
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
        });
    }

    toggleSearchRow() {
        if (this.searchRowVisible) {
            this.searchRowElement.remove();
            this.searchRowElement = null;
            this.searchRowVisible = false;
            return;
        }

        const tr = createElement("tr", "search-row");
        const td = createElement("td");
        td.colSpan = this.config.length;

        const input = createElement("input");
        input.type = "text";
        input.placeholder = "Search...";
        input.className = "search-input";

        const reset = createElement("button", "reset-btn", "Reset");
        reset.addEventListener("click", () => {
            input.value = "";
            this.searchManager.resetSearch();
        });

        input.addEventListener("input", () => {
            this.searchManager.handleSearch(input.value);
        });

        td.append(input, reset);
        tr.appendChild(td);

        const thead = this.container.querySelector("thead");
        thead.insertAdjacentElement("afterend", tr);

        this.searchRowElement = tr;
        this.searchRowVisible = true;
    }

    render() {
        const thead = createElement("thead");
        const row = createElement("tr");
   
        this.config.forEach((col, index) => {  
            const th = createElement("th");
            th.textContent = col.column;
            Object.assign(th.style, {
                minWidth: col.minWidth,
                maxWidth: col.maxWidth,
            });
   
            if (col.sortable) this.addSortIcon(th, col);
            if (col.customSortGroups) this.addSortDropdown(th, col);
   
            if (col.dataIndex === "address" && col.searchIcon) {
                const icon = createElement("span", "search-toggle", col.searchIcon);
                icon.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.toggleSearchRow();
                });
                th.appendChild(icon);
            }
   
            if (col.dataIndex === "name" && col.resetIcon) {
                const resetIcon = createElement("span", "reset-toggle", col.resetIcon);
                resetIcon.title = "Reset Search";
                resetIcon.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.searchManager.resetSearch();
                });
                th.appendChild(resetIcon);
            }
   
            const resizer = createElement("div", "resizer");
            this.initResizer(resizer, th, index); 
            th.appendChild(resizer);
   
            row.appendChild(th);
        });
   
        thead.appendChild(row);
        return thead;
    }
}
