export function attach_external_language(language_definition) {
  if (typeof window === "undefined") {
    return;
  }

  const pending_languages = window.__mango_picker_languages__ || {};
  pending_languages[language_definition.code] = language_definition;
  window.__mango_picker_languages__ = pending_languages;

  if (window.mangoPicker && typeof window.mangoPicker.register_language === "function") {
    window.mangoPicker.register_language(language_definition.code, language_definition);
  }
}
