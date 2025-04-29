import { columnConfig } from './config.js';
import { GridComponent } from './grid-component.js';

const fetchData = async () => {
  try {
    const response = await fetch("http://localhost:3000/users");
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("grid-container");
  const grid = new GridComponent(container, fetchData, columnConfig);
  await grid.init();
});
