import previouslyFocusedElement from '/popup.js';

export default class SortWidget {

  static icons = ["az-up", "az-dn", "dt-up", "dt-dn"];
  static iconExt = ".svg";

  constructor(alias_widget_generator) {
    this.alias_widget_generator = alias_widget_generator;
  }

  create() {
    this.sort_icon = document.getElementById("sort-icon");
    document.addEventListener("click", this.toggleSort.bind(this));
    document.addEventListener("tableCreated", this.getTable.bind(this));
  }

  getTable() {
    this.table = this.alias_widget_generator.table;
    this.rows = Array.from(this.table.rows).splice(2);
  }

  toggleSort(event) {
    if (event.target != this.sort_icon) {
      return;
    }
    const icon_prefix = this.sort_icon.src.slice(0, -9);
    const icon = this.sort_icon.src.slice(-9, -4);
    let idx = this.constructor.icons.indexOf(icon);
    if (idx == -1) {
      console.log("Error: icon", icon, "not found in", this.constructor.icons);
      return;
    }
    idx = (idx + 1) % this.constructor.icons.length;
    this.sort_icon.src = icon_prefix + this.constructor.icons[idx] + this.constructor.iconExt;
    this.doSort(this.constructor.icons[idx]);
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    } else {
      console.log("No previously focussed element.");
    }
  }

  doSort(icon) {
    let newRows;
    if (icon == "dt-up") {
      newRows = this.sortRowsDateUp();
    } else if (icon == "dt-dn") {
      newRows = this.sortRowsDateDown();
    } else if (icon == "az-up") {
      newRows = this.sortRowsAZ();
    } else if (icon == "az-dn") {
      newRows = this.sortRowsZA();
    }
    for (const row of newRows) {
      this.table.appendChild(row);
    }
  }

  sortRowsAZ() {
    return this.rows.sort((a, b) => {
      const aValue = a.cells[1].firstChild.textContent;
      const bValue = b.cells[1].firstChild.textContent;
      return aValue.localeCompare(bValue);
    });
  }

  sortRowsZA() {
    return this.rows.sort((a, b) => {
      const aValue = a.cells[1].firstChild.textContent;
      const bValue = b.cells[1].firstChild.textContent;
      return bValue.localeCompare(aValue);
    });
  }

  sortRowsDateUp() {
    return this.rows.sort((a, b) => {
      const aValue = a.getAttribute("alias-id-value");
      const bValue = b.getAttribute("alias-id-value");
      return bValue.localeCompare(aValue);
    });
  }

  sortRowsDateDown() {
    return this.rows.sort((a, b) => {
      const aValue = a.getAttribute("alias-id-value");
      const bValue = b.getAttribute("alias-id-value");
      return aValue.localeCompare(bValue);
    });
  }
}
