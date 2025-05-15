import Widget from "/src/widgets/widget.js"
import BaseAliasWidgetGenerator from "/src/widgets/alias-widgets/base_alias_widget_generator.js"

export default class AliasWidgetGenerator extends BaseAliasWidgetGenerator {
  static WIDGET_ID = "alias-widget"
  static WIDGET_HOLDER = "alias-collection"
  static ALIAS_ID = "alias-id-value"
  static ALIAS_WIDGET_TABLE_CLASS = "alias-table-class"

  constructor(alias_controller) {
    super();
    this.table = Widget.create_table();
    this.table.classList.add(AliasWidgetGenerator.ALIAS_WIDGET_TABLE_CLASS);
    this.controller = alias_controller;
    this.delete_button_action = this.delete_button_action.bind(this);
  }

  async create_existing_aliases() {
    let aliases = await this.controller.get_aliases();
    this.append(this.table);
    for (let alias of aliases) {
      await this.create(alias);
    }
  }

  async create(alias, insert_after_row = 1) {
    let row = Widget.create_tr();
    row.setAttribute(AliasWidgetGenerator.ALIAS_ID, alias.id);
    for (let ele of await this.get_alias_widget_elements(alias)) {
      row.appendChild(ele);
    }
    row.delete_button_action = this.delete_button_action.bind(this);
    if (this.table.rows.length > insert_after_row) {
      // Insert rows from the top.
      this.table.insertBefore(row, this.table.rows[insert_after_row]);
    } else {
      this.table.appendChild(row);
    }
  }

  add_initial_row_from_three_elements(elements) {
    let row = Widget.create_tr();
    for (let ele of elements) {
      row.appendChild(ele);
    }
    this.table.insertBefore(row, this.table.firstChild);
    return row;
  }

  async get_alias_widget_elements(alias) {
    let row_elements = [];
    row_elements.push(this.create_delete_button());
    row_elements.push(this.add_alias_value(alias.name));
    row_elements.push(await this.add_url_value(alias.url.replace(/^(https?:\/\/)/, '')));
    return row_elements;
  }

  create_delete_button() {
    let delete_button = Widget.create_button();
    delete_button.innerText = "x";
    delete_button.addEventListener("click", this.delete_button_action);
    return Widget.create_td(delete_button);
  }

  async delete_button_action(event) {
    let button = event.target;
    let td = button.parentNode;
    let row = td.parentNode;
    let id = parseInt(row.getAttribute(AliasWidgetGenerator.ALIAS_ID));
    row.remove();
    await this.controller.delete_alias(id);
  }

  add_alias_value(value) {
    let element = Widget.create_td();
    element.classList.add("alias");
    element.innerText = value;
    return element;
  }

  async add_url_value(value) {
    let element = Widget.create_td();
    element.classList.add("url");
    element.innerText = value;
    let url = this.controller.maybe_add_protocol(value);
    let current_url = await this.controller.active_url();
    if (url == current_url) {
      element.classList.add("url-in-list-matches-current-url");
    }
    element.addEventListener("click", (event) => {
      chrome.tabs.update({ url: url });
    });
    return element;
  }
}
