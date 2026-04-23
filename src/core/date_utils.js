export function is_valid_date_object(date_value) {
  return date_value instanceof Date && !Number.isNaN(date_value.getTime());
}

export function clone_date(date_value) {
  if (!is_valid_date_object(date_value)) {
    return null;
  }

  return new Date(date_value.getTime());
}

export function create_local_date(year_value, month_index, day_value, hour_value = 0, minute_value = 0, second_value = 0) {
  return new Date(year_value, month_index, day_value, hour_value, minute_value, second_value, 0);
}

export function start_of_day(date_value) {
  const normalized_date = clone_date(date_value);

  if (!normalized_date) {
    return null;
  }

  normalized_date.setHours(0, 0, 0, 0);
  return normalized_date;
}

export function start_of_month(date_value) {
  const normalized_date = start_of_day(date_value);

  if (!normalized_date) {
    return null;
  }

  normalized_date.setDate(1);
  return normalized_date;
}

export function end_of_month(date_value) {
  const normalized_date = start_of_month(date_value);

  if (!normalized_date) {
    return null;
  }

  normalized_date.setMonth(normalized_date.getMonth() + 1, 0);
  normalized_date.setHours(23, 59, 59, 999);
  return normalized_date;
}

export function start_of_year(date_value) {
  const normalized_date = start_of_day(date_value);

  if (!normalized_date) {
    return null;
  }

  normalized_date.setMonth(0, 1);
  return normalized_date;
}

export function end_of_year(date_value) {
  const normalized_date = start_of_year(date_value);

  if (!normalized_date) {
    return null;
  }

  normalized_date.setFullYear(normalized_date.getFullYear() + 1, 0, 0);
  normalized_date.setHours(23, 59, 59, 999);
  return normalized_date;
}

export function get_days_in_month(year_value, month_index) {
  return new Date(year_value, month_index + 1, 0).getDate();
}

export function add_days(date_value, amount) {
  const normalized_date = clone_date(date_value);

  if (!normalized_date) {
    return null;
  }

  normalized_date.setDate(normalized_date.getDate() + amount);
  return normalized_date;
}

export function add_months(date_value, amount) {
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

export function add_years(date_value, amount) {
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

export function compare_full_date(left_date, right_date) {
  return start_of_day(left_date).getTime() - start_of_day(right_date).getTime();
}

export function compare_month(left_date, right_date) {
  const left_key = left_date.getFullYear() * 12 + left_date.getMonth();
  const right_key = right_date.getFullYear() * 12 + right_date.getMonth();
  return left_key - right_key;
}

export function compare_year(left_date, right_date) {
  return left_date.getFullYear() - right_date.getFullYear();
}

export function same_day(left_date, right_date) {
  return compare_full_date(left_date, right_date) === 0;
}

export function same_month(left_date, right_date) {
  return compare_month(left_date, right_date) === 0;
}

export function same_year(left_date, right_date) {
  return compare_year(left_date, right_date) === 0;
}

export function sort_dates(date_list) {
  return [...date_list].sort((left_date, right_date) => left_date.getTime() - right_date.getTime());
}

export function pad_number(number_value, length = 2) {
  return String(number_value).padStart(length, "0");
}

export function reorder_list_by_start(item_list, start_index) {
  const safe_index = ((start_index % item_list.length) + item_list.length) % item_list.length;
  return [...item_list.slice(safe_index), ...item_list.slice(0, safe_index)];
}
