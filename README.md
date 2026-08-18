# Hijri Calendar for Omarchy

An Omarchy bar widget that shows the current Gregorian time next to the corresponding Umm al-Qura Hijri date. Click it to open the familiar monthly Gregorian calendar popup.

The Hijri conversion is fully offline and deterministic. It uses the Umm al-Qura calendar — the official civil Islamic calendar of Saudi Arabia — from a table of month starts published by the King Abdulaziz City for Science and Technology (KACST), covering Hijri years 1318–1500 (Gregorian 1900–2076). It is a civil calendar, so dates may differ by a day from calendars based on local moon sightings.

## What it does

- Shows a configurable Gregorian date/time label and the Umm al-Qura Hijri date.
- Opens a monthly calendar with ISO week numbers on left click.
- Cycles clock formats on right click.
- Opens Omarchy's timezone picker on middle click.

## Install

Install from git and enable it:

```bash
omarchy plugin add https://github.com/korex-f/omarchy-hijri-calendar.git --enable
```

After enabling, Omarchy adds the widget to the right bar section. Move it if desired:

```bash
omarchy bar plugin move dki.hijri-calendar --section center
```

## Remove

```bash
omarchy plugin remove dki.hijri-calendar
```

## Update

```bash
omarchy plugin update dki.hijri-calendar
```

## Validate from source

```bash
omarchy plugin validate .
node tests/model.test.js
```

## Security and privacy

The plugin runs inside `omarchy-shell` when enabled. It has no network access, does not run external commands, and does not read or write files. It only derives calendar data from the local system clock.

## License

MIT. See [LICENSE](LICENSE).
