import UrlGenerator from "/src/logic/url_generator.js";

export default class Alias {
    constructor(id, alias, url) {
        this.id = id;
        this.name = alias;
        this.url = UrlGenerator.generate(url);
    }

    static create(alias_values) {
        if ("id" in alias_values && "alias" in alias_values && "url" in alias_values) {
            return new Alias(alias_values["id"], alias_values["alias"], alias_values["url"])
        }
        throw Error("ERROR: Name and url must be specifed")
    }
}
