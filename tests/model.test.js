const assert = require("node:assert/strict")
const model = require("../Model.js")

// Umm al-Qura reference dates, cross-checked against the official Saudi
// calendar (e.g. the KACST-published month starts used across the web).
assert.equal(model.hijriDate(new Date(2026, 7, 17)), "4 Rabi al-Awwal 1448 AH")
assert.equal(model.hijriDate(new Date(2024, 2, 11)), "1 Ramadan 1445 AH")
assert.equal(model.hijriDate(new Date(2023, 6, 19)), "1 Muharram 1445 AH")
assert.equal(model.hijriDate(new Date(2024, 3, 10)), "1 Shawwal 1445 AH")
assert.equal(model.hijriDate(new Date(2025, 5, 6)), "10 Dhu al-Hijjah 1446 AH")
assert.equal(model.hijriDate(new Date(2025, 2, 1)), "1 Ramadan 1446 AH")

// The table covers Hijri years 1318-1500 (Gregorian 1900-2076). Dates outside
// that window convert to null so the widget can fall back to Gregorian only.
assert.equal(model.hijriDate(new Date(1899, 11, 31)), null)
assert.equal(model.hijriDate(new Date(2077, 11, 31)), null)

console.log("Hijri conversion tests passed")
