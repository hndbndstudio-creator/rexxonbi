import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';
import { COLORS, FONTS } from '../MainVideo';

const Stat: React.FC<{ label: string; value: string; trend?: string; delay: number }> = ({
  label,
  value,
  trend,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 140 } });
  const y = interpolate(s, [0, 1], [16, 0]);
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${y}px)`,
        background: 'rgba(255,255,255,0.7)',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: '14px 18px',
        minWidth: 200,
      }}
    >
      <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, letterSpacing: 1.4, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.ink, letterSpacing: -0.5 }}>{value}</div>
        {trend && (
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.green, fontFamily: FONTS.mono }}>↗ {trend}</div>
        )}
      </div>
    </div>
  );
};

export const Scene1Birdseye: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const titleY = interpolate(titleS, [0, 1], [22, 0]);

  const subS = spring({ frame: frame - 8, fps, config: { damping: 22 } });

  // Greeting -> name reveal
  const nameOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Donut progress
  const progress = interpolate(frame, [40, 130], [0, 0.89], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const dash = circ * progress;

  // Idle breathing on donut after fill
  const breath = Math.sin((frame - 130) / 18) * 1.5;

  return (
    <AbsoluteFill style={{ padding: '72px 96px', display: 'flex', flexDirection: 'column' }}>
      {/* Eyebrow */}
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 13,
          letterSpacing: 3,
          color: COLORS.brand,
          textTransform: 'uppercase',
          opacity: titleS,
          transform: `translateY(${titleY}px)`,
        }}
      >
        ● Bird's-eye
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 92,
          fontWeight: 700,
          color: COLORS.ink,
          letterSpacing: -2.5,
          lineHeight: 1.05,
          marginTop: 18,
          opacity: titleS,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Good morning,{' '}
        <span style={{ color: COLORS.brand, opacity: nameOpacity }}>Alex.</span>
      </div>
      <div
        style={{
          fontSize: 26,
          color: COLORS.inkSoft,
          marginTop: 14,
          opacity: subS,
          maxWidth: 900,
        }}
      >
        Your entire pipeline. One calm screen.
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginTop: 56, flexWrap: 'wrap' }}>
        <Stat label="Streak" value="15 days" trend="+12%" delay={20} />
        <Stat label="Pipeline" value="$284K" trend="+15%" delay={28} />
        <Stat label="Hot leads" value="47" trend="+8%" delay={36} />
        <Stat label="Reached" value="156" trend="+20%" delay={44} />
      </div>

      {/* Donut ring */}
      <Sequence from={20}>
        <div
          style={{
            position: 'absolute',
            top: 96,
            right: 110,
            width: 220,
            height: 220,
            transform: `scale(${1 + breath / 200})`,
          }}
        >
          <svg width="220" height="220" viewBox="0 0 220 220">
            <defs>
              <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor={COLORS.brand} />
                <stop offset="100%" stopColor={COLORS.brandGlow} />
              </linearGradient>
            </defs>
            <circle cx="110" cy="110" r={radius} fill="none" stroke={COLORS.border} strokeWidth="14" />
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="url(#ring)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              transform="rotate(-90 110 110)"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 700, color: COLORS.ink, letterSpacing: -1.5 }}>
              {Math.round(progress * 100)}
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>
              Of target
            </div>
          </div>
        </div>
      </Sequence>

      {/* Floating little chip */}
      <Sequence from={120}>
        <FloatingChip />
      </Sequence>
    </AbsoluteFill>
  );
};

const FloatingChip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const float = Math.sin(frame / 14) * 4;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 96,
        right: 130,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [12, 0]) + float}px)`,
        background: COLORS.ink,
        color: COLORS.cream,
        padding: '12px 18px',
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 18px 40px -18px rgba(15,14,20,0.45)',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS.green }} />
      <span style={{ fontSize: 14, fontWeight: 500 }}>23 signals today</span>
    </div>
  );
};
