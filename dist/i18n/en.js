/*! mangoPicker v1.0.0 | MIT License */
(() => {
  // src/i18n/attach_language.js
  function attach_external_language(language_definition) {
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

  // src/i18n/en.js
  var en_language = {
    code: "en",
    name: "English",
    week_start: 0,
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    months_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    weekdays_short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    labels: {
      today: "Today",
      now: "Now",
      clear: "Clear",
      reset: "Reset",
      apply: "Apply",
      selected: "Selected",
      nothing_selected: "Nothing selected",
      time: "Time",
      start: "Start",
      end: "End",
      multiple_count: "items selected"
    }
  };
  var en_default = en_language;

  // src/i18n/build_en.js
  attach_external_language(en_default);
})();
