# Photo library (published images only)

- `site/`: portrait and other website-only photos.
- `albums/<album-id>/`: one folder per photography album.
- `albums/<album-id>/<photo-name>.webp`: screen-size photo, also used by the full-screen lightbox.
- `albums/<album-id>/<photo-name>-thumb.webp`: optional light thumbnail for the album grid.

The page order, cover, captions and paths are controlled from `data/albums.js` at the website root.

**Do not place original Hasselblad RAW, full-size TIFF, or archival masters in the published site.**
Store those originals outside the GitHub Pages repository, e.g. on a local drive or private cloud backup.
