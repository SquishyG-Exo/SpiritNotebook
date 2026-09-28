This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

---

## Spirit Notebook conventions

This is a clickable proof of concept: mocked journal state in memory, a real AI reading via one serverless function. Keep the code production-shaped so the real app can grow from it.

### Layout

- `brand/` — everything a re-skin touches: `config.ts` (name, palette, fonts, AI limits), `categories.ts`, `locales/<lang>/<namespace>.json` (all UI copy), `sample-entries.ts`, `insights.ts`, `voice.md` (AI system prompt). No React Native imports in `brand/config.ts` or `brand/categories.ts`: the API imports them too.
- `src/app/` — Expo Router routes only. Screen logic lives in `src/features/<feature>/`.
- `src/ui/art/` — vector artwork (`DreamBanner`, `Dreamscape`, `Butterfly`, `EnergyField`, `Sparkles`). Use them for headers, banners and edge decoration; keep animated elements per screen modest (≤ 8) and never place art over text or inputs.
- `src/ui/` — shared primitives (`Screen`, `AppText`, `Button`, `Card`, `Chip`, `IconCircle`, `Header`, `Icon`, `PressableScale`, `TabBar`). Use them before writing new styled views.
- `src/theme/` — tokens (`colors`, `gradients`, `fonts`, `type`, `spacing`, `radius`, `shadow`, `layout`). Never hard-code colors or font names in features.
- `src/state/` — `useJournal()` (entries, drafts, save, notes, reset) and `useSettings()` (language, unlock). Journal state is in memory on purpose.
- `src/i18n/` — i18next. Strings are `t('namespace.key')`; add keys to BOTH `brand/locales/en/<namespace>.json` and `brand/locales/es/<namespace>.json`.
- `src/api/client.ts` — the only place that talks to `/api`. The request/response contract is documented at the top of the file.
- `api/` — Vercel serverless functions (Node, Web-standard `Request`/`Response`). `src/server/` holds their testable internals.
- `public/index.html` — the root HTML template Expo uses for the web export. `src/global.css` — page chrome (desktop phone frame).

### Rules of thumb

- Dates: use `src/lib/dates.ts` with the current language from `useSettings()`; never hand-format.
- Icons: `<Icon name="Moon" />` with lucide names registered in `src/ui/icons.tsx`.
- Reanimated shared values: `.get()` / `.set()` (the `.value` setter trips the React Compiler lint rule).
- Animations should be subtle: fade/slide-in on mount, spring scale on press, one gentle looping element at most per screen.
- Sample entries are resolved per language with `resolveContent(entry, language)`.
- In this sandbox `npx expo install` cannot reach the Expo API. Install with `npm install <pkg>@<version>` using versions from `node_modules/expo/bundledNativeModules.json`.
- Before finishing: `npm run typecheck && npm run lint && npm test`, and `npm run export` when you touched anything that bundles.
