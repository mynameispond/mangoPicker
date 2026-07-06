import { MangoPickerInstance } from "./picker_instance.js";

const data_attribute_prefix = "data-mangopicker-";

function is_html_element(target_value) {
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

  if (is_html_element(selector_value)) {
    return [selector_value];
  }

  if (Array.isArray(selector_value)) {
    return selector_value.filter(is_html_element);
  }

  if (typeof NodeList !== "undefined" && selector_value instanceof NodeList) {
    return [...selector_value].filter(is_html_element);
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

  return String(function_name)
    .split(".")
    .reduce((current_value, key_name) => (current_value ? current_value[key_name] : null), global_object);
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

  return normalized_value
    .split(",")
    .map((item_value) => item_value.trim())
    .filter(Boolean);
}

function parse_number_list(value) {
  return parse_json_or_list(value)
    .map((item_value) => Number(item_value))
    .filter((item_value) => !Number.isNaN(item_value));
}

function normalize_data_option_name(attribute_name) {
  return attribute_name
    .replace(/^data-mangopicker-/, "")
    .replace(/-/g, "_");
}

function read_data_options(element) {
  const boolean_options = new Set([
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
  const number_options = new Set([
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
  const list_options = new Set(["enabled_dates", "disabled_dates", "enabled_ranges", "disabled_ranges"]);
  const function_options = new Set(["enabled_date", "disabled_date", "render_cell_date", "on_open", "on_close", "on_select", "on_change"]);
  const ignored_options = new Set(["ready", "role"]);
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
  return {
    instances,
    count: instances.length,
    element: instances[0]?.source_input || null,
    get_instance(index = 0) {
      return instances[index] || null;
    },
    open(index = 0) {
      instances[index]?.open();
      return this;
    },
    close(index = 0) {
      instances[index]?.close();
      return this;
    },
    clear(index = 0) {
      instances[index]?.clear_value("api");
      return this;
    },
    reset(index = 0) {
      instances[index]?.reset_value("api");
      return this;
    },
    destroy() {
      instances.forEach((instance) => instance.destroy());
      return null;
    },
    get_value(index = 0) {
      return instances[index]?.get_value() ?? null;
    },
    get_values(index = 0) {
      return instances[index]?.get_values() ?? [];
    },
    set_value(next_value, index = 0) {
      instances[index]?.set_value(next_value, "api");
      return this;
    },
    each(callback_function) {
      instances.forEach((instance, instance_index) => callback_function(instance, instance_index));
      return this;
    }
  };
}

export function create_picker_manager(user_options = {}) {
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
