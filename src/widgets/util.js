export default class Util {
  static get_text_from_element_in_row(row, selector) {
    const element = row.querySelector(selector);
    return element ? element.innerText.trim() : null;
  }

  static escape_reg_exp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
