import Util from "/src/widgets/util.js";
import Widget from "/src/widgets/widget.js";
import BaseAliasWidgetGenerator from "/src/widgets/alias-widgets/base_alias_widget_generator.js";
import Alias from "/src/logic/alias.js";

export default class AliasFilterWidgetGenerator extends BaseAliasWidgetGenerator {
  static WIDGET_ID = "alias-filter-widget";
  static WIDGET_HOLDER = "alias-filter";
  static WIDGET_AUTOFOCUS_FIELD = "alias-filter-input-field";

  constructor(alias_controller, alias_widget_generator) {
    super();
    this.controller = alias_controller;
    this.alias_widget_generator = alias_widget_generator;
    this.table = alias_widget_generator.table;
    this.do_filter = this.do_filter.bind(this);
  }

  async create() {
    await this.create_content();
    document.addEventListener("showOrHideFilter",
                              this.show_or_hide_filter.bind(this));
    document.addEventListener("customFocus", this.focus_event.bind(this));
  }

  show_or_hide_filter(event) {
    const { show_filter } = event.detail;
    if (show_filter) {
      this.tr.style.display = "";
      this.do_filter();
    } else {
      this.tr.style.display = "none";
      this.show_all_rows();
    }
  }

  focus_event(event) {
    const { widget } = event.detail;
    if (widget == "filter") {
      requestAnimationFrame(() => {
        this.filter_field.focus();
      });
    }
  }

  async create_content() {
    this.tr = Widget.create_tr();
    this.tr.style.display = "none";
    this.filter_field = this.create_filter_field();
    let filter_td = Widget.create_td(this.filter_field);
    filter_td.colSpan = 3;
    filter_td.classList.add("filter-td");
    this.tr.appendChild(filter_td);

    // Add row as first row of table.
    if (this.table.rows.length == 0) {
      this.table.appendChild(this.tr);
    } else {
      this.table.insertBefore(this.tr, this.table.rows[0]);
    }
  }

  focus() {
    this.filter_field.focus();
  }

  do_filter(event) {
    const filter = this.filter_field.value.trim() || "";
    this.filter_rows(filter);
  }

  create_filter_field() {
    let element = Widget.create_input();
    element.classList.add("filter");
    element.setAttribute("id", this.constructor.WIDGET_AUTOFOCUS_FIELD);
    element.setAttribute("placeholder", "filter");

    element.addEventListener("focus", (event) => {
      element.select();
    });

    element.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent(
          "showOrHideFilter", { detail: { show_filter: false } }));
        return;
      }
    });

    element.addEventListener("keyup", this.do_filter);

    element.focus();
    return element;
  }

  filter_rows(str) {
    let strings = [str];
    if (str.includes(" ")) {
      strings.push(str.replace(" ", "+"));
    }
    let rows = Array.from(this.table.rows).slice(2);
    for (let row of rows) {
      row.style.display = "none";
    }
    for (let s of strings) {
      for (let row of rows) {
        if (this.row_contains_string(row, s)) {
          row.style.display = "";
        }
      }
    }
  }

  show_all_rows() {
    let rows = Array.from(this.table.rows).slice(2);
    for (let row of rows) {
      row.style.display = "";
    }
  }

  row_contains_string(row, s) {
    let result = false;
    const url_regex = new RegExp(".*" + Util.escape_reg_exp(s) + ".*");
    const url = Util.get_text_from_element_in_row(row, "td.url");
    result ||= url ? url.match(url_regex) : false;
    if (!result) {
      const alias_regex = new RegExp(".*" + Util.escape_reg_exp(s) + ".*");
      const alias = Util.get_text_from_element_in_row(row, "td.alias");
      result ||= alias ? alias.match(alias_regex) : false;
    }
    return result;
  }

  row_has_url(row, url) {
    const url_regex = new RegExp(
      "^(http://|https://)?" + Util.escape_reg_exp(url) + "/?$");
    const text = Util.get_text_from_element_in_row(row, "td.url");
    return text ? text.match(url_regex) : false;
  }

  row_has_alias(row, alias) {
    const alias_regex = new RegExp("^" + alias + "$");
    const text = Util.get_text_from_element_in_row(row, "td.alias");
    return text ? text.match(alias_regex) : false;
  }

  async get_row_with_url(value) {
    const url = this.controller.maybe_remove_http(value.trim());
    for (let row of this.table.rows) {
      if (this.row_has_url(row, url)) {
        return row;
      }
    }
  }

  async get_row_with_alias(alias) {
    for (let row of this.table.rows) {
      if (this.row_has_alias(row, alias.trim())) {
        return row;
      }
    }
    return null;
  }
}
