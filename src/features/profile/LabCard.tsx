import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { sampleEntries } from '../../../brand/sample-entries';
import { ApiError, requestInterpretation } from '../../api/client';
import { useSettings, type Reading, type ReadingMode } from '../../state';
import { colors, radius, spacing, withAlpha } from '../../theme';
import { AppText, Button, Card, Chip, Icon } from '../../ui';

const VARIANTS: readonly ReadingMode[] = ['standard', 'advisor'];

interface RunResult {
  reading?: Reading;
  errorKey?: string;
  ms: number;
}

function errorKeyFor(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'rate_limited':
        return 'common.errors.rateLimited';
      case 'not_configured':
        return 'common.errors.notConfigured';
      case 'unauthorized':
        return 'common.errors.unauthorized';
      case 'network':
        return 'common.errors.network';
      default:
        return 'common.errors.generic';
    }
  }
  return 'common.errors.generic';
}

/** Lab settings: the advisor-mode switch and a side-by-side comparison on a sample entry. */
export function LabCard() {
  const { t } = useTranslation();
  const { language, advisorMode, setAdvisorMode } = useSettings();
  const [running, setRunning] = useState<ReadingMode | null>(null);
  const [results, setResults] = useState<Partial<Record<ReadingMode, RunResult>>>({});

  const sample = sampleEntries.find((entry) => entry.id === 'sample-heron') ?? sampleEntries[0];
  const text = sample?.content[language]?.text ?? sample?.content.en.text ?? '';
  const category = sample?.category ?? 'animals';

  const run = useCallback(async () => {
    setResults({});
    for (const variant of VARIANTS) {
      setRunning(variant);
      const started = Date.now();
      try {
        const reading = await requestInterpretation({ text, category, language, mode: variant });
        setResults((current) => ({ ...current, [variant]: { reading, ms: Date.now() - started } }));
      } catch (error) {
        setResults((current) => ({
          ...current,
          [variant]: { errorKey: errorKeyFor(error), ms: Date.now() - started },
        }));
      }
    }
    setRunning(null);
  }, [text, category, language]);

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <Icon name="Sparkles" size={20} color={colors.lavenderDeep} />
        <AppText variant="heading">{t('profile.lab.title')}</AppText>
      </View>
      <AppText variant="small" color={colors.muted}>
        {t('profile.lab.subtitle')}
      </AppText>

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <AppText variant="bodyMedium">{t('profile.lab.toggle')}</AppText>
          <AppText variant="small" color={colors.muted}>
            {t('profile.lab.toggleHint')}
          </AppText>
        </View>
        <Toggle value={advisorMode} onChange={setAdvisorMode} label={t('profile.lab.toggle')} />
      </View>

      <View style={styles.divider} />

      <AppText variant="small" color={colors.muted}>
        {t('profile.lab.sample')}
      </AppText>
      <Button
        label={
          running === 'standard'
            ? t('profile.lab.runningStandard')
            : running === 'advisor'
              ? t('profile.lab.runningAdvisor')
              : t('profile.lab.run')
        }
        variant="secondary"
        size="md"
        loading={running !== null}
        onPress={() => void run()}
        icon={<Icon name="Compass" size={18} color={colors.roseDeep} />}
      />

      {VARIANTS.map((variant) => {
        const result = results[variant];
        if (!result) return null;
        return <ResultCard key={variant} variant={variant} result={result} />;
      })}
    </Card>
  );
}

function ResultCard({ variant, result }: { variant: ReadingMode; result: RunResult }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const reading = result.reading;
  const paragraphs = reading?.interpretation.split(/\n\s*\n/) ?? [];
  const shown = expanded ? paragraphs : paragraphs.slice(0, 1);
  const seconds = (result.ms / 1000).toFixed(1);

  return (
    <View style={[styles.result, variant === 'advisor' ? styles.resultAdvisor : null]}>
      <View style={styles.resultHeader}>
        <Chip
          label={t(variant === 'advisor' ? 'profile.lab.advisor' : 'profile.lab.standard')}
          tone={variant === 'advisor' ? 'premium' : 'lavender'}
        />
        <AppText variant="caption" color={colors.muted}>
          {t('profile.lab.seconds', { seconds })}
          {reading?.model ? ` · ${reading.model}` : ''}
        </AppText>
      </View>
      {result.errorKey ? (
        <AppText variant="small" color={colors.danger}>
          {t(result.errorKey)}
        </AppText>
      ) : null}
      {reading ? (
        <>
          <AppText variant="heading">{reading.title}</AppText>
          {shown.map((paragraph, index) => (
            <AppText key={index} variant="small" color={colors.inkSoft}>
              {paragraph}
            </AppText>
          ))}
          {paragraphs.length > 1 ? (
            <Pressable onPress={() => setExpanded((value) => !value)} hitSlop={8}>
              <AppText variant="smallMedium" color={colors.roseDeep}>
                {t(expanded ? 'profile.lab.less' : 'profile.lab.more')}
              </AppText>
            </Pressable>
          ) : null}
          {variant === 'advisor' ? (
            <AppText variant="caption" color={reading.advisor?.consulted ? colors.success : colors.muted}>
              {t(reading.advisor?.consulted ? 'profile.lab.consulted' : 'profile.lab.notConsulted')}
              {reading.advisor?.model ? ` · ${reading.advisor.model}` : ''}
            </AppText>
          ) : null}
          {reading.advice ? (
            <View style={styles.advice}>
              <AppText variant="overline" color={colors.lavenderDeep}>
                {t('profile.lab.advice')}
              </AppText>
              <AppText variant="quote" color={colors.inkSoft} style={styles.adviceText}>
                {reading.advice}
              </AppText>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (next: boolean) => void; label: string }) {
  const position = useSharedValue(value ? 1 : 0);
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: 22 * position.get() }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        const next = !value;
        position.set(withTiming(next ? 1 : 0, { duration: 180 }));
        onChange(next);
      }}
      style={[styles.track, value ? styles.trackOn : null]}>
      <Animated.View style={[styles.knob, knobStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  toggleText: { flex: 1, gap: spacing.xs },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: spacing.xs },
  track: {
    width: 50,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.hairline,
    padding: 3,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.roseDeep },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  result: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  resultAdvisor: { backgroundColor: withAlpha('#FBEFD6', 0.6) },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  advice: { gap: spacing.xs, marginTop: spacing.xs },
  adviceText: { fontSize: 16, lineHeight: 24 },
});
