export class RowsComponent {

    constructor(tbody, config, container, filteredData, spacer) {
        this.tbody = tbody;
        this.config = config;
        this.container = container;
        this.filteredData = filteredData;
        console.log("filteredData", filteredData)
        this.spacer = spacer;
    
        this.rowHeight = 50;
        this.visibleRowsCount = 0;
        this.bufferSize = 5;
      }

    updateRows(start = 0) { 
        
        start = Math.max(0, start);
        const end = Math.min(this.filteredData.length, start + this.visibleRowsCount * 3); 

        console.log("Rendering rows from", start, "to", end);

        const visibleData = this.filteredData.slice(start, end);
        console.log("visibleData", visibleData)
        const rows = Array.from(this.tbody.children);

        console.log("98908", rows);  

        this.tbody.style.transform = `translateY(${start * this.rowHeight}px)`;
        
        rows.forEach((row, index) => {  
          const dataItem = visibleData[index]; 

          if (dataItem) { 
            row.style.display = "";  
            row.classList.toggle("row", (start + index) % 2 === 1);
            
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
       
      }

      calculateVisibleRows() {
        const wrapper = this.container.querySelector(".table-scroll");
        this.visibleRowsCount = Math.ceil(wrapper.clientHeight / this.rowHeight); //this.visibleRowsCount = Math.ceil(400 / 50); // => 8
        console.log("8888888888", this.visibleRowsCount)

      }
    
      updateSpacerHeight() {
        this.spacer.style.height = `${this.filteredData.length * this.rowHeight}px`;

      }
}