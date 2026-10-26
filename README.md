# Meow Guard 🐾

A small Vietnamese-language, responsive browser tower-defense prototype. Built with HTML5 Canvas, vanilla JavaScript and Bootstrap 5. No server or build step is required.

## Play locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser, or serve the folder with any static HTTP server.
3. Choose a cat, tap/click a grass tile to place it, then press **Bắt đầu / Tiếp tục**.
4. Defeat enemies to earn fish, buy more cats and survive increasing waves.

The game has an emoji-based fallback so the prototype remains playable if optional image assets are not present. High score is stored locally in the browser and is not shared between devices.

## Optional CraftPix sprites

The code looks for these paths. Add the relevant files from the CraftPix pack only after checking and complying with the asset pack's current license/attribution terms:

- `assets/arena.png`
- `assets/cat/idle_0.png` … `idle_7.png`
- `assets/cat/shoot_0.png` … `shoot_7.png`
- `assets/enemy/walk_0.png` … `walk_9.png`

If those files are missing, canvas draws the game map and uses emoji characters as fallbacks. The image pack is not redistributed by this source unless the assets are added to the repository separately.

## GitHub Pages

The workflow at `.github/workflows/pages.yml` validates `index.html`, `style.css` and JavaScript syntax, then publishes the repository as a static site on pushes to `main` and on manual workflow runs.

In repository **Settings → Pages**, choose **GitHub Actions** as the build and deployment source if it is not already selected. Then open **Actions** and confirm the latest **Deploy Meow Guard to GitHub Pages** run succeeds. The expected project URL is:

`https://khahdihdz.github.io/meow-guard/`

That URL is an expected URL, not proof of a successful deployment; check the Pages deployment status in GitHub.

## Scope and limitations

- Single-player prototype; no backend, account system, multiplayer or online leaderboard.
- Progress/high score uses browser `localStorage`.
- Bootstrap CSS is loaded from jsDelivr, so the layout CDN needs internet access.
- Test on a current desktop or mobile browser before treating this as a finished release.
