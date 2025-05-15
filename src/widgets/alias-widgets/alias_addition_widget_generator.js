import Widget from "/src/widgets/widget.js";
import BaseAliasWidgetGenerator from "/src/widgets/alias-widgets/base_alias_widget_generator.js";
import Alias from "/src/logic/alias.js";

export default class AliasAdditionWidgetGenerator extends BaseAliasWidgetGenerator {
  static WIDGET_ID = "alias-addition-widget";
  static WIDGET_HOLDER = "alias-addition";
  static WIDGET_AUTOFOCUS_FIELD = "alias-input-field";

  constructor(alias_controller, alias_widget_generator) {
    super();
    this.controller = alias_controller;
    this.alias_widget_generator = alias_widget_generator;
    this.add_button_action = this.add_button_action.bind(this);
    this.hide_overlay_error = this.hide_overlay_error.bind(this);
    this.table = Widget.create_table();
  }

  async create() {
    await this.create_content();
  }

  async create_content() {
    const table = this.alias_widget_generator.table;
    let tr = Widget.create_tr();
    this.alias_field = this.create_alias_field();
    let add_button_td = Widget.create_td(this.create_add_button());
    let alias_td = Widget.create_td(this.alias_field);
    add_button_td.classList.add("add-button-td");
    alias_td.classList.add("alias-td");
    tr.appendChild(add_button_td);
    tr.appendChild(alias_td);
    tr.appendChild(Widget.create_td(await this.create_url_field()));

    // Add row as first row of table.
    if (table.rows.length == 0) {
      table.appendChild(tr);
    } else {
      table.insertBefore(tr, table.rows[0]);
    }
    // Add an overlay for error messages
    this.error_overlay = this.create_error_overlay();
    const table_parent = table.parentElement;
    table_parent.insertBefore(
      tr.appendChild(this.error_overlay), table_parent.firstChild);
  }

  focus() {
    this.alias_field.focus();
  }

  create_add_button() {
    let add_button = Widget.create_button();
    add_button.addEventListener("click", this.add_button_action);
    add_button.innerText = "+";
    return add_button;
  }

  create_error_overlay() {
    const overlay = document.createElement("div");
    overlay.classList.add("error-overlay");
    return overlay;
  }

  async add_button_action(event) {
    let element = event.target;
    let widget = element.parentNode;
    widget = widget.parentNode;
    let urlField = widget.querySelector(".url");
    let aliasField = widget.querySelector(".alias");

    const values = {
      alias: aliasField.value.trim(),
      url: urlField.value.trim(),
    };

    // Validate URL
    if (values.alias.length == 0) {
      this.show_overlay_error("No alias entered.");
      return;
    }

    if (values.url.length == 0) {
      this.show_overlay_error("No URL entered.");
      return;
    }

    if (values.url.startsWith("chrome://")) {
      this.show_overlay_error("URLs starting with 'chrome://' are not allowed.");
      return;
    }

    if (values.alias == "" || values.url == "") {
      // No error visible to user.
      return;
    }

    if (await this.is_alias_duplicate(values.alias)) {
      // User sees duplicate via styling.
      return;
    }

    let name = await this.get_name_for_url(values.url);
    if (name) {
      this.show_overlay_error(`The URL already has an alias: ${name}.`);
      return;
    }

    let alias = await this.controller.create_alias(values);
    this.alias_widget_generator.create(alias, 1);

    aliasField.value = "";
    urlField.value = "";
    aliasField.focus();
  }

  show_overlay_error(message) {
    this.error_overlay.textContent = message;
    this.error_overlay.style.display = "flex";

    // Hide the overlay after 3 seconds
    setTimeout(this.hide_overlay_error, 2500);
  }

  hide_overlay_error() {
    this.error_overlay.style.display = "none";
    this.error_overlay.textContent = "";
  }

  create_alias_field() {
    let element = Widget.create_input();
    element.classList.add("alias");
    element.setAttribute("id", this.constructor.WIDGET_AUTOFOCUS_FIELD);
    element.setAttribute("placeholder", "alias");

    // Add event listener for Enter key
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.add_button_action(event);
      }
    });
    element.addEventListener("keyup", async (event) => {
      let dup = await this.is_alias_duplicate(element.value);
      if (dup) {
        this.alias_field.classList.add('duplicate');
      } else {
        this.alias_field.classList.remove('duplicate');
      }
    });

    element.addEventListener("focus", (event) => {
      element.select();
    });

    element.focus();
    return element;
  }

  async create_url_field() {
    let element = Widget.create_input();
    element.classList.add("url");
    element.setAttribute("placeholder", "url");
    let controller_aliases = await this.controller.get_aliases();
    let urls = controller_aliases.map(alias => alias.url);
    let current_url = await this.controller.active_url();
    if (urls.includes(current_url)) {
      element.value = "";
    } else {
      element.value = current_url;
    }
    Widget.add_submission_event(element, this.add_button_action);

    element.addEventListener("focus", (event) => {
      element.select();
    });

    return element;
  }

  async is_alias_duplicate(value) {
    let controller_aliases = await this.controller.get_aliases();
    let aliases = controller_aliases.map(alias => alias.name);
    for (let alias of aliases) {
      if (alias == value) return true;
    }
    return false;
  }

   escape_reg_exp(s) {
     return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
   }

  async get_name_for_url(value) {
    const url = this.controller.maybe_remove_http(value);
    const aliases = await this.controller.get_aliases();
    const url_regex = new RegExp(
      "^(http://|https://)?" + this.escape_reg_exp(url) + "/?$");
    for (let alias of aliases) {
      if (alias.url.match(url_regex)) {
        return alias.name;
      }
    }
    return null;
  }
}
