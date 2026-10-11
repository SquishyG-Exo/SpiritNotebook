import { useTranslation } from 'react-i18next';

import { AppText, Header, Screen } from '../ui';

/** PLACEHOLDER: replaced by the feature implementation in the redesign. */
export default function SearchRoute() {
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <Header title={t('common.tabs.search')} />
      <AppText variant="body">{t('common.app.tagline')}</AppText>
    </Screen>
  );
}
