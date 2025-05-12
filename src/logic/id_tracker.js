export default class IdTracker {
  async get_id() {
    // Always survey the existing rules to find the maximum ID
    const maxRuleId = await this.get_max_rule_id();
    return maxRuleId + 1; // Return the next available ID
  }

  async get_max_rule_id() {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const ids = rules.map(rule => rule.id);
    return ids.length > 0 ? Math.max(...ids) : 0; // If no rules exist, return 0
  }
}
