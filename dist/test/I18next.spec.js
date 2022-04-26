// src/I18next.ts
var I18next = class {
  constructor(message = {}, options = {}) {
    this.options = options;
    this.message = message;
    this.splitter = options.splitter || "::";
    return (...key) => {
      let replacements;
      let count;
      if (key[1] && typeof key[1] === "object")
        replacements = key[1];
      else if (key[1] && typeof key[1] === "string")
        this.fallback = key[1];
      else if (key[2] && typeof key[2] === "object")
        replacements = key[2];
      if (key[2] && typeof key[2] === "string")
        this.fallback = key[2];
      if (Number.isInteger(key[1]))
        count = key[1];
      else if (Number.isInteger(key[2]))
        count = key[2];
      let translation = this.getTranslation(key[0]);
      if (count && replacements) {
        replacements.n = replacements.n ? replacements.n : count;
        translation = this.getPlural(translation, count);
      }
      if (replacements) {
        translation = this.replacePlaceholders(translation, replacements);
      }
      if (translation === null) {
        console.warn(`Translation for "${key}" not found. Returning fallback, if any`);
        if (this.fallback)
          translation = this.fallback;
      }
      return translation;
    };
  }
  getTranslation(key) {
    if (!key)
      return null;
    if (Object.hasOwn(this.message, key)) {
      return this.message[key];
    }
    try {
      const components = key.split(this.splitter);
      const namespace = components[0];
      const _key = components[1];
      if (Object.hasOwn(this.message, namespace) && this.message[namespace][_key]) {
        return this.message[namespace][_key];
      }
      if (!_key && this.fallback)
        return this.fallback;
      return key;
    } catch (e) {
      if (this.fallback)
        return this.fallback;
      return key;
    }
  }
  getPlural(translation, count) {
    let i;
    let _translation;
    let upper = 0;
    if (typeof translation === "object") {
      const keys = Object.keys(translation);
      if (keys.length === 0)
        return null;
      for (i = 0; i < keys.length; i++) {
        if (keys[i].indexOf("gt" === 0))
          upper = parseInt(keys[i].replace("gt", ""), 10);
      }
      if (translation[count])
        _translation = translation[count];
      else if (count > upper)
        _translation = translation[`gt${upper}`];
      else if (translation.n)
        _translation = translation.n;
      else
        _translation = translation[Object.keys(translation).reverse()[0]];
      return _translation;
    }
  }
  replacePlaceholders(translation, replacements) {
    const t = typeof translation === "string" ? translation.replace(/\{(\w*)\}/g, (match, key) => replacements[key]) : translation;
    return t;
  }
};
var I18next_default = I18next;

// src/test/I18next.spec.ts
describe("I18next", () => {
  it("should, when instantiated, return a function", () => {
    const i18next = new I18next_default();
    expect(i18next).to.exist;
    expect(i18next).to.be.a("function");
  });
  it("should get certain translations", () => {
    const t = new I18next_default({name: "Name", sex: "Male"});
    expect(t("name")).to.be.equal("Name");
    expect(t("sex")).to.be.equal("Male");
  });
  it("should return the key name if a translation cannot be found", () => {
    const t = new I18next_default({name: "Name", sex: "Male"});
    expect(t("firstName")).to.be.equal("firstName");
    expect(t("sex")).to.be.equal("Male");
  });
  it("should return a translation with a splitter", () => {
    const t = new I18next_default({foo: {name: "bar"}});
    expect(t("foo::name")).to.be.equal("bar");
  });
  it("should return a translation with a custom splitter", () => {
    const t = new I18next_default({foo: {name: "bar"}}, {splitter: "."});
    expect(t("foo.name")).to.be.equal("bar");
  });
  it("should replace placeholders", () => {
    const translations = {
      results: "Show {viewCount} of {totalCount} Results"
    };
    const t = new I18next_default(translations);
    expect(t("results")).to.be.equal("Show {viewCount} of {totalCount} Results");
    expect(t("results", {viewCount: 20, totalCount: 100})).to.be.equal("Show 20 of 100 Results");
  });
  it("should return a fallback where only 2 parameters are provided", () => {
    const translations = {};
    const t = new I18next_default(translations);
    expect(t("results", "foo")).to.be.equal("foo");
  });
  it("should return a fallback when 3 parameters are provided and the key and replacements are not found", () => {
    const translations = {};
    const t = new I18next_default(translations);
    expect(t("results", {}, "foo")).to.be.equal("foo");
  });
});
