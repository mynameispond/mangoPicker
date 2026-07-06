import {
  add_days,
  clone_date,
  compare_full_date,
  create_local_date,
  get_days_in_month,
  same_day,
  start_of_day
} from "./date_utils.js";
import { parse_any_date_value } from "./format.js";

function normalize_date_value(raw_value, fallback_format, options = {}) {
  const parsed_value = parse_any_date_value(raw_value, fallback_format, options);
  return parsed_value ? start_of_day(parsed_value) : null;
}

function normalize_date_list(date_list, fallback_format, options = {}) {
  return (date_list || [])
    .map((date_value) => normalize_date_value(date_value, fallback_format, options))
    .filter(Boolean);
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
  return (range_list || [])
    .map((range_value) => normalize_range_item(range_value, fallback_format, options))
    .filter(Boolean);
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

  const today_date = start_of_day(new Date());

  if (!configured_min_date || compare_full_date(today_date, configured_min_date) > 0) {
    return today_date;
  }

  return configured_min_date;
}

export function normalize_availability_rules(options, fallback_format) {
  return {
    min_date: get_effective_min_date(options, fallback_format),
    max_date: normalize_date_value(options.max_date, fallback_format, options),
    enabled_dates: normalize_date_list(options.enabled_dates || options.allowed_dates, fallback_format, options),
    disabled_dates: normalize_date_list(options.disabled_dates || options.closed_dates, fallback_format, options),
    enabled_ranges: normalize_range_list(options.enabled_ranges || options.allowed_ranges, fallback_format, options),
    disabled_ranges: normalize_range_list(options.disabled_ranges || options.closed_ranges, fallback_format, options),
    enabled_date: typeof (options.enabled_date || options.allowed_date) === "function" ? options.enabled_date || options.allowed_date : null,
    disabled_date: typeof (options.disabled_date || options.closed_date) === "function"
      ? options.disabled_date || options.closed_date
      : null,
    disabled_weekdays: [...(options.disabled_weekdays || [])]
  };
}

export function is_date_allowed(date_value, rules) {
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
    const is_enabled =
      matches_date_list(normalized_date, rules.enabled_dates) ||
      matches_range_list(normalized_date, rules.enabled_ranges) ||
      (typeof rules.enabled_date === "function" && rules.enabled_date(clone_date(date_value)) === true);

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

export function is_month_allowed(year_value, month_index, rules) {
  const total_days = get_days_in_month(year_value, month_index);

  for (let day_value = 1; day_value <= total_days; day_value += 1) {
    const candidate_date = create_local_date(year_value, month_index, day_value);

    if (is_date_allowed(candidate_date, rules)) {
      return true;
    }
  }

  return false;
}

export function is_year_allowed(year_value, rules) {
  for (let month_index = 0; month_index < 12; month_index += 1) {
    if (is_month_allowed(year_value, month_index, rules)) {
      return true;
    }
  }

  return false;
}

export function find_first_available_date(reference_date, step_direction, rules, max_steps = 400) {
  let candidate_date = start_of_day(reference_date);

  for (let step_index = 0; step_index < max_steps; step_index += 1) {
    if (is_date_allowed(candidate_date, rules)) {
      return candidate_date;
    }

    candidate_date = add_days(candidate_date, step_direction);
  }

  return null;
}
