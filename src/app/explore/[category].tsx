import { Redirect, useLocalSearchParams } from 'expo-router';

import { isCategoryKey } from '../../../brand/categories';
import { LifeSituationsScreen } from '../../features/explore/LifeSituationsScreen';
import { dateParam, withDate } from '../../features/explore/params';

/** Only "life" has a sub-list; any other valid category goes straight to the composer (keeping ?date=). */
export default function CategoryRoute() {
  const params = useLocalSearchParams<{ category?: string | string[]; date?: string | string[] }>();
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const date = dateParam(params.date);

  if (category === 'life') return <LifeSituationsScreen />;
  if (isCategoryKey(category)) {
    return <Redirect href={{ pathname: '/entry/new', params: { category, ...withDate(date) } }} />;
  }
  return <Redirect href={{ pathname: '/explore', params: withDate(date) }} />;
}
