import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { loadFont as loadOnest } from '@remotion/google-fonts/Onest';
import { loadFont as loadJetBrains } from '@remotion/google-fonts/JetBrainsMono';
import { Scene1Birdseye } from './scenes/Scene1Birdseye';
import { Scene2Signal } from './scenes/Scene2Signal';
import { Scene3Outreach } from './scenes/Scene3Outreach';
import { SceneOutro } from './scenes/SceneOutro';

const { fontFamily: onest } = loadOnest('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] });
const { fontFamily: mono } = loadJetBrains('normal', { weights: ['400', '500', '600'], subsets: ['latin'] });

export const FONTS = { onest, mono };
export const COLORS = {
  cream: '#F7F6F0',
  ink: '#0F0E14',
  inkSoft: '#3A3848',
  muted: '#8A8794',
  border: '#E8E7E2',
  brand: '#7C5CFF',
  brandGlow: '#A593FF',
  green: '#22C55E',
  amber: '#F59E0B',
  rose: '#F43F5E',
};

// Subtle warm grain overlay drifting across the whole video
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 900], [0, 40]);
  const y = interpolate(frame, [0, 900], [0, 30]);
  return (
    <AbsoluteFill
      style={{
        opacity: 0.06,
        mixBlendMode: 'multiply',
        backgroundImage:
          'radial-gradient(rgba(15,14,20,0.5) 1px, transparent 1px)',
        backgroundSize: '3px 3px',
        transform: `translate(${x}px, ${y}px)`,
        pointerEvents: 'none',
      }}
    />
  );
};

// Soft aurora that drifts behind every scene
const Aurora: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const x = interpolate(t, [0, 1], [-10, 10]);
  const y = interpolate(t, [0, 1], [0, -8]);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 50% at ${50 + x}% ${30 + y}%, ${COLORS.brand}22, transparent 70%), radial-gradient(45% 40% at ${20 - x}% ${80 + y}%, ${COLORS.brandGlow}1F, transparent 70%)`,
        pointerEvents: 'none',
      }}
    />
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream, fontFamily: onest }}>
      <Aurora />

      <TransitionSeries>
        {/* Scene 1: Bird's-eye — 8s */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <Scene1Birdseye />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })}
        />

        {/* Scene 2: Signal Feed — 9s */}
        <TransitionSeries.Sequence durationInFrames={270}>
          <Scene2Signal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })}
        />

        {/* Scene 3: Outreach — 9s */}
        <TransitionSeries.Sequence durationInFrames={270}>
          <Scene3Outreach />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 14 })}
        />

        {/* Outro — 4s */}
        <TransitionSeries.Sequence durationInFrames={140}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Grain />
    </AbsoluteFill>
  );
};
