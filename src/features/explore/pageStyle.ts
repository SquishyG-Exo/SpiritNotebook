import { StyleSheet } from 'react-native';

import { layout } from '../../theme';

/** Keeps scroll content phone-width when the window is wider (landscape, desktop without the frame). */
export const pageStyle = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
});
