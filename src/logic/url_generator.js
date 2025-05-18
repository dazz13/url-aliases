export default class UrlGenerator {
    static SEARCH_PREFIX = "https://www.google.com/search?q=";
    static INVALID_URL_MESSAGE = "Not a valid URL: converting input to a search instead";

  /* Adding a new url will prefix with https. */
  static generate(url) {
    if (url.startsWith("chrome://")) {
      return url; // Allow chrome:// URLs as-is
    }
    if (url.includes(" ") || url.match(/^\w+$/)) {
      const search_url = UrlGenerator.convert_to_search(url);
      return search_url;
    }
    try {
      let url_orig = url;
      new URL(url_orig);
      return url_orig;
    } catch (error) {
    }
    try {
      let url_new = "https://" + url;
      new URL(url_new);
      return url_new;
    } catch(error) {
      console.log(UrlGenerator.INVALID_URL_MESSAGE);
    }
    // Defaults to 'convert to search'.
    return UrlGenerator.convert_to_search(url);
  }

  static convert_to_search(text) {
    return UrlGenerator.SEARCH_PREFIX + text.replace(" ", "+");
  }

  static encode(text) {
    return text.replace(" ", "+")
  }

  static decode(text) {
    return text.replace("+", " ")
  }
}
