import { useTranslation } from 'react-i18next';

import { AppText, Screen } from '../../ui';

/** PLACEHOLDER screen: replaced by the feature implementation. */
export default function NewEntryScreen() {
  const { t } = useTranslation();
  return (
    <Screen scroll>
      <AppText variant="title" style={{ marginTop: 24 }}>
        NewEntry
      </AppText>
      <AppText variant="body" color="#6F6A94" style={{ marginTop: 8 }}>
        {t('common.app.tagline')}
      </AppText>
    </Screen>
  );
}
