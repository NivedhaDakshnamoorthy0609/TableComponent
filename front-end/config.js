export const columnConfig = [
  { 
    column: "Name", 
    dataIndex: "name", 
    sortable: true, 
    filterable: true,
    minWidth: "25%", 
    maxWidth: "30%", 
    render: (value) => value,
    sortIcons: { default: "↕", asc: "▲", desc: "▼" }
    },
  { 
    column: "Age", 
    dataIndex: "age", 
    sortable: true, 
    filterable: true,
    minWidth: "5%",
    maxWidth: "15%",
    render: (value) => value,
    sortIcons: { default: "↕", asc: "▲", desc: "▼" },
    dropdownIcon: "⚙",
    customSortGroups: [
      { label: "10-20", range: [10, 20] },
      { label: "21-30", range: [21, 30] },
      { label: "31-40", range: [31, 40] },
      { label: "41-50", range: [41, 50] }
    ]
  },
  { 
    column: "Address", 
    dataIndex: "address", 
    sortable: true, 
    filterable: true,
    minWidth: "35%",
    maxWidth: "35%",
    render: (value) => value,
    sortIcons: { default: "↕", asc: "▲", desc: "▼" },
  },
  { 
    column: "Logged In", 
    dataIndex: "isLoggedIn", 
    sortable: true, 
    filterable: false,
    minWidth: "20%",
    maxWidth: "25%",
    render: (value) => {
      const span = document.createElement("span");
      span.textContent = value ? "✅" : "❌";  
      return span;
    },
    sortIcons: { default: "↕", asc: "▲", desc: "▼" }
  },
  { 
    column: "WFH Today", 
    dataIndex: "isWfHToday", 
    sortable: true, 
    filterable: false,
    minWidth: "15%",
    maxWidth: "20%",
    render: (value) => {
      const span = document.createElement("span");
      span.textContent = value ? "🏠" : "🏢"; 
      return span;
    },
    sortIcons: { default: "↕", asc: "▲", desc: "▼" }
  }
];
