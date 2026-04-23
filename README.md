# mangoPicker

`mangoPicker` คือ Date Time Picker แบบ vanilla JS/CSS ที่เอาไปใช้กับหน้าเว็บได้ง่าย ไม่ต้องพึ่ง framework และใช้ไฟล์ build จากโฟลเดอร์ `dist/` ได้ทันที

เหมาะกับฟอร์มที่ต้องเลือกวันที่ เวลา ช่วงวันที่ หลายวัน เดือน ปี หรือแสดงปีแบบ พ.ศ. ให้ผู้ใช้เห็น แต่ยังเก็บค่าใน input เป็น ค.ศ. เพื่อส่งเข้า backend ได้ตรงไปตรงมา

## สิ่งที่ทำได้

- เลือกวันเดียว, ช่วงวันที่, หรือหลายวัน
- เลือกเฉพาะเดือน/ปี เช่น `Y-m` หรือ `Y`
- เลือกเวลาแบบชั่วโมง/นาที/วินาที เช่น `H:i`, `H:i:s`
- ใช้เวลาแบบ 24 ชั่วโมง หรือ 12 ชั่วโมงพร้อม `AM/PM`
- เลือกช่วงเวลาได้ด้วย `range: true` เมื่อใช้ format เฉพาะเวลา
- จำกัดวันที่ด้วย `min_date`, `max_date`, `disable_past`
- ปิดวันที่เป็นรายการ, ปิดเป็นช่วง, ปิดวันในสัปดาห์ หรือใช้ function กำหนด rule เอง
- แสดงปี พ.ศ. ด้วย `buddha: true` แต่ค่าใน input เดิมยังเป็น ค.ศ.
- ตั้งวันแรกของสัปดาห์ได้ เช่น อาทิตย์หรือจันทร์
- ใช้งานแบบ popup/dropdown หรือ inline
- รองรับ keyboard, touch/swipe, ARIA attributes และ lazy render
- รองรับ input `type="text"` และ native input เช่น `date`, `time`, `datetime-local`, `month`
- ตั้งค่า option ผ่าน HTML ได้ด้วย `data-mangopicker-*` เช่น `data-mangopicker-format="Y-m-d"`

## ไฟล์ที่ต้องใช้

ถ้าใช้จากโฟลเดอร์ `dist/` ให้แนบอย่างน้อย 2 ไฟล์นี้

```html
<link rel="stylesheet" href="./dist/mangopicker.css" />
<script src="./dist/mangopicker.js"></script>
```

ถ้าต้องการภาษาไทย ให้เพิ่มไฟล์ภาษาไทยหลังไฟล์หลัก

```html
<script src="./dist/i18n/th.js"></script>
```

## เริ่มใช้งานเร็วที่สุด

สร้าง input ก่อน

```html
<input type="text" class="appointment-date" name="appointment_date" />
```

แล้วเรียก `window.mangoPicker.init(...)`

```html
<script>
  window.mangoPicker.init({
    selector: ".appointment-date",
    language: "th",
    format: "Y-m-d"
  });
</script>
```

ค่าที่ถูกเก็บใน input จะเป็น string ตาม `format` ที่กำหนด เช่น `2026-04-23`

## เริ่มด้วย Data Attributes

ถ้าอยากให้ config อยู่ใน HTML ให้ใส่ `data-mangopicker-*` ที่ input ได้เลย แล้ว JavaScript เหลือแค่ `selector`

```html
<input
  type="text"
  class="booking-date"
  name="booking_date"
  data-mangopicker-language="th"
  data-mangopicker-format="Y-m-d"
  data-mangopicker-buddha="true"
  data-mangopicker-disable-past="true"
/>

<script>
  window.mangoPicker.init({
    selector: ".booking-date"
  });
</script>
```

ดูรายการ attribute ทั้งหมดได้ที่หัวข้อ [Data Attributes](#data-attributes)

## ตัวอย่างที่ใช้บ่อย

### เลือกวันและเวลา

```js
window.mangoPicker.init({
  selector: ".start-at",
  language: "th",
  format: "Y-m-d H:i"
});
```

### แสดงปี พ.ศ. แต่เก็บค่า ค.ศ.

```js
window.mangoPicker.init({
  selector: ".birthday",
  language: "th",
  format: "Y-m-d",
  buddha: true
});
```

เมื่อเปิด `buddha: true` ผู้ใช้จะเห็นปีแบบ พ.ศ. เช่น `2569-04-23` แต่ input เดิมจะเก็บค่าแบบ ค.ศ. เช่น `2026-04-23`

### เลือกช่วงวันที่

```js
window.mangoPicker.init({
  selector: ".travel-range",
  language: "th",
  format: "Y-m-d",
  range: true,
  range_separator: " ถึง "
});
```

### เลือกหลายวัน

```js
window.mangoPicker.init({
  selector: ".leave-dates",
  language: "th",
  format: "Y-m-d",
  multiple: true,
  multiple_separator: " | "
});
```

### เลือกเฉพาะเวลาและกำหนด step

```js
window.mangoPicker.init({
  selector: ".open-time",
  format: "H:i",
  hour_step: 1,
  minute_step: 15
});
```

### เลือกเวลาแบบ 12 ชั่วโมงพร้อมวินาที

```js
window.mangoPicker.init({
  selector: ".service-time",
  format: "h:i:s A",
  minute_step: 15,
  second_step: 10
});
```

### เลือกช่วงเวลา

```js
window.mangoPicker.init({
  selector: ".working-hours",
  format: "H:i",
  range: true,
  range_separator: " - ",
  minute_step: 30
});
```

### เลือกเฉพาะเดือนหรือปี

```js
window.mangoPicker.init({
  selector: ".billing-month",
  language: "th",
  format: "Y-m"
});

window.mangoPicker.init({
  selector: ".fiscal-year",
  language: "th",
  format: "Y"
});
```

### จำกัดวันที่และปิดวันเสาร์อาทิตย์

```js
window.mangoPicker.init({
  selector: ".service-date",
  language: "th",
  format: "Y-m-d",
  min_date: "2026-01-01",
  max_date: "2026-12-31",
  disabled_weekdays: [0, 6]
});
```

### ปิดวันที่ผ่านมา

```js
window.mangoPicker.init({
  selector: ".future-date",
  language: "th",
  format: "Y-m-d",
  disable_past: true
});
```

### ปิด/เปิดบางวันที่ด้วย rule

```js
window.mangoPicker.init({
  selector: ".special-booking",
  language: "th",
  format: "Y-m-d",
  enabled_ranges: [
    { start: "2026-04-01", end: "2026-04-30" },
    { start: "2026-06-01", end: "2026-06-15" }
  ],
  disabled_dates: ["2026-04-13", "2026-04-14", "2026-04-15"],
  disabled_ranges: [
    { start: "2026-04-20", end: "2026-04-22" }
  ]
});
```

### ใช้ function เป็น business rule

```js
window.mangoPicker.init({
  selector: ".delivery-cycle",
  language: "th",
  format: "Y-m-d",
  enabled_date: function (candidate_date) {
    return candidate_date.getDate() % 2 === 0;
  },
  disabled_date: function (candidate_date) {
    return candidate_date.getDay() === 3;
  }
});
```

### แสดง inline แทน popup

```js
window.mangoPicker.init({
  selector: ".inline-date",
  language: "th",
  format: "Y-m-d",
  inline: true
});
```

### ใช้ native input

ถ้าไม่กำหนด `format` เอง library จะเดา format จาก type ของ input ให้

```html
<input type="date" class="native-date" />
<input type="time" class="native-time" step="1" />
<input type="datetime-local" class="native-datetime" />
<input type="month" class="native-month" />
```

```js
window.mangoPicker.init({
  selector: ".native-date, .native-time, .native-datetime, .native-month",
  language: "th"
});
```

## Data Attributes

ถ้าอยากให้ HTML อ่านง่ายและไม่ต้องใส่ option ทุกอย่างใน JavaScript สามารถตั้งค่าผ่าน `data-mangopicker-*` ได้

```html
<input
  type="text"
  class="booking-date"
  name="booking_date"
  data-mangopicker-language="th"
  data-mangopicker-format="Y-m-d"
  data-mangopicker-buddha="true"
  data-mangopicker-disable-past="true"
  data-mangopicker-week-start="1"
/>

<script>
  window.mangoPicker.init({
    selector: ".booking-date"
  });
</script>
```

ถ้าตั้งค่าซ้ำกัน ค่าใน JavaScript จะชนะค่าใน data attribute เช่น `init({ format: "Y-m-d H:i" })` จะ override `data-mangopicker-format`

### Data Attributes ที่รองรับ

| Data attribute | Option ที่ได้ | ตัวอย่าง |
| --- | --- | --- |
| `data-mangopicker-language` | `language` | `th` |
| `data-mangopicker-format` | `format` | `Y-m-d H:i` |
| `data-mangopicker-buddha` | `buddha` | `true` |
| `data-mangopicker-range` | `range` | `true` |
| `data-mangopicker-range-separator` | `range_separator` | ` ถึง ` |
| `data-mangopicker-multiple` | `multiple` | `true` |
| `data-mangopicker-multiple-separator` | `multiple_separator` | ` \| ` |
| `data-mangopicker-inline` | `inline` | `true` |
| `data-mangopicker-mode` | `mode` | `inline` |
| `data-mangopicker-inline-container` | `inline_container` | `#calendar-host` |
| `data-mangopicker-lazy-render` | `lazy_render` | `true` |
| `data-mangopicker-hour-step` | `hour_step` | `2` |
| `data-mangopicker-minute-step` | `minute_step` | `15` |
| `data-mangopicker-second-step` | `second_step` | `10` |
| `data-mangopicker-time-12h` | `time_12h` | `true` |
| `data-mangopicker-close-on-select` | `close_on_select` | `false` |
| `data-mangopicker-readonly-input` | `readonly_input` | `true` |
| `data-mangopicker-allow-clear` | `allow_clear` | `true` |
| `data-mangopicker-show-reset-button` | `show_reset_button` | `true` |
| `data-mangopicker-show-today-button` | `show_today_button` | `true` |
| `data-mangopicker-reset-label` | `reset_label` | `เริ่มใหม่` |
| `data-mangopicker-z-index` | `z_index` | `3000` |
| `data-mangopicker-default-hour` | `default_hour` | `9` |
| `data-mangopicker-default-minute` | `default_minute` | `30` |
| `data-mangopicker-default-second` | `default_second` | `0` |
| `data-mangopicker-week-start` | `week_start` | `1` |
| `data-mangopicker-disable-past` | `disable_past` | `true` |
| `data-mangopicker-swipe-navigation` | `swipe_navigation` | `true` |
| `data-mangopicker-keyboard-navigation` | `keyboard_navigation` | `true` |
| `data-mangopicker-min-date` | `min_date` | `2026-01-01` |
| `data-mangopicker-max-date` | `max_date` | `2026-12-31` |
| `data-mangopicker-enabled-dates` | `enabled_dates` | `2026-04-01,2026-04-02` |
| `data-mangopicker-disabled-dates` | `disabled_dates` | `2026-04-13,2026-04-14` |
| `data-mangopicker-enabled-ranges` | `enabled_ranges` | `[{"start":"2026-04-01","end":"2026-04-30"}]` |
| `data-mangopicker-disabled-ranges` | `disabled_ranges` | `[{"start":"2026-04-20","end":"2026-04-22"}]` |
| `data-mangopicker-disabled-weekdays` | `disabled_weekdays` | `0,6` |
| `data-mangopicker-enabled-date` | `enabled_date` | `windowFunctionName` |
| `data-mangopicker-disabled-date` | `disabled_date` | `windowFunctionName` |
| `data-mangopicker-on-open` | `on_open` | `windowFunctionName` |
| `data-mangopicker-on-close` | `on_close` | `windowFunctionName` |
| `data-mangopicker-on-select` | `on_select` | `windowFunctionName` |
| `data-mangopicker-on-change` | `on_change` | `windowFunctionName` |

ค่าสำหรับ list ใส่ได้ 2 แบบ

```html
<!-- comma-separated -->
<input data-mangopicker-disabled-dates="2026-04-13,2026-04-14" />

<!-- JSON -->
<input data-mangopicker-disabled-ranges='[{"start":"2026-04-20","end":"2026-04-22"}]' />
```

## Callback และ Function Options

callback ใช้สำหรับรับ event หลังผู้ใช้ทำอะไรบางอย่างกับ picker ส่วน function options ใช้เขียน rule ของวันที่ที่เลือกได้หรือเลือกไม่ได้

### Callback Options

| Callback | เรียกเมื่อไหร่ | หมายถึงอะไร | ตัวอย่าง |
| --- | --- | --- | --- |
| `on_open(detail)` | picker ถูกเปิด | ใช้รู้ว่าผู้ใช้เริ่มเปิด picker แล้ว | `on_open: function (detail) { console.log(detail.value); }` |
| `on_close(detail)` | picker ถูกปิด | ใช้รู้ว่าผู้ใช้ออกจาก picker แล้ว | `on_close: function (detail) { console.log(detail.values); }` |
| `on_select(detail)` | ผู้ใช้เลือกวัน/เดือน/ปี/เวลา | ใช้ preview ค่าระหว่างเลือก โดยบางกรณีค่ายังไม่ถูก apply ลง input | `on_select: function (detail) { console.log(detail.display_value); }` |
| `on_change(detail)` | ค่าใน input เปลี่ยนจริง | ใช้ sync ฟอร์ม, validate, เรียก API หรือคำนวณต่อ | `on_change: function (detail) { console.log(detail.value); }` |

ตัวอย่างแบบ JavaScript

```js
window.mangoPicker.init({
  selector: ".booking-date",
  language: "th",
  format: "Y-m-d",
  on_change: function (detail) {
    console.log(detail.value);
    console.log(detail.dates);
  }
});
```

ตัวอย่างแบบ data attribute ต้องประกาศ function ไว้บน `window`

```html
<input
  type="text"
  class="booking-date"
  data-mangopicker-language="th"
  data-mangopicker-format="Y-m-d"
  data-mangopicker-on-change="handleBookingDateChange"
/>

<script>
  window.handleBookingDateChange = function (detail) {
    console.log(detail.value);
  };

  window.mangoPicker.init({
    selector: ".booking-date"
  });
</script>
```

### Function Options

| Function option | หมายถึงอะไร | ต้อง return | ตัวอย่าง |
| --- | --- | --- | --- |
| `enabled_date(candidate_date)` | กำหนด whitelist ของวันที่ที่อนุญาตให้เลือก | `true` เพื่ออนุญาตวันนั้น | `enabled_date: function (date) { return date.getDay() !== 0; }` |
| `disabled_date(candidate_date)` | กำหนด blacklist ของวันที่ที่ต้องปิดไม่ให้เลือก | `true` เพื่อปิดวันนั้น | `disabled_date: function (date) { return date.getDate() === 13; }` |

ถ้าใช้ทั้ง `enabled_date` และ `disabled_date` พร้อมกัน ระบบจะเช็ค enabled ก่อน แล้วค่อยเช็ค disabled อีกที

```js
window.mangoPicker.init({
  selector: ".delivery-date",
  language: "th",
  format: "Y-m-d",
  enabled_date: function (candidate_date) {
    return candidate_date.getDay() !== 0;
  },
  disabled_date: function (candidate_date) {
    return candidate_date.getDate() === 13;
  }
});
```

`candidate_date` คือ `Date` object จริง จึงใช้ method ของ JavaScript ได้ เช่น `getDay()`, `getDate()`, `getMonth()`, `getFullYear()`

## API หลัก

`init()` จะคืน manager object กลับมา ใช้สั่งงาน picker ได้

```js
var picker = window.mangoPicker.init({
  selector: ".example",
  language: "th",
  format: "Y-m-d"
});

picker.open();
picker.close();
picker.set_value("2026-04-23");
picker.get_value();
picker.get_values();
picker.clear();
picker.reset();
picker.destroy();
```

ถ้า selector เจอหลาย input ให้ระบุ index ได้

```js
picker.open(1);
picker.set_value("2026-04-23", 1);
picker.get_instance(1);
```

## Options

| Option | ค่าเริ่มต้น | หมายถึงอะไร | ตัวอย่าง |
| --- | --- | --- | --- |
| `selector` | `""` | selector, element, NodeList หรือ array ของ input ที่ต้องการผูก picker | `selector: ".appointment-date"` |
| `language` | `"en"` | รหัสภาษาที่ใช้แสดงเดือน วัน และปุ่ม | `language: "th"` |
| `format` | `"Y-m-d"` | รูปแบบค่าที่เก็บใน input ถ้าไม่กำหนดจะเดาจาก native input type | `format: "Y-m-d H:i"` |
| `buddha` | `false` | แสดงปีแบบ พ.ศ. แต่เก็บค่า input เป็น ค.ศ. | `buddha: true` |
| `range` | `false` | เลือกเป็นช่วง เช่น วันเริ่ม-วันสิ้นสุด หรือเวลาเริ่ม-เวลาสิ้นสุด | `range: true` |
| `range_separator` | `" - "` | ตัวคั่นค่าของ range ใน input | `range_separator: " ถึง "` |
| `multiple` | `false` | เลือกหลายค่าใน input เดียว | `multiple: true` |
| `multiple_separator` | `", "` | ตัวคั่นค่าของ multiple ใน input | `multiple_separator: " / "` |
| `inline` | `false` | แสดง picker แบบ inline แทน popup | `inline: true` |
| `mode` | `"popup"` | ใช้กำหนด mode โดยตรง | `mode: "inline"` |
| `inline_container` | `null` | selector หรือ element ที่ต้องการให้ inline picker ไปอยู่ข้างใน | `inline_container: "#calendar-host"` |
| `lazy_render` | `true` | ยังไม่สร้าง HTML ของ popup จนกว่าจะเปิดครั้งแรก | `lazy_render: false` |
| `hour_step` | `1` | ระยะห่างของรายการชั่วโมง | `hour_step: 2` |
| `minute_step` | `1` | ระยะห่างของรายการนาที | `minute_step: 15` |
| `second_step` | `1` | ระยะห่างของรายการวินาที | `second_step: 10` |
| `time_12h` | `false` | แสดง time panel เป็น 12 ชั่วโมงพร้อม AM/PM | `time_12h: true` |
| `close_on_select` | `true` | ปิด picker หลังเลือกค่าครบ | `close_on_select: false` |
| `readonly_input` | `true` | ตั้ง input เป็น readonly เพื่อบังคับเลือกผ่าน picker | `readonly_input: false` |
| `allow_clear` | `true` | แสดงปุ่มล้างค่า | `allow_clear: false` |
| `show_reset_button` | `false` | แสดงปุ่ม reset กลับไปค่าเริ่มต้น | `show_reset_button: true` |
| `show_today_button` | `true` | แสดงปุ่มวันนี้/ตอนนี้ | `show_today_button: false` |
| `reset_label` | `null` | ข้อความปุ่ม reset | `reset_label: "เริ่มใหม่"` |
| `z_index` | `3000` | z-index ของ popup | `z_index: 5000` |
| `default_hour` | `0` | ชั่วโมงเริ่มต้นเมื่อยังไม่มีค่า | `default_hour: 9` |
| `default_minute` | `0` | นาทีเริ่มต้นเมื่อยังไม่มีค่า | `default_minute: 30` |
| `default_second` | `0` | วินาทีเริ่มต้นเมื่อยังไม่มีค่า | `default_second: 0` |
| `week_start` | `null` | กำหนดวันแรกของสัปดาห์เอง เช่น `0` อาทิตย์, `1` จันทร์ | `week_start: 1` |
| `disable_past` | `false` | ปิดวันที่ก่อนวันนี้ | `disable_past: true` |
| `swipe_navigation` | `true` | ปัดซ้าย/ขวาบนมือถือเพื่อเปลี่ยนเดือนหรือปี | `swipe_navigation: false` |
| `keyboard_navigation` | `true` | ใช้ arrow keys, Enter, Esc ใน picker | `keyboard_navigation: false` |
| `min_date` | `null` | วันที่ต่ำสุดที่เลือกได้ | `min_date: "2026-01-01"` |
| `max_date` | `null` | วันที่สูงสุดที่เลือกได้ | `max_date: "2026-12-31"` |
| `enabled_dates` | `[]` | รายการวันที่อนุญาตให้เลือกเท่านั้น | `enabled_dates: ["2026-04-01"]` |
| `disabled_dates` | `[]` | รายการวันที่ปิดไม่ให้เลือก | `disabled_dates: ["2026-04-13"]` |
| `enabled_ranges` | `[]` | ช่วงวันที่อนุญาตให้เลือกเท่านั้น | `enabled_ranges: [{ start: "2026-04-01", end: "2026-04-30" }]` |
| `disabled_ranges` | `[]` | ช่วงวันที่ปิดไม่ให้เลือก | `disabled_ranges: [{ start: "2026-04-20", end: "2026-04-22" }]` |
| `enabled_date` | `null` | function whitelist วันที่ | `enabled_date: function (date) { return date.getDay() !== 0; }` |
| `disabled_date` | `null` | function blacklist วันที่ | `disabled_date: function (date) { return date.getDay() === 3; }` |
| `disabled_weekdays` | `[]` | ปิดวันในสัปดาห์ เช่น `[0, 6]` คืออาทิตย์และเสาร์ | `disabled_weekdays: [0, 6]` |
| `on_open` | `null` | callback ตอนเปิด picker | `on_open: function (detail) { console.log(detail.value); }` |
| `on_close` | `null` | callback ตอนปิด picker | `on_close: function (detail) { console.log(detail.value); }` |
| `on_select` | `null` | callback ตอนผู้ใช้เลือกค่า | `on_select: function (detail) { console.log(detail.display_value); }` |
| `on_change` | `null` | callback ตอนค่าใน input เปลี่ยน | `on_change: function (detail) { console.log(detail.value); }` |

## Format tokens

| Token | ความหมาย | ตัวอย่าง |
| --- | --- | --- |
| `Y` | ปี 4 หลัก | `2026` |
| `y` | ปี 2 หลัก | `26` |
| `m` | เดือน 2 หลัก | `04` |
| `n` | เดือน ไม่มี 0 นำหน้า | `4` |
| `d` | วัน 2 หลัก | `09` |
| `j` | วัน ไม่มี 0 นำหน้า | `9` |
| `H` | ชั่วโมง 24h มี 0 นำหน้า | `08`, `23` |
| `G` | ชั่วโมง 24h ไม่มี 0 นำหน้า | `8`, `23` |
| `h` | ชั่วโมง 12h มี 0 นำหน้า | `08`, `11` |
| `g` | ชั่วโมง 12h ไม่มี 0 นำหน้า | `8`, `11` |
| `i` | นาที | `30` |
| `s` | วินาที | `05` |
| `A` | AM/PM ตัวใหญ่ | `AM`, `PM` |
| `a` | am/pm ตัวเล็ก | `am`, `pm` |

ตัวอย่าง format ที่ใช้บ่อย

- `Y-m-d`
- `Y-m-d H:i`
- `Y-m-d H:i:s`
- `Y-m`
- `Y`
- `H:i`
- `H:i:s`
- `h:i A`
- `h:i:s A`

## Event detail

callback เช่น `on_open`, `on_select`, `on_change` จะได้รับ object ลักษณะนี้

```js
{
  value: "2026-04-23 14:30",
  values: ["2026-04-23 14:30"],
  display_value: "2569-04-23 14:30",
  display_values: ["2569-04-23 14:30"],
  dates: [Date],
  range_start: Date | null,
  range_end: Date | null,
  draft_date: Date | null,
  input: HTMLInputElement,
  display_input: HTMLInputElement | null,
  instance: MangoPickerInstance
}
```

## CSS class ของแต่ละวัน

day cell ทุกวันจะมี class ตามวันที่จริง เช่น

```html
<button class="mango-picker__cell mango-picker-2026-04-23">
```

จึงเขียน CSS หรือจับ element รายวันได้ง่าย

```css
.mango-picker-2026-04-23 {
  outline: 2px solid #dc3545;
}
```

class สำคัญที่ใช้กับวัน

- `is-today` และ `is-current-day` คือวันปัจจุบัน
- `is-selected` คือวันที่เลือก
- `is-in-range` คือวันที่อยู่ในช่วงที่เลือก
- `is-range-preview` คือช่วงวันที่ preview ตอน hover ระหว่างเลือก range
- `is-disabled` คือวันที่เลือกไม่ได้

## เพิ่มภาษาเอง

```js
window.mangoPicker.register_language("custom", {
  code: "custom",
  name: "Custom",
  week_start: 0,
  months: ["..."],
  months_short: ["..."],
  weekdays: ["..."],
  weekdays_short: ["..."],
  labels: {
    today: "Today",
    now: "Now",
    clear: "Clear",
    reset: "Reset",
    apply: "Apply",
    selected: "Selected",
    nothing_selected: "Nothing selected",
    time: "Time",
    multiple_count: "items selected"
  }
});
```

## Demo

เปิดไฟล์ `demo/index.html` เพื่อดูตัวอย่างแบบ live preview และกดปุ่ม `แสดงโค้ด` ในแต่ละการ์ดเพื่อดู snippet ที่คัดลอกไปใช้ต่อได้

## Build

```bash
npm install
npm run build
```

หลัง build จะได้ไฟล์พร้อมใช้งานใน `dist/`

## License

MIT

