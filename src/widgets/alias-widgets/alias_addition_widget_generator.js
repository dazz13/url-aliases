import Util from "/src/widgets/util.js";
import Widget from "/src/widgets/widget.js";
import BaseAliasWidgetGenerator from "/src/widgets/alias-widgets/base_alias_widget_generator.js";
import Alias from "/src/logic/alias.js";
import UrlGenerator from "/src/logic/url_generator.js";

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
    this.table = alias_widget_generator.table;
  }

  focus_event(event) {
    const { widget } = event.detail;
    if (widget == "add") {
      requestAnimationFrame(() => {
        this.alias_field.focus();
      });
    }
  }

  show_or_hide_filter(event) {
    const { show_filter } = event.detail;
    if (show_filter) {
      this.tr.style.display = "none";
    } else {
      this.tr.style.display = "";
      this.alias_field.focus();
    }
  }

  set_or_unset_styles() {
    this.remove_class_name("duplicate");
    this.remove_class_name("matches-current-url");

    let alias_row = this.get_row_with_alias(this.alias_field.value);
    if (alias_row) {
      alias_row.classList.add("matches-current-url");
      this.alias_field.classList.add("duplicate");
    }

    let url_row = this.get_row_with_url(this.url_field.value);
    if (url_row) {
      url_row.classList.add("matches-current-url");
      this.url_field.classList.add("duplicate");
    }
  }

  async create() {
    await this.create_content();
    document.addEventListener("stylesNeedReset",
                              this.set_or_unset_styles.bind(this));
    document.addEventListener("showOrHideFilter",
                              this.show_or_hide_filter.bind(this));
  }

  async create_content() {
    this.tr = Widget.create_tr();
    const add_button_td = Widget.create_td(this.create_add_button());
    this.alias_field = this.create_alias_field();
    this.url_field = await this.create_url_field();
    let alias_td = Widget.create_td(this.alias_field);
    add_button_td.classList.add("add-button-td");
    alias_td.classList.add("alias-td");
    this.tr.appendChild(add_button_td);
    this.tr.appendChild(alias_td);
    this.tr.appendChild(Widget.create_td(this.url_field));

    // Add row as first or second row of table.
    if (this.table.rows.length == 0) {
      this.table.appendChild(this.tr);
    } else {
      this.table.insertBefore(this.tr, this.table.rows[1]);
    }
    // Add an overlay for error messages
    this.error_overlay = this.create_error_overlay();
    document.body.insertBefore(this.error_overlay, document.body.firstChild);
    document.dispatchEvent(new CustomEvent(
      "showOrHideFilter", { detail: { show_filter: false } }));
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
    const values = {
      name: this.alias_field.value.trim(),
      url: this.url_field.value.trim(),
    };

    // Validate URL
    if (values.name.length == 0) {
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

    let row = this.get_row_with_url(values.url);
    if (row) {
      const text = Util.get_text_from_element_in_row(row, "td.alias");
      this.show_overlay_error(
        `The URL already has an alias: ${text}.`);
      return;
    }

    let alias_row = this.get_row_with_alias(values.name);
    if (alias_row) {
      this.show_overlay_error("That alias is already assigned.");
      return;
    }

    let alias = await this.controller.create_alias(values);
    this.alias_widget_generator.create(alias);

    this.alias_field.value = "";
    this.url_field.value = "";
    this.alias_field.focus();
  }

  show_overlay_error(message) {
    this.error_overlay.textContent = message;
    this.error_overlay.style.display = "flex";

    // Hide the overlay after 2 seconds
    setTimeout(this.hide_overlay_error, 2000);
  }

  hide_overlay_error() {
    this.error_overlay.style.display = "none";
    this.error_overlay.textContent = "";
  }

  remove_class_name(class_name, ele = this.table) {
    for (let el of Array.from(ele.getElementsByClassName(class_name))) {
      el.classList.remove(class_name);
    }
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
    element.addEventListener("keyup", (event) => {
      this.set_or_unset_styles();
      if (event.key == "/") {
        this.alias_field.value = this.alias_field.value.replace("/", "");
        document.dispatchEvent(new CustomEvent(
          "showOrHideFilter", { detail: { show_filter: true } }));
        document.dispatchEvent(new CustomEvent(
          "customFocus", { detail: { widget: "filter" } }));
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

    element.addEventListener("keyup", async (event) => {
      this.set_or_unset_styles();
    });

    return element;
  }

  row_has_alias(row, alias) {
    const text = Util.get_text_from_element_in_row(row, "td.alias") || "";
    const alias_regex = new RegExp("^" + alias + "$");
    return text.match(alias_regex);
  }

  get_row_with_alias(alias) {
    let rows = Array.from(this.table.rows).slice(2);
    for (let row of rows) {
      if (this.row_has_alias(row, alias.trim())) {
        return row;
      }
    }
  }

  row_has_url(row, url) {
    const text = Util.get_text_from_element_in_row(row, "td.url") || "";
    const regex = new RegExp(
      "^" +
        Util.escape_reg_exp(UrlGenerator.generate(url).replace("https://", "")) +
        "/?$");
    return text.match(regex);
  }

  get_row_with_url(value) {
    const url = this.controller.maybe_remove_http(value.trim());
    let rows = Array.from(this.table.rows).slice(2);
    for (let row of rows) {
      if (this.row_has_url(row, url)) {
        return row;
      }
    }
  }
}
