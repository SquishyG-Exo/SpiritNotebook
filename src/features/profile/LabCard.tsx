import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { sampleEntries } from '../../../brand/sample-entries';
import { ApiError, requestInterpretation } from '../../api/client';
import { useSettings, type Reading, type ReadingMode } from '../../state';
import { colors, radius, spacing, withAlpha } from '../../theme';
import { AppText, Button, Chip, HitSlopArea, Icon } from '../../ui';
import { GlassCard, SectionTitle } from './GlassCard';

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
    <GlassCard style={styles.card}>
      <SectionTitle icon="Sparkles" title={t('profile.lab.title')} />
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
    </GlassCard>
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
        </AppText>
      </View>
      {result.errorKey ? (
        <AppText variant="small" color={colors.danger}>
          {t(result.errorKey)}
        </AppText>
      ) : null}
      {reading ? (
        <>
          <AppText variant="heading" color={colors.plum}>
            {reading.title}
          </AppText>
          {shown.map((paragraph, index) => (
            <AppText key={index} variant="small" color={colors.inkSoft}>
              {paragraph}
            </AppText>
          ))}
          {paragraphs.length > 1 ? (
            <Pressable onPress={() => setExpanded((value) => !value)} hitSlop={8}>
              <HitSlopArea hitSlop={8} />
              <AppText variant="smallMedium" color={colors.plum}>
                {t(expanded ? 'profile.lab.less' : 'profile.lab.more')}
              </AppText>
            </Pressable>
          ) : null}
          {variant === 'advisor' ? (
            <AppText variant="caption" color={reading.advisor?.consulted ? colors.success : colors.muted}>
              {t(reading.advisor?.consulted ? 'profile.lab.consulted' : 'profile.lab.notConsulted')}
            </AppText>
          ) : null}
          {reading.advice ? (
            <View style={styles.advice}>
              <AppText variant="overline" color={colors.goldDeep}>
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
      aria-checked={value}
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        const next = !value;
        position.set(withTiming(next ? 1 : 0, { duration: 180 }));
        onChange(next);
      }}
      style={[styles.track, value ? styles.trackOn : null]}>
      <HitSlopArea hitSlop={8} />
      <Animated.View style={[styles.knob, knobStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  toggleText: { flex: 1, gap: spacing.xs },
  divider: { height: 1, backgroundColor: withAlpha(colors.plum, 0.1), marginVertical: spacing.xs },
  track: {
    width: 50,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(colors.plum, 0.22),
    padding: 3,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.plum },
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
    backgroundColor: withAlpha(colors.white, 0.62),
    borderWidth: 1,
    borderColor: withAlpha(colors.plum, 0.1),
  },
  resultAdvisor: { backgroundColor: withAlpha(colors.peachSoft, 0.85) },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  advice: { gap: spacing.xs, marginTop: spacing.xs },
  adviceText: { fontSize: 16, lineHeight: 24 },
});
