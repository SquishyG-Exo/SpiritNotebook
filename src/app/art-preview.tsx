import { ScrollView, View } from 'react-native';

import { colors, spacing } from '../theme';
import { AppText } from '../ui';
import { Butterfly, DreamBanner, EnergyField, Sparkles } from '../ui/art';

/** TEMPORARY: visual check of the art components. Removed before release. */
export default function ArtPreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.cream }} contentContainerStyle={{ paddingBottom: 60 }}>
      <DreamBanner height={220} butterflies="many">
        <View style={{ padding: 20 }}>
          <AppText variant="display" color="#FFFFFF">Dusk banner</AppText>
        </View>
      </DreamBanner>
      <View style={{ padding: 20, gap: 16 }}>
        <DreamBanner variant="dawn" height={160} rounded fadeTo={null}>
          <View style={{ padding: 16 }}>
            <AppText variant="heading">Dawn, rounded</AppText>
          </View>
        </DreamBanner>
        <DreamBanner variant="night" height={160} rounded fadeTo={null} butterflies="few">
          <View style={{ padding: 16 }}>
            <AppText variant="heading" color="#FFFFFF">Night, rounded</AppText>
          </View>
        </DreamBanner>
        <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
          <EnergyField size={260} color={colors.rose} intensity={0.7} />
          <EnergyField size={160} color={colors.lavender} intensity={0.6} delay={1200} style={{ left: 40, top: 10 }} />
          <Sparkles color={colors.gold} sparkles={[{ x: 0.2, y: 0.3, size: 12 }, { x: 0.8, y: 0.25, size: 10, delay: 500 }, { x: 0.65, y: 0.75, size: 8, delay: 900 }]} />
          <AppText variant="title">Energy field on cream</AppText>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 120 }}>
          <Butterfly size={96} />
          <Butterfly size={64} rotation={-20} colorA={colors.peach} colorB={colors.rose} />
          <Butterfly size={44} rotation={25} colorA={colors.lavender} colorB={colors.lavenderDeep} />
          <Butterfly size={28} rotation={-35} colorA={colors.gold} colorB={colors.peach} />
        </View>
        <View style={{ height: spacing.lg }} />
      </View>
    </ScrollView>
  );
}
