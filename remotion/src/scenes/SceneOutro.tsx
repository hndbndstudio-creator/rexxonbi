import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { COLORS, FONTS } from '../MainVideo';

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoS = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const tagS = spring({ frame: frame - 18, fps, config: { damping: 22 } });
  const urlS = spring({ frame: frame - 36, fps, config: { damping: 22 } });

  const breath = 1 + Math.sin(frame / 14) * 0.015;

  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', transform: `scale(${breath})` }}>
        <div
          style={{
            fontSize: 130,
            fontWeight: 800,
            color: COLORS.ink,
            letterSpacing: -4,
            lineHeight: 1,
            opacity: logoS,
            transform: `translateY(${interpolate(logoS, [0, 1], [24, 0])}px)`,
          }}
        >
          rexxon
          <span style={{ color: COLORS.brand }}>.</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: COLORS.inkSoft,
            marginTop: 22,
            opacity: tagS,
            transform: `translateY(${interpolate(tagS, [0, 1], [12, 0])}px)`,
            fontWeight: 500,
          }}
        >
          Know who's about to buy.
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 14,
            color: COLORS.brand,
            marginTop: 36,
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: urlS,
          }}
        >
          rexxon.ai · 7-day free trial
        </div>
      </div>
    </AbsoluteFill>
  );
};
