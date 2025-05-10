import Widget from "/src/widgets/widget.js"
import BaseAliasWidgetGenerator from "/src/widgets/alias-widgets/base_alias_widget_generator.js"
import Alias from "/src/logic/alias.js"

function query_tabs(queryInfo) {
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

async function active_url() {
  const tabs = await query_tabs({ active: true, currentWindow: true });
  if (tabs && tabs.length > 0) {
    const current_url = tabs[0].url;
    console.log('url of this tab', current_url);
    return current_url;
  } else {
    console.log('tabs test failed.');
  }
}

export default class AliasAdditionWidgetGenerator extends BaseAliasWidgetGenerator{
  static WIDGET_ID = "alias-addition-widget";
  static WIDGET_HOLDER = "alias-addition";
  static WIDGET_AUTOFOCUS_FIELD = "alias-input-field";

  constructor(alias_controller, alias_widget_generator) {
    super();
    this.controller = alias_controller;
    this.alias_widget_generator = alias_widget_generator;
    this.add_button_action = this.add_button_action.bind(this);
  }

  async create_content() {
    let widget_content = Widget.create_form()
    widget_content.appendChild(this.create_add_button());
    widget_content.appendChild(this.create_alias_field());
    widget_content.appendChild(await this.create_url_field());
    return widget_content;
  }

  create_add_button() {
    let add_button = Widget.create_button();
    add_button.addEventListener("click", this.add_button_action);
    add_button.innerText = "+";
    return add_button;
  }

  async add_button_action(event){
    let element = event.target;
    let widget = element.parentNode;
    let values = {
      "alias": widget.querySelector(".alias").value,
      "url": widget.querySelector(".url").value,
    }
    let alias = await this.controller.create_alias(values);
    this.alias_widget_generator.create(alias);
    widget.querySelector(".alias").value = '';
    widget.querySelector(".url").value = '';
    widget.querySelector(".alias").focus();
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
      element.select();
    });

    return element;
  }

  async create_url_field() {
    let element = Widget.create_input();
    element.classList.add("url");
    element.setAttribute("placeholder","url");
    element.value = await active_url();
    Widget.add_submission_event(element, this.add_button_action);
    element.addEventListener("focus", (event) => {
      element.select();
    });
    return element;
  }
}
