import { useTranslation } from 'react-i18next';

import { AppText, Header, Screen } from '../../ui';

/** PLACEHOLDER: replaced by the feature implementation in the redesign. */
export default function FavoritesRoute() {
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <Header title={t('common.tabs.favorites')} />
      <AppText variant="body">{t('common.app.tagline')}</AppText>
    </Screen>
  );
}
