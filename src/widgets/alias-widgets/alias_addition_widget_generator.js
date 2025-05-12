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
    let tr = Widget.create_tr();
    this.alias_field = this.create_alias_field();
    let add_button_td = Widget.create_td(this.create_add_button());
    let alias_td = Widget.create_td(this.alias_field);
    add_button_td.style.width = "23px";
    alias_td.style.width = "28px";
    tr.appendChild(add_button_td);
    tr.appendChild(alias_td);
    tr.appendChild(Widget.create_td(await this.create_url_field()));
    this.alias_widget_generator.table.appendChild(tr);

    // Add an overlay for error messages
    this.error_overlay = this.create_error_overlay();
    tr.appendChild(this.error_overlay);
  }

  focus() {
    this.alias_field.focus();
  }

  query_tabs(queryInfo) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query(queryInfo, (tabs) => {
        // Check for errors returned by the Chrome API
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(tabs);
      });
    });
  }

  async active_url() {
    const tabs = await this.query_tabs({ active: true, currentWindow: true });
    if (tabs && tabs.length > 0) {
      const current_url = tabs[0].url;
      return current_url;
    } else {
      console.log("tabs test failed.");
    }
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
      /* Make error visible to user. */
      return;
    }

    let alias = await this.controller.create_alias(values);
    this.alias_widget_generator.create(alias);

    aliasField.value = "";
    urlField.value = "";
    aliasField.focus();
  }

  show_overlay_error(message) {
    this.error_overlay.textContent = message;
    this.error_overlay.style.display = "flex";

    // Hide the overlay after 3 seconds
    setTimeout(this.hide_overlay_error, 3000);
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

    element.addEventListener("focus", (event) => {
      this.hide_overlay_error(); // Clear error when alias field is focused.
      element.select();
    });

    element.focus();
    return element;
  }

  async create_url_field() {
    let element = Widget.create_input();
    element.classList.add("url");
    element.setAttribute("placeholder", "url");
    element.value = await this.active_url();
    Widget.add_submission_event(element, this.add_button_action);

    element.addEventListener("focus", (event) => {
      this.hide_overlay_error(); // Clear error when URL field is focused.
      element.select();
    });

    return element;
  }
}
