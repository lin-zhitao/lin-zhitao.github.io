# Website Maintenance Notes

This repository is the personal website for Zhitao Lin.

## Local Preview

From the project folder:

```bash
cd /Volumes/Apps/个人主页
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/index.html
```

## Editing Content

- Main structured content lives in `content.json`.
- Page rendering logic lives in `content-renderer.js`.
- Homepage animation and hidden cat-photo mode live in `script.js`.
- Visual styling lives in `styles.css`.
- Project detail pages are rendered through `work-detail.html`.

## Cat Memory Photo Mode

The hidden photo mode is triggered by clicking the black cat on the homepage.

Public web images for this mode are stored in:

```text
assets/Mian/
```

Only upload processed black-and-white film images named like:

```text
mian-01-home-cat-memory-film.jpg
mian-02-memory-film.jpg
mian-03-window-memory-film.jpg
```

Do not upload original cat photos. `.gitignore` excludes the raw files:

```text
assets/Mian/*.HEIC
assets/Mian/*.JPEG
assets/Mian/IMG_*.jpg
assets/Mian/*-source.jpg
```

When adding a new cat photo:

1. Place the original in `assets/Mian/`.
2. Process it into black-and-white film style.
3. Name the processed file using the next number, for example `mian-06-memory-film.jpg`.
4. Add the processed file to the `.memory-photo-strip` section in `index.html`.
5. Confirm `git status --short -uall assets/Mian` only shows the processed `mian-*-memory-film.jpg` file.

## Git Upload Workflow

Use selective staging. Do not run `git add .` without checking ignored/raw files first.

Recommended check:

```bash
git status --short -uall
git status --short -uall assets/Mian
```

Then stage only public site files, for example:

```bash
git add index.html styles.css script.js content.json content-renderer.js
git add about.html research.html works.html compositions.html work-detail.html
git add assets/profile-zhitao-lin.png
git add assets/work-*-film.jpg
git add assets/Mian/mian-*-memory-film.jpg
git add .gitignore WEBSITE_MAINTENANCE.md DESIGN_MIGRATION_NOTES.md
```

Commit and push:

```bash
git commit -m "Update personal website"
git push origin main
```

## Deployment

The GitHub Pages repository is:

```text
https://github.com/lin-zhitao/lin-zhitao.github.io
```

After pushing to `main`, GitHub Pages should update:

```text
https://lin-zhitao.github.io/
https://lin-zhitao.github.io/index.html
```

If `/` and `/index.html` ever differ, wait a minute and refresh with cache disabled.
