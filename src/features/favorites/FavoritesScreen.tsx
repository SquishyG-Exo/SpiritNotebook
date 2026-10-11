import { router } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { whisperById, type Whisper } from '../../../brand/whispers';
import { entryTitle, useJournal, useSettings } from '../../state';
import { colors, fonts, spacing, withAlpha } from '../../theme';
import { AppText, Button, Icon } from '../../ui';
import { EmptyState, TextLink } from '../notebook/EmptyState';
import { EntryCard } from '../notebook/EntryCard';
import { glass, glassBlur } from '../notebook/glass';
import { HeartButton } from '../notebook/HeartButton';
import { SectionHeader } from '../notebook/SectionHeader';
import { ProfileButton, SkyHeader } from '../notebook/SkyHeader';
import { SkyPage, skyPage, useSkyPadding } from '../notebook/SkyPage';
import { WhisperCard } from './WhisperCard';

/**
 * Saved (the Favorites tab; the Home tile calls it "Saved"): favorite
 * entries, then saved whispers. Each heart un-saves in place.
 */
export function FavoritesScreen() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { favoriteEntries, toggleFavorite, savedWhispers, toggleWhisper } = useJournal();
  const padding = useSkyPadding('tab');

  const whispers = useMemo(
    () => savedWhispers.map((id) => whisperById(id)).filter((w): w is Whisper => Boolean(w)),
    [savedWhispers],
  );
  const nothingSaved = favoriteEntries.length === 0 && whispers.length === 0;

  return (
    <SkyPage>
      <ScrollView
        style={skyPage.scroll}
        contentContainerStyle={[skyPage.content, padding]}
        showsVerticalScrollIndicator={false}>
        <SkyHeader title={t('favorites.title')} subtitle={t('favorites.subtitle')} right={<ProfileButton />} />

        {nothingSaved ? (
          <View style={styles.firstSection}>
            <NothingSaved />
          </View>
        ) : (
          <>
            <Section title={t('favorites.entriesTitle')} count={favoriteEntries.length} first>
              {favoriteEntries.length > 0 ? (
                favoriteEntries.map((entry, index) => (
                  <Animated.View key={entry.id} exiting={FadeOut.duration(180)} layout={LinearTransition.duration(260)}>
                    <EntryCard
                      entry={entry}
                      index={index}
                      testID={`saved-${entry.id}`}
                      action={
                        <HeartButton
                          label={t('favorites.unsaveEntry', { title: entryTitle(entry, language) })}
                          onPress={() => toggleFavorite(entry.id)}
                          testID={`unsave-${entry.id}`}
                        />
                      }
                    />
                  </Animated.View>
                ))
              ) : (
                <InlineHint text={t('favorites.noEntries')} />
              )}
            </Section>

            <Section title={t('favorites.whispersTitle')} count={whispers.length}>
              {whispers.length > 0 ? (
                whispers.map((whisper, index) => (
                  <Animated.View key={whisper.id} layout={LinearTransition.duration(260)}>
                    <WhisperCard whisper={whisper} index={index} onUnsave={() => toggleWhisper(whisper.id)} />
                  </Animated.View>
                ))
              ) : (
                <InlineHint text={t('favorites.noWhispers')}>
                  <TextLink
                    label={t('favorites.readWhisper')}
                    onPress={() => router.push('/whispers')}
                    testID="saved-read-whisper"
                  />
                </InlineHint>
              )}
            </Section>
          </>
        )}
      </ScrollView>
    </SkyPage>
  );
}

function Section({
  title,
  count,
  first = false,
  children,
}: {
  title: string;
  count: number;
  first?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <View style={first ? styles.firstSection : styles.section}>
      <SectionHeader title={title} meta={count > 0 ? t('favorites.count', { count }) : undefined} />
      <View style={styles.list}>{children}</View>
    </View>
  );
}

/** One quiet line for an empty section, with an optional action. */
function InlineHint({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={[glass.card, glassBlur, styles.hint]}>
      <View style={styles.hintRow}>
        <View style={styles.hintIcon}>
          <Icon name="Heart" size={16} color={colors.roseDeep} strokeWidth={1.8} />
        </View>
        <AppText style={styles.hintText}>{text}</AppText>
      </View>
      {children}
    </Animated.View>
  );
}

/** Nothing saved yet: how the heart works on a reading and on a whisper. */
function NothingSaved() {
  const { t } = useTranslation();
  return (
    <EmptyState icon="Heart" title={t('favorites.emptyTitle')} hint={t('favorites.emptyIntro')} testID="saved-empty">
      <View style={styles.howTo}>
        <HowToRow icon="BookOpen" text={t('favorites.emptyReading')} />
        <HowToRow icon="Sun" text={t('favorites.emptyWhisper')} />
      </View>
      <Button
        label={t('favorites.openNotebook')}
        size="md"
        fullWidth={false}
        onPress={() => router.navigate('/notebook')}
        style={styles.button}
      />
      <TextLink label={t('favorites.readWhisper')} onPress={() => router.push('/whispers')} />
    </EmptyState>
  );
}

function HowToRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.howToRow}>
      <View style={styles.howToIcon}>
        <Icon name={icon} size={16} color={colors.gold} strokeWidth={1.8} />
        <View style={styles.howToHeart}>
          <Icon name="Heart" size={10} color={colors.roseDeep} fill={colors.roseDeep} strokeWidth={1.6} />
        </View>
      </View>
      <AppText style={styles.howToText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  firstSection: { marginTop: spacing.xxl, gap: spacing.md },
  section: { marginTop: spacing.xxl + spacing.sm, gap: spacing.md },
  list: { gap: spacing.md },
  hint: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg, gap: spacing.xs },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hintIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.roseSoft, 0.8),
  },
  hintText: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  howTo: { alignSelf: 'stretch', gap: spacing.md, marginVertical: spacing.xs },
  howToRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  howToIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.goldLight, 0.3),
  },
  howToHeart: { position: 'absolute', right: -2, bottom: -2 },
  howToText: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  button: { alignSelf: 'center', marginTop: spacing.xs },
});
