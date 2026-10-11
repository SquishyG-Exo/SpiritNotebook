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
    // Design 4: warm sunset palette, plum titles, gold accents.
    ink: '#2E2340',
    inkSoft: '#4A3D5E',
    muted: '#6E6283',
    faint: '#A99FBE',
    cream: '#FFF9F5',
    surface: '#FFFFFF',
    surfaceTint: '#FBF4F7',
    hairline: '#EFE6EE',
    /** Translucent tile / card glass over the sunset art. */
    glass: 'rgba(255, 250, 247, 0.72)',
    glassBorder: 'rgba(255, 255, 255, 0.85)',
    plum: '#5B3876',
    plumDeep: '#3F2656',
    lavender: '#C9B9F2',
    lavenderSoft: '#EDE6FB',
    lavenderDeep: '#6D5BBE',
    rose: '#E9A6BB',
    roseSoft: '#F9E1E9',
    roseDeep: '#A64A6B',
    peach: '#F6C8A8',
    peachSoft: '#FCE9DC',
    /** Line icons on light glass (3:1 for graphics). */
    gold: '#AD7A39',
    /** Gold text on light surfaces (AA). */
    goldDeep: '#7F561F',
    goldLight: '#E7C07A',
    /** Bottom navigation bar. */
    navDark: '#2B1C33',
    navDarkSoft: '#3D2A47',
    navy: '#2A2660',
    navyDeep: '#171436',
    success: '#4F8F6F',
    danger: '#C8463F',
    white: '#FFFFFF',
  },

  gradients: {
    /** Light page hero: peach → rose → lavender. */
    dusk: ['#FBE3D5', '#F3CCDB', '#D5C6F3'],
    /** Sunset sky (top → horizon): lavender → rose → peach. */
    sunset: ['#B7A2DC', '#E8B5CA', '#F8D3B5'],
    /** Sunset sky: violet → rose → peach. */
    sky: ['#8E7BC8', '#D9A6C4', '#F7CDB0'],
    /** Deep water / night. */
    night: ['#1B1840', '#2E2A6A', '#5D4C9C'],
    /** Primary call to action: lavender plum (the client's chosen purple). */
    cta: ['#8E5BA0', '#6D4689'],
    /** Gold accent: the centre "+" button. */
    gold: ['#EBC781', '#B98544'],
    /** Bottom navigation bar. */
    nav: ['#36243F', '#24172B'],
    /** Premium accents. */
    premium: ['#F1C27D', '#E39BB4', '#B8A2EA'],
  },

  /** Keys must match the font assets registered in src/theme/fonts.ts. */
  fonts: {
    // Cormorant Garamond: the classic serif of the approved Design 4.
    display: 'CormorantGaramond_600SemiBold',
    displayRegular: 'CormorantGaramond_500Medium',
    displaySemiBold: 'CormorantGaramond_700Bold',
    displayItalic: 'CormorantGaramond_500Medium_Italic',
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
    // The models used are server-side settings (src/server/config.ts): this file ships in the client bundle.
    minInputChars: 8,
    maxInputChars: 1500,
    maxOutputTokens: 1024,
  },

  languages: ['en', 'es'],
  defaultLanguage: 'en',
} as const;

export type BrandLanguage = (typeof brand.languages)[number];
