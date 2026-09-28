/**
 * Every UI string comes from brand/locales/<lang>/<namespace>.json.
 * Namespaces are nested under the default translation namespace, so keys
 * read as t('home.title'), t('common.tabs.home'), t('categories.dreams.label').
 */
import enCalendar from '../../brand/locales/en/calendar.json';
import enCategories from '../../brand/locales/en/categories.json';
import enCommon from '../../brand/locales/en/common.json';
import enEntry from '../../brand/locales/en/entry.json';
import enExplore from '../../brand/locales/en/explore.json';
import enHome from '../../brand/locales/en/home.json';
import enInsights from '../../brand/locales/en/insights.json';
import enProfile from '../../brand/locales/en/profile.json';
import enReading from '../../brand/locales/en/reading.json';
import enUnlock from '../../brand/locales/en/unlock.json';
import esCalendar from '../../brand/locales/es/calendar.json';
import esCategories from '../../brand/locales/es/categories.json';
import esCommon from '../../brand/locales/es/common.json';
import esEntry from '../../brand/locales/es/entry.json';
import esExplore from '../../brand/locales/es/explore.json';
import esHome from '../../brand/locales/es/home.json';
import esInsights from '../../brand/locales/es/insights.json';
import esProfile from '../../brand/locales/es/profile.json';
import esReading from '../../brand/locales/es/reading.json';
import esUnlock from '../../brand/locales/es/unlock.json';

export const resources = {
  en: {
    translation: {
      common: enCommon,
      categories: enCategories,
      home: enHome,
      explore: enExplore,
      entry: enEntry,
      reading: enReading,
      calendar: enCalendar,
      insights: enInsights,
      profile: enProfile,
      unlock: enUnlock,
    },
  },
  es: {
    translation: {
      common: esCommon,
      categories: esCategories,
      home: esHome,
      explore: esExplore,
      entry: esEntry,
      reading: esReading,
      calendar: esCalendar,
      insights: esInsights,
      profile: esProfile,
      unlock: esUnlock,
    },
  },
} as const;
