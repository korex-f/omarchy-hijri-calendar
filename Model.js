// Pure date and format math for the clock widget and its calendar panel.
// Everything here is locale- and Qt-free so it can be unit tested under node
// (tests/model.test.js); the QML owns month/weekday naming through
// Qt.locale().

var MS_PER_DAY = 86400000

// Umm al-Qura Hijri conversion. The Umm al-Qura calendar is the official
// civil Islamic calendar of Saudi Arabia: month starts are set by observation
// and committee decision rather than by a fixed arithmetic rule, so the
// conversion is table-driven rather than computed. The table encodes the
// decisions for Hijri years 1318-1500 (Gregorian 1900-2076); dates outside
// that window return null and the widget shows the Gregorian label alone.
//
// The table is derived from data published by the King Abdulaziz City for
// Science and Technology (KACST) and distributed under MIT by Aric Camarata's
// hijri-core project. One entry per Hijri year, in order:
// [Gregorian year, month, day of 1 Muharram, 12-bit days-per-month mask].
// Bit i (from bit 0) corresponds to month i+1: 1 = 30 days, 0 = 29 days.
var HIJRI_MONTHS = ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Shaban", "Ramadan", "Shawwal", "Dhu al-Qidah", "Dhu al-Hijjah"]

var UMM_AL_QURA = [
  [1900, 4, 30, 0x2ea], [1901, 4, 19, 0x6e9], [1902, 4, 9, 0xed2], [1903, 3, 30, 0xea4],
  [1904, 3, 18, 0xd4a], [1905, 3, 7, 0xa96], [1906, 2, 24, 0x536], [1907, 2, 13, 0xab5],
  [1908, 2, 3, 0xdaa], [1909, 1, 23, 0xba4], [1910, 1, 12, 0xb49], [1911, 1, 1, 0xa93],
  [1911, 12, 21, 0x52b], [1912, 12, 9, 0xa57], [1913, 11, 29, 0x4b6], [1914, 11, 18, 0xab5],
  [1915, 11, 8, 0x5aa], [1916, 10, 27, 0xd55], [1917, 10, 17, 0xd2a], [1918, 10, 6, 0xa56],
  [1919, 9, 25, 0x4ae], [1920, 9, 13, 0x95d], [1921, 9, 3, 0x2ec], [1922, 8, 23, 0x6d5],
  [1923, 8, 13, 0x6aa], [1924, 8, 1, 0x555], [1925, 7, 21, 0x4ab], [1926, 7, 10, 0x95b],
  [1927, 6, 30, 0x2ba], [1928, 6, 18, 0x575], [1929, 6, 8, 0xbb2], [1930, 5, 29, 0x764],
  [1931, 5, 18, 0x749], [1932, 5, 6, 0x655], [1933, 4, 25, 0x2ab], [1934, 4, 14, 0x55b],
  [1935, 4, 4, 0xada], [1936, 3, 24, 0x6d4], [1937, 3, 13, 0xec9], [1938, 3, 3, 0xd92],
  [1939, 2, 20, 0xd25], [1940, 2, 9, 0xa4d], [1941, 1, 28, 0x2ad], [1942, 1, 17, 0x56d],
  [1943, 1, 7, 0xb6a], [1943, 12, 28, 0xb52], [1944, 12, 16, 0xaa5], [1945, 12, 5, 0xa4b],
  [1946, 11, 24, 0x497], [1947, 11, 13, 0x937], [1948, 11, 2, 0x2b6], [1949, 10, 22, 0x575],
  [1950, 10, 12, 0xd6a], [1951, 10, 2, 0xd52], [1952, 9, 20, 0xa96], [1953, 9, 9, 0x92d],
  [1954, 8, 29, 0x25d], [1955, 8, 18, 0x4dd], [1956, 8, 7, 0xada], [1957, 7, 28, 0x5d4],
  [1958, 7, 17, 0xda9], [1959, 7, 7, 0xd52], [1960, 6, 25, 0xaaa], [1961, 6, 14, 0x4d6],
  [1962, 6, 3, 0x9b6], [1963, 5, 24, 0x374], [1964, 5, 12, 0x769], [1965, 5, 2, 0x752],
  [1966, 4, 21, 0x6a5], [1967, 4, 10, 0x54b], [1968, 3, 29, 0xaab], [1969, 3, 19, 0x55a],
  [1970, 3, 8, 0xad5], [1971, 2, 26, 0xdd2], [1972, 2, 16, 0xda4], [1973, 2, 4, 0xd49],
  [1974, 1, 24, 0xa95], [1975, 1, 13, 0x52d], [1976, 1, 2, 0xa5d], [1976, 12, 22, 0x55a],
  [1977, 12, 11, 0xad5], [1978, 12, 1, 0x6aa], [1979, 11, 20, 0x695], [1980, 11, 8, 0x52b],
  [1981, 10, 28, 0xa57], [1982, 10, 18, 0x4ae], [1983, 10, 7, 0x976], [1984, 9, 26, 0x56c],
  [1985, 9, 15, 0xb55], [1986, 9, 5, 0xaaa], [1987, 8, 25, 0xa55], [1988, 8, 13, 0x4ad],
  [1989, 8, 2, 0x95d], [1990, 7, 23, 0x2da], [1991, 7, 12, 0x5d9], [1992, 7, 1, 0xdb2],
  [1993, 6, 21, 0xba4], [1994, 6, 10, 0xb4a], [1995, 5, 30, 0xa55], [1996, 5, 18, 0x2b5],
  [1997, 5, 7, 0x575], [1998, 4, 27, 0xb6a], [1999, 4, 17, 0xbd2], [2000, 4, 6, 0xbc4],
  [2001, 3, 26, 0xb89], [2002, 3, 15, 0xa95], [2003, 3, 4, 0x52d], [2004, 2, 21, 0x5ad],
  [2005, 2, 10, 0xb6a], [2006, 1, 31, 0x6d4], [2007, 1, 20, 0xdc9], [2008, 1, 10, 0xd92],
  [2008, 12, 29, 0xaa6], [2009, 12, 18, 0x956], [2010, 12, 7, 0x2ae], [2011, 11, 26, 0x56d],
  [2012, 11, 15, 0x36a], [2013, 11, 4, 0xb55], [2014, 10, 25, 0xaaa], [2015, 10, 14, 0x94d],
  [2016, 10, 2, 0x49d], [2017, 9, 21, 0x95d], [2018, 9, 11, 0x2ba], [2019, 8, 31, 0x5b5],
  [2020, 8, 20, 0x5aa], [2021, 8, 9, 0xd55], [2022, 7, 30, 0xa9a], [2023, 7, 19, 0x92e],
  [2024, 7, 7, 0x26e], [2025, 6, 26, 0x55d], [2026, 6, 16, 0xada], [2027, 6, 6, 0x6d4],
  [2028, 5, 25, 0x6a5], [2029, 5, 14, 0x54b], [2030, 5, 3, 0xa97], [2031, 4, 23, 0x54e],
  [2032, 4, 11, 0xaae], [2033, 4, 1, 0x5ac], [2034, 3, 21, 0xba9], [2035, 3, 11, 0xd92],
  [2036, 2, 28, 0xb25], [2037, 2, 16, 0x64b], [2038, 2, 5, 0xcab], [2039, 1, 26, 0x55a],
  [2040, 1, 15, 0xb55], [2041, 1, 4, 0x6d2], [2041, 12, 24, 0xea5], [2042, 12, 14, 0xe4a],
  [2043, 12, 3, 0xa95], [2044, 11, 21, 0x52d], [2045, 11, 10, 0xaad], [2046, 10, 31, 0x36c],
  [2047, 10, 20, 0x759], [2048, 10, 9, 0x6d2], [2049, 9, 28, 0x695], [2050, 9, 17, 0x52d],
  [2051, 9, 6, 0xa5b], [2052, 8, 26, 0x4ba], [2053, 8, 15, 0x9ba], [2054, 8, 5, 0x3b4],
  [2055, 7, 25, 0xb69], [2056, 7, 14, 0xb52], [2057, 7, 3, 0xaa6], [2058, 6, 22, 0x4b6],
  [2059, 6, 11, 0x96d], [2060, 5, 31, 0x2ec], [2061, 5, 20, 0x6d9], [2062, 5, 10, 0xeb2],
  [2063, 4, 30, 0xd54], [2064, 4, 18, 0xd2a], [2065, 4, 7, 0xa56], [2066, 3, 27, 0x4ae],
  [2067, 3, 16, 0x96d], [2068, 3, 5, 0xd6a], [2069, 2, 23, 0xb54], [2070, 2, 12, 0xb29],
  [2071, 2, 1, 0xa93], [2072, 1, 21, 0x52b], [2073, 1, 9, 0xa57], [2073, 12, 30, 0x536],
  [2074, 12, 19, 0xab5], [2075, 12, 9, 0x6aa], [2076, 11, 27, 0xe93]
]

// First Hijri year in UMM_AL_QURA; entry i is year HIJRI_TABLE_YEAR + i.
var HIJRI_TABLE_YEAR = 1318

function hijriDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth()
  var day = date.getDate()
  var utc = Date.UTC(year, month, day)

  // Binary search for the last entry whose 1 Muharram is on or before the
  // date — the entry whose Hijri year the date falls in.
  var lo = 0
  var hi = UMM_AL_QURA.length - 1
  var found = -1
  while (lo <= hi) {
    var mid = (lo + hi) >> 1
    var entry = UMM_AL_QURA[mid]
    if (Date.UTC(entry[0], entry[1] - 1, entry[2]) <= utc) {
      found = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  if (found === -1) return null

  var rec = UMM_AL_QURA[found]
  var remaining = Math.round((utc - Date.UTC(rec[0], rec[1] - 1, rec[2])) / MS_PER_DAY)
  for (var i = 0; i < 12; i++) {
    var dim = (rec[3] & (1 << i)) ? 30 : 29
    if (remaining < dim)
      return (remaining + 1) + " " + HIJRI_MONTHS[i] + " " + (HIJRI_TABLE_YEAR + found) + " AH"
    remaining -= dim
  }
  return null
}

// Weekday indices match both JS Date.getDay() and QML's Locale.Sunday…
// Locale.Saturday, so a locale's firstDayOfWeek can be passed straight in.
var WEEKDAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

// ---- Bar label formats. Right-clicking the clock walks these in order and
//      writes the result back to shell.json, so the label the bar shows and
//      the format the config stores are always the same thing.
//
// The locale-shaped time presets are each followed by their 12-hour twin, so
// the walk from a 24-hour label to the same label in AM/PM is a single right
// click rather than a lap of the ring. The ISO preset is deliberately left
// without one: ISO 8601 writes time on a 24-hour clock, so an AM/PM variant
// would contradict the only thing that format is for.
var CLOCK_FORMATS = [
  "dddd HH:mm",
  "dddd h:mm AP",
  "HH:mm",
  "h:mm AP",
  "ddd d MMM HH:mm",
  "ddd d MMM h:mm AP",
  "d MMMM 'W'ww yyyy",
  "yyyy-MM-dd HH:mm"
]

// Vertical bars have room for a few stacked lines and nothing else, so the
// ring stays short. AM/PM costs a fourth line, which is why only the plain
// time carries it here.
var VERTICAL_CLOCK_FORMATS = [
  "HH\n—\nmm",
  "h\n—\nmm\nAP",
  "dd\nMMM\n'W'ww\n''yy",
  "HH\nmm"
]

function clockFormats(vertical) {
  return vertical ? VERTICAL_CLOCK_FORMATS.slice() : CLOCK_FORMATS.slice()
}

// The presets in a fixed order, plus the configured alternate and current
// format when they are something else. The order must not depend on which
// entry is current: cycling writes the result back to shell.json, and a ring
// that reshuffled itself around the current value would bounce between two
// entries instead of walking.
function clockFormatRing(configured, configuredAlt, presets) {
  var ring = []
  var candidates = (presets || []).concat([configuredAlt, configured])
  for (var i = 0; i < candidates.length; i++) {
    var format = String(candidates[i] === undefined || candidates[i] === null ? "" : candidates[i])
    if (format === "" || ring.indexOf(format) !== -1) continue
    ring.push(format)
  }
  return ring.length > 0 ? ring : ["HH:mm"]
}

// Next entry after `current`. An unknown current format (a hand-written one
// that is not in the ring) starts the walk at the top.
function nextClockFormat(ring, current) {
  if (!ring || ring.length === 0) return ""
  var index = ring.indexOf(String(current === undefined || current === null ? "" : current))
  return ring[(index + 1) % ring.length]
}

// Two-digit ISO week, substituted into a format's 'ww' token before Qt
// formats it -- Qt has no ISO week specifier of its own.
function isoWeekLiteral(year, month, day) {
  return pad2(isoWeek(year, month, day))
}

function pad2(value) {
  var n = Number(value)
  return (n < 10 ? "0" : "") + n
}

// Stable "yyyy-MM-dd" identity for a day, so a grid cell can be compared
// against today without dragging Date objects through bindings.
function dateKey(year, month, day) {
  return year + "-" + pad2(Number(month) + 1) + "-" + pad2(day)
}

function keyForDate(date) {
  return dateKey(date.getFullYear(), date.getMonth(), date.getDate())
}

function coerceWeekStart(value) {
  if (value === undefined || value === null) return null
  if (typeof value === "number")
    return isFinite(value) ? ((Math.round(value) % 7) + 7) % 7 : null

  var text = String(value).replace(/^\s+|\s+$/g, "").toLowerCase()
  if (text === "") return null

  for (var i = 0; i < WEEKDAY_NAMES.length; i++)
    if (WEEKDAY_NAMES[i] === text || WEEKDAY_NAMES[i].substr(0, 3) === text) return i

  var parsed = parseInt(text, 10)
  return isFinite(parsed) ? ((parsed % 7) + 7) % 7 : null
}

// Configured week start, falling back to the locale's own first day when
// the setting is missing or nonsense.
function normalizedWeekStart(value, fallback) {
  var configured = coerceWeekStart(value)
  if (configured !== null) return configured
  var fallbackStart = coerceWeekStart(fallback)
  return fallbackStart === null ? 1 : fallbackStart
}

function weekStartSettingName(index) {
  return WEEKDAY_NAMES[normalizedWeekStart(index, 1)]
}

// The toggle flips between the two conventions people actually switch
// between. A calendar configured to any other start (Saturday, say) is
// shown as-is and lands on Monday the first time it is toggled.
function toggledWeekStart(index) {
  return normalizedWeekStart(index, 1) === 1 ? 0 : 1
}

function weekdayOrder(weekStart) {
  var start = normalizedWeekStart(weekStart, 1)
  var out = []
  for (var i = 0; i < 7; i++) out.push((start + i) % 7)
  return out
}

// ISO-8601 week number: the week owning the Thursday of that date's
// Monday-based week. Mirrors the clock widget's 'ww' format token.
function isoWeek(year, month, day) {
  var date = new Date(Date.UTC(year, month, day))
  var weekday = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - weekday)
  var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7)
}

function dayOfYear(year, month, day) {
  return Math.round((Date.UTC(year, month, day) - Date.UTC(year, 0, 1)) / MS_PER_DAY) + 1
}

function daysInYear(year) {
  return dayOfYear(year, 11, 31)
}

// Share of the year already behind you: whole days completed over days in
// the year, so January 1 reads 0% and December 31 reads 100%.
function yearProgress(year, month, day) {
  var total = daysInYear(year)
  if (total <= 0) return 0
  return Math.max(0, Math.min(1, (dayOfYear(year, month, day) - 1) / total))
}

function yearProgressPercent(year, month, day) {
  return Math.round(yearProgress(year, month, day) * 100)
}

// Memento mori. The default span is a round number rather than anything from
// an actuarial table: the point of the bar is the reminder, not the
// arithmetic, and whoever wants a different number can say so.
var DEFAULT_LIFE_EXPECTANCY = 90

// A birth year rather than an age, so the bar keeps counting on its own
// instead of going stale the moment it is entered. 0 means "not set", which
// is also what a blank, malformed, future, or implausibly distant year means.
function parseBirthYear(value, currentYear) {
  var now = Math.round(Number(currentYear))
  if (!isFinite(now)) return 0
  var text = String(value === undefined || value === null ? "" : value).replace(/^\s+|\s+$/g, "")
  if (!/^\d{4}$/.test(text)) return 0
  var year = parseInt(text, 10)
  if (!isFinite(year) || year > now || year < now - 120) return 0
  return year
}

// Whole years, the way people say their age: born in 1979 makes you 47 for
// all of 2026, whichever side of your birthday today falls.
function ageFromBirthYear(birthYear, currentYear) {
  var born = parseBirthYear(birthYear, currentYear)
  if (born <= 0) return 0
  return Math.round(Number(currentYear)) - born
}

// 0 means "not set", which is also what a blank, negative, fractional, or
// absurd entry means — the life bar simply stays hidden.
function parseAge(value) {
  var text = String(value === undefined || value === null ? "" : value).replace(/^\s+|\s+$/g, "")
  if (!/^\d+$/.test(text)) return 0
  var years = parseInt(text, 10)
  if (!isFinite(years) || years <= 0 || years > 120) return 0
  return years
}

// Unset or nonsense falls back to the default rather than to zero, so the
// bar always has something to measure against.
function parseLifeExpectancy(value) {
  var text = String(value === undefined || value === null ? "" : value).replace(/^\s+|\s+$/g, "")
  if (!/^\d+$/.test(text)) return DEFAULT_LIFE_EXPECTANCY
  var years = parseInt(text, 10)
  if (!isFinite(years) || years <= 0 || years > 150) return DEFAULT_LIFE_EXPECTANCY
  return years
}

function lifeProgress(age, expectancy) {
  var years = parseAge(age)
  var span = parseLifeExpectancy(expectancy)
  if (years <= 0 || span <= 0) return 0
  return Math.max(0, Math.min(1, years / span))
}

function lifeProgressPercent(age, expectancy) {
  return Math.round(lifeProgress(age, expectancy) * 100)
}

// Always six rows of seven days. A fixed grid keeps the popup exactly the
// same height in every month, so stepping through the year never makes the
// panel jump under the pointer.
function monthGrid(year, month, weekStart, todayKey) {
  var start = normalizedWeekStart(weekStart, 1)
  var leading = (new Date(year, month, 1).getDay() - start + 7) % 7
  var cursor = new Date(year, month, 1 - leading)
  var today = String(todayKey || "")
  var weeks = []

  for (var w = 0; w < 6; w++) {
    var days = []
    var thursday = null
    for (var d = 0; d < 7; d++) {
      var cellYear = cursor.getFullYear()
      var cellMonth = cursor.getMonth()
      var cellDay = cursor.getDate()
      var weekday = cursor.getDay()
      var key = dateKey(cellYear, cellMonth, cellDay)
      if (weekday === 4) thursday = { year: cellYear, month: cellMonth, day: cellDay }
      days.push({
        key: key,
        year: cellYear,
        month: cellMonth,
        day: cellDay,
        weekday: weekday,
        inMonth: cellMonth === month && cellYear === year,
        weekend: weekday === 0 || weekday === 6,
        today: key === today
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    // Number every row by the ISO week owning its Thursday. That is the
    // definition itself for Monday-start weeks, and the only answer that
    // stays stable for the other starts, where a row straddles two ISO
    // weeks but shares all of Monday through Thursday with one of them.
    var anchor = thursday || days[0]
    weeks.push({
      week: isoWeek(anchor.year, anchor.month, anchor.day),
      days: days
    })
  }
  return weeks
}

function stepMonth(year, month, delta) {
  var target = new Date(year, Number(month) + Number(delta), 1)
  return { year: target.getFullYear(), month: target.getMonth() }
}

if (typeof module !== "undefined") {
  module.exports = {
    hijriDate: hijriDate,
    dateKey: dateKey,
    keyForDate: keyForDate,
    normalizedWeekStart: normalizedWeekStart,
    weekStartSettingName: weekStartSettingName,
    toggledWeekStart: toggledWeekStart,
    weekdayOrder: weekdayOrder,
    isoWeek: isoWeek,
    dayOfYear: dayOfYear,
    daysInYear: daysInYear,
    yearProgress: yearProgress,
    yearProgressPercent: yearProgressPercent,
    parseAge: parseAge,
    parseBirthYear: parseBirthYear,
    ageFromBirthYear: ageFromBirthYear,
    parseLifeExpectancy: parseLifeExpectancy,
    lifeProgress: lifeProgress,
    lifeProgressPercent: lifeProgressPercent,
    monthGrid: monthGrid,
    stepMonth: stepMonth,
    clockFormats: clockFormats,
    clockFormatRing: clockFormatRing,
    nextClockFormat: nextClockFormat,
    isoWeekLiteral: isoWeekLiteral
  }
}
