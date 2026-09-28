import { Link } from 'expo-router';

import { AppText, Screen } from '../ui';

export default function NotFoundScreen() {
  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center' }}>
      <AppText variant="title" align="center">
        This page drifted away.
      </AppText>
      <Link href="/" style={{ marginTop: 16 }}>
        <AppText variant="bodyMedium" color="#C8698A">
          Return home
        </AppText>
      </Link>
    </Screen>
  );
}
