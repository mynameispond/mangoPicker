import { find_first_available_date, is_date_allowed, is_month_allowed, is_year_allowed, normalize_availability_rules } from "./availability.js";
import { add_days, add_months, add_years, clone_date, compare_full_date, create_local_date, get_days_in_month, is_valid_date_object, pad_number, reorder_list_by_start, same_day, same_month, same_year, sort_dates, start_of_month } from "./date_utils.js";
import { default_options } from "./defaults.js";
import { analyze_format, format_date_value, parse_any_date_value, parse_value_by_format, split_multiple_values, split_range_values } from "./format.js";
import { resolve_language } from "./language_registry.js";

let instance_counter = 0;
const open_instances = new Set();

function create_custom_event(event_name, detail) {
  if (typeof CustomEvent === "function") {
    return new CustomEvent(event_name, { bubbles: true, detail });
  }

  return null;
}

function unique_dates_by_key(date_list, key_function) {
  const key_map = new Map();

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

export class MangoPickerInstance {
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
    this.view_date = new Date();
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
    const reference_date = this.selected_dates[0] || new Date();
    this.view_date = clone_date(reference_date) || new Date();
    this.sync_time_cursor_from_date(reference_date);
    this.reset_draft_state();
  }

  bind_events() {
    this.handle_input_open = () => {
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

    this.handle_window_refresh = () => {
      if (this.is_open) {
        this.position_panel();
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
  }

  create_panel_element() {
    const panel_element = document.createElement("div");
    panel_element.className = this.is_inline_mode() ? "mango-picker is-inline" : "mango-picker";
    panel_element.hidden = !this.is_inline_mode();
    panel_element.dataset.mangopickerId = this.instance_id;
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
    const parsed_dates = value_parts
      .map((value_part) => this.parse_input_candidate(value_part))
      .filter(Boolean);

    return this.normalize_selected_dates(parsed_dates);
  }

  parse_input_candidate(input_value) {
    if (is_valid_date_object(input_value)) {
      return clone_date(input_value);
    }

    const parsed_by_format = parse_value_by_format(input_value, this.options.format, {
      base_date: new Date(),
      buddha: this.options.buddha,
      default_hour: this.options.default_hour,
      default_minute: this.options.default_minute,
      default_second: this.options.default_second
    });

    if (parsed_by_format) {
      return parsed_by_format;
    }

    return parse_any_date_value(input_value, this.options.format);
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

    this.selected_dates = [this.time_range_values.start, this.time_range_values.end]
      .map((date_value) => clone_date(date_value))
      .filter(Boolean);
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
    const safe_dates = next_dates
      .map((date_value) => clone_date(date_value))
      .filter(Boolean);

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
      return [this.time_range_values.start, this.time_range_values.end]
        .filter(Boolean)
        .map((date_value) => this.get_selection_key(date_value));
    }

    return this.selected_dates.map((date_value) => this.get_selection_key(date_value));
  }

  get_display_values() {
    if (this.is_time_range_mode()) {
      return [this.time_range_values.start, this.time_range_values.end]
        .filter(Boolean)
        .map((date_value) => this.get_display_value(date_value));
    }

    return this.selected_dates.map((date_value) => this.get_display_value(date_value));
  }

  set_value(next_value, source = "api") {
    let input_list = [];

    if (Array.isArray(next_value)) {
      input_list = next_value;
    } else if (typeof next_value === "string" && (this.options.multiple || this.has_range_selection())) {
      input_list = this.split_input_values(next_value);
    } else if (next_value !== null && next_value !== undefined && next_value !== "") {
      input_list = [next_value];
    }

    const parsed_dates = input_list
      .map((input_item) => this.parse_input_candidate(input_item))
      .filter(Boolean);

    this.selected_dates = this.normalize_selected_dates(parsed_dates);
    this.sync_time_range_values_from_selected_dates();
    this.range_hover_date = null;
    this.view_date = clone_date(this.selected_dates[this.selected_dates.length - 1]) || new Date();
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

    open_instances.forEach((instance) => {
      if (instance !== this) {
        instance.close();
      }
    });

    open_instances.add(this);
    this.is_open = true;
    this.language = resolve_language(this.options.language);
    this.rules = normalize_availability_rules(this.options, this.options.format);
    this.prepare_draft_state();
    this.panel_element.hidden = false;
    this.active_input.setAttribute("aria-expanded", "true");
    document.addEventListener("mousedown", this.handle_document_mouse_down);
    document.addEventListener("keydown", this.handle_document_keydown);
    window.addEventListener("resize", this.handle_window_refresh);
    window.addEventListener("scroll", this.handle_window_refresh, true);
    this.render();
    this.position_panel();
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
    this.panel_element.hidden = true;
    this.active_input.setAttribute("aria-expanded", "false");
    document.removeEventListener("mousedown", this.handle_document_mouse_down);
    document.removeEventListener("keydown", this.handle_document_keydown);
    window.removeEventListener("resize", this.handle_window_refresh);
    window.removeEventListener("scroll", this.handle_window_refresh, true);
    this.reset_draft_state();
    this.notify_close("close");
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

    if (this.display_input) {
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
    const picker_minimum_width = this.format_details.is_time_only
      ? this.is_time_range_mode()
        ? Math.max(420, time_panel_count * time_panel_width + (time_panel_count - 1) * 12)
        : Math.max(260, time_panel_count * time_panel_width)
      : this.format_details.has_time
        ? Math.max(380, 260 + time_column_count * 64)
        : 280;
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

    if (this.format_details.has_hour || (!this.format_details.has_minute && !this.format_details.has_second)) {
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
    const now_date = new Date();

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
      const now_date = new Date();
      return create_local_date(
        now_date.getFullYear(),
        now_date.getMonth(),
        now_date.getDate(),
        this.time_cursor_hour,
        this.time_cursor_minute,
        this.time_cursor_second
      );
    }

    const today_date = new Date();
    return (
      find_first_available_date(today_date, 1, this.rules) ||
      find_first_available_date(today_date, -1, this.rules) ||
      today_date
    );
  }

  compose_time_range_candidate(slot_name, overrides = {}) {
    const reference_date = this.get_time_range_reference_date(slot_name);

    return create_local_date(
      reference_date.getFullYear(),
      reference_date.getMonth(),
      reference_date.getDate(),
      overrides.hour ?? reference_date.getHours(),
      overrides.minute ?? reference_date.getMinutes(),
      overrides.second ?? reference_date.getSeconds()
    );
  }

  compose_candidate_date(overrides = {}) {
    const reference_date = this.draft_date || this.selected_dates[0] || this.view_date || new Date();
    let year_value = overrides.year ?? reference_date.getFullYear();
    let month_index = overrides.month ?? reference_date.getMonth();
    let day_value = overrides.day ?? reference_date.getDate();
    const hour_value = overrides.hour ?? this.time_cursor_hour;
    const minute_value = overrides.minute ?? this.time_cursor_minute;
    const second_value = overrides.second ?? this.time_cursor_second;

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
    const display_output = this.options.multiple || this.has_range_selection()
      ? display_values.join(this.get_output_separator())
      : display_values[0] || "";

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
    const custom_event = create_custom_event(event_name, detail);

    if (!custom_event) {
      return;
    }

    this.source_input.dispatchEvent(custom_event);

    if (this.display_input) {
      this.display_input.dispatchEvent(create_custom_event(event_name, detail));
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
    const button_list = [...this.panel_element.querySelectorAll(selector)];
    const current_index = button_list.indexOf(action_element);

    if (current_index < 0) {
      return;
    }

    const offset_map = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -column_count,
      ArrowDown: column_count,
      Home: -current_index,
      End: button_list.length - current_index - 1
    };
    const next_index = Math.max(0, Math.min(button_list.length - 1, current_index + (offset_map[key_name] || 0)));

    button_list[next_index]?.focus();
  }

  navigate_time_focus(action_element, key_name) {
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
      next_buttons[Math.min(current_button_index, next_buttons.length - 1)]?.focus();
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
      return this.normalize_selected_dates([this.selected_dates[0], normalized_candidate]);
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
    this.view_date = clone_date(this.selected_dates[this.selected_dates.length - 1]) || clone_date(this.view_date) || new Date();
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
    this.view_date = clone_date(normalized_candidate) || clone_date(this.view_date) || new Date();
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
      const candidate_date = this.compose_time_range_candidate(normalized_slot, { hour: hour_value });
      this.update_time_range_selection(normalized_slot, candidate_date, "time");
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
      const candidate_date = this.compose_time_range_candidate(normalized_slot, { minute: minute_value });
      this.update_time_range_selection(normalized_slot, candidate_date, "time");
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
      const candidate_date = this.compose_time_range_candidate(normalized_slot, { second: second_value });
      this.update_time_range_selection(normalized_slot, candidate_date, "time");
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
      const hour_12_value = slot_date.getHours() % 12;
      const hour_value = normalized_period === "PM" ? hour_12_value + 12 : hour_12_value;
      const candidate_date = this.compose_time_range_candidate(normalized_slot, { hour: hour_value });
      this.update_time_range_selection(normalized_slot, candidate_date, "time");
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
    const now_date = new Date();

    if (this.is_time_range_mode()) {
      const normalized_slot = this.get_time_range_slot_name(slot_name || this.time_range_active_slot);
      const candidate_date = this.compose_time_range_candidate(normalized_slot, {
        hour: now_date.getHours(),
        minute: now_date.getMinutes(),
        second: now_date.getSeconds()
      });
      this.update_time_range_selection(normalized_slot, candidate_date, "today");
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
      candidate_date =
        find_first_available_date(candidate_date, 1, this.rules) ||
        find_first_available_date(candidate_date, -1, this.rules) ||
        candidate_date;
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
      return ((option_week_start % 7) + 7) % 7;
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

      if (rendered_markup === null || rendered_markup === undefined || rendered_markup === false) {
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
    const weekday_headers = reorder_list_by_start(this.language.weekdays_short, week_start)
      .map((weekday_label) => `<div class="mango-picker__weekday" role="columnheader">${weekday_label}</div>`)
      .join("");

    const day_cells = [];

    for (let cell_index = 0; cell_index < 42; cell_index += 1) {
      const current_date = add_days(grid_start, cell_index);
      const current_date_class_name = `mango-picker-${format_date_value(current_date, "Y-m-d")}`;
      const is_other_month = current_date.getMonth() !== this.view_date.getMonth();
      const is_selected = this.is_highlighted_day(current_date);
      const is_today = same_day(current_date, new Date());
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
      const cell_content = this.get_day_cell_content_markup({
        date: current_date,
        day: current_date.getDate(),
        month: current_date.getMonth() + 1,
        month_index: current_date.getMonth(),
        year: current_date.getFullYear(),
        is_today,
        is_selected,
        is_other_month,
        is_disabled,
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
        is_disabled ? "is-disabled" : ""
      ]
        .filter(Boolean)
        .join(" ");

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
          ${is_disabled ? 'aria-disabled="true"' : ""}
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
    const month_buttons = this.language.months_short
      .map((month_label, month_index) => {
        const candidate_date = create_local_date(this.view_date.getFullYear(), month_index, 1, this.time_cursor_hour, this.time_cursor_minute, this.time_cursor_second);
        const is_selected = this.is_highlighted_month(candidate_date);
        const is_disabled = !is_month_allowed(this.view_date.getFullYear(), month_index, this.rules);
        const class_names = ["mango-picker__tile", is_selected ? "is-selected" : "", is_disabled ? "is-disabled" : ""]
          .filter(Boolean)
          .join(" ");

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
      })
      .join("");

    return `<div class="mango-picker__tiles">${month_buttons}</div>`;
  }

  get_year_view_markup() {
    const start_year = Math.floor(this.view_date.getFullYear() / 12) * 12;
    const year_buttons = Array.from({ length: 12 }, (_, year_offset) => start_year + year_offset)
      .map((year_value) => {
        const is_selected = this.is_highlighted_year(year_value);
        const is_disabled = !is_year_allowed(year_value, this.rules);
        const class_names = ["mango-picker__tile", is_selected ? "is-selected" : "", is_disabled ? "is-disabled" : ""]
          .filter(Boolean)
          .join(" ");

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
      })
      .join("");

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

      return hour_12_options.map((hour_value) => (hour_value === 12 ? period_offset : period_offset + hour_value));
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
    const hour_buttons = this.get_hour_options(selected_hour)
      .map((hour_value) => {
        const class_names = ["mango-picker__time-option", selected_hour === hour_value ? "is-selected" : ""]
          .filter(Boolean)
          .join(" ");

        return `
          <button type="button" class="${class_names}" data-action="select-hour" data-hour="${hour_value}" aria-selected="${selected_hour === hour_value ? "true" : "false"}"${range_target_attribute}>
            ${this.get_hour_label(hour_value)}
          </button>
        `;
      })
      .join("");

    const minute_buttons = this.get_minute_options(selected_minute)
      .map((minute_value) => {
        const class_names = ["mango-picker__time-option", selected_minute === minute_value ? "is-selected" : ""]
          .filter(Boolean)
          .join(" ");

        return `
          <button type="button" class="${class_names}" data-action="select-minute" data-minute="${minute_value}" aria-selected="${selected_minute === minute_value ? "true" : "false"}"${range_target_attribute}>
            ${pad_number(minute_value)}
          </button>
        `;
      })
      .join("");

    const time_columns = [];

    if (this.format_details.has_hour || (!this.format_details.has_minute && !this.format_details.has_second)) {
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
      const second_buttons = this.get_second_options(selected_second)
        .map((second_value) => {
          const class_names = ["mango-picker__time-option", selected_second === second_value ? "is-selected" : ""]
            .filter(Boolean)
            .join(" ");

          return `
            <button type="button" class="${class_names}" data-action="select-second" data-second="${second_value}" aria-selected="${selected_second === second_value ? "true" : "false"}"${range_target_attribute}>
              ${pad_number(second_value)}
            </button>
          `;
        })
        .join("");

      time_columns.push(`
        <div class="mango-picker__time-column">
          <div class="mango-picker__time-label">SS</div>
          <div class="mango-picker__time-list">${second_buttons}</div>
        </div>
      `);
    }

    if (this.uses_12_hour_clock()) {
      const meridiem_buttons = ["AM", "PM"]
        .map((period_value) => {
          const is_selected = period_value === (selected_hour >= 12 ? "PM" : "AM");
          const class_names = ["mango-picker__time-option", is_selected ? "is-selected" : ""]
            .filter(Boolean)
            .join(" ");

          return `
            <button type="button" class="${class_names}" data-action="select-meridiem" data-period="${period_value}" aria-selected="${is_selected ? "true" : "false"}"${range_target_attribute}>
              ${this.get_meridiem_label(period_value)}
            </button>
          `;
        })
        .join("");

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
      const chips_markup = preview_values
        .map((preview_value) => `<span class="mango-picker__chip">${preview_value}</span>`)
        .join("");

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
      const preview_value = preview_values.length ? preview_values.join(this.options.range_separator) : this.language.labels.nothing_selected;

      return `
        <div class="mango-picker__summary">
          <div class="mango-picker__summary-title">${this.language.labels.selected}</div>
          <div class="mango-picker__summary-value">${preview_value}</div>
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
    this.panel_element.innerHTML = `
      <div class="mango-picker__surface">
        ${this.get_header_markup()}
        <div class="mango-picker__body">${this.get_body_markup()}</div>
        ${this.get_footer_markup()}
      </div>
    `;

    if (this.is_open) {
      this.position_panel();
    }
  }
}
