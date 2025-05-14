export default class Widget {
  static create_table() {
    return document.createElement("table");
  }

  static create_tr() {
    return document.createElement("tr");
  }

  static create_a(text, url) {
    let a = document.createElement("a");
    const link_text = document.createTextNode(text);
    a.href = url ?
      (url.includes("://") ? url : "https://" + url) :
      (text.includes("://") ? text : "https://" + text);
    a.appendChild(link_text);
    return a;
  }

  static create_td(inner_element) {
    let element = document.createElement("td");
    if (inner_element) {
      element.appendChild(inner_element);
    }
    return element;
  }

  static create_td_and_add_to_tr(row, inner_element) {
    let td = create_td(inner_element);
    row.appendChild(td);
  }

  static create_button() {
    let button = document.createElement("button");
    button.classList.add("button");
    return button;
  }

  static create_input() {
    let element = document.createElement("input");
    element.classList.add("field");
    element.setAttribute("type", "text");
    return element;
  }

  static create_form() {
    let widget_content = document.createElement("div");
    widget_content.classList.add("form");
    return widget_content;
  }

  static create_value() {
    let value = document.createElement("div");
    return value;
  }

  static add_submission_event(element, method) {
    element.addEventListener("keypress", function(event){
      if (event.key === 'Enter') {
        method(event)
      }
    })
  }
}
