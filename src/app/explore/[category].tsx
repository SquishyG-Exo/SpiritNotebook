import { Redirect, useLocalSearchParams } from 'expo-router';

import { isCategoryKey } from '../../../brand/categories';
import { LifeSituationsScreen } from '../../features/explore/LifeSituationsScreen';
import { firstParam } from '../../features/entry/params';

/** Only "life" has a sub-list; any other valid category goes straight to the composer. */
export default function CategoryRoute() {
  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const category = firstParam(params.category);

  if (category === 'life') return <LifeSituationsScreen />;
  if (isCategoryKey(category)) {
    return <Redirect href={{ pathname: '/entry/new', params: { category } }} />;
  }
  return <Redirect href="/explore" />;
}
