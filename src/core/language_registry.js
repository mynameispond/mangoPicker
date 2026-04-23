const language_registry = Object.create(null);

function get_global_root() {
  if (typeof window !== "undefined") {
    return window;
  }

  if (typeof globalThis !== "undefined") {
    return globalThis;
  }

  return null;
}

export function register_language(language_code, language_definition) {
  if (!language_code || !language_definition) {
    return;
  }

  language_registry[language_code] = language_definition;

  const global_root = get_global_root();

  if (!global_root) {
    return;
  }

  const pending_languages = global_root.__mango_picker_languages__ || {};
  pending_languages[language_code] = language_definition;
  global_root.__mango_picker_languages__ = pending_languages;
}

export function sync_global_languages() {
  const global_root = get_global_root();

  if (!global_root || !global_root.__mango_picker_languages__) {
    return;
  }

  const pending_languages = global_root.__mango_picker_languages__;

  Object.keys(pending_languages).forEach((language_code) => {
    language_registry[language_code] = pending_languages[language_code];
  });
}

export function resolve_language(language_code) {
  sync_global_languages();
  return language_registry[language_code] || language_registry.en;
}

export function get_registered_languages() {
  sync_global_languages();
  return { ...language_registry };
}
