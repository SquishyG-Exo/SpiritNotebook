import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError, unlockWithPasscode } from '../../api/client';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { AppText, Button, Icon, IconCircle } from '../../ui';
import { Butterfly, Dreamscape, Sparkles, type SparkleSpec } from '../../ui/art';
import { withAlpha } from '../insights/insightsModel';

const MAX_LENGTH = 32;

/** Twinkles in the open sky above the content and over the hills below it. */
const SKY_SPARKLES: SparkleSpec[] = [
  { x: 0.14, y: 0.05, size: 11, delay: 0 },
  { x: 0.6, y: 0.08, size: 8, delay: 700 },
  { x: 0.88, y: 0.04, size: 10, delay: 1400 },
  { x: 0.12, y: 0.95, size: 9, delay: 1000 },
];

/** Cream mist behind the brand block, card and hint: the scenery shows above and below it. */
const MIST = withAlpha(colors.cream, 0.78);
const MIST_CLEAR = withAlpha(colors.cream, 0);
const HILLS_VEIL = [withAlpha(colors.lavender, 0), withAlpha(colors.lavender, 0.5)] as const;
/** How far the mist fades out beyond the content, top and bottom. */
const MIST_EDGE = 96;
/** Each fade reaches full strength a little inside the content, so text never sits on a thin edge. */
const MIST_FADE = MIST_EDGE + spacing.xxl;

function errorMessageKey(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'network') return 'common.errors.network';
    if (error.code === 'rate_limited') return 'common.errors.rateLimited';
  }
  return 'common.errors.generic';
}

/** Full-screen passcode prompt for private previews. */
export function UnlockScreen({ onUnlocked }: { onUnlocked: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; wrongCode: boolean } | null>(null);

  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));

  const submit = async () => {
    const value = code.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (await unlockWithPasscode(value)) {
        onUnlocked();
        return;
      }
      setError({ message: t('unlock.wrong'), wrongCode: true });
      shake.set(
        withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 60 }),
          withTiming(-7, { duration: 60 }),
          withTiming(7, { duration: 60 }),
          withTiming(-3, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        ),
      );
    } catch (caught) {
      setError({ message: t(errorMessageKey(caught)), wrongCode: false });
    }
    setBusy(false);
  };

  return (
    <View style={styles.root}>
      <Dreamscape variant="dusk" />
      {/* Softens the zoomed-in near hills so the page closes in lavender, not a heavy violet block. */}
      <LinearGradient pointerEvents="none" colors={HILLS_VEIL} style={styles.hillsVeil} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Sparkles sparkles={SKY_SPARKLES} />
        <Butterfly size={58} rotation={-14} style={[styles.butterfly, { top: insets.top + 56, left: 18 }]} />
        <Butterfly
          size={36}
          rotation={18}
          delay={900}
          colorA={colors.peach}
          colorB={colors.rose}
          opacity={0.8}
          style={[styles.butterfly, { top: insets.top + 112, right: 22 }]}
        />
        <Butterfly
          size={26}
          rotation={-24}
          delay={1800}
          colorA={colors.peach}
          colorB={colors.lavender}
          opacity={0.9}
          style={[styles.butterfly, { bottom: insets.bottom + 64, right: 40 }]}
        />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xxxl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View pointerEvents="none" style={styles.mist}>
              <LinearGradient colors={[MIST_CLEAR, MIST]} style={styles.mistEdgeTop} />
              <View style={styles.mistBody} />
              <LinearGradient colors={[MIST, MIST_CLEAR]} style={styles.mistEdgeBottom} />
            </View>
            <Animated.View entering={FadeInUp.duration(520)} style={styles.brand}>
              <IconCircle name="Moon" size={68} tint={colors.white} color={colors.lavenderDeep} style={shadow.glow} />
              <AppText variant="display" align="center">
                {t('common.app.name')}
              </AppText>
              <AppText variant="small" color={colors.inkSoft} align="center">
                {t('common.app.shortTagline')}
              </AppText>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(520).delay(120)}>
              <Animated.View style={[styles.card, shakeStyle]}>
                <View style={styles.cardText}>
                  <AppText variant="heading" align="center" accessibilityRole="header">
                    {t('unlock.title')}
                  </AppText>
                  <AppText variant="small" color={colors.muted} align="center">
                    {t('unlock.subtitle')}
                  </AppText>
                </View>

                <View
                  style={[
                    styles.field,
                    focused ? styles.fieldFocused : null,
                    error?.wrongCode ? styles.fieldError : null,
                  ]}>
                  <View style={styles.fieldIcon}>
                    <Icon name="LockKeyhole" size={18} color={focused ? colors.lavenderDeep : colors.muted} />
                  </View>
                  <TextInput
                    value={code}
                    onChangeText={(next) => {
                      setCode(next);
                      if (error) setError(null);
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onSubmitEditing={() => void submit()}
                    placeholder={t('unlock.placeholder')}
                    placeholderTextColor={colors.faint}
                    secureTextEntry={!revealed}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    spellCheck={false}
                    keyboardType="default"
                    returnKeyType="go"
                    enterKeyHint="go"
                    maxLength={MAX_LENGTH}
                    editable={!busy}
                    accessibilityLabel={t('unlock.placeholder')}
                    style={[styles.input, !revealed && code ? styles.inputHidden : null]}
                    testID="unlock-input"
                  />
                  <Pressable
                    onPress={() => setRevealed((v) => !v)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={revealed ? t('unlock.hide') : t('unlock.show')}
                    style={({ pressed }) => [styles.eye, pressed ? styles.pressed : null]}>
                    {revealed ? (
                      <Icon name="EyeOff" size={20} color={colors.muted} strokeWidth={1.75} />
                    ) : (
                      <Icon name="Eye" size={20} color={colors.muted} />
                    )}
                  </Pressable>
                </View>

                <View style={styles.errorSlot} accessibilityLiveRegion="polite">
                  {error ? (
                    <Animated.View entering={FadeIn.duration(160)}>
                      <AppText variant="small" color={colors.danger} align="center" testID="unlock-error">
                        {error.message}
                      </AppText>
                    </Animated.View>
                  ) : null}
                </View>

                <Button
                  label={t('unlock.submit')}
                  onPress={() => void submit()}
                  loading={busy}
                  disabled={!code.trim()}
                  testID="unlock-submit"
                />
              </Animated.View>
            </Animated.View>

            <Animated.View entering={FadeIn.duration(600).delay(360)}>
              <AppText variant="caption" color={colors.inkSoft} align="center" style={styles.hint}>
                {t('unlock.hint')}
              </AppText>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, overflow: 'hidden' },
  flex: { flex: 1 },
  hillsVeil: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '32%' },
  butterfly: { position: 'absolute' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  content: { width: '100%', maxWidth: 380, alignSelf: 'center', gap: spacing.xxl },
  // Hugs the content (so it follows it when it scrolls or wraps) and bleeds past the screen edges.
  mist: { position: 'absolute', top: -MIST_EDGE, bottom: -MIST_EDGE, left: -80, right: -80 },
  mistEdgeTop: { height: MIST_FADE },
  mistBody: { flex: 1, backgroundColor: MIST },
  mistEdgeBottom: { height: MIST_FADE },
  brand: { alignItems: 'center', gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    gap: spacing.lg,
    ...shadow.lifted,
  },
  cardText: { gap: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 56,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    backgroundColor: colors.cream,
  },
  fieldFocused: { borderColor: colors.lavender, backgroundColor: colors.surface },
  fieldError: { borderColor: colors.rose },
  fieldIcon: { flexShrink: 0 },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    color: colors.ink,
    paddingVertical: 0,
  },
  inputHidden: { letterSpacing: 3 },
  eye: {
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  errorSlot: { minHeight: 20, justifyContent: 'center', marginTop: -spacing.xs, marginBottom: -spacing.xs },
  hint: { paddingHorizontal: spacing.lg },
});
