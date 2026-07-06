/*! mangoPicker v1.0.0 | MIT License */
var mangoPicker = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    init: () => init,
    register_language: () => register_language,
    version: () => version
  });

  // src/core/date_utils.js
  function is_valid_date_object(date_value) {
    return date_value instanceof Date && !Number.isNaN(date_value.getTime());
  }
  function clone_date(date_value) {
    if (!is_valid_date_object(date_value)) {
      return null;
    }
    return new Date(date_value.getTime());
  }
  function create_local_date(year_value, month_index, day_value, hour_value = 0, minute_value = 0, second_value = 0) {
    return new Date(year_value, month_index, day_value, hour_value, minute_value, second_value, 0);
  }
  function start_of_day(date_value) {
    const normalized_date = clone_date(date_value);
    if (!normalized_date) {
      return null;
    }
    normalized_date.setHours(0, 0, 0, 0);
    return normalized_date;
  }
  function start_of_month(date_value) {
    const normalized_date = start_of_day(date_value);
    if (!normalized_date) {
      return null;
    }
    normalized_date.setDate(1);
    return normalized_date;
  }
  function get_days_in_month(year_value, month_index) {
    return new Date(year_value, month_index + 1, 0).getDate();
  }
  function add_days(date_value, amount) {
    const normalized_date = clone_date(date_value);
    if (!normalized_date) {
      return null;
    }
    normalized_date.setDate(normalized_date.getDate() + amount);
    return normalized_date;
  }
  function add_months(date_value, amount) {
    const normalized_date = clone_date(date_value);
    if (!normalized_date) {
      return null;
    }
    const original_day = normalized_date.getDate();
    normalized_date.setDate(1);
    normalized_date.setMonth(normalized_date.getMonth() + amount);
    normalized_date.setDate(Math.min(original_day, get_days_in_month(normalized_date.getFullYear(), normalized_date.getMonth())));
    return normalized_date;
  }
  function add_years(date_value, amount) {
    const normalized_date = clone_date(date_value);
    if (!normalized_date) {
      return null;
    }
    const original_month = normalized_date.getMonth();
    normalized_date.setFullYear(normalized_date.getFullYear() + amount);
    if (normalized_date.getMonth() !== original_month) {
      normalized_date.setDate(0);
    }
    return normalized_date;
  }
  function compare_full_date(left_date, right_date) {
    return start_of_day(left_date).getTime() - start_of_day(right_date).getTime();
  }
  function compare_month(left_date, right_date) {
    const left_key = left_date.getFullYear() * 12 + left_date.getMonth();
    const right_key = right_date.getFullYear() * 12 + right_date.getMonth();
    return left_key - right_key;
  }
  function same_day(left_date, right_date) {
    return compare_full_date(left_date, right_date) === 0;
  }
  function same_month(left_date, right_date) {
    return compare_month(left_date, right_date) === 0;
  }
  function sort_dates(date_list) {
    return [...date_list].sort((left_date, right_date) => left_date.getTime() - right_date.getTime());
  }
  function pad_number(number_value, length = 2) {
    return String(number_value).padStart(length, "0");
  }
  function reorder_list_by_start(item_list, start_index) {
    const safe_index = (start_index % item_list.length + item_list.length) % item_list.length;
    return [...item_list.slice(safe_index), ...item_list.slice(0, safe_index)];
  }

  // src/core/format.js
  var token_definitions = {
    Y: {
      group_name: "year",
      pattern: "(?<year>\\d{4})",
      apply(parts, value) {
        parts.year = Number(value);
      }
    },
    y: {
      group_name: "year_short",
      pattern: "(?<year_short>\\d{2})",
      apply(parts, value) {
        parts.year = 2e3 + Number(value);
      }
    },
    m: {
      group_name: "month_zero",
      pattern: "(?<month_zero>0?[1-9]|1[0-2])",
      apply(parts, value) {
        parts.month_index = Number(value) - 1;
      }
    },
    n: {
      group_name: "month",
      pattern: "(?<month>0?[1-9]|1[0-2])",
      apply(parts, value) {
        parts.month_index = Number(value) - 1;
      }
    },
    d: {
      group_name: "day_zero",
      pattern: "(?<day_zero>0?[1-9]|[12]\\d|3[01])",
      apply(parts, value) {
        parts.day = Number(value);
      }
    },
    j: {
      group_name: "day",
      pattern: "(?<day>0?[1-9]|[12]\\d|3[01])",
      apply(parts, value) {
        parts.day = Number(value);
      }
    },
    H: {
      group_name: "hour_zero",
      pattern: "(?<hour_zero>[0-1]?\\d|2[0-3])",
      apply(parts, value) {
        parts.hour = Number(value);
      }
    },
    G: {
      group_name: "hour",
      pattern: "(?<hour>[0-1]?\\d|2[0-3])",
      apply(parts, value) {
        parts.hour = Number(value);
      }
    },
    h: {
      group_name: "hour_12_zero",
      pattern: "(?<hour_12_zero>0?[1-9]|1[0-2])",
      apply(parts, value) {
        parts.hour_12 = Number(value);
      }
    },
    g: {
      group_name: "hour_12",
      pattern: "(?<hour_12>0?[1-9]|1[0-2])",
      apply(parts, value) {
        parts.hour_12 = Number(value);
      }
    },
    i: {
      group_name: "minute",
      pattern: "(?<minute>[0-5]?\\d)",
      apply(parts, value) {
        parts.minute = Number(value);
      }
    },
    s: {
      group_name: "second",
      pattern: "(?<second>[0-5]?\\d)",
      apply(parts, value) {
        parts.second = Number(value);
      }
    },
    A: {
      group_name: "meridiem_upper",
      pattern: "(?<meridiem_upper>AM|PM)",
      apply(parts, value) {
        parts.meridiem = value.toUpperCase();
      }
    },
    a: {
      group_name: "meridiem_lower",
      pattern: "(?<meridiem_lower>am|pm)",
      apply(parts, value) {
        parts.meridiem = value.toUpperCase();
      }
    }
  };
  function escape_regular_expression(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function analyze_format(format_string) {
    const tokens = [];
    for (const token_key of format_string) {
      if (token_definitions[token_key]) {
        tokens.push(token_key);
      }
    }
    const has_year = tokens.includes("Y") || tokens.includes("y");
    const has_month = tokens.includes("m") || tokens.includes("n");
    const has_day = tokens.includes("d") || tokens.includes("j");
    const has_hour_24 = tokens.includes("H") || tokens.includes("G");
    const has_hour_12 = tokens.includes("h") || tokens.includes("g");
    const has_hour = has_hour_24 || has_hour_12;
    const has_minute = tokens.includes("i");
    const has_second = tokens.includes("s");
    const has_meridiem = tokens.includes("A") || tokens.includes("a");
    const has_time = has_hour || has_minute || has_second || has_meridiem;
    const has_date = has_year || has_month || has_day;
    const is_time_only = has_time && !has_date;
    const is_year_only = has_year && !has_month && !has_day && !has_time;
    const is_month_only = has_year && has_month && !has_day && !has_time;
    let default_view = "day";
    if (is_time_only) {
      default_view = "time";
    } else if (is_year_only) {
      default_view = "year";
    } else if (is_month_only) {
      default_view = "month";
    }
    let selection_unit = "day";
    if (is_time_only) {
      selection_unit = "time";
    } else if (has_day) {
      selection_unit = "day";
    } else if (has_month) {
      selection_unit = "month";
    } else if (has_year) {
      selection_unit = "year";
    }
    return {
      tokens,
      has_year,
      has_month,
      has_day,
      has_hour_24,
      has_hour_12,
      has_hour,
      has_minute,
      has_second,
      has_meridiem,
      has_time,
      has_date,
      is_time_only,
      is_year_only,
      is_month_only,
      default_view,
      selection_unit
    };
  }
  function parse_value_by_format(raw_value, format_string, options = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if (raw_value === null || raw_value === void 0 || raw_value === "") {
      return null;
    }
    const normalized_value = String(raw_value).trim();
    const token_sequence = [];
    const expression_parts = [];
    for (const format_token of format_string) {
      const token_definition = token_definitions[format_token];
      if (token_definition) {
        token_sequence.push(token_definition);
        expression_parts.push(token_definition.pattern);
        continue;
      }
      expression_parts.push(escape_regular_expression(format_token));
    }
    const parser_expression = new RegExp(`^${expression_parts.join("")}$`);
    const match_result = parser_expression.exec(normalized_value);
    if (!match_result || !match_result.groups) {
      return null;
    }
    const format_details = analyze_format(format_string);
    const date_parts = {};
    token_sequence.forEach((token_definition) => {
      const group_value = match_result.groups[token_definition.group_name];
      if (group_value !== void 0) {
        token_definition.apply(date_parts, group_value);
      }
    });
    const base_date = clone_date(options.base_date) || /* @__PURE__ */ new Date();
    let year_value = (_a = date_parts.year) != null ? _a : base_date.getFullYear();
    let month_index = (_b = date_parts.month_index) != null ? _b : base_date.getMonth();
    let day_value = (_c = date_parts.day) != null ? _c : base_date.getDate();
    let hour_value = (_e = (_d = date_parts.hour) != null ? _d : options.default_hour) != null ? _e : 0;
    if (options.buddha && date_parts.year !== void 0) {
      if (year_value >= 2400) {
        year_value -= 543;
      } else {
        year_value -= 43;
      }
    }
    if (date_parts.hour_12 !== void 0) {
      hour_value = date_parts.hour_12;
      if (date_parts.meridiem) {
        hour_value = date_parts.hour_12 % 12;
        if (date_parts.meridiem === "PM") {
          hour_value += 12;
        }
      }
    }
    const minute_value = (_g = (_f = date_parts.minute) != null ? _f : options.default_minute) != null ? _g : 0;
    const second_value = (_i = (_h = date_parts.second) != null ? _h : options.default_second) != null ? _i : 0;
    if (format_details.has_month && !format_details.has_day) {
      day_value = 1;
    }
    if (!format_details.has_month && format_details.has_year) {
      month_index = 0;
      day_value = 1;
    }
    if (format_details.is_time_only) {
      year_value = base_date.getFullYear();
      month_index = base_date.getMonth();
      day_value = base_date.getDate();
    }
    const parsed_date = create_local_date(year_value, month_index, day_value, hour_value, minute_value, second_value);
    if (!is_valid_date_object(parsed_date)) {
      return null;
    }
    if (parsed_date.getFullYear() !== year_value || parsed_date.getMonth() !== month_index || parsed_date.getDate() !== day_value) {
      return null;
    }
    return parsed_date;
  }
  function format_date_value(date_value, format_string, options = {}) {
    if (!is_valid_date_object(date_value)) {
      return "";
    }
    const buddhist_year = options.buddha ? date_value.getFullYear() + 543 : date_value.getFullYear();
    const hour_12_value = date_value.getHours() % 12 || 12;
    const token_renderers = {
      Y: () => String(buddhist_year),
      y: () => String(buddhist_year).slice(-2),
      m: () => pad_number(date_value.getMonth() + 1),
      n: () => String(date_value.getMonth() + 1),
      d: () => pad_number(date_value.getDate()),
      j: () => String(date_value.getDate()),
      H: () => pad_number(date_value.getHours()),
      G: () => String(date_value.getHours()),
      h: () => pad_number(hour_12_value),
      g: () => String(hour_12_value),
      i: () => pad_number(date_value.getMinutes()),
      s: () => pad_number(date_value.getSeconds()),
      A: () => date_value.getHours() >= 12 ? "PM" : "AM",
      a: () => date_value.getHours() >= 12 ? "pm" : "am"
    };
    return [...format_string].map((format_token) => {
      if (token_renderers[format_token]) {
        return token_renderers[format_token]();
      }
      return format_token;
    }).join("");
  }
  function split_multiple_values(raw_value, separator) {
    if (raw_value === null || raw_value === void 0 || raw_value === "") {
      return [];
    }
    const safe_separator = separator || ",";
    return String(raw_value).split(safe_separator).map((value_part) => value_part.trim()).filter(Boolean);
  }
  function split_range_values(raw_value, separator) {
    if (raw_value === null || raw_value === void 0 || raw_value === "") {
      return [];
    }
    const safe_separator = separator || " - ";
    const normalized_value = String(raw_value).trim();
    if (!normalized_value.includes(safe_separator)) {
      return normalized_value ? [normalized_value] : [];
    }
    return normalized_value.split(safe_separator).map((value_part) => value_part.trim()).filter(Boolean).slice(0, 2);
  }
  function parse_any_date_value(raw_value, fallback_format = "Y-m-d", options = {}) {
    if (raw_value === null || raw_value === void 0 || raw_value === "") {
      return null;
    }
    if (is_valid_date_object(raw_value)) {
      return clone_date(raw_value);
    }
    if (typeof raw_value === "number") {
      const date_from_number = new Date(raw_value);
      return is_valid_date_object(date_from_number) ? date_from_number : null;
    }
    const string_value = String(raw_value).trim();
    const format_candidates = [
      fallback_format,
      "Y-m-d H:i:s",
      "Y-m-d H:i",
      "Y-m-dTH:i:s",
      "Y-m-dTH:i",
      "Y-m-d",
      "Y-m",
      "Y",
      "H:i:s",
      "H:i",
      "h:i:s A",
      "h:i A"
    ];
    for (const format_candidate of format_candidates) {
      const parsed_value = parse_value_by_format(string_value, format_candidate, options);
      if (parsed_value) {
        return parsed_value;
      }
    }
    const native_date = new Date(string_value);
    if (is_valid_date_object(native_date)) {
      if (options.buddha && native_date.getFullYear() >= 2400) {
        native_date.setFullYear(native_date.getFullYear() - 543);
      }
      return native_date;
    }
    return null;
  }

  // src/core/availability.js
  function normalize_date_value(raw_value, fallback_format, options = {}) {
    const parsed_value = parse_any_date_value(raw_value, fallback_format, options);
    return parsed_value ? start_of_day(parsed_value) : null;
  }
  function normalize_date_list(date_list, fallback_format, options = {}) {
    return (date_list || []).map((date_value) => normalize_date_value(date_value, fallback_format, options)).filter(Boolean);
  }
  function normalize_range_item(range_value, fallback_format, options = {}) {
    if (!range_value) {
      return null;
    }
    let start_value = null;
    let end_value = null;
    if (Array.isArray(range_value)) {
      [start_value, end_value] = range_value;
    } else if (typeof range_value === "object") {
      start_value = range_value.start;
      end_value = range_value.end;
    }
    const normalized_start = normalize_date_value(start_value, fallback_format, options);
    const normalized_end = normalize_date_value(end_value, fallback_format, options);
    if (!normalized_start || !normalized_end) {
      return null;
    }
    if (compare_full_date(normalized_start, normalized_end) <= 0) {
      return { start: normalized_start, end: normalized_end };
    }
    return { start: normalized_end, end: normalized_start };
  }
  function normalize_range_list(range_list, fallback_format, options = {}) {
    return (range_list || []).map((range_value) => normalize_range_item(range_value, fallback_format, options)).filter(Boolean);
  }
  function matches_date_list(date_value, date_list) {
    return date_list.some((candidate_date) => same_day(date_value, candidate_date));
  }
  function matches_range_list(date_value, range_list) {
    return range_list.some(
      (range_item) => compare_full_date(date_value, range_item.start) >= 0 && compare_full_date(date_value, range_item.end) <= 0
    );
  }
  function has_enabled_rules(rules) {
    return Boolean(rules.enabled_dates.length || rules.enabled_ranges.length || typeof rules.enabled_date === "function");
  }
  function get_effective_min_date(options, fallback_format) {
    const configured_min_date = normalize_date_value(options.min_date, fallback_format, options);
    if (!options.disable_past) {
      return configured_min_date;
    }
    const today_date = start_of_day(/* @__PURE__ */ new Date());
    if (!configured_min_date || compare_full_date(today_date, configured_min_date) > 0) {
      return today_date;
    }
    return configured_min_date;
  }
  function normalize_availability_rules(options, fallback_format) {
    return {
      min_date: get_effective_min_date(options, fallback_format),
      max_date: normalize_date_value(options.max_date, fallback_format, options),
      enabled_dates: normalize_date_list(options.enabled_dates || options.allowed_dates, fallback_format, options),
      disabled_dates: normalize_date_list(options.disabled_dates || options.closed_dates, fallback_format, options),
      enabled_ranges: normalize_range_list(options.enabled_ranges || options.allowed_ranges, fallback_format, options),
      disabled_ranges: normalize_range_list(options.disabled_ranges || options.closed_ranges, fallback_format, options),
      enabled_date: typeof (options.enabled_date || options.allowed_date) === "function" ? options.enabled_date || options.allowed_date : null,
      disabled_date: typeof (options.disabled_date || options.closed_date) === "function" ? options.disabled_date || options.closed_date : null,
      disabled_weekdays: (options.disabled_weekdays || []).map((day) => Number(day)).filter((day) => !Number.isNaN(day))
    };
  }
  function is_date_allowed(date_value, rules) {
    const normalized_date = start_of_day(date_value);
    if (!normalized_date) {
      return false;
    }
    if (rules.min_date && compare_full_date(normalized_date, rules.min_date) < 0) {
      return false;
    }
    if (rules.max_date && compare_full_date(normalized_date, rules.max_date) > 0) {
      return false;
    }
    if (has_enabled_rules(rules)) {
      const is_enabled = matches_date_list(normalized_date, rules.enabled_dates) || matches_range_list(normalized_date, rules.enabled_ranges) || typeof rules.enabled_date === "function" && rules.enabled_date(clone_date(date_value)) === true;
      if (!is_enabled) {
        return false;
      }
    }
    if (rules.disabled_weekdays.includes(normalized_date.getDay())) {
      return false;
    }
    if (matches_date_list(normalized_date, rules.disabled_dates)) {
      return false;
    }
    if (matches_range_list(normalized_date, rules.disabled_ranges)) {
      return false;
    }
    if (typeof rules.disabled_date === "function" && rules.disabled_date(clone_date(date_value)) === true) {
      return false;
    }
    return true;
  }
  function is_month_allowed(year_value, month_index, rules) {
    const total_days = get_days_in_month(year_value, month_index);
    for (let day_value = 1; day_value <= total_days; day_value += 1) {
      const candidate_date = create_local_date(year_value, month_index, day_value);
      if (is_date_allowed(candidate_date, rules)) {
        return true;
      }
    }
    return false;
  }
  function is_year_allowed(year_value, rules) {
    for (let month_index = 0; month_index < 12; month_index += 1) {
      if (is_month_allowed(year_value, month_index, rules)) {
        return true;
      }
    }
    return false;
  }
  function find_first_available_date(reference_date, step_direction, rules, max_steps = 400) {
    let candidate_date = start_of_day(reference_date);
    for (let step_index = 0; step_index < max_steps; step_index += 1) {
      if (is_date_allowed(candidate_date, rules)) {
        return candidate_date;
      }
      candidate_date = add_days(candidate_date, step_direction);
    }
    return null;
  }

  // src/core/defaults.js
  var default_options = {
    selector: "",
    language: "en",
    format: "Y-m-d",
    buddha: false,
    buddha_input: false,
    range: false,
    range_time: false,
    range_separator: " - ",
    multiple: false,
    multiple_separator: ", ",
    inline: false,
    mode: "popup",
    inline_container: null,
    lazy_render: true,
    hour_step: 1,
    minute_step: 1,
    second_step: 1,
    time_12h: false,
    close_on_select: true,
    readonly_input: true,
    allow_clear: true,
    show_reset_button: false,
    show_today_button: true,
    reset_label: null,
    z_index: 3e3,
    default_hour: 0,
    default_minute: 0,
    default_second: 0,
    week_start: null,
    disable_past: false,
    swipe_navigation: true,
    keyboard_navigation: true,
    animation: "slide",
    min_range_days: null,
    max_range_days: null,
    min_date: null,
    max_date: null,
    enabled_dates: [],
    disabled_dates: [],
    enabled_ranges: [],
    disabled_ranges: [],
    enabled_date: null,
    disabled_date: null,
    render_cell_date: null,
    disabled_weekdays: [],
    on_open: null,
    on_close: null,
    on_select: null,
    on_change: null
  };

  // src/core/language_registry.js
  var language_registry = /* @__PURE__ */ Object.create(null);
  function get_global_root() {
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof globalThis !== "undefined") {
      return globalThis;
    }
    return null;
  }
  function register_language(language_code, language_definition) {
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
  function sync_global_languages() {
    const global_root = get_global_root();
    if (!global_root || !global_root.__mango_picker_languages__) {
      return;
    }
    const pending_languages = global_root.__mango_picker_languages__;
    Object.keys(pending_languages).forEach((language_code) => {
      language_registry[language_code] = pending_languages[language_code];
    });
  }
  function resolve_language(language_code) {
    sync_global_languages();
    return language_registry[language_code] || language_registry.en;
  }

  // src/core/picker_instance.js
  var instance_counter = 0;
  var open_instances = /* @__PURE__ */ new Set();
  function create_custom_event(event_name, detail, bubbles = true) {
    if (typeof CustomEvent === "function") {
      return new CustomEvent(event_name, { bubbles, detail });
    }
    return null;
  }
  function unique_dates_by_key(date_list, key_function) {
    const key_map = /* @__PURE__ */ new Map();
    date_list.forEach((date_value) => {
      key_map.set(key_function(date_value), date_value);
    });
    return sort_dates([...key_map.values()]);
  }
  function is_html_element(target_value) {
    return typeof HTMLElement !== "undefined" && target_value instanceof HTMLElement;
  }
  function infer_format_from_input(input_element, fallback_format) {
    const input_type = String(input_element.getAttribute("type") || "text").toLowerCase();
    switch (input_type) {
      case "date":
        return "Y-m-d";
      case "datetime-local":
        return input_element.step && Number(input_element.step) > 0 && Number(input_element.step) < 60 ? "Y-m-dTH:i:s" : "Y-m-dTH:i";
      case "month":
        return "Y-m";
      case "time":
        return input_element.step && Number(input_element.step) > 0 && Number(input_element.step) < 60 ? "H:i:s" : "H:i";
      default:
        return fallback_format;
    }
  }
  var MangoPickerInstance = class {
    constructor(input_element, user_options = {}) {
      this.source_input = input_element;
      this.options = { ...default_options, ...user_options };
      if (!Object.prototype.hasOwnProperty.call(user_options, "format")) {
        this.options.format = infer_format_from_input(input_element, default_options.format);
      }
      this.language = resolve_language(this.options.language);
      this.format_details = analyze_format(this.options.format);
      this.rules = normalize_availability_rules(this.options, this.options.format);
      this.instance_id = `mango-picker-${instance_counter += 1}`;
      this.initial_input_value = this.source_input.value;
      this.is_open = this.is_inline_mode();
      this.has_rendered = false;
      this.current_view = this.format_details.default_view;
      this.selected_dates = [];
      this.draft_date = null;
      this.range_hover_date = null;
      this.view_date = /* @__PURE__ */ new Date();
      this.display_input = null;
      this.active_input = this.source_input;
      this.original_source_style = this.source_input.getAttribute("style");
      this.original_source_readonly = this.source_input.readOnly;
      this.original_source_autocomplete = this.source_input.getAttribute("autocomplete");
      this.time_cursor_hour = Number(this.options.default_hour) || 0;
      this.time_cursor_minute = Number(this.options.default_minute) || 0;
      this.time_cursor_second = Number(this.options.default_second) || 0;
      this.time_range_values = { start: null, end: null };
      this.time_range_active_slot = "start";
      this.touch_start_x = null;
      this.touch_start_y = null;
      this.close_timeout_id = null;
      this.is_focusing_programmatically = false;
      this.setup_inputs();
      this.selected_dates = this.read_initial_selection();
      this.sync_time_range_values_from_selected_dates();
      this.initialize_view_state();
      this.bind_events();
      this.panel_element = this.create_panel_element();
      this.refresh_input_value();
      if (this.is_inline_mode()) {
        this.panel_element.hidden = false;
        this.active_input.setAttribute("aria-expanded", "true");
        this.render();
      } else if (!this.options.lazy_render) {
        this.render();
      }
    }
    is_inline_mode() {
      return Boolean(this.options.inline || this.options.mode === "inline");
    }
    resolve_inline_container() {
      if (!this.is_inline_mode()) {
        return null;
      }
      if (is_html_element(this.options.inline_container)) {
        return this.options.inline_container;
      }
      if (typeof this.options.inline_container === "string") {
        return document.querySelector(this.options.inline_container);
      }
      return null;
    }
    should_use_buddha_input() {
      return Boolean(this.options.buddha && this.options.buddha_input && this.format_details.has_year);
    }
    setup_inputs() {
      if (this.should_use_buddha_input()) {
        const mirror_input = document.createElement("input");
        const source_style_text = this.source_input.getAttribute("style");
        mirror_input.type = "text";
        mirror_input.className = this.source_input.className;
        mirror_input.placeholder = this.source_input.getAttribute("placeholder") || "";
        mirror_input.disabled = this.source_input.disabled;
        mirror_input.dataset.mangopickerRole = "display";
        mirror_input.autocomplete = "off";
        mirror_input.readOnly = true;
        mirror_input.classList.add("mango-picker__field", "mango-picker__mirror-input");
        mirror_input.setAttribute("aria-haspopup", "dialog");
        mirror_input.setAttribute("aria-expanded", "false");
        if (this.source_input.required) {
          mirror_input.required = true;
          this.source_input.required = false;
        }
        const original_id = this.source_input.id;
        if (original_id) {
          mirror_input.id = original_id;
          this.source_input.id = `${original_id}__source`;
        }
        if (source_style_text) {
          mirror_input.setAttribute("style", source_style_text);
        }
        this.source_input.dataset.mangopickerRole = "source";
        this.source_input.insertAdjacentElement("afterend", mirror_input);
        this.display_input = mirror_input;
        this.active_input = mirror_input;
        if (this.original_source_style === null) {
          this.source_input.style.display = "none";
        } else {
          this.source_input.setAttribute("style", `${this.original_source_style};display:none;`);
        }
        return;
      }
      this.active_input = this.source_input;
      this.active_input.classList.add("mango-picker__field");
      if (this.options.readonly_input) {
        this.active_input.readOnly = true;
      }
      this.active_input.setAttribute("autocomplete", "off");
      this.active_input.setAttribute("aria-haspopup", "dialog");
      this.active_input.setAttribute("aria-expanded", "false");
    }
    initialize_view_state() {
      const reference_date = this.selected_dates[0] || /* @__PURE__ */ new Date();
      this.view_date = clone_date(reference_date) || /* @__PURE__ */ new Date();
      this.sync_time_cursor_from_date(reference_date);
      this.reset_draft_state();
    }
    bind_events() {
      this.handle_input_open = () => {
        if (this.is_focusing_programmatically) {
          return;
        }
        this.open();
      };
      this.handle_input_keydown = (event) => {
        if (event.key === "Escape") {
          this.close();
          return;
        }
        if (event.key === "Enter" || event.key === "ArrowDown") {
          event.preventDefault();
          this.open();
          this.focus_active_element();
        }
      };
      this.handle_input_change = () => {
        const current_value = this.source_input.value;
        const value_parts = this.split_input_values(current_value);
        const parsed_dates = value_parts.map((value_part) => this.parse_input_candidate(value_part)).filter(Boolean);
        const normalized_next = this.normalize_selected_dates(parsed_dates);
        const is_same = normalized_next.length === this.selected_dates.length && normalized_next.every((date_val, idx) => {
          const existing = this.selected_dates[idx];
          return existing && date_val.getTime() === existing.getTime();
        });
        if (!is_same) {
          this.selected_dates = normalized_next;
          this.sync_time_range_values_from_selected_dates();
          this.view_date = clone_date(this.selected_dates[this.selected_dates.length - 1]) || /* @__PURE__ */ new Date();
          this.sync_time_cursor_from_date(this.get_primary_selected_date());
          this.reset_draft_state();
          this.render();
        }
      };
      this.handle_document_mouse_down = (event) => {
        if (!this.is_open) {
          return;
        }
        const event_target = event.target;
        if (this.panel_element.contains(event_target) || this.active_input.contains(event_target)) {
          return;
        }
        this.close();
      };
      this.handle_document_keydown = (event) => {
        if (event.key === "Escape") {
          this.close();
        }
      };
      let refresh_ticking = false;
      this.handle_window_refresh = () => {
        if (this.is_open && !refresh_ticking) {
          refresh_ticking = true;
          requestAnimationFrame(() => {
            if (this.is_open) {
              this.position_panel();
            }
            refresh_ticking = false;
          });
        }
      };
      this.handle_panel_click = (event) => {
        const action_element = event.target.closest("[data-action]");
        if (!action_element || action_element.disabled) {
          return;
        }
        const { action } = action_element.dataset;
        const range_target = action_element.dataset.rangeTarget || null;
        switch (action) {
          case "shift-period":
            this.shift_period(Number(action_element.dataset.step) || 0);
            break;
          case "switch-view":
            this.range_hover_date = null;
            this.current_view = action_element.dataset.view;
            this.render();
            break;
          case "select-day":
            this.select_day(
              Number(action_element.dataset.year),
              Number(action_element.dataset.month),
              Number(action_element.dataset.day)
            );
            break;
          case "select-month":
            this.select_month(Number(action_element.dataset.year), Number(action_element.dataset.month));
            break;
          case "select-year":
            this.select_year(Number(action_element.dataset.year));
            break;
          case "select-hour":
            this.select_hour(Number(action_element.dataset.hour), range_target);
            break;
          case "select-minute":
            this.select_minute(Number(action_element.dataset.minute), range_target);
            break;
          case "select-second":
            this.select_second(Number(action_element.dataset.second), range_target);
            break;
          case "select-meridiem":
            this.select_meridiem(action_element.dataset.period, range_target);
            break;
          case "set-today":
            this.select_today(range_target);
            break;
          case "clear-value":
            this.clear_value("clear");
            break;
          case "reset-value":
            this.reset_value("reset");
            break;
          case "apply-value":
            this.apply_draft("apply");
            break;
          default:
            break;
        }
      };
      this.handle_panel_mouse_move = (event) => {
        if (!this.should_track_range_hover()) {
          this.clear_range_hover_date();
          return;
        }
        const event_target = event.target;
        const action_element = event_target.closest ? event_target.closest('[data-action="select-day"]') : null;
        if (!action_element || !this.panel_element.contains(action_element) || action_element.disabled) {
          this.clear_range_hover_date();
          return;
        }
        const hover_date = this.compose_candidate_date({
          year: Number(action_element.dataset.year),
          month: Number(action_element.dataset.month),
          day: Number(action_element.dataset.day)
        });
        if (!is_date_allowed(hover_date, this.rules)) {
          this.clear_range_hover_date();
          return;
        }
        this.update_range_hover_date(hover_date);
      };
      this.handle_panel_mouse_leave = () => {
        this.clear_range_hover_date();
      };
      this.handle_panel_keydown = (event) => {
        this.handle_keyboard_navigation(event);
      };
      this.handle_panel_touch_start = (event) => {
        if (!this.options.swipe_navigation || !event.touches || event.touches.length !== 1) {
          return;
        }
        if (event.target.closest(".mango-picker__time-panel")) {
          this.touch_start_x = null;
          this.touch_start_y = null;
          return;
        }
        this.touch_start_x = event.touches[0].clientX;
        this.touch_start_y = event.touches[0].clientY;
      };
      this.handle_panel_touch_end = (event) => {
        if (!this.options.swipe_navigation || this.current_view === "time" || this.touch_start_x === null || !event.changedTouches || !event.changedTouches.length) {
          return;
        }
        const delta_x = event.changedTouches[0].clientX - this.touch_start_x;
        const delta_y = event.changedTouches[0].clientY - this.touch_start_y;
        this.touch_start_x = null;
        this.touch_start_y = null;
        if (Math.abs(delta_x) < 48 || Math.abs(delta_y) > 64) {
          return;
        }
        this.shift_period(delta_x > 0 ? -1 : 1);
      };
      this.active_input.addEventListener("focus", this.handle_input_open);
      this.active_input.addEventListener("click", this.handle_input_open);
      this.active_input.addEventListener("keydown", this.handle_input_keydown);
      this.source_input.addEventListener("change", this.handle_input_change);
      this.source_input.addEventListener("input", this.handle_input_change);
    }
    focus_active_element() {
      if (!this.panel_element) {
        return;
      }
      if (this.current_view === "day") {
        const target_date = this.selected_dates[0] || this.draft_date || /* @__PURE__ */ new Date();
        if (this.focus_day_button(target_date)) {
          return;
        }
        const first_cell = this.panel_element.querySelector(".mango-picker__cell:not(:disabled)");
        first_cell == null ? void 0 : first_cell.focus();
      } else if (this.current_view === "month") {
        const selected_tile = this.panel_element.querySelector(".mango-picker__tile.is-selected:not(:disabled)") || this.panel_element.querySelector(".mango-picker__tile:not(:disabled)");
        selected_tile == null ? void 0 : selected_tile.focus();
      } else if (this.current_view === "year") {
        const selected_tile = this.panel_element.querySelector(".mango-picker__tile.is-selected:not(:disabled)") || this.panel_element.querySelector(".mango-picker__tile:not(:disabled)");
        selected_tile == null ? void 0 : selected_tile.focus();
      } else if (this.current_view === "time") {
        const first_option = this.panel_element.querySelector(".mango-picker__time-option.is-selected:not(:disabled)") || this.panel_element.querySelector(".mango-picker__time-option:not(:disabled)");
        first_option == null ? void 0 : first_option.focus();
      }
    }
    create_panel_element() {
      const panel_element = document.createElement("div");
      panel_element.className = this.is_inline_mode() ? "mango-picker is-inline is-visible" : "mango-picker";
      panel_element.hidden = !this.is_inline_mode();
      panel_element.dataset.mangopickerId = this.instance_id;
      panel_element.setAttribute("data-animation", this.options.animation || "slide");
      panel_element.setAttribute("role", "dialog");
      panel_element.setAttribute("aria-modal", "false");
      panel_element.addEventListener("click", this.handle_panel_click);
      panel_element.addEventListener("mousemove", this.handle_panel_mouse_move);
      panel_element.addEventListener("mouseleave", this.handle_panel_mouse_leave);
      panel_element.addEventListener("keydown", this.handle_panel_keydown);
      panel_element.addEventListener("touchstart", this.handle_panel_touch_start, { passive: true });
      panel_element.addEventListener("touchend", this.handle_panel_touch_end, { passive: true });
      const inline_container = this.resolve_inline_container();
      if (inline_container) {
        inline_container.appendChild(panel_element);
      } else if (this.is_inline_mode()) {
        this.active_input.insertAdjacentElement("afterend", panel_element);
      } else {
        document.body.appendChild(panel_element);
      }
      return panel_element;
    }
    read_initial_selection() {
      const raw_value = this.source_input.value;
      if (!raw_value) {
        return [];
      }
      const value_parts = this.split_input_values(raw_value);
      const parsed_dates = value_parts.map((value_part) => this.parse_input_candidate(value_part)).filter(Boolean);
      return this.normalize_selected_dates(parsed_dates);
    }
    parse_input_candidate(input_value) {
      if (is_valid_date_object(input_value)) {
        return clone_date(input_value);
      }
      const parsed_by_format = parse_value_by_format(input_value, this.options.format, {
        base_date: /* @__PURE__ */ new Date(),
        buddha: this.options.buddha,
        default_hour: this.options.default_hour,
        default_minute: this.options.default_minute,
        default_second: this.options.default_second
      });
      if (parsed_by_format) {
        return parsed_by_format;
      }
      return parse_any_date_value(input_value, this.options.format, {
        buddha: this.options.buddha,
        default_hour: this.options.default_hour,
        default_minute: this.options.default_minute,
        default_second: this.options.default_second
      });
    }
    get_selection_key(date_value) {
      return format_date_value(date_value, this.options.format);
    }
    get_display_value(date_value) {
      return format_date_value(date_value, this.options.format, { buddha: this.options.buddha });
    }
    is_range_mode() {
      return Boolean(this.options.range) && !this.options.multiple && !this.format_details.is_time_only;
    }
    is_time_range_mode() {
      return Boolean(this.options.range_time) && this.format_details.is_time_only && !this.options.multiple;
    }
    has_range_selection() {
      return this.is_range_mode() || this.is_time_range_mode();
    }
    get_time_range_slot_name(slot_name) {
      return slot_name === "end" ? "end" : "start";
    }
    get_time_range_slot_date(slot_name) {
      return this.time_range_values[this.get_time_range_slot_name(slot_name)] || null;
    }
    sync_time_range_values_from_selected_dates() {
      if (!this.is_time_range_mode()) {
        this.time_range_values = { start: null, end: null };
        return;
      }
      this.time_range_values = {
        start: this.selected_dates[0] ? clone_date(this.selected_dates[0]) : null,
        end: this.selected_dates[1] ? clone_date(this.selected_dates[1]) : null
      };
    }
    sync_selected_dates_from_time_range_values() {
      if (!this.is_time_range_mode()) {
        return;
      }
      this.selected_dates = [this.time_range_values.start, this.time_range_values.end].map((date_value) => clone_date(date_value)).filter(Boolean);
    }
    get_output_separator() {
      if (this.has_range_selection()) {
        return this.options.range_separator;
      }
      return this.options.multiple_separator;
    }
    split_input_values(raw_value) {
      if (this.has_range_selection()) {
        return split_range_values(raw_value, this.options.range_separator);
      }
      if (this.options.multiple) {
        return split_multiple_values(raw_value, this.options.multiple_separator);
      }
      return [raw_value];
    }
    normalize_selected_dates(next_dates) {
      const safe_dates = next_dates.map((date_value) => clone_date(date_value)).filter(Boolean);
      if (this.is_time_range_mode()) {
        return safe_dates.slice(0, 2);
      }
      if (this.is_range_mode()) {
        if (safe_dates.length <= 1) {
          return safe_dates.slice(0, 1);
        }
        const [left_date, right_date] = safe_dates.slice(0, 2).sort((left_value, right_value) => left_value.getTime() - right_value.getTime());
        return [left_date, right_date];
      }
      if (this.options.multiple) {
        return unique_dates_by_key(safe_dates, (date_value) => this.get_selection_key(date_value));
      }
      return safe_dates.slice(0, 1);
    }
    get_primary_selected_date() {
      if (this.is_time_range_mode()) {
        const active_date = this.get_time_range_slot_date(this.time_range_active_slot);
        if (active_date) {
          return clone_date(active_date);
        }
        return clone_date(this.time_range_values.end || this.time_range_values.start || null);
      }
      if (!this.selected_dates.length) {
        return null;
      }
      if (this.is_range_mode()) {
        return this.selected_dates[this.selected_dates.length - 1];
      }
      return this.selected_dates[0];
    }
    get_range_bounds() {
      if (this.is_time_range_mode()) {
        return {
          start_date: this.time_range_values.start ? clone_date(this.time_range_values.start) : null,
          end_date: this.time_range_values.end ? clone_date(this.time_range_values.end) : null
        };
      }
      if (!this.is_range_mode() || !this.selected_dates.length) {
        return { start_date: null, end_date: null };
      }
      return {
        start_date: this.selected_dates[0] || null,
        end_date: this.selected_dates[1] || null
      };
    }
    is_complete_range() {
      if (this.is_time_range_mode()) {
        return Boolean(this.time_range_values.start && this.time_range_values.end);
      }
      return this.is_range_mode() && this.selected_dates.length === 2;
    }
    get_value() {
      return this.source_input.value;
    }
    get_values() {
      if (this.is_time_range_mode()) {
        return [this.time_range_values.start, this.time_range_values.end].filter(Boolean).map((date_value) => this.get_selection_key(date_value));
      }
      return this.selected_dates.map((date_value) => this.get_selection_key(date_value));
    }
    get_display_values() {
      if (this.is_time_range_mode()) {
        return [this.time_range_values.start, this.time_range_values.end].filter(Boolean).map((date_value) => this.get_display_value(date_value));
      }
      return this.selected_dates.map((date_value) => this.get_display_value(date_value));
    }
    set_value(next_value, source = "api") {
      let input_list = [];
      if (Array.isArray(next_value)) {
        input_list = next_value;
      } else if (typeof next_value === "string" && (this.options.multiple || this.has_range_selection())) {
        input_list = this.split_input_values(next_value);
      } else if (next_value !== null && next_value !== void 0 && next_value !== "") {
        input_list = [next_value];
      }
      const parsed_dates = input_list.map((input_item) => this.parse_input_candidate(input_item)).filter(Boolean);
      this.selected_dates = this.normalize_selected_dates(parsed_dates);
      this.sync_time_range_values_from_selected_dates();
      this.range_hover_date = null;
      this.view_date = clone_date(this.selected_dates[this.selected_dates.length - 1]) || /* @__PURE__ */ new Date();
      this.sync_time_cursor_from_date(this.get_primary_selected_date());
      this.reset_draft_state();
      this.refresh_input_value();
      this.render();
      this.notify_change(source);
    }
    open() {
      if (this.is_inline_mode()) {
        return;
      }
      if (this.is_open || this.active_input.disabled) {
        return;
      }
      if (this.close_timeout_id) {
        clearTimeout(this.close_timeout_id);
        this.close_timeout_id = null;
      }
      open_instances.forEach((instance) => {
        if (instance !== this) {
          instance.close();
        }
      });
      open_instances.add(this);
      this.is_open = true;
      this.language = resolve_language(this.options.language);
      this.rules = normalize_availability_rules(this.options, this.options.format);
      this.selected_dates = this.read_initial_selection();
      this.sync_time_range_values_from_selected_dates();
      this.initialize_view_state();
      this.prepare_draft_state();
      this.render();
      this.panel_element.hidden = false;
      this.position_panel();
      this.panel_element.offsetHeight;
      this.panel_element.classList.add("is-visible");
      this.active_input.setAttribute("aria-expanded", "true");
      document.addEventListener("mousedown", this.handle_document_mouse_down);
      document.addEventListener("keydown", this.handle_document_keydown);
      window.addEventListener("resize", this.handle_window_refresh);
      window.addEventListener("scroll", this.handle_window_refresh, true);
      this.notify_open("open");
    }
    close() {
      if (this.is_inline_mode()) {
        return;
      }
      if (!this.is_open) {
        return;
      }
      this.is_open = false;
      open_instances.delete(this);
      this.range_hover_date = null;
      this.panel_element.classList.remove("is-visible");
      this.active_input.setAttribute("aria-expanded", "false");
      document.removeEventListener("mousedown", this.handle_document_mouse_down);
      document.removeEventListener("keydown", this.handle_document_keydown);
      window.removeEventListener("resize", this.handle_window_refresh);
      window.removeEventListener("scroll", this.handle_window_refresh, true);
      const active_element = document.activeElement;
      if (active_element && this.panel_element.contains(active_element)) {
        this.is_focusing_programmatically = true;
        this.active_input.focus();
        setTimeout(() => {
          this.is_focusing_programmatically = false;
        }, 50);
      }
      this.reset_draft_state();
      this.notify_close("close");
      if (this.options.animation === "none") {
        this.panel_element.hidden = true;
      } else {
        this.close_timeout_id = setTimeout(() => {
          this.panel_element.hidden = true;
          this.close_timeout_id = null;
        }, 250);
      }
    }
    destroy() {
      this.close();
      this.active_input.removeEventListener("focus", this.handle_input_open);
      this.active_input.removeEventListener("click", this.handle_input_open);
      this.active_input.removeEventListener("keydown", this.handle_input_keydown);
      this.panel_element.removeEventListener("click", this.handle_panel_click);
      this.panel_element.removeEventListener("mousemove", this.handle_panel_mouse_move);
      this.panel_element.removeEventListener("mouseleave", this.handle_panel_mouse_leave);
      this.panel_element.removeEventListener("keydown", this.handle_panel_keydown);
      this.panel_element.removeEventListener("touchstart", this.handle_panel_touch_start);
      this.panel_element.removeEventListener("touchend", this.handle_panel_touch_end);
      this.panel_element.remove();
      if (this.handle_input_change) {
        this.source_input.removeEventListener("change", this.handle_input_change);
        this.source_input.removeEventListener("input", this.handle_input_change);
      }
      if (this.display_input) {
        if (this.display_input.required) {
          this.source_input.required = true;
        }
        if (this.display_input.id) {
          this.source_input.id = this.display_input.id;
        }
        this.display_input.remove();
        if (this.original_source_style === null) {
          this.source_input.removeAttribute("style");
        } else {
          this.source_input.setAttribute("style", this.original_source_style);
        }
      }
      this.source_input.readOnly = this.original_source_readonly;
      if (this.original_source_autocomplete === null) {
        this.source_input.removeAttribute("autocomplete");
      } else {
        this.source_input.setAttribute("autocomplete", this.original_source_autocomplete);
      }
      this.source_input.removeAttribute("data-mangopicker-role");
      delete this.source_input.__mango_picker_instance__;
    }
    position_panel() {
      if (this.is_inline_mode() || this.panel_element.hidden) {
        return;
      }
      const input_rect = this.active_input.getBoundingClientRect();
      const panel_element = this.panel_element;
      const viewport_padding = 12;
      const time_column_count = this.get_time_column_count();
      const time_panel_count = this.is_time_range_mode() ? 2 : 1;
      const time_panel_width = time_column_count * 84 + 48;
      const picker_minimum_width = this.format_details.is_time_only ? this.is_time_range_mode() ? Math.max(420, time_panel_count * time_panel_width + (time_panel_count - 1) * 12) : Math.max(260, time_panel_count * time_panel_width) : this.format_details.has_time ? Math.max(380, 260 + time_column_count * 64) : 280;
      const minimum_width = Math.min(Math.max(input_rect.width, picker_minimum_width), window.innerWidth - viewport_padding * 2);
      panel_element.style.minWidth = `${minimum_width}px`;
      panel_element.style.zIndex = String(this.options.z_index);
      const panel_height = panel_element.offsetHeight;
      const panel_width = panel_element.offsetWidth;
      const fits_below = input_rect.bottom + panel_height + 12 <= window.innerHeight;
      let top_value = window.scrollY + input_rect.bottom + 8;
      if (!fits_below && input_rect.top - panel_height - 8 >= viewport_padding) {
        top_value = window.scrollY + input_rect.top - panel_height - 8;
        panel_element.classList.add("is-top");
      } else {
        panel_element.classList.remove("is-top");
      }
      let left_value = window.scrollX + input_rect.left;
      const max_left = window.scrollX + window.innerWidth - panel_width - viewport_padding;
      left_value = Math.max(window.scrollX + viewport_padding, Math.min(left_value, max_left));
      panel_element.style.top = `${top_value}px`;
      panel_element.style.left = `${left_value}px`;
    }
    needs_apply() {
      return this.format_details.has_time && !this.options.multiple && !this.has_range_selection();
    }
    sync_time_cursor_from_date(date_value) {
      if (!date_value) {
        this.time_cursor_hour = Number(this.options.default_hour) || 0;
        this.time_cursor_minute = Number(this.options.default_minute) || 0;
        this.time_cursor_second = Number(this.options.default_second) || 0;
        return;
      }
      this.time_cursor_hour = date_value.getHours();
      this.time_cursor_minute = date_value.getMinutes();
      this.time_cursor_second = date_value.getSeconds();
    }
    get_time_column_count() {
      let time_column_count = 0;
      if (this.format_details.has_hour || !this.format_details.has_minute && !this.format_details.has_second) {
        time_column_count += 1;
      }
      if (this.format_details.has_minute) {
        time_column_count += 1;
      }
      if (this.format_details.has_second) {
        time_column_count += 1;
      }
      if (this.uses_12_hour_clock()) {
        time_column_count += 1;
      }
      return time_column_count;
    }
    get_default_time_date() {
      const now_date = /* @__PURE__ */ new Date();
      return create_local_date(
        now_date.getFullYear(),
        now_date.getMonth(),
        now_date.getDate(),
        Number(this.options.default_hour) || 0,
        Number(this.options.default_minute) || 0,
        Number(this.options.default_second) || 0
      );
    }
    get_time_range_reference_date(slot_name) {
      return clone_date(this.get_time_range_slot_date(slot_name)) || this.get_default_time_date();
    }
    get_time_panel_state(slot_name = null) {
      if (this.is_time_range_mode() && slot_name) {
        const reference_date = this.get_time_range_reference_date(slot_name);
        return {
          hour: reference_date.getHours(),
          minute: reference_date.getMinutes(),
          second: reference_date.getSeconds()
        };
      }
      return {
        hour: this.time_cursor_hour,
        minute: this.time_cursor_minute,
        second: this.time_cursor_second
      };
    }
    reset_draft_state() {
      if (!this.needs_apply()) {
        this.draft_date = null;
        this.sync_time_cursor_from_date(this.get_primary_selected_date());
        return;
      }
      this.draft_date = this.selected_dates[0] ? clone_date(this.selected_dates[0]) : null;
      this.sync_time_cursor_from_date(this.draft_date || this.selected_dates[0] || null);
    }
    prepare_draft_state() {
      if (!this.needs_apply()) {
        return;
      }
      if (this.selected_dates[0]) {
        this.draft_date = clone_date(this.selected_dates[0]);
        this.sync_time_cursor_from_date(this.draft_date);
        return;
      }
      const base_date = this.find_available_base_date();
      this.draft_date = this.compose_candidate_date({
        year: base_date.getFullYear(),
        month: base_date.getMonth(),
        day: base_date.getDate(),
        hour: base_date.getHours(),
        minute: base_date.getMinutes(),
        second: base_date.getSeconds()
      });
      this.sync_time_cursor_from_date(this.draft_date);
    }
    find_available_base_date() {
      if (this.format_details.is_time_only) {
        const now_date = /* @__PURE__ */ new Date();
        return create_local_date(
          now_date.getFullYear(),
          now_date.getMonth(),
          now_date.getDate(),
          this.time_cursor_hour,
          this.time_cursor_minute,
          this.time_cursor_second
        );
      }
      const today_date = /* @__PURE__ */ new Date();
      return find_first_available_date(today_date, 1, this.rules) || find_first_available_date(today_date, -1, this.rules) || today_date;
    }
    compose_time_range_candidate(slot_name, overrides = {}) {
      var _a, _b, _c;
      const reference_date = this.get_time_range_reference_date(slot_name);
      return create_local_date(
        reference_date.getFullYear(),
        reference_date.getMonth(),
        reference_date.getDate(),
        (_a = overrides.hour) != null ? _a : reference_date.getHours(),
        (_b = overrides.minute) != null ? _b : reference_date.getMinutes(),
        (_c = overrides.second) != null ? _c : reference_date.getSeconds()
      );
    }
    compose_candidate_date(overrides = {}) {
      var _a, _b, _c, _d, _e, _f;
      const reference_date = this.draft_date || this.selected_dates[0] || this.view_date || /* @__PURE__ */ new Date();
      let year_value = (_a = overrides.year) != null ? _a : reference_date.getFullYear();
      let month_index = (_b = overrides.month) != null ? _b : reference_date.getMonth();
      let day_value = (_c = overrides.day) != null ? _c : reference_date.getDate();
      const hour_value = (_d = overrides.hour) != null ? _d : this.time_cursor_hour;
      const minute_value = (_e = overrides.minute) != null ? _e : this.time_cursor_minute;
      const second_value = (_f = overrides.second) != null ? _f : this.time_cursor_second;
      if (this.format_details.is_time_only) {
        year_value = reference_date.getFullYear();
        month_index = reference_date.getMonth();
        day_value = reference_date.getDate();
      } else if (this.format_details.selection_unit === "month") {
        day_value = 1;
      } else if (this.format_details.selection_unit === "year") {
        month_index = 0;
        day_value = 1;
      }
      return create_local_date(year_value, month_index, day_value, hour_value, minute_value, second_value);
    }
    refresh_input_value() {
      const raw_values = this.get_values();
      const display_values = this.get_display_values();
      const output_separator = this.get_output_separator();
      const has_multi_output = this.options.multiple || this.has_range_selection();
      const raw_output = has_multi_output ? raw_values.join(output_separator) : raw_values[0] || "";
      const display_output = has_multi_output ? display_values.join(output_separator) : display_values[0] || "";
      this.source_input.value = raw_output;
      if (this.display_input) {
        this.display_input.value = display_output;
        return;
      }
      this.active_input.value = raw_output;
    }
    emit_native_change_events() {
      this.source_input.dispatchEvent(new Event("input", { bubbles: true }));
      this.source_input.dispatchEvent(new Event("change", { bubbles: true }));
      if (this.display_input) {
        this.display_input.dispatchEvent(new Event("input", { bubbles: true }));
        this.display_input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    build_detail(source) {
      const { start_date, end_date } = this.get_range_bounds();
      const display_values = this.get_display_values();
      const display_output = this.options.multiple || this.has_range_selection() ? display_values.join(this.get_output_separator()) : display_values[0] || "";
      return {
        instance: this,
        source,
        element: this.source_input,
        input: this.source_input,
        active_input: this.active_input,
        display_input: this.display_input,
        format: this.options.format,
        language: this.options.language,
        buddha: this.options.buddha,
        buddha_input: this.should_use_buddha_input(),
        range: this.has_range_selection(),
        range_time: this.is_time_range_mode(),
        multiple: this.options.multiple,
        value: this.get_value(),
        values: this.get_values(),
        display_value: display_output,
        display_values,
        dates: this.selected_dates.map((date_value) => clone_date(date_value)),
        range_start: start_date ? clone_date(start_date) : null,
        range_end: end_date ? clone_date(end_date) : null,
        draft_date: this.draft_date ? clone_date(this.draft_date) : null
      };
    }
    dispatch_custom_event(event_name, detail) {
      const custom_event = create_custom_event(event_name, detail, true);
      if (!custom_event) {
        return;
      }
      this.source_input.dispatchEvent(custom_event);
      if (this.display_input) {
        this.display_input.dispatchEvent(create_custom_event(event_name, detail, false));
      }
    }
    notify_open(source) {
      const detail = this.build_detail(source);
      if (typeof this.options.on_open === "function") {
        this.options.on_open(detail);
      }
      this.dispatch_custom_event("mango:open", detail);
    }
    notify_close(source) {
      const detail = this.build_detail(source);
      if (typeof this.options.on_close === "function") {
        this.options.on_close(detail);
      }
      this.dispatch_custom_event("mango:close", detail);
    }
    notify_select(source) {
      const detail = this.build_detail(source);
      if (typeof this.options.on_select === "function") {
        this.options.on_select(detail);
      }
      this.dispatch_custom_event("mango:select", detail);
    }
    notify_change(source) {
      const detail = this.build_detail(source);
      if (typeof this.options.on_change === "function") {
        this.options.on_change(detail);
      }
      this.dispatch_custom_event("mango:change", detail);
      this.emit_native_change_events();
    }
    handle_keyboard_navigation(event) {
      if (!this.options.keyboard_navigation) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
        return;
      }
      const action_element = event.target && event.target.closest ? event.target.closest("[data-action]") : null;
      if (!action_element || !this.panel_element.contains(action_element)) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action_element.click();
        return;
      }
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
        return;
      }
      const action_name = action_element.dataset.action;
      if (action_name === "select-day") {
        event.preventDefault();
        this.navigate_day_focus(action_element, event.key);
        return;
      }
      if (action_name === "select-month" || action_name === "select-year") {
        event.preventDefault();
        this.navigate_button_group_focus(action_element, event.key, ".mango-picker__tile:not(:disabled)", 3);
        return;
      }
      if (["select-hour", "select-minute", "select-second", "select-meridiem"].includes(action_name)) {
        event.preventDefault();
        this.navigate_time_focus(action_element, event.key);
      }
    }
    navigate_day_focus(action_element, key_name) {
      if (key_name === "Home" || key_name === "End") {
        this.navigate_button_group_focus(action_element, key_name, ".mango-picker__cell:not(:disabled)", 7);
        return;
      }
      const offset_map = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7
      };
      const offset_value = offset_map[key_name];
      if (!offset_value) {
        return;
      }
      const current_date = create_local_date(
        Number(action_element.dataset.year),
        Number(action_element.dataset.month),
        Number(action_element.dataset.day)
      );
      const next_date = add_days(current_date, offset_value);
      if (this.focus_day_button(next_date)) {
        return;
      }
      this.view_date = start_of_month(next_date) || this.view_date;
      this.render();
      this.focus_day_button(next_date);
    }
    navigate_button_group_focus(action_element, key_name, selector, column_count) {
      const base_selector = selector.split(":")[0];
      const all_buttons = [...this.panel_element.querySelectorAll(base_selector)];
      const current_index = all_buttons.indexOf(action_element);
      if (current_index < 0) {
        return;
      }
      const offset_map = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -column_count,
        ArrowDown: column_count,
        Home: -current_index,
        End: all_buttons.length - current_index - 1
      };
      const target_index = current_index + (offset_map[key_name] || 0);
      if (target_index < 0 || target_index >= all_buttons.length) {
        return;
      }
      const target_button = all_buttons[target_index];
      if (target_button && !target_button.disabled) {
        target_button.focus();
      } else {
        const direction = Math.sign(offset_map[key_name] || 1) || 1;
        let check_index = target_index + direction;
        while (check_index >= 0 && check_index < all_buttons.length) {
          const candidate = all_buttons[check_index];
          if (candidate && !candidate.disabled) {
            candidate.focus();
            break;
          }
          check_index += direction;
        }
      }
    }
    navigate_time_focus(action_element, key_name) {
      var _a;
      if (key_name === "ArrowLeft" || key_name === "ArrowRight") {
        const column_list = [...this.panel_element.querySelectorAll(".mango-picker__time-column")];
        const current_column = action_element.closest(".mango-picker__time-column");
        const current_column_index = column_list.indexOf(current_column);
        if (current_column_index < 0) {
          return;
        }
        const next_column_index = Math.max(0, Math.min(column_list.length - 1, current_column_index + (key_name === "ArrowLeft" ? -1 : 1)));
        const current_buttons = [...current_column.querySelectorAll(".mango-picker__time-option:not(:disabled)")];
        const next_buttons = [...column_list[next_column_index].querySelectorAll(".mango-picker__time-option:not(:disabled)")];
        const current_button_index = Math.max(0, current_buttons.indexOf(action_element));
        (_a = next_buttons[Math.min(current_button_index, next_buttons.length - 1)]) == null ? void 0 : _a.focus();
        return;
      }
      this.navigate_button_group_focus(action_element, key_name, ".mango-picker__time-option:not(:disabled)", 1);
    }
    focus_day_button(date_value) {
      const button_class_name = `mango-picker-${format_date_value(date_value, "Y-m-d")}`;
      const day_button = this.panel_element.querySelector(`.${button_class_name}:not(:disabled)`);
      if (!day_button) {
        return false;
      }
      day_button.focus();
      return true;
    }
    is_highlighted_day(date_value) {
      const highlighted_dates = [...this.selected_dates];
      if (this.draft_date) {
        highlighted_dates.push(this.draft_date);
      }
      return highlighted_dates.some((selected_date) => same_day(selected_date, date_value));
    }
    is_highlighted_month(date_value) {
      const highlighted_dates = [...this.selected_dates];
      if (this.draft_date) {
        highlighted_dates.push(this.draft_date);
      }
      return highlighted_dates.some((selected_date) => same_month(selected_date, date_value));
    }
    is_highlighted_year(year_value) {
      const highlighted_dates = [...this.selected_dates];
      if (this.draft_date) {
        highlighted_dates.push(this.draft_date);
      }
      return highlighted_dates.some((selected_date) => selected_date.getFullYear() === year_value);
    }
    is_date_selectable_as_range_end(candidate_date) {
      if (this.selected_dates.length !== 1) {
        return true;
      }
      const first_date = this.selected_dates[0];
      const diff_time = Math.abs(candidate_date.getTime() - first_date.getTime());
      const diff_days = Math.round(diff_time / (1e3 * 60 * 60 * 24)) + 1;
      if (this.options.min_range_days !== null && diff_days < this.options.min_range_days) {
        return false;
      }
      if (this.options.max_range_days !== null && diff_days > this.options.max_range_days) {
        return false;
      }
      return true;
    }
    should_track_range_hover() {
      return this.is_range_mode() && this.current_view === "day" && this.selected_dates.length === 1;
    }
    update_range_hover_date(next_date) {
      if (this.range_hover_date && same_day(this.range_hover_date, next_date)) {
        return;
      }
      this.range_hover_date = clone_date(next_date);
      this.render();
    }
    clear_range_hover_date() {
      if (!this.range_hover_date) {
        return;
      }
      this.range_hover_date = null;
      this.render();
    }
    get_range_preview_bounds() {
      if (!this.should_track_range_hover() || !this.range_hover_date) {
        return { start_date: null, end_date: null };
      }
      if (!this.is_date_selectable_as_range_end(this.range_hover_date)) {
        return { start_date: null, end_date: null };
      }
      const next_dates = this.normalize_selected_dates([this.selected_dates[0], this.range_hover_date]);
      return {
        start_date: next_dates[0] || null,
        end_date: next_dates[1] || null
      };
    }
    is_range_start_day(date_value) {
      const { start_date } = this.get_range_bounds();
      return start_date ? same_day(start_date, date_value) : false;
    }
    is_range_end_day(date_value) {
      const { end_date } = this.get_range_bounds();
      return end_date ? same_day(end_date, date_value) : false;
    }
    is_day_within_range(date_value) {
      const { start_date, end_date } = this.get_range_bounds();
      if (!start_date || !end_date) {
        return false;
      }
      return compare_full_date(date_value, start_date) > 0 && compare_full_date(date_value, end_date) < 0;
    }
    is_day_within_range_preview(date_value) {
      const { start_date, end_date } = this.get_range_preview_bounds();
      if (!start_date || !end_date) {
        return false;
      }
      return compare_full_date(date_value, start_date) > 0 && compare_full_date(date_value, end_date) < 0;
    }
    is_range_hover_day(date_value) {
      return this.range_hover_date ? same_day(this.range_hover_date, date_value) : false;
    }
    uses_12_hour_clock() {
      return Boolean(this.options.time_12h || this.format_details.has_hour_12 || this.format_details.has_meridiem);
    }
    get_hour_label(hour_value) {
      if (!this.uses_12_hour_clock()) {
        return pad_number(hour_value);
      }
      return pad_number(hour_value % 12 || 12);
    }
    get_meridiem_label(period_value) {
      return this.options.format.includes("a") ? period_value.toLowerCase() : period_value;
    }
    should_commit_time_selection(unit_name) {
      if (!this.format_details.is_time_only) {
        return false;
      }
      if (unit_name === "hour") {
        return !this.format_details.has_minute && !this.format_details.has_second;
      }
      if (unit_name === "minute") {
        return this.format_details.has_minute && !this.format_details.has_second;
      }
      if (unit_name === "second") {
        return this.format_details.has_second;
      }
      return false;
    }
    commit_time_selection(candidate_date, source) {
      if (this.options.multiple) {
        this.toggle_multiple_selection(candidate_date, source);
        return;
      }
      if (this.is_range_mode()) {
        this.commit_range_selection(candidate_date, source);
      }
    }
    build_step_options(total_count, step_value, selected_value) {
      const safe_step = Math.max(1, Number(step_value) || 1);
      const option_values = [];
      for (let option_value = 0; option_value < total_count; option_value += safe_step) {
        option_values.push(option_value);
      }
      if (!option_values.includes(selected_value)) {
        option_values.push(selected_value);
        option_values.sort((left_value, right_value) => left_value - right_value);
      }
      return option_values;
    }
    build_next_range_dates(candidate_date) {
      const normalized_candidate = clone_date(candidate_date);
      if (!normalized_candidate) {
        return [];
      }
      if (this.selected_dates.length === 1) {
        if (this.is_date_selectable_as_range_end(normalized_candidate)) {
          return this.normalize_selected_dates([this.selected_dates[0], normalized_candidate]);
        }
      }
      return [normalized_candidate];
    }
    commit_range_selection(candidate_date, source) {
      const next_dates = this.build_next_range_dates(candidate_date);
      const should_close = next_dates.length === 2;
      this.commit_selection(next_dates, source, should_close);
    }
    commit_selection(next_dates, source, should_close = false) {
      this.selected_dates = this.normalize_selected_dates(next_dates);
      this.sync_time_range_values_from_selected_dates();
      this.range_hover_date = null;
      this.view_date = clone_date(this.view_date) || clone_date(this.selected_dates[this.selected_dates.length - 1]) || /* @__PURE__ */ new Date();
      this.sync_time_cursor_from_date(this.get_primary_selected_date());
      this.reset_draft_state();
      this.refresh_input_value();
      this.render();
      this.notify_select(source);
      this.notify_change(source);
      if (should_close && this.options.close_on_select) {
        this.close();
      }
    }
    update_time_range_selection(slot_name, candidate_date, source) {
      const normalized_slot = this.get_time_range_slot_name(slot_name);
      const normalized_candidate = clone_date(candidate_date);
      if (!normalized_candidate) {
        return;
      }
      this.time_range_active_slot = normalized_slot;
      this.time_range_values[normalized_slot] = normalized_candidate;
      this.sync_selected_dates_from_time_range_values();
      this.view_date = clone_date(normalized_candidate) || clone_date(this.view_date) || /* @__PURE__ */ new Date();
      this.sync_time_cursor_from_date(normalized_candidate);
      this.reset_draft_state();
      this.refresh_input_value();
      this.render();
      this.notify_select(source);
      this.notify_change(source);
    }
    toggle_multiple_selection(candidate_date, source) {
      const candidate_key = this.get_selection_key(candidate_date);
      const existing_index = this.selected_dates.findIndex((selected_date) => this.get_selection_key(selected_date) === candidate_key);
      const next_dates = [...this.selected_dates];
      if (existing_index >= 0) {
        next_dates.splice(existing_index, 1);
      } else {
        next_dates.push(candidate_date);
      }
      this.commit_selection(next_dates, source, false);
    }
    apply_draft(source) {
      if (!this.draft_date) {
        return;
      }
      const next_date = clone_date(this.draft_date);
      if (!this.format_details.is_time_only && !is_date_allowed(next_date, this.rules)) {
        return;
      }
      this.selected_dates = [next_date];
      this.sync_time_range_values_from_selected_dates();
      this.view_date = clone_date(next_date);
      this.sync_time_cursor_from_date(next_date);
      this.reset_draft_state();
      this.refresh_input_value();
      this.render();
      this.notify_change(source);
      if (this.options.close_on_select) {
        this.close();
      }
    }
    clear_value(source = "clear") {
      this.selected_dates = [];
      this.time_range_values = { start: null, end: null };
      this.draft_date = null;
      this.range_hover_date = null;
      this.sync_time_cursor_from_date(null);
      this.refresh_input_value();
      this.render();
      this.notify_change(source);
    }
    reset_value(source = "reset") {
      this.set_value(this.initial_input_value, source);
    }
    shift_period(step_value) {
      if (!step_value) {
        return;
      }
      this.range_hover_date = null;
      switch (this.current_view) {
        case "day":
          this.view_date = add_months(this.view_date, step_value);
          break;
        case "month":
          this.view_date = add_years(this.view_date, step_value);
          break;
        case "year":
          this.view_date = add_years(this.view_date, step_value * 12);
          break;
        default:
          break;
      }
      this.render();
    }
    select_day(year_value, month_index, day_value) {
      const candidate_date = this.compose_candidate_date({
        year: year_value,
        month: month_index,
        day: day_value
      });
      if (!is_date_allowed(candidate_date, this.rules)) {
        return;
      }
      this.view_date = clone_date(candidate_date);
      if (this.options.multiple) {
        this.toggle_multiple_selection(candidate_date, "day");
        return;
      }
      if (this.is_range_mode()) {
        this.commit_range_selection(candidate_date, "day");
        return;
      }
      if (this.needs_apply()) {
        this.draft_date = candidate_date;
        this.notify_select("day");
        this.render();
        return;
      }
      this.commit_selection([candidate_date], "day", true);
    }
    select_month(year_value, month_index) {
      if (!is_month_allowed(year_value, month_index, this.rules)) {
        return;
      }
      this.view_date = create_local_date(year_value, month_index, 1, this.time_cursor_hour, this.time_cursor_minute, this.time_cursor_second);
      if (this.format_details.has_day) {
        this.current_view = "day";
        this.render();
        return;
      }
      const candidate_date = this.compose_candidate_date({
        year: year_value,
        month: month_index,
        day: 1
      });
      if (this.options.multiple) {
        this.toggle_multiple_selection(candidate_date, "month");
        return;
      }
      if (this.is_range_mode()) {
        this.commit_range_selection(candidate_date, "month");
        return;
      }
      if (this.needs_apply()) {
        this.draft_date = candidate_date;
        this.notify_select("month");
        this.render();
        return;
      }
      this.commit_selection([candidate_date], "month", true);
    }
    select_year(year_value) {
      if (!is_year_allowed(year_value, this.rules)) {
        return;
      }
      this.view_date = create_local_date(year_value, this.view_date.getMonth(), 1, this.time_cursor_hour, this.time_cursor_minute, this.time_cursor_second);
      if (this.format_details.has_month || this.format_details.has_day) {
        this.current_view = "month";
        this.render();
        return;
      }
      const candidate_date = this.compose_candidate_date({
        year: year_value,
        month: 0,
        day: 1
      });
      if (this.options.multiple) {
        this.toggle_multiple_selection(candidate_date, "year");
        return;
      }
      if (this.is_range_mode()) {
        this.commit_range_selection(candidate_date, "year");
        return;
      }
      if (this.needs_apply()) {
        this.draft_date = candidate_date;
        this.notify_select("year");
        this.render();
        return;
      }
      this.commit_selection([candidate_date], "year", true);
    }
    get_time_reference_date() {
      return this.draft_date || this.get_primary_selected_date() || this.find_available_base_date();
    }
    select_hour(hour_value, slot_name = null) {
      if (this.is_time_range_mode()) {
        const normalized_slot = this.get_time_range_slot_name(slot_name || this.time_range_active_slot);
        const candidate_date2 = this.compose_time_range_candidate(normalized_slot, { hour: hour_value });
        this.update_time_range_selection(normalized_slot, candidate_date2, "time");
        return;
      }
      this.time_cursor_hour = hour_value;
      const reference_date = this.get_time_reference_date();
      const candidate_date = this.compose_candidate_date({
        year: reference_date.getFullYear(),
        month: reference_date.getMonth(),
        day: reference_date.getDate(),
        hour: hour_value
      });
      if ((this.options.multiple || this.is_range_mode()) && this.should_commit_time_selection("hour")) {
        this.commit_time_selection(candidate_date, "time");
        return;
      }
      if (this.needs_apply()) {
        this.draft_date = candidate_date;
        this.notify_select("time");
        this.render();
        return;
      }
      this.notify_select("time");
      this.render();
    }
    select_minute(minute_value, slot_name = null) {
      if (this.is_time_range_mode()) {
        const normalized_slot = this.get_time_range_slot_name(slot_name || this.time_range_active_slot);
        const candidate_date2 = this.compose_time_range_candidate(normalized_slot, { minute: minute_value });
        this.update_time_range_selection(normalized_slot, candidate_date2, "time");
        return;
      }
      this.time_cursor_minute = minute_value;
      const reference_date = this.get_time_reference_date();
      const candidate_date = this.compose_candidate_date({
        year: reference_date.getFullYear(),
        month: reference_date.getMonth(),
        day: reference_date.getDate(),
        minute: minute_value
      });
      if ((this.options.multiple || this.is_range_mode()) && this.should_commit_time_selection("minute")) {
        this.commit_time_selection(candidate_date, "time");
        return;
      }
      if (this.needs_apply()) {
        this.draft_date = candidate_date;
        this.notify_select("time");
        this.render();
        return;
      }
      this.notify_select("time");
      this.render();
    }
    select_second(second_value, slot_name = null) {
      if (this.is_time_range_mode()) {
        const normalized_slot = this.get_time_range_slot_name(slot_name || this.time_range_active_slot);
        const candidate_date2 = this.compose_time_range_candidate(normalized_slot, { second: second_value });
        this.update_time_range_selection(normalized_slot, candidate_date2, "time");
        return;
      }
      this.time_cursor_second = second_value;
      const reference_date = this.get_time_reference_date();
      const candidate_date = this.compose_candidate_date({
        year: reference_date.getFullYear(),
        month: reference_date.getMonth(),
        day: reference_date.getDate(),
        second: second_value
      });
      if ((this.options.multiple || this.is_range_mode()) && this.should_commit_time_selection("second")) {
        this.commit_time_selection(candidate_date, "time");
        return;
      }
      if (this.needs_apply()) {
        this.draft_date = candidate_date;
        this.notify_select("time");
        this.render();
        return;
      }
      this.notify_select("time");
      this.render();
    }
    select_meridiem(period_value, slot_name = null) {
      const normalized_period = period_value === "PM" ? "PM" : "AM";
      if (this.is_time_range_mode()) {
        const normalized_slot = this.get_time_range_slot_name(slot_name || this.time_range_active_slot);
        const slot_date = this.get_time_range_reference_date(normalized_slot);
        const hour_12_value2 = slot_date.getHours() % 12;
        const hour_value = normalized_period === "PM" ? hour_12_value2 + 12 : hour_12_value2;
        const candidate_date2 = this.compose_time_range_candidate(normalized_slot, { hour: hour_value });
        this.update_time_range_selection(normalized_slot, candidate_date2, "time");
        return;
      }
      const hour_12_value = this.time_cursor_hour % 12;
      this.time_cursor_hour = normalized_period === "PM" ? hour_12_value + 12 : hour_12_value;
      const reference_date = this.get_time_reference_date();
      const candidate_date = this.compose_candidate_date({
        year: reference_date.getFullYear(),
        month: reference_date.getMonth(),
        day: reference_date.getDate(),
        hour: this.time_cursor_hour
      });
      if (this.needs_apply()) {
        this.draft_date = candidate_date;
      }
      this.notify_select("time");
      this.render();
    }
    select_today(slot_name = null) {
      const now_date = /* @__PURE__ */ new Date();
      if (this.is_time_range_mode()) {
        const normalized_slot = this.get_time_range_slot_name(slot_name || this.time_range_active_slot);
        const candidate_date2 = this.compose_time_range_candidate(normalized_slot, {
          hour: now_date.getHours(),
          minute: now_date.getMinutes(),
          second: now_date.getSeconds()
        });
        this.update_time_range_selection(normalized_slot, candidate_date2, "today");
        return;
      }
      let candidate_date = create_local_date(
        now_date.getFullYear(),
        now_date.getMonth(),
        now_date.getDate(),
        this.format_details.has_time ? now_date.getHours() : this.time_cursor_hour,
        this.format_details.has_time ? now_date.getMinutes() : this.time_cursor_minute,
        this.format_details.has_time ? now_date.getSeconds() : this.time_cursor_second
      );
      if (!this.format_details.is_time_only && !is_date_allowed(candidate_date, this.rules)) {
        candidate_date = find_first_available_date(candidate_date, 1, this.rules) || find_first_available_date(candidate_date, -1, this.rules) || candidate_date;
      }
      this.view_date = clone_date(candidate_date);
      this.time_cursor_hour = candidate_date.getHours();
      this.time_cursor_minute = candidate_date.getMinutes();
      this.time_cursor_second = candidate_date.getSeconds();
      if (this.options.multiple) {
        this.toggle_multiple_selection(candidate_date, "today");
        return;
      }
      if (this.is_range_mode()) {
        this.commit_range_selection(candidate_date, "today");
        return;
      }
      if (this.needs_apply()) {
        this.draft_date = candidate_date;
        this.notify_select("today");
        this.render();
        return;
      }
      this.commit_selection([candidate_date], "today", true);
    }
    get_display_year(year_value) {
      return this.options.buddha ? year_value + 543 : year_value;
    }
    get_header_markup() {
      if (this.current_view === "time") {
        return `
        <div class="mango-picker__header">
          <div class="mango-picker__title">${this.language.labels.time}</div>
        </div>
      `;
      }
      if (this.current_view === "month") {
        return `
        <div class="mango-picker__header">
          <button type="button" class="mango-picker__nav" data-action="shift-period" data-step="-1" aria-label="Previous year">&lsaquo;</button>
          <div class="mango-picker__header-center">
            <button type="button" class="mango-picker__headline is-static">${this.get_display_year(this.view_date.getFullYear())}</button>
          </div>
          <button type="button" class="mango-picker__nav" data-action="shift-period" data-step="1" aria-label="Next year">&rsaquo;</button>
        </div>
      `;
      }
      if (this.current_view === "year") {
        const start_year = Math.floor(this.view_date.getFullYear() / 12) * 12;
        const end_year = start_year + 11;
        return `
        <div class="mango-picker__header">
          <button type="button" class="mango-picker__nav" data-action="shift-period" data-step="-1" aria-label="Previous year range">&lsaquo;</button>
          <div class="mango-picker__header-center">
            <button type="button" class="mango-picker__headline is-static">${this.get_display_year(start_year)} - ${this.get_display_year(end_year)}</button>
          </div>
          <button type="button" class="mango-picker__nav" data-action="shift-period" data-step="1" aria-label="Next year range">&rsaquo;</button>
        </div>
      `;
      }
      return `
      <div class="mango-picker__header">
        <button type="button" class="mango-picker__nav" data-action="shift-period" data-step="-1" aria-label="Previous month">&lsaquo;</button>
        <div class="mango-picker__header-center">
          <button type="button" class="mango-picker__headline" data-action="switch-view" data-view="month">${this.language.months[this.view_date.getMonth()]}</button>
          <button type="button" class="mango-picker__headline" data-action="switch-view" data-view="year">${this.get_display_year(this.view_date.getFullYear())}</button>
        </div>
        <button type="button" class="mango-picker__nav" data-action="shift-period" data-step="1" aria-label="Next month">&rsaquo;</button>
      </div>
    `;
    }
    get_week_start() {
      const option_week_start = Number(this.options.week_start);
      if (Number.isInteger(option_week_start)) {
        return (option_week_start % 7 + 7) % 7;
      }
      return this.language.week_start || 0;
    }
    get_day_cell_content_markup(cell_detail) {
      const default_markup = `<span>${cell_detail.day}</span>`;
      if (typeof this.options.render_cell_date !== "function") {
        return default_markup;
      }
      try {
        const rendered_markup = this.options.render_cell_date({
          instance: this,
          date: clone_date(cell_detail.date),
          day: cell_detail.day,
          month: cell_detail.month,
          month_index: cell_detail.month_index,
          year: cell_detail.year,
          display_year: this.get_display_year(cell_detail.year),
          label: String(cell_detail.day),
          is_today: cell_detail.is_today,
          is_selected: cell_detail.is_selected,
          is_other_month: cell_detail.is_other_month,
          is_disabled: cell_detail.is_disabled,
          is_range_start: cell_detail.is_range_start,
          is_range_end: cell_detail.is_range_end,
          is_in_range: cell_detail.is_in_range,
          is_range_preview: cell_detail.is_range_preview,
          is_range_hover: cell_detail.is_range_hover
        });
        if (rendered_markup === null || rendered_markup === void 0 || rendered_markup === false) {
          return default_markup;
        }
        return String(rendered_markup);
      } catch (error) {
        if (typeof console !== "undefined" && typeof console.error === "function") {
          console.error("mangoPicker render_cell_date error", error);
        }
        return default_markup;
      }
    }
    get_day_view_markup() {
      const month_start = start_of_month(this.view_date);
      const week_start = this.get_week_start();
      const first_day_offset = (month_start.getDay() - week_start + 7) % 7;
      const grid_start = add_days(month_start, -first_day_offset);
      const weekday_headers = reorder_list_by_start(this.language.weekdays_short, week_start).map((weekday_label) => `<div class="mango-picker__weekday" role="columnheader">${weekday_label}</div>`).join("");
      const day_cells = [];
      for (let cell_index = 0; cell_index < 42; cell_index += 1) {
        const current_date = add_days(grid_start, cell_index);
        const current_date_class_name = `mango-picker-${format_date_value(current_date, "Y-m-d")}`;
        const is_other_month = current_date.getMonth() !== this.view_date.getMonth();
        const is_selected = this.is_highlighted_day(current_date);
        const is_today = same_day(current_date, /* @__PURE__ */ new Date());
        const is_range_start = this.is_range_start_day(current_date);
        const is_range_end = this.is_range_end_day(current_date);
        const is_in_range = this.is_day_within_range(current_date);
        const is_range_preview = this.is_day_within_range_preview(current_date);
        const is_range_hover = this.is_range_hover_day(current_date);
        const is_aria_selected = is_selected || is_range_start || is_range_end;
        const candidate_date = this.compose_candidate_date({
          year: current_date.getFullYear(),
          month: current_date.getMonth(),
          day: current_date.getDate()
        });
        const is_disabled = !is_date_allowed(candidate_date, this.rules);
        const is_range_limit_disabled = !is_disabled && this.is_range_mode() && this.selected_dates.length === 1 && !this.is_date_selectable_as_range_end(candidate_date);
        const is_cell_disabled = is_disabled || is_range_limit_disabled;
        const cell_content = this.get_day_cell_content_markup({
          date: current_date,
          day: current_date.getDate(),
          month: current_date.getMonth() + 1,
          month_index: current_date.getMonth(),
          year: current_date.getFullYear(),
          is_today,
          is_selected,
          is_other_month,
          is_disabled: is_cell_disabled,
          is_range_start,
          is_range_end,
          is_in_range,
          is_range_preview,
          is_range_hover
        });
        const class_names = [
          "mango-picker__cell",
          current_date_class_name,
          is_other_month ? "is-muted" : "",
          is_selected ? "is-selected" : "",
          is_today ? "is-today" : "",
          is_today ? "is-current-day" : "",
          is_range_start ? "is-range-start" : "",
          is_range_end ? "is-range-end" : "",
          is_in_range || is_range_preview ? "is-in-range" : "",
          is_range_preview ? "is-range-preview" : "",
          is_range_hover ? "is-range-hover" : "",
          is_cell_disabled ? "is-disabled" : ""
        ].filter(Boolean).join(" ");
        day_cells.push(`
        <button
          type="button"
          class="${class_names}"
          data-action="select-day"
          data-year="${current_date.getFullYear()}"
          data-month="${current_date.getMonth()}"
          data-day="${current_date.getDate()}"
          role="gridcell"
          aria-label="${format_date_value(current_date, "Y-m-d")}"
          aria-selected="${is_aria_selected ? "true" : "false"}"
          ${is_today ? 'aria-current="date"' : ""}
          ${is_cell_disabled ? 'aria-disabled="true"' : ""}
          ${is_disabled ? "disabled" : ""}
        >
          ${cell_content}
        </button>
      `);
      }
      return `
      <div class="mango-picker__calendar" role="grid">
        <div class="mango-picker__weekdays">${weekday_headers}</div>
        <div class="mango-picker__grid">${day_cells.join("")}</div>
      </div>
    `;
    }
    get_month_view_markup() {
      const month_buttons = this.language.months_short.map((month_label, month_index) => {
        const candidate_date = create_local_date(this.view_date.getFullYear(), month_index, 1, this.time_cursor_hour, this.time_cursor_minute, this.time_cursor_second);
        const is_selected = this.is_highlighted_month(candidate_date);
        const is_disabled = !is_month_allowed(this.view_date.getFullYear(), month_index, this.rules);
        const class_names = ["mango-picker__tile", is_selected ? "is-selected" : "", is_disabled ? "is-disabled" : ""].filter(Boolean).join(" ");
        return `
          <button
            type="button"
            class="${class_names}"
            data-action="select-month"
            data-year="${this.view_date.getFullYear()}"
            data-month="${month_index}"
            aria-selected="${is_selected ? "true" : "false"}"
            ${is_disabled ? 'aria-disabled="true"' : ""}
            ${is_disabled ? "disabled" : ""}
          >
            ${month_label}
          </button>
        `;
      }).join("");
      return `<div class="mango-picker__tiles">${month_buttons}</div>`;
    }
    get_year_view_markup() {
      const start_year = Math.floor(this.view_date.getFullYear() / 12) * 12;
      const year_buttons = Array.from({ length: 12 }, (_, year_offset) => start_year + year_offset).map((year_value) => {
        const is_selected = this.is_highlighted_year(year_value);
        const is_disabled = !is_year_allowed(year_value, this.rules);
        const class_names = ["mango-picker__tile", is_selected ? "is-selected" : "", is_disabled ? "is-disabled" : ""].filter(Boolean).join(" ");
        return `
          <button
            type="button"
            class="${class_names}"
            data-action="select-year"
            data-year="${year_value}"
            aria-selected="${is_selected ? "true" : "false"}"
            ${is_disabled ? 'aria-disabled="true"' : ""}
            ${is_disabled ? "disabled" : ""}
          >
            ${this.get_display_year(year_value)}
          </button>
        `;
      }).join("");
      return `<div class="mango-picker__tiles">${year_buttons}</div>`;
    }
    get_hour_options(selected_hour = this.time_cursor_hour) {
      if (this.uses_12_hour_clock()) {
        const period_offset = selected_hour >= 12 ? 12 : 0;
        const selected_hour_12 = selected_hour % 12 || 12;
        const safe_step = Math.max(1, Number(this.options.hour_step) || 1);
        const hour_12_options = [];
        for (let hour_value = 1; hour_value <= 12; hour_value += safe_step) {
          hour_12_options.push(hour_value);
        }
        if (!hour_12_options.includes(selected_hour_12)) {
          hour_12_options.push(selected_hour_12);
          hour_12_options.sort((left_value, right_value) => left_value - right_value);
        }
        return hour_12_options.map((hour_value) => hour_value === 12 ? period_offset : period_offset + hour_value);
      }
      return this.build_step_options(24, this.options.hour_step, selected_hour);
    }
    get_minute_options(selected_minute = this.time_cursor_minute) {
      return this.build_step_options(60, this.options.minute_step, selected_minute);
    }
    get_second_options(selected_second = this.time_cursor_second) {
      return this.build_step_options(60, this.options.second_step, selected_second);
    }
    get_time_panel_markup(slot_name = null) {
      const time_state = this.get_time_panel_state(slot_name);
      const selected_hour = time_state.hour;
      const selected_minute = time_state.minute;
      const selected_second = time_state.second;
      const normalized_slot = slot_name ? this.get_time_range_slot_name(slot_name) : null;
      const range_target_attribute = normalized_slot ? ` data-range-target="${normalized_slot}"` : "";
      const hour_buttons = this.get_hour_options(selected_hour).map((hour_value) => {
        const class_names = ["mango-picker__time-option", selected_hour === hour_value ? "is-selected" : ""].filter(Boolean).join(" ");
        return `
          <button type="button" class="${class_names}" data-action="select-hour" data-hour="${hour_value}" aria-selected="${selected_hour === hour_value ? "true" : "false"}"${range_target_attribute}>
            ${this.get_hour_label(hour_value)}
          </button>
        `;
      }).join("");
      const minute_buttons = this.get_minute_options(selected_minute).map((minute_value) => {
        const class_names = ["mango-picker__time-option", selected_minute === minute_value ? "is-selected" : ""].filter(Boolean).join(" ");
        return `
          <button type="button" class="${class_names}" data-action="select-minute" data-minute="${minute_value}" aria-selected="${selected_minute === minute_value ? "true" : "false"}"${range_target_attribute}>
            ${pad_number(minute_value)}
          </button>
        `;
      }).join("");
      const time_columns = [];
      if (this.format_details.has_hour || !this.format_details.has_minute && !this.format_details.has_second) {
        time_columns.push(`
        <div class="mango-picker__time-column">
          <div class="mango-picker__time-label">HH</div>
          <div class="mango-picker__time-list">${hour_buttons}</div>
        </div>
      `);
      }
      if (this.format_details.has_minute) {
        time_columns.push(`
        <div class="mango-picker__time-column">
          <div class="mango-picker__time-label">MM</div>
          <div class="mango-picker__time-list">${minute_buttons}</div>
        </div>
      `);
      }
      if (this.format_details.has_second) {
        const second_buttons = this.get_second_options(selected_second).map((second_value) => {
          const class_names = ["mango-picker__time-option", selected_second === second_value ? "is-selected" : ""].filter(Boolean).join(" ");
          return `
            <button type="button" class="${class_names}" data-action="select-second" data-second="${second_value}" aria-selected="${selected_second === second_value ? "true" : "false"}"${range_target_attribute}>
              ${pad_number(second_value)}
            </button>
          `;
        }).join("");
        time_columns.push(`
        <div class="mango-picker__time-column">
          <div class="mango-picker__time-label">SS</div>
          <div class="mango-picker__time-list">${second_buttons}</div>
        </div>
      `);
      }
      if (this.uses_12_hour_clock()) {
        const meridiem_buttons = ["AM", "PM"].map((period_value) => {
          const is_selected = period_value === (selected_hour >= 12 ? "PM" : "AM");
          const class_names = ["mango-picker__time-option", is_selected ? "is-selected" : ""].filter(Boolean).join(" ");
          return `
            <button type="button" class="${class_names}" data-action="select-meridiem" data-period="${period_value}" aria-selected="${is_selected ? "true" : "false"}"${range_target_attribute}>
              ${this.get_meridiem_label(period_value)}
            </button>
          `;
        }).join("");
        time_columns.push(`
        <div class="mango-picker__time-column">
          <div class="mango-picker__time-label">AM/PM</div>
          <div class="mango-picker__time-list">${meridiem_buttons}</div>
        </div>
      `);
      }
      return `
      <div class="mango-picker__time-panel" style="--mango-picker-time-columns: ${time_columns.length};">
        ${time_columns.join("")}
      </div>
    `;
    }
    get_time_range_markup() {
      const start_label = this.language.labels.start || "Start";
      const end_label = this.language.labels.end || "End";
      return `
      <div class="mango-picker__time-range">
        <div class="mango-picker__time-range-group ${this.time_range_active_slot === "start" ? "is-active" : ""}">
          <div class="mango-picker__time-range-title">${start_label}</div>
          ${this.get_time_panel_markup("start")}
        </div>
        <div class="mango-picker__time-range-group ${this.time_range_active_slot === "end" ? "is-active" : ""}">
          <div class="mango-picker__time-range-title">${end_label}</div>
          ${this.get_time_panel_markup("end")}
        </div>
      </div>
    `;
    }
    get_body_markup() {
      if (this.current_view === "time") {
        return this.is_time_range_mode() ? this.get_time_range_markup() : this.get_time_panel_markup();
      }
      if (this.current_view === "month") {
        return this.get_month_view_markup();
      }
      if (this.current_view === "year") {
        return this.get_year_view_markup();
      }
      const calendar_markup = this.get_day_view_markup();
      if (!this.format_details.has_time) {
        return calendar_markup;
      }
      return `
      <div class="mango-picker__layout">
        <div class="mango-picker__calendar-wrap">${calendar_markup}</div>
        ${this.get_time_panel_markup()}
      </div>
    `;
    }
    get_summary_markup() {
      if (this.options.multiple && this.selected_dates.length) {
        const preview_values = this.get_display_values().slice(0, 3);
        const extra_count = this.selected_dates.length - preview_values.length;
        const chips_markup = preview_values.map((preview_value2) => `<span class="mango-picker__chip">${preview_value2}</span>`).join("");
        return `
        <div class="mango-picker__summary">
          <div class="mango-picker__summary-title">${this.selected_dates.length} ${this.language.labels.multiple_count}</div>
          <div class="mango-picker__chips">
            ${chips_markup}
            ${extra_count > 0 ? `<span class="mango-picker__chip">+${extra_count}</span>` : ""}
          </div>
        </div>
      `;
      }
      if (this.is_range_mode()) {
        const preview_values = this.get_display_values();
        const preview_value2 = preview_values.length ? preview_values.join(this.options.range_separator) : this.language.labels.nothing_selected;
        return `
        <div class="mango-picker__summary">
          <div class="mango-picker__summary-title">${this.language.labels.selected}</div>
          <div class="mango-picker__summary-value">${preview_value2}</div>
        </div>
      `;
      }
      if (this.is_time_range_mode()) {
        const start_label = this.language.labels.start || "Start";
        const end_label = this.language.labels.end || "End";
        const start_value = this.time_range_values.start ? this.get_display_value(this.time_range_values.start) : this.language.labels.nothing_selected;
        const end_value = this.time_range_values.end ? this.get_display_value(this.time_range_values.end) : this.language.labels.nothing_selected;
        return `
        <div class="mango-picker__summary">
          <div class="mango-picker__summary-title">${this.language.labels.selected}</div>
          <div class="mango-picker__summary-value">${start_label}: ${start_value}</div>
          <div class="mango-picker__summary-value">${end_label}: ${end_value}</div>
        </div>
      `;
      }
      const preview_date = this.needs_apply() ? this.draft_date || this.selected_dates[0] : this.selected_dates[0];
      const preview_value = preview_date ? this.get_display_value(preview_date) : this.language.labels.nothing_selected;
      return `
      <div class="mango-picker__summary">
        <div class="mango-picker__summary-title">${this.language.labels.selected}</div>
        <div class="mango-picker__summary-value">${preview_value}</div>
      </div>
    `;
    }
    get_footer_markup() {
      const action_buttons = [];
      const today_range_target_attribute = this.is_time_range_mode() ? ` data-range-target="${this.time_range_active_slot}"` : "";
      if (this.options.show_today_button) {
        action_buttons.push(`
        <button type="button" class="mango-picker__action" data-action="set-today"${today_range_target_attribute}>
          ${this.format_details.is_time_only ? this.language.labels.now : this.language.labels.today}
        </button>
      `);
      }
      if (this.options.allow_clear) {
        action_buttons.push(`
        <button type="button" class="mango-picker__action" data-action="clear-value">${this.language.labels.clear}</button>
      `);
      }
      if (this.options.show_reset_button) {
        const reset_label = this.options.reset_label || this.language.labels.reset || "Reset";
        action_buttons.push(`
        <button type="button" class="mango-picker__action" data-action="reset-value">${reset_label}</button>
      `);
      }
      if (this.needs_apply()) {
        action_buttons.push(`
        <button type="button" class="mango-picker__action is-primary" data-action="apply-value" ${this.draft_date ? "" : "disabled"}>
          ${this.language.labels.apply}
        </button>
      `);
      }
      return `
      <div class="mango-picker__footer">
        ${this.get_summary_markup()}
        <div class="mango-picker__actions">${action_buttons.join("")}</div>
      </div>
    `;
    }
    render() {
      this.language = resolve_language(this.options.language);
      this.has_rendered = true;
      const active_element = document.activeElement;
      let focus_identifier = null;
      if (active_element && this.panel_element.contains(active_element)) {
        if (active_element.dataset.action) {
          focus_identifier = {
            action: active_element.dataset.action,
            step: active_element.dataset.step,
            view: active_element.dataset.view,
            year: active_element.dataset.year,
            month: active_element.dataset.month,
            day: active_element.dataset.day,
            hour: active_element.dataset.hour,
            minute: active_element.dataset.minute,
            second: active_element.dataset.second,
            period: active_element.dataset.period,
            rangeTarget: active_element.dataset.rangeTarget
          };
        }
      }
      this.panel_element.innerHTML = `
      <div class="mango-picker__surface">
        ${this.get_header_markup()}
        <div class="mango-picker__body">${this.get_body_markup()}</div>
        ${this.get_footer_markup()}
      </div>
    `;
      if (focus_identifier) {
        let selector = `[data-action="${focus_identifier.action}"]`;
        if (focus_identifier.step) selector += `[data-step="${focus_identifier.step}"]`;
        if (focus_identifier.view) selector += `[data-view="${focus_identifier.view}"]`;
        if (focus_identifier.year) selector += `[data-year="${focus_identifier.year}"]`;
        if (focus_identifier.month) selector += `[data-month="${focus_identifier.month}"]`;
        if (focus_identifier.day) selector += `[data-day="${focus_identifier.day}"]`;
        if (focus_identifier.hour) selector += `[data-hour="${focus_identifier.hour}"]`;
        if (focus_identifier.minute) selector += `[data-minute="${focus_identifier.minute}"]`;
        if (focus_identifier.second) selector += `[data-second="${focus_identifier.second}"]`;
        if (focus_identifier.period) selector += `[data-period="${focus_identifier.period}"]`;
        if (focus_identifier.rangeTarget) selector += `[data-range-target="${focus_identifier.rangeTarget}"]`;
        const element_to_focus = this.panel_element.querySelector(selector);
        element_to_focus == null ? void 0 : element_to_focus.focus();
      }
      if (this.is_open) {
        this.position_panel();
      }
    }
  };

  // src/core/picker_manager.js
  var data_attribute_prefix = "data-mangopicker-";
  function is_html_element2(target_value) {
    return typeof HTMLElement !== "undefined" && target_value instanceof HTMLElement;
  }
  function get_mangopicker_role(element) {
    return element.dataset.mangopickerRole || "";
  }
  function resolve_target_elements(selector_value) {
    if (!selector_value) {
      return [];
    }
    if (typeof selector_value === "string") {
      return [...document.querySelectorAll(selector_value)].filter(
        (element) => get_mangopicker_role(element) !== "display"
      );
    }
    if (is_html_element2(selector_value)) {
      return [selector_value];
    }
    if (Array.isArray(selector_value)) {
      return selector_value.filter(is_html_element2);
    }
    if (typeof NodeList !== "undefined" && selector_value instanceof NodeList) {
      return [...selector_value].filter(is_html_element2);
    }
    return [];
  }
  function get_global_object() {
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof globalThis !== "undefined") {
      return globalThis;
    }
    return null;
  }
  function resolve_global_function(function_name) {
    if (!function_name) {
      return null;
    }
    const global_object = get_global_object();
    if (!global_object) {
      return null;
    }
    return String(function_name).split(".").reduce((current_value, key_name) => current_value ? current_value[key_name] : null, global_object);
  }
  function parse_boolean(value) {
    const normalized_value = String(value).toLowerCase();
    if (normalized_value === "" || normalized_value === "true" || normalized_value === "1" || normalized_value === "yes" || normalized_value === "on") {
      return true;
    }
    if (normalized_value === "false" || normalized_value === "0" || normalized_value === "no" || normalized_value === "off") {
      return false;
    }
    return Boolean(value);
  }
  function parse_number(value) {
    const parsed_value = Number(value);
    return Number.isNaN(parsed_value) ? null : parsed_value;
  }
  function parse_json_or_list(value) {
    const normalized_value = String(value || "").trim();
    if (!normalized_value) {
      return [];
    }
    if (normalized_value.startsWith("[") || normalized_value.startsWith("{")) {
      try {
        const parsed_value = JSON.parse(normalized_value);
        return Array.isArray(parsed_value) ? parsed_value : [parsed_value];
      } catch (error) {
        return [];
      }
    }
    return normalized_value.split(",").map((item_value) => item_value.trim()).filter(Boolean);
  }
  function parse_number_list(value) {
    return parse_json_or_list(value).map((item_value) => Number(item_value)).filter((item_value) => !Number.isNaN(item_value));
  }
  function normalize_data_option_name(attribute_name) {
    return attribute_name.replace(/^data-mangopicker-/, "").replace(/-/g, "_");
  }
  function read_data_options(element) {
    const boolean_options = /* @__PURE__ */ new Set([
      "buddha",
      "buddha_input",
      "range",
      "range_time",
      "multiple",
      "inline",
      "lazy_render",
      "time_12h",
      "close_on_select",
      "readonly_input",
      "allow_clear",
      "show_reset_button",
      "show_today_button",
      "disable_past",
      "swipe_navigation",
      "keyboard_navigation"
    ]);
    const number_options = /* @__PURE__ */ new Set([
      "hour_step",
      "minute_step",
      "second_step",
      "z_index",
      "default_hour",
      "default_minute",
      "default_second",
      "week_start",
      "min_range_days",
      "max_range_days"
    ]);
    const list_options = /* @__PURE__ */ new Set(["enabled_dates", "disabled_dates", "enabled_ranges", "disabled_ranges"]);
    const function_options = /* @__PURE__ */ new Set(["enabled_date", "disabled_date", "render_cell_date", "on_open", "on_close", "on_select", "on_change"]);
    const ignored_options = /* @__PURE__ */ new Set(["ready", "role"]);
    const data_options = {};
    [...element.attributes].forEach((attribute_item) => {
      if (!attribute_item.name.startsWith(data_attribute_prefix)) {
        return;
      }
      const option_name = normalize_data_option_name(attribute_item.name);
      if (!option_name || ignored_options.has(option_name)) {
        return;
      }
      const option_value = attribute_item.value;
      if (boolean_options.has(option_name)) {
        data_options[option_name] = parse_boolean(option_value);
        return;
      }
      if (number_options.has(option_name)) {
        const parsed_value = parse_number(option_value);
        if (parsed_value !== null) {
          data_options[option_name] = parsed_value;
        }
        return;
      }
      if (option_name === "disabled_weekdays") {
        data_options[option_name] = parse_number_list(option_value);
        return;
      }
      if (list_options.has(option_name)) {
        data_options[option_name] = parse_json_or_list(option_value);
        return;
      }
      if (function_options.has(option_name)) {
        const resolved_function = resolve_global_function(option_value);
        if (typeof resolved_function === "function") {
          data_options[option_name] = resolved_function;
        }
        return;
      }
      data_options[option_name] = option_value;
    });
    return data_options;
  }
  function create_manager_api(instances) {
    var _a;
    return {
      instances,
      count: instances.length,
      element: ((_a = instances[0]) == null ? void 0 : _a.source_input) || null,
      get_instance(index = 0) {
        return instances[index] || null;
      },
      open(index = 0) {
        var _a2;
        (_a2 = instances[index]) == null ? void 0 : _a2.open();
        return this;
      },
      close(index = 0) {
        var _a2;
        (_a2 = instances[index]) == null ? void 0 : _a2.close();
        return this;
      },
      clear(index = 0) {
        var _a2;
        (_a2 = instances[index]) == null ? void 0 : _a2.clear_value("api");
        return this;
      },
      reset(index = 0) {
        var _a2;
        (_a2 = instances[index]) == null ? void 0 : _a2.reset_value("api");
        return this;
      },
      destroy() {
        instances.forEach((instance) => instance.destroy());
        return null;
      },
      get_value(index = 0) {
        var _a2, _b;
        return (_b = (_a2 = instances[index]) == null ? void 0 : _a2.get_value()) != null ? _b : null;
      },
      get_values(index = 0) {
        var _a2, _b;
        return (_b = (_a2 = instances[index]) == null ? void 0 : _a2.get_values()) != null ? _b : [];
      },
      set_value(next_value, index = 0) {
        var _a2;
        (_a2 = instances[index]) == null ? void 0 : _a2.set_value(next_value, "api");
        return this;
      },
      each(callback_function) {
        instances.forEach((instance, instance_index) => callback_function(instance, instance_index));
        return this;
      }
    };
  }
  function create_picker_manager(user_options = {}) {
    const target_elements = resolve_target_elements(user_options.selector || user_options.element || user_options.elements);
    const instances = target_elements.map((target_element) => {
      if (target_element.__mango_picker_instance__) {
        target_element.__mango_picker_instance__.destroy();
      }
      const data_options = read_data_options(target_element);
      const merged_options = { ...data_options, ...user_options };
      const instance = new MangoPickerInstance(target_element, merged_options);
      target_element.__mango_picker_instance__ = instance;
      return instance;
    });
    return create_manager_api(instances);
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

  // src/index.js
  register_language(en_default.code, en_default);
  sync_global_languages();
  function init(user_options = {}) {
    sync_global_languages();
    return create_picker_manager(user_options);
  }
  var version = "1.0.0";
  if (typeof window !== "undefined") {
    window.mangoPicker = {
      init,
      register_language,
      version
    };
  }
  return __toCommonJS(index_exports);
})();
