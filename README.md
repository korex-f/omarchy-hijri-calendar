# Hijri Calendar for Omarchy

An Omarchy bar widget that shows the current Gregorian time next to the corresponding tabular Hijri date. Click it to open the familiar monthly Gregorian calendar popup.

The Hijri conversion is fully offline and deterministic. It uses the tabular (civil) Islamic calendar, so dates may differ by one day from calendars based on local moon sightings.

## What it does

- Shows a configurable Gregorian date/time label and the Hijri date.
- Opens a monthly calendar with ISO week numbers on left click.
- Cycles clock formats on right click.
- Opens Omarchy's timezone picker on middle click.

## Install

The public Git install URL will be added with the first release. After enabling, Omarchy adds the widget to the right bar section. Move it if desired:

```bash
omarchy bar plugin move dki.hijri-calendar --section center
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
