import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';
import { COLORS, FONTS } from '../MainVideo';

type Signal = {
  company: string;
  initial: string;
  type: string;
  title: string;
  ago: string;
  confidence: 'HIGH' | 'MED';
};

const SIGNALS: Signal[] = [
  { company: 'HashiCorp', initial: 'H', type: 'SALES OPS', title: 'Global Head of Sales Operations opening posted', ago: '3h ago', confidence: 'HIGH' },
  { company: 'Notion', initial: 'N', type: 'FUNDING', title: 'Series C round closed at $275M', ago: '5h ago', confidence: 'HIGH' },
  { company: 'Okta', initial: 'O', type: 'COMPLIANCE', title: 'New SOC 2 framework rollout announced', ago: '8h ago', confidence: 'MED' },
];

const SignalCard: React.FC<{ signal: Signal; delay: number; flash?: boolean }> = ({ signal, delay, flash }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 130 } });
  const y = interpolate(s, [0, 1], [40, 0]);

  // Flash highlight when first signal lands
  const flashOpacity = flash ? interpolate(frame - delay, [0, 8, 28], [0, 0.55, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }) : 0;

  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${y}px)`,
        background: '#FFFFFF',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: '22px 26px',
        display: 'flex',
        gap: 18,
        position: 'relative',
        boxShadow: '0 8px 24px -16px rgba(15,14,20,0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Flash overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(120deg, transparent 30%, ${COLORS.brand} 50%, transparent 70%)`,
          opacity: flashOpacity,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandGlow})`,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {signal.initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink }}>{signal.company}</span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 999,
              background: `${COLORS.amber}22`,
              color: '#9A6500',
              letterSpacing: 1,
            }}
          >
            {signal.type}
          </span>
          <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: FONTS.mono }}>{signal.ago}</span>
        </div>
        <div style={{ fontSize: 17, color: COLORS.inkSoft, lineHeight: 1.4 }}>{signal.title}</div>
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 10,
          padding: '6px 10px',
          borderRadius: 999,
          background: signal.confidence === 'HIGH' ? `${COLORS.green}1F` : `${COLORS.amber}1F`,
          color: signal.confidence === 'HIGH' ? '#0E7B3E' : '#9A6500',
          letterSpacing: 1,
          alignSelf: 'flex-start',
          height: 'fit-content',
        }}
      >
        ● {signal.confidence}
      </div>
    </div>
  );
};

export const Scene2Signal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 20 } });
  const titleY = interpolate(titleS, [0, 1], [16, 0]);

  // Pulsing live dot
  const pulse = 1 + Math.sin(frame / 6) * 0.15;

  return (
    <AbsoluteFill style={{ padding: '72px 96px' }}>
      {/* Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: titleS, transform: `translateY(${titleY}px)` }}>
        <div style={{ position: 'relative', width: 14, height: 14 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              background: COLORS.green,
              opacity: 0.35,
              transform: `scale(${pulse * 1.6})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 3,
              borderRadius: 999,
              background: COLORS.green,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 13,
            letterSpacing: 3,
            color: COLORS.brand,
            textTransform: 'uppercase',
          }}
        >
          Signal feed · live
        </span>
      </div>

      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: COLORS.ink,
          letterSpacing: -2,
          lineHeight: 1.05,
          marginTop: 16,
          opacity: titleS,
          transform: `translateY(${titleY}px)`,
          maxWidth: 1100,
        }}
      >
        The moment a budget activates.
      </div>

      {/* Stack of signals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 56, maxWidth: 1100 }}>
        <SignalCard signal={SIGNALS[0]} delay={36} flash />
        <SignalCard signal={SIGNALS[1]} delay={70} />
        <SignalCard signal={SIGNALS[2]} delay={100} />
      </div>

      {/* Counter ticking up */}
      <Sequence from={130}>
        <SignalCounter />
      </Sequence>
    </AbsoluteFill>
  );
};

const SignalCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20 } });
  const count = Math.round(interpolate(frame, [0, 90], [23, 48], { extrapolateRight: 'clamp' }));
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        right: 96,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)`,
        background: COLORS.ink,
        color: COLORS.cream,
        padding: '18px 24px',
        borderRadius: 16,
        boxShadow: '0 18px 40px -18px rgba(15,14,20,0.45)',
        minWidth: 220,
      }}
    >
      <div style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: 1.5, opacity: 0.7, textTransform: 'uppercase' }}>
        Today
      </div>
      <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1, marginTop: 2 }}>
        {count} <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7 }}>new signals</span>
      </div>
    </div>
  );
};
