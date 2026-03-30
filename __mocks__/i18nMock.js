// Mock for client/i18n — returns translation key as-is so pure-function
// unit tests can assert on defined/undefined without depending on locale files.
const i18nMock = { t: (key) => key };

export default i18nMock;
