import { create_picker_manager } from "./core/picker_manager.js";
import { register_language, sync_global_languages } from "./core/language_registry.js";
import en_language from "./i18n/en.js";

register_language(en_language.code, en_language);
sync_global_languages();

export function init(user_options = {}) {
  sync_global_languages();
  return create_picker_manager(user_options);
}

export { register_language };

export const version = "0.1.0";

if (typeof window !== "undefined") {
  window.mangoPicker = {
    init,
    register_language,
    version
  };
}
