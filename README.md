# Spirit Notebook — proof of concept

A clickable, phone-first demo of a spiritual journaling app: notice a sign, write it down, receive a warm AI reading, save it to your notebook, and watch patterns emerge. Everything is mocked and lives in memory **except the AI interpretation, which is real** (Anthropic Claude, called from one serverless function).

> This is a proof of concept for evaluation, not the production app. The code is organised so the production app can grow from it (see *Where to go from here*).

## What the demo shows

The look follows the client's approved "Design 4": a watercolor sunset sky over the sea, a watercolor lotus with gold accents, "Spirit Notebook" in a plum serif, translucent glass tiles with gold line icons, and a dark plum tab bar with a raised gold "+". A faint calligraphic "SN" monogram sits in the background of Home, Profile and the passcode screen.

| Screen | What happens |
| --- | --- |
| **Home** | The lotus, name, tagline ("Follow the signs. Discover the path your soul already knows.") and the client's twelve buttons in her order: Dreams, Numbers, Everyday Signs, Animals, Life Situations, Repeated Words, Spiritual Questions, Daily Gratitude, Whispers of Wisdom, Calendar, Search, Saved. The gear and avatar open Profile. Tabs: Home · Notebook · **+** · Calendar · Favorites. |
| **+ (new entry)** | The eight entry categories as glass tiles; Life Situations opens its list of 15 situations. |
| **New Entry** | Optional title (e.g. "Blue boat"), the date it happened (today or a past day, from a small calendar) and an optional time, the entry text with prompts, a UI-only photo attachment. Daily Gratitude and Everyday Signs have their own copy. |
| **Your Interpretation** | **Live AI reading**: title, interpretation, reflection question, shown under the entry's painting with the reader's own title. *Save to Notebook* (then the Calendar opens on the entry's day), *Journal My Thoughts*, and a heart to keep it in Favorites. Daily Gratitude gets a warm reflection instead of a symbolic reading. Graceful loading, error and crisis ("care") states. |
| **Search** | Finds past entries by their title and words, including notes and readings, ignoring case and accents; every word must match. Filter chips by category or notes. Results show date, category, title and an excerpt with the match highlighted, and open the full entry. Try "blue boat". |
| **Notebook** | Every entry by month, with category filters, a search shortcut and a Premium "patterns" card that opens Insights. |
| **Calendar** | Month view with dots on days that have entries; tap a day to see them, or add an entry for that day. |
| **Favorites** (the "Saved" button) | Hearted entries and saved whispers. |
| **Whispers of Wisdom** | An uplifting message for the day, another one on request, save or share. The messages are original; some are written "in the spirit of" a teacher from the reading list, never as quotes. |
| **Insights** | A believable pattern summary computed from the sample journal, labelled **Premium**. |
| **Profile** | English / Español (UI strings and AI answers), what the app offers, the Lab (advisor mode), the disclaimer, reset demo data. |

The journal is preloaded with nine sample entries, including the client's own search example: a dream titled "Blue boat" on May 17, and an Everyday Sign weeks later, "Saw a blue boat". State is in memory: reloading the page restores the samples.

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

Checks: `npm run typecheck`, `npm run lint`, `npm test` (or `npm run check` for all three) and `npm run export` to produce `dist/`. Tests cover the API internals, journal search, the composer's date and time model, whisper picking and the sample journal.

## Deploy to Vercel

1. In the Vercel dashboard choose **Add New → Project → Import Git Repository** and pick `SquishyG-Exo/SpiritNotebook` (branch `claude/hopeful-darwin-6k3tei`, or `main` once it exists). Leave the framework preset as *Other*: `vercel.json` already sets the build command (`npx expo export --platform web`), the output directory (`dist`), the SPA rewrite, the function timeout, the `noindex` headers and the voice-prompt file the function needs.
2. Add the environment variables (Project → Settings → Environment Variables):

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | yes | Server-only. Without it `/api/interpret` answers `503 not_configured` and the app shows an honest "AI not set up" state (never a fake reading). |
   | `DEMO_PASSCODE` | no | When set, the app shows a passcode screen and the API refuses readings without it. |
   | `ANTHROPIC_MODEL` | no | Defaults to `claude-sonnet-5` (see `src/server/config.ts`); `claude-opus-5` gives the richest prose at a slower, pricier call. |
   | `RATE_LIMIT_PER_IP_PER_MINUTE` / `RATE_LIMIT_PER_IP_PER_DAY` / `RATE_LIMIT_GLOBAL_PER_DAY` | no | Defaults 8 / 40 / 300. |
   | `ANTHROPIC_ADVISOR_MODEL` | no | Advisor model for the Profile → Lab "advisor mode" readings (default `claude-opus-5`). |
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
- **Title**: the reader's own title travels with the entry (`title`, up to 120 characters), and the guide reads it as part of the entry.
- **Everyday Signs** replaced Body Signs at the client's request. Body sensations ("my left palm itches") are read only as folklore, never as health information, and the guide says gently that a doctor is the right person when something sounds like a health concern. **Daily Gratitude** gets a warm 80–130-word reflection rather than a symbolic reading.
- **Reading list**: the client's books shape the voice ("Wellsprings" in `brand/voice.md`). The guide paraphrases their ideas, names at most one teacher per reading, and never quotes them or invents quotations.
- **Cost**: well under a cent per reading at Sonnet 5 prices with a ~1,100-token prompt and a short answer (roughly 1–2¢ on Opus 5); the global daily cap bounds the worst case. When a per-IP or global daily cap is reached the API answers `429` with a `Retry-After` of up to a day and the app asks the reader to come back tomorrow. Rate limits are kept in memory per serverless instance — good enough for a private demo, and the limiter sits behind a small interface so Redis (e.g. Upstash) can replace it without touching the handler.

## Re-skinning

Everything brand-specific lives in `/brand`:

- `config.ts` — name, palette, gradients, font names, crisis links and AI input limits (model choices stay server-side).
- `categories.ts` — the eight entry categories, the four feature buttons, the twelve-tile Home order and the Life Situations list (keys, icons, tints).
- `locales/en/*.json`, `locales/es/*.json` — every UI string, one file per screen.
- `sample-entries.ts` — the preloaded journal (both languages), `insights.ts` — the mocked Premium copy, `whispers.ts` — Whispers of Wisdom.
- `voice.md` — the AI guide's system prompt.

Fonts are loaded in `src/theme/fonts.ts` (Cormorant Garamond for display, DM Sans for body); icons are lucide line icons plus two custom ones (Butterfly, Lotus), registered in `src/ui/icons.tsx`. App and PWA icons are composed from the watercolor lotus and sky with `NODE_PATH=$(npm root -g) node scripts/icons/make-icons.cjs` (needs Playwright + Chromium), then compressed to 256-colour PNGs with libimagequant (the pngquant engine).

## Lab: advisor mode

Profile → Lab has an **Advisor mode** switch and a **Run a comparison** button. With advisor mode on, each reading is produced by the executor model (Sonnet 5) after it consults a stronger advisor model (Opus 5 by default) through the Anthropic [advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool): the advisor reads the entry and prompt, returns short strategic guidance, and the executor writes the reading. The comparison runs the same sample entry both ways and shows both readings with timings, whether the advisor was consulted, and the advice text when the advisor model returns it in plain text (Opus 4.8 does; Opus 5 returns it encrypted). Model names never reach the client: the UI copy speaks of a "deeper source", and the API response carries no model ids (they are in the function logs). Advisor readings cost roughly five times a standard one and take a few seconds longer; readings made this way carry an "Advisor" chip.

## Artwork

- **Painted art** lives in `assets/art/` as WebP and is registered in `src/ui/art/images.ts`: the Home sky (a calm watercolor sunset over the sea), a second sky for other screens, the watercolor lotus with gold accents (transparent), one square painting per category (used on entry cards and the reading banner) and a sample photo for the "Blue boat" entry. They were generated with an image model to match Design 4 and resized for phones. Swap a file and keep its name to re-skin.
- **The "SN" monogram** (`src/ui/art/Monogram.tsx`) is one vector path made from the "S" and "N" of Rouge Script (SIL Open Font License; credit in the file) with a hand-drawn swash, shown at 10–13% opacity in plum. No font file ships.
- **Vector pieces** (`Dreamscape`, `DreamBanner`, `Butterfly`, `EnergyField`, `Sparkles`) remain available for headers and edges. They never intercept touches and respect reduced motion where the screen exposes it.
- The desktop backdrop behind the phone frame is `public/art/sky-dusk.webp`.

## Project structure

```
api/            Vercel serverless functions (interpret, unlock)
brand/          brand config, categories, copy, sample content, whispers, AI voice prompt
public/         root HTML template, PWA manifest, icons, robots.txt
scripts/        local API dev server, icon generator
src/app/        Expo Router routes (thin)
src/features/   screen implementations by feature
src/ui/         shared primitives (Screen, AppText, Button, Card, Chip, Header, Icon…)
src/ui/art/     painted art registry (images.ts), monogram, sky backdrop, lotus, vector art
src/theme/      design tokens and fonts
src/state/      in-memory journal + settings providers
src/lib/        pure helpers: dates, journal search, category copy
src/i18n/       i18next setup
src/api/        client for /api (request/response contract)
src/server/     serverless internals (prompt, schema, limiter, passcode) + tests
```

## Where to go from here

Persistence and accounts (the journal store already has the right shape), Redis-backed rate limiting, streaming the reading token by token, real photo upload and vision-assisted readings, real Insights from saved entries, push reminders, and native builds through EAS. None of these require restructuring the code in this repository.
