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
- `src/data/mods.ts`: central mod list and routing metadata.
- `src/pages/HomePage.tsx`: tiles for every mod.
- `src/pages/ModDownloadsPage.tsx`: banner + latest release + old builds link.
- `src/services/releases.ts`: release fetching logic.
- `public/data/mods/<slug>/latest-release.json`: CI-updated latest release payload.
- `public/images/mods/*`: thumbnails and banners.

## Add A New Mod

1. Add a new object to `src/data/mods.ts`:

```js
{
	slug: 'example-mod',
	name: 'Example Mod',
	description: 'Short description shown on the home tile.',
	repository: { repo: 'example-mod' },
	pagesAssets: {
		branch: 'pages-assets',
		themeJsonPath: 'theme.json'
	},
	oldBuildsUrl: getGitHubReleasesUrl('example-mod'),
	latestReleaseJson: '/data/mods/example-mod/latest-release.json',
}
```

2. Add a CI-generated JSON file at `public/data/mods/example-mod/latest-release.json`.
3. In the mod repository's `pages-assets` branch, add a `theme.json` and image files.

If no image/theme is supplied by that repo, the shared defaults in `src/config/site.ts` are used.

## Mod Repository Integration Reference

This section is the source of truth for mod repositories that integrate with this site.

### Required Branches

Mod repository:

- `main` (or your default branch): source code and workflows.
- `pages-assets`: image/theme assets consumed by this site.

Mods pages repository (this repo):

- `main`: app source.
- `gh-pages`: built site output and `data/mods/<slug>/latest-release.json` files.

### Required Files In Each Mod Repository

- `.github/workflows/release.yml` (copied from `.github/workflow-templates/mod-release-template.yml` in this repo).
- `pages-assets/theme.json`.
- Image files referenced by `pages-assets/theme.json` (recommended under `pages-assets/images/`).

### Required Files In This Repository

- `src/data/mods.ts`: one entry per mod.
- `.github/workflows/deploy-pages.yml`: builds and publishes site to `gh-pages`.
- `public/data/mods/<slug>/latest-release.json` can be authored manually initially, then kept up to date by mod workflows.

## Mod Definition Schema (`src/data/mods.ts`)

Each entry in `mods` should follow this shape:

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
	latestReleaseJson?: string,
	thumbnailImage?: string, // optional hard fallback
	bannerImage?: string     // optional hard fallback
}
```

Notes:

- `slug` must match the JSON output path: `data/mods/<slug>/latest-release.json`.
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

## Latest Release JSON Schema (`data/mods/<slug>/latest-release.json`)

This JSON is read by the site for each mod's latest download data.

Expected shape:

```json
{
	"name": "Example Mod 1.2.3",
	"tag": "v1.2.3",
	"publishedAt": "2026-07-10T12:00:00Z",
	"releaseUrl": "https://github.com/your-org/example-mod/releases/tag/v1.2.3",
	"assets": [
		{
			"name": "example-mod-1.2.3.jar",
			"downloadUrl": "https://github.com/your-org/example-mod/releases/download/v1.2.3/example-mod-1.2.3.jar",
			"size": 1234567
		}
	]
}
```

Latest-release schema notes:

- `publishedAt` should be ISO-8601.
- `assets` can be empty, but should be present.
- `size` is in bytes.
- If this file is missing, the app falls back to GitHub's `releases/latest` API.

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
- Important: before publish, it copies existing `data/mods/*/latest-release.json` files from the current `gh-pages` branch into the new build output so release JSON updates made by mod repositories are preserved.

Required repository settings (this repo):

- GitHub Pages source should serve from branch `gh-pages` at `/`.
- Actions must be enabled.
- `GITHUB_TOKEN` must have permission to push to `gh-pages` (workflow sets `contents: write`).

### Mod repositories (tag release + JSON update)

Template file: `.github/workflow-templates/mod-release-template.yml`

Copy this into each mod repository as `.github/workflows/release.yml` and set:

- `MOD_SLUG`: slug used in this site under `data/mods/<slug>`.
- `PAGES_REPOSITORY`: owner/repo of this site repository (example: `your-org/mods-pages`).
- `PAGES_BRANCH`: hosting branch (default `gh-pages`).
- `BUILD_COMMAND`: build command that creates jar files.
- `ARTIFACT_GLOB`: glob for built jar artifacts.

Required secret in each mod repository:

- `MODS_PAGES_TOKEN`: token with `contents:write` access to the site repository so the workflow can commit `data/mods/<slug>/latest-release.json` in `gh-pages`.

Token recommendations for `MODS_PAGES_TOKEN`:

- Prefer a fine-grained PAT scoped only to the mods-pages repository.
- Required repository permission: `Contents: Read and write`.
- Store the token as an Actions secret in each mod repository.

Required repository settings (mod repos):

- Actions enabled.
- Workflow permissions set to allow `contents: write` (or keep the explicit workflow permission block).
- Tag naming convention should match your release convention (example: `v1.2.3`).

What the template workflow does:

1. Runs on tag creation (`push` to tags).
2. Builds jar artifacts.
3. Creates or updates a GitHub release for the tag and uploads artifacts.
4. Generates `latest-release.json` from the release data.
5. Commits that JSON into this repository's `gh-pages` branch at `data/mods/<slug>/latest-release.json`.

## End-To-End Flow Summary

1. Mod maintainer pushes tag in mod repository.
2. Mod workflow builds jar(s), creates/updates release, and updates `data/mods/<slug>/latest-release.json` in this repo's `gh-pages` branch.
3. This site's deploy workflow runs on changes to `main` and republishes to `gh-pages` while preserving existing release JSON files in `data/mods/*`.
4. Site renders latest releases from those JSON files.

## CI/CD Release Update Contract

The canonical contract is documented above in `Latest Release JSON Schema`.
