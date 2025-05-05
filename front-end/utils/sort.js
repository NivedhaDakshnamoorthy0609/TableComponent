import { toggleNoDataMessage } from "./noData.js";

const isBoolean = (a, b) => typeof a === "boolean" || typeof b === "boolean";

const compareBooleans = (a, b, direction) => {
    const aBool = a === true || a === "true" || a === 1;
    const bBool = b === true || b === "true" || b === 1;
    return direction === "asc" ? aBool - bBool : bBool - aBool;
};

export class sortManager {

    constructor(container, config, filteredData, rowsComponent) {
        this.container = container;
        this.filteredData = filteredData;
        this.config = config;
        this.sortState = {};

        this.rowsComponent = rowsComponent;
    }

    handleSortClick(col) {
        const currentSortDirection = this.sortState[col.dataIndex];
        const newDirection = currentSortDirection === "asc" ? "desc" : "asc";
        this.sortState = { [col.dataIndex]: newDirection };
    
        this.sortData(col.dataIndex, newDirection);
    
        toggleNoDataMessage(this.container, this.rowsComponent.filteredData.length === 0);
        this.rowsComponent.updateSpacerHeight();
        this.rowsComponent.updateRows(0);
        this.updateSortIcons();
    }

    sortData(key, direction) {
        const col = this.config.find(c => c.dataIndex === key);
    
        this.rowsComponent.filteredData.sort((a, b) => {
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
                if (icon) {
                    icon.textContent = dir === "asc" ? col.sortIcons.asc : dir === "desc" ? col.sortIcons.desc : col.sortIcons.default;
                }
            }
        });
    }
}