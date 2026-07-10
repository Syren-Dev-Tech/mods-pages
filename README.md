# Minecraft Mods Pages

A React + Vite + Bootstrap website for hosting download pages for Minecraft mods in one place.

## Features

- Home page with mod tiles: thumbnail, name, and link to each downloads page.
- Per-mod downloads page with:
	- banner image
	- mod title/heading
	- latest release information and assets
	- link to old builds
- Light and dark mode using Bootstrap themes (`data-bs-theme`).
- Bootstrap Icons for navigation and action buttons.
- Data-driven structure so adding mods is easy.
- Per-mod assets and color themes loaded from each mod repository's `pages-assets` branch.
- One default thumbnail, banner, and theme used whenever a mod does not provide them.
- Organization name configured once and reused for GitHub links and site text.

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure

- `src/config/site.ts`: organization config, site text, and global default visuals/theme.
- `public/config/mod-repositories.json`: single source-of-truth mod repository list.
- `src/data/mods.ts`: loader that reads and normalizes public mod config.
- `src/pages/HomePage.tsx`: tiles for every mod.
- `src/pages/ModDownloadsPage.tsx`: banner + latest release + old builds link.
- `src/services/releases.ts`: latest release fetching directly from GitHub API.
- `public/images/mods/*`: thumbnails and banners.

## Add A New Mod

1. Add a new repository entry to `public/config/mod-repositories.json`:

```json
{
	"repositories": [
		{
			"repo": "example-mod",
			"prettyName": "Example Mod"
		}
	]
}
```

2. In the mod repository's `pages-assets` branch, add a `theme.json` and image files.

If no image/theme is supplied by that repo, the shared defaults in `src/config/site.ts` are used.

## Mod Repository Integration Reference

This section is the source of truth for mod repositories that integrate with this site.

### Required Branches

Mod repository:

- `main` (or your default branch): source code and workflows.
- `pages-assets`: image/theme assets consumed by this site.

Mods pages repository (this repo):

- `main`: app source.
- `gh-pages`: built site output only.

### Required Files In Each Mod Repository

- `.github/workflows/release.yml` (copied from `.github/workflow-templates/mod-release-template.yml` in this repo, optional but recommended).
- `pages-assets/theme.json`.
- Image files referenced by `pages-assets/theme.json` (recommended under `pages-assets/images/`).

### Required Files In This Repository

- `public/config/mod-repositories.json`: one entry per mod repo (`repo` + `prettyName`).
- `src/data/mods.ts`: reads and normalizes the public config file.
- `.github/workflows/deploy-pages.yml`: builds and publishes site to `gh-pages`.

### Single Config File

All mod repositories referenced by the site are defined manually in one file:

- `public/config/mod-repositories.json`

To add or remove mods, edit this file and deploy.

Config schema:

```json
{
	"repositories": [
		{
			"repo": "string",
			"prettyName": "string"
		}
	]
}
```

Schema notes:

- `repo` should be the GitHub repository name under your shared organization.
- `prettyName` is the display name shown in the UI.
- Organization owner is not set per entry; the site uses `ORGANIZATION_NAME` from `src/config/site.ts`.

## Mod Definition Schema (`src/data/mods.ts`)

Each repository entry from the public config is normalized to this internal shape:

```ts
{
	slug: string,
	name: string,
	description: string,
	repository: {
		repo: string,
		owner?: string
	},
	pagesAssets?: {
		branch?: string,        // default: "pages-assets"
		themeJsonPath?: string, // default: "theme.json"
		thumbnailPath?: string, // optional override if not provided by theme JSON
		bannerPath?: string     // optional override if not provided by theme JSON
	},
	oldBuildsUrl?: string | null,
	thumbnailImage?: string, // optional hard fallback
	bannerImage?: string     // optional hard fallback
}
```

Notes:

- `slug` is used in route paths (`/mods/<slug>`).
- If `repository.owner` is omitted, `ORGANIZATION_NAME` from `src/config/site.ts` is used.

## Pages Assets Theme Schema (`pages-assets/theme.json`)

This file is fetched from:

`https://raw.githubusercontent.com/<owner>/<repo>/<pages-assets-branch>/<themeJsonPath>`

Expected JSON shape (schema version `1`):

```json
{
	"schemaVersion": 1,
	"images": {
		"thumbnail": "images/example-mod-thumb.png",
		"banner": "images/example-mod-banner.png"
	},
	"theme": {
		"accent": "#c22d2d",
		"gradientStart": "rgba(194, 45, 45, 0.24)",
		"gradientEnd": "rgba(18, 18, 18, 0.26)",
		"panelLight": "rgba(255, 234, 234, 0.82)",
		"panelDark": "rgba(40, 20, 20, 0.82)",
		"bannerGlow": "radial-gradient(circle at 30% 30%, rgba(255, 120, 120, 0.35), transparent 45%)"
	}
}
```

Theme schema notes:

- `schemaVersion`: required, must be `1`.
- `images.thumbnail` and `images.banner`: paths relative to the `pages-assets` branch root.
- Any missing theme fields fall back to defaults from `src/config/site.ts`.
- If `theme.json` is missing or invalid, full visual/theme fallback is applied.

Recommended asset file conventions in `pages-assets`:

- `images/<slug>-thumb.png` (square image, recommended 512x512 or 1024x1024).
- `images/<slug>-banner.png` (wide banner, recommended around 1600x500).

## Latest Release Data Source

The site fetches latest release data directly from GitHub API for each configured repository:

- Endpoint: `GET /repos/<owner>/<repo>/releases/latest`
- API docs: https://docs.github.com/rest/releases/releases#get-the-latest-release

Data used by this site:

- `name` / `tag_name`
- `published_at`
- `html_url`
- `assets[].name`
- `assets[].browser_download_url`
- `assets[].size`

If the latest release endpoint returns an error (no releases, private repo without access, rate limit, etc.), the mod page shows an error and links to GitHub releases.

## Configure Organization Name Once

Update this single value in `src/config/site.ts`:

```js
export const ORGANIZATION_NAME = 'your-org'
```

That value is reused for generated GitHub links and organization text across the app.

## GitHub Workflows

### This repository (site deploy)

Workflow file: `.github/workflows/deploy-pages.yml`

- Trigger: push to `main` (and manual dispatch).
- Behavior: builds the site and publishes `dist` to `gh-pages`.

Required repository settings (this repo):

- GitHub Pages source should serve from branch `gh-pages` at `/`.
- Actions must be enabled.
- `GITHUB_TOKEN` must have permission to push to `gh-pages` (workflow sets `contents: write`).

### Mod repositories (tag release)

Template file: `.github/workflow-templates/mod-release-template.yml`

Copy this into each mod repository as `.github/workflows/release.yml` and set:

- `BUILD_COMMAND`: build command that creates jar files.
- `ARTIFACT_GLOB`: glob for built jar artifacts.

Required repository settings (mod repos):

- Actions enabled.
- Workflow permissions set to allow `contents: write` (or keep the explicit workflow permission block).
- Tag naming convention should match your release convention (example: `v1.2.3`).

What the template workflow does:

1. Runs on tag creation (`push` to tags).
2. Builds jar artifacts.
3. Creates or updates a GitHub release for the tag and uploads artifacts.

## End-To-End Flow Summary

1. Mod maintainer pushes tag in mod repository.
2. Mod workflow builds jar(s), creates/updates release, and uploads release assets.
3. This site reads latest release metadata directly from GitHub API using the repositories listed in `src/data/mods.ts`.
4. This site's deploy workflow publishes frontend changes from `main` to `gh-pages`.

## CI/CD Release Update Contract

The canonical contract is GitHub Releases API (`releases/latest`) for each configured repository.
