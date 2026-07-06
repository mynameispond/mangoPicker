import { clone_date, create_local_date, is_valid_date_object, pad_number } from "./date_utils.js";

const token_definitions = {
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
      parts.year = 2000 + Number(value);
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

export function analyze_format(format_string) {
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

export function parse_value_by_format(raw_value, format_string, options = {}) {
  if (raw_value === null || raw_value === undefined || raw_value === "") {
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

    if (group_value !== undefined) {
      token_definition.apply(date_parts, group_value);
    }
  });

  const base_date = clone_date(options.base_date) || new Date();
  let year_value = date_parts.year ?? base_date.getFullYear();
  let month_index = date_parts.month_index ?? base_date.getMonth();
  let day_value = date_parts.day ?? base_date.getDate();
  let hour_value = date_parts.hour ?? options.default_hour ?? 0;

  if (options.buddha && date_parts.year !== undefined) {
    if (year_value >= 2400) {
      year_value -= 543;
    } else {
      year_value -= 43;
    }
  }

  if (date_parts.hour_12 !== undefined) {
    hour_value = date_parts.hour_12;

    if (date_parts.meridiem) {
      hour_value = date_parts.hour_12 % 12;

      if (date_parts.meridiem === "PM") {
        hour_value += 12;
      }
    }
  }

  const minute_value = date_parts.minute ?? options.default_minute ?? 0;
  const second_value = date_parts.second ?? options.default_second ?? 0;

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

export function format_date_value(date_value, format_string, options = {}) {
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
    A: () => (date_value.getHours() >= 12 ? "PM" : "AM"),
    a: () => (date_value.getHours() >= 12 ? "pm" : "am")
  };

  return [...format_string]
    .map((format_token) => {
      if (token_renderers[format_token]) {
        return token_renderers[format_token]();
      }

      return format_token;
    })
    .join("");
}

export function split_multiple_values(raw_value, separator) {
  if (raw_value === null || raw_value === undefined || raw_value === "") {
    return [];
  }

  const safe_separator = separator || ",";

  return String(raw_value)
    .split(safe_separator)
    .map((value_part) => value_part.trim())
    .filter(Boolean);
}

export function split_range_values(raw_value, separator) {
  if (raw_value === null || raw_value === undefined || raw_value === "") {
    return [];
  }

  const safe_separator = separator || " - ";
  const normalized_value = String(raw_value).trim();

  if (!normalized_value.includes(safe_separator)) {
    return normalized_value ? [normalized_value] : [];
  }

  return normalized_value
    .split(safe_separator)
    .map((value_part) => value_part.trim())
    .filter(Boolean)
    .slice(0, 2);
}

export function parse_any_date_value(raw_value, fallback_format = "Y-m-d", options = {}) {
  if (raw_value === null || raw_value === undefined || raw_value === "") {
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
