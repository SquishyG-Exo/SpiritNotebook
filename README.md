# Spirit Notebook — proof of concept

A clickable, phone-first demo of a spiritual journaling app: notice a sign, write it down, receive a warm AI reading, save it to your notebook, and watch patterns emerge. Everything is mocked and lives in memory **except the AI interpretation, which is real** (Anthropic Claude, called from one serverless function).

> This is a proof of concept for evaluation, not the production app. The code is organised so the production app can grow from it (see *Where to go from here*).

## What the demo shows

| Screen | What happens |
| --- | --- |
| **Home** | Dusk hero, name + tagline, latest reflection, **Log a New Entry**. Tabs: Home · Calendar · Insights · Profile. |
| **Explore** | 12 categories (Dreams, Numbers, Signs & Symbols, Life Situations, People, Places & Travel, Repeated Words, Animals, Objects, Body Signs, Spiritual Questions, Synchronicities). |
| **Life Situations** | 15 situations (Love & Relationships, Breakups & Separation, Family, … Something I Can't Explain). |
| **New Entry** | Text entry with the category preselected, hints, a UI-only photo attachment, character cap. |
| **Your Interpretation** | **Live AI reading**: title, 120–180-word interpretation, a reflection question. *Save to Notebook* / *Journal My Thoughts*. Graceful loading, error and crisis ("care") states. |
| **Calendar & Journal** | Month view with dots on days that have entries; tap a day to see its entries; newly saved entries appear here. |
| **Insights** | Believable pattern summary computed from the sample journal, labelled **Premium**. |
| **Profile** | English / Español switch (UI strings and AI answers), disclaimer, reset demo data. |

The journal is preloaded with six sample entries spread across the current month. State is in memory: reloading the page restores the samples.

## Stack

- [Expo SDK 57](https://docs.expo.dev) (React Native) + TypeScript + Expo Router, exported as a single-page web app (`npx expo export --platform web`) and served by Vercel. The same code runs as a native app.
- `api/interpret.ts` — Vercel serverless function calling the Anthropic API with the official SDK, structured JSON output validated with zod, per-IP and global daily rate limits, input length cap, optional passcode.
- `api/unlock.ts` — validates the optional demo passcode server-side (the code never ships in the client bundle).
- i18next for EN/ES UI strings; the selected language is passed to the AI so readings answer in that language.
- PWA manifest + icons, `noindex` meta and `X-Robots-Tag`, and a centered phone frame when opened on a desktop browser.

## Run locally

```bash
npm install
cp .env.example .env.local        # add ANTHROPIC_API_KEY, or set MOCK_AI=true for canned readings

# terminal 1 — the two API functions on http://localhost:3000
npm run dev:api

# terminal 2 — the app on http://localhost:8081, pointed at the local API
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000 npm run web
```

Alternative: `npx vercel dev` runs the static app and the functions together on one port (requires the Vercel CLI and `vercel link`).

Checks: `npm run typecheck`, `npm run lint`, `npm test` (or `npm run check` for all three) and `npm run export` to produce `dist/`.

## Deploy to Vercel

1. In the Vercel dashboard choose **Add New → Project → Import Git Repository** and pick `SquishyG-Exo/SpiritNotebook` (branch `claude/hopeful-darwin-6k3tei`, or `main` once it exists). Leave the framework preset as *Other*: `vercel.json` already sets the build command (`npx expo export --platform web`), the output directory (`dist`), the SPA rewrite, the function timeout, the `noindex` headers and the voice-prompt file the function needs.
2. Add the environment variables (Project → Settings → Environment Variables):

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | yes | Server-only. Without it `/api/interpret` answers `503 not_configured` and the app shows an honest "AI not set up" state (never a fake reading). |
   | `DEMO_PASSCODE` | no | When set, the app shows a passcode screen and the API refuses readings without it. |
   | `ANTHROPIC_MODEL` | no | Defaults to `claude-sonnet-5` (see `brand/config.ts`); `claude-opus-5` gives the richest prose at a slower, pricier call. |
   | `RATE_LIMIT_PER_IP_PER_MINUTE` / `RATE_LIMIT_PER_IP_PER_DAY` / `RATE_LIMIT_GLOBAL_PER_DAY` | no | Defaults 8 / 40 / 300. |
   | `ANTHROPIC_EFFORT` | no | `low` (default), `medium` or `high`: how much the model thinks before writing. |
   | `ANTHROPIC_FALLBACKS` | no | The server-side refusal fallback beta: on by default for Opus / Fable models, off for others; `on` / `off` force it. If the account lacks the beta the function retries once without it. |
   | `ALLOWED_ORIGIN` | no | Extra origins allowed to call the API cross-site (localhost is always allowed for development). |
   | `MOCK_AI` | never in production | `true` returns canned readings for local UI work. |

3. Deploy. Open the URL on a phone; on iOS use *Share → Add to Home Screen* to run it full-screen.

Or from the command line: `npx vercel` (preview) / `npx vercel --prod`.

## The AI reading

- **Voice**: `brand/voice.md` is the system prompt — a gentle, uplifting, non-dogmatic guide; never medical, legal, psychological or financial advice. If an entry suggests crisis or self-harm, the guide does not give a reading: it answers with care and points to **988** (US). The app renders that as a distinct "care" screen with tappable call/text buttons.
- **Shape**: the model returns `{ kind, title, interpretation, reflection_question }` through structured output; the function validates it with zod before returning it, and the client validates again.
- **Language**: the request carries `language: "en" | "es"`, and the reading comes back in that language.
- **Cost**: well under a cent per reading at Sonnet 5 prices with a ~1,100-token prompt and a short answer (roughly 1–2¢ on Opus 5); the global daily cap bounds the worst case. When a per-IP or global daily cap is reached the API answers `429` with a `Retry-After` of up to a day and the app asks the reader to come back tomorrow. Rate limits are kept in memory per serverless instance — good enough for a private demo, and the limiter sits behind a small interface so Redis (e.g. Upstash) can replace it without touching the handler.

## Re-skinning

Everything brand-specific lives in `/brand`:

- `config.ts` — name, palette, gradients, font names, crisis links, AI limits and default model.
- `categories.ts` — the category grid and Life Situations list (keys, icons, tints).
- `locales/en/*.json`, `locales/es/*.json` — every UI string, one file per screen.
- `sample-entries.ts` — the preloaded journal (both languages), `insights.ts` — the mocked Premium copy.
- `voice.md` — the AI guide's system prompt.

Fonts are loaded in `src/theme/fonts.ts` (Fraunces for display, DM Sans for body); icons are lucide line icons registered in `src/ui/icons.tsx`. App icons are generated from a single SVG design with `NODE_PATH=$(npm root -g) node scripts/icons/make-icons.cjs` (needs Playwright + Chromium).

## Artwork

The dreamscapes, butterflies, energy fields and sparkles are vector components in `src/ui/art/` (no image files): `Dreamscape` (sky, horizon glow, light rays, energy rings, cloud fields, misty hills; `dusk` / `dawn` / `night`), `DreamBanner` (a scene with glow, butterflies, sparkles and a fade into the page, used for screen headers and the reading banner), `Butterfly` (gradient wings with a soft wing-beat and drift), `EnergyField` (breathing radial glow) and `Sparkles`. They are crisp at any size, animate with Reanimated, never intercept touches, and respect reduced motion where the screen exposes it. The desktop backdrop behind the phone frame is `public/art/desktop-backdrop.svg`.

`DreamBanner` also accepts a bundled image (`source`) so painterly artwork can replace the vector scene per banner without touching the screens.

## Project structure

```
api/            Vercel serverless functions (interpret, unlock)
brand/          brand config, copy, sample content, AI voice prompt
public/         root HTML template, PWA manifest, icons, robots.txt
scripts/        local API dev server, icon generator
src/app/        Expo Router routes (thin)
src/features/   screen implementations by feature
src/ui/         shared primitives (Screen, AppText, Button, Card, Chip, Header, Icon…)
src/ui/art/     vector artwork (Dreamscape, DreamBanner, Butterfly, EnergyField, Sparkles)
src/theme/      design tokens and fonts
src/state/      in-memory journal + settings providers
src/i18n/       i18next setup
src/api/        client for /api (request/response contract)
src/server/     serverless internals (prompt, schema, limiter, passcode) + tests
```

## Where to go from here

Persistence and accounts (the journal store already has the right shape), Redis-backed rate limiting, streaming the reading token by token, real photo upload and vision-assisted readings, real Insights from saved entries, push reminders, and native builds through EAS. None of these require restructuring the code in this repository.
