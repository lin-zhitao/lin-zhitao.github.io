# Design Migration Notes

Date: 2026-04-28

## Sources

- Figma reference: `/Volumes/Apps/figma/Personal Portfolio Homepage Design`
- Works source folder: `/Volumes/Apps/figma/作品`
- Works text source: `/Volumes/Apps/figma/作品/works.md`

## Page Changes

### About

- Migrated the Figma-style About layout into the site.
- Uses a large low-opacity English background name: `ZHITAO LIN`.
- Uses the portrait image at `assets/profile-zhitao-lin.png`.
- Contact email is set to `lin_zhitao@berkeley.edu`.

### Works

- Works now contains four selected projects only:
  - `Liminal`
  - `Ear on the Edge of the Eye`
  - `Bodhi 菩提`
  - `Dvesha`
- The Works index follows the Figma reference:
  - one large image card
  - title below the image
  - type/medium below the title
  - no long description on the card
  - clicking the current image opens a detail page
- Detail pages are rendered through `work-detail.html?id=...`.

### Compositions

- Migrated the composition page into an archive-style layout.
- Items are grouped by category from `content.json`.
- Hover movement and small stats are used to make the page feel more designed without adding visual clutter.

## Image Treatment

The original work images were copied from `/Volumes/Apps/figma/作品` and processed into a unified black-and-white film style.

Processed image outputs:

- `assets/work-liminal-film.jpg`
- `assets/work-ear-on-the-edge-of-the-eye-film.jpg`
- `assets/work-bodhi-film.jpg`
- `assets/work-dvesha-film.jpg`

Film treatment recipe:

- EXIF orientation normalized
- Resized to a maximum of roughly `1800 x 1400`
- Converted to grayscale
- Contrast increased by `1.18`
- Brightness reduced to `0.96`
- Mild unsharp mask applied
- Fine monochrome grain blended at about `7.5%`
- Subtle vignette added around the edges
- Autocontrast applied with a small cutoff
- Exported as progressive JPEG, quality `88`

## Content Maintenance

Main editable file:

- `content.json`

To add or edit Works, update the `projects` array. Each work can use:

- `id`
- `title`
- `year`
- `medium`
- `image`
- `description`
- `presentations`
- `recognition`
- `credits`
- `technical`

The Works page reads only from `content.json > projects`.

The Compositions page reads from `content.json > compositions`.

## Local Preview

Run a local static server from the project folder:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173/
http://localhost:4173/works.html
http://localhost:4173/work-detail.html?id=liminal
```
