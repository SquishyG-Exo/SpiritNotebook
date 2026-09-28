/**
 * Spirit Notebook brand configuration.
 *
 * Everything a re-skin needs to touch lives in this folder:
 *   config.ts        name, palette, fonts, links, AI limits
 *   categories.ts    the category grid and the Life Situations list
 *   locales/         every UI string, per language
 *   sample-entries   the preloaded demo journal
 *   insights.ts      the mocked Premium insights
 *   voice.md         the AI guide's system prompt
 *
 * This file must stay free of React Native imports: the serverless API
 * imports it too.
 */
export const brand = {
  name: 'Spirit Notebook',
  shortName: 'Spirit',
  slug: 'spirit-notebook',

  colors: {
    ink: '#1F1B45',
    inkSoft: '#3E3A6E',
    muted: '#6F6A94',
    faint: '#A9A4C6',
    cream: '#FFF9F5',
    surface: '#FFFFFF',
    surfaceTint: '#FBF4F7',
    hairline: '#EFE6EE',
    lavender: '#C9B9F2',
    lavenderSoft: '#EDE6FB',
    lavenderDeep: '#6D5BBE',
    rose: '#E9A6BB',
    roseSoft: '#F9E1E9',
    roseDeep: '#C8698A',
    peach: '#F6C8A8',
    peachSoft: '#FCE9DC',
    gold: '#CFA55B',
    navy: '#2A2660',
    navyDeep: '#171436',
    success: '#5BA37F',
    danger: '#D9534F',
    white: '#FFFFFF',
  },

  gradients: {
    /** Light page hero: peach → rose → lavender. */
    dusk: ['#FBE3D5', '#F3CCDB', '#D5C6F3'],
    /** Sunset sky: violet → rose → peach. */
    sky: ['#8E7BC8', '#D9A6C4', '#F7CDB0'],
    /** Deep water / night. */
    night: ['#1B1840', '#2E2A6A', '#5D4C9C'],
    /** Primary call to action. */
    cta: ['#D27A9B', '#B86B9E'],
    /** Premium accents. */
    premium: ['#F1C27D', '#E39BB4', '#B8A2EA'],
  },

  /** Keys must match the font assets registered in src/theme/fonts.ts. */
  fonts: {
    display: 'Fraunces_500Medium',
    displayRegular: 'Fraunces_400Regular',
    displaySemiBold: 'Fraunces_600SemiBold',
    displayItalic: 'Fraunces_400Regular_Italic',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodySemiBold: 'DMSans_600SemiBold',
    bodyBold: 'DMSans_700Bold',
  },

  links: {
    crisisLine: {
      label: '988',
      tel: 'tel:988',
      sms: 'sms:988',
      url: 'https://988lifeline.org',
    },
  },

  ai: {
    /** Overridable with the ANTHROPIC_MODEL env var on the server. */
    defaultModel: 'claude-opus-5',
    minInputChars: 8,
    maxInputChars: 1500,
    maxOutputTokens: 1024,
  },

  languages: ['en', 'es'],
  defaultLanguage: 'en',
} as const;

export type BrandLanguage = (typeof brand.languages)[number];
