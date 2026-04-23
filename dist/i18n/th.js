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

  // src/i18n/th.js
  var th_language = {
    code: "th",
    name: "ไทย",
    week_start: 0,
    months: [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม"
    ],
    months_short: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
    weekdays: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"],
    weekdays_short: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"],
    labels: {
      today: "วันนี้",
      now: "ตอนนี้",
      clear: "ล้างค่า",
      apply: "ตกลง",
      selected: "เลือกแล้ว",
      nothing_selected: "ยังไม่ได้เลือก",
      time: "เวลา",
      multiple_count: "รายการ"
    }
  };
  var th_default = th_language;

  // src/i18n/build_th.js
  attach_external_language(th_default);
})();
