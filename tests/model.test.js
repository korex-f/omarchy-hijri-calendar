const assert = require("node:assert/strict")
const model = require("../Model.js")

assert.equal(model.hijriDate(new Date(2026, 7, 17)), "3 Rabi al-Awwal 1448 AH")
assert.equal(model.hijriDate(new Date(2024, 2, 11)), "1 Ramadan 1445 AH")
assert.equal(model.hijriDate(new Date(2023, 6, 19)), "1 Muharram 1445 AH")

console.log("Hijri conversion tests passed")
