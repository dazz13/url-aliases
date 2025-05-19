import RuleGenerator from "/src/logic/rule_generator.js";
import IdTracker from "/src/logic/id_tracker.js";
import Alias from "/src/logic/alias.js"

export default class AliasController {
  static instance = null;
  static ID_KEY = "ALIAS";

  static get_instance(){
    if (AliasController.instance == null) {
      AliasController.instance = new AliasController();
    }
    return AliasController.instance;
  }

  constructor() {
    this.id_tracker = new IdTracker(AliasController.ID_KEY);
  }

  /* Only used with the add alias button. */
  async create_alias(values) {
    let id = await this.id_tracker.get_id();
    values["id"] = id;
    let alias = Alias.create(values);
    await this.add_alias(alias);
    return alias;
  }

  async add_alias(alias) {
    let rule = RuleGenerator.generate(alias);
    await chrome.declarativeNetRequest.updateDynamicRules({addRules: [rule]});
  }

  async delete_all_aliases() {
    let alias_ids = await this.get_alias_ids();
    await this.delete_aliases(alias_ids);
  }

  async delete_aliases(ids) {
    await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: ids});
  }

  async delete_alias(id) {
    await this.delete_aliases([id])
  }

  async get_aliases() {
    const rules = await this.get_alias_rules();
    const aliases = [];
    for (const rule of rules) {
      aliases.push(RuleGenerator.rule_to_alias(rule));
    }
    return aliases;
  }

  async get_alias_rules() {
    return await chrome.declarativeNetRequest.getDynamicRules();
  }

  async get_alias_ids() {
    let alias_rules = await this.get_alias_rules();
    let ids = []
    for (let rule of alias_rules) {
      ids.push(rule["id"]);
    }
    return ids;
  }

  async update_alias(alias) {
    await this.delete_alias(alias.id)
    await this.add_alias(alias)
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
    return "";
  }

  maybe_add_protocol(url) {
    return url.includes("://") ? url : "https://" + url;
  }

  maybe_remove_http(url) {
    return url.replace(/^(http|https):\/\//, '');
  }
}
