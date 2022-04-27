export default class I18next {
    message: object;
    options: object;
    splitter: string;
    fallback: string;
    constructor(message?: {}, options?: {});
    getTranslation(key: string): any;
    getPlural(translation: object, count: number): any;
    replacePlaceholders(translation: string, replacements: Array<string>): string;
}
