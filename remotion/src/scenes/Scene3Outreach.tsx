import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';
import { COLORS, FONTS } from '../MainVideo';

const EMAIL_BODY = `Hi Sarah,

Saw HashiCorp just opened the Global Head of Sales Ops role —
congrats on the momentum.

Most teams scaling RevOps at this stage hit the same wall:
fragmented signals across LinkedIn, news, and earnings.

We've helped 40+ Series C teams cut signal-to-meeting time
by 68%. Worth a quick 15-min look?

— Alex`;

export const Scene3Outreach: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 20 } });
  const titleY = interpolate(titleS, [0, 1], [16, 0]);

  // Typewriter effect on email body
  const charsVisible = Math.floor(interpolate(frame, [50, 200], [0, EMAIL_BODY.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const visibleBody = EMAIL_BODY.slice(0, charsVisible);

  // Cursor blink
  const cursor = Math.floor(frame / 10) % 2 === 0;

  // Subject line
  const subjectS = spring({ frame: frame - 30, fps, config: { damping: 20 } });

  // Send pulse
  const sendPulse = 1 + Math.sin(frame / 8) * 0.05;
  const sendDelay = 215;
  const sendS = spring({ frame: frame - sendDelay, fps, config: { damping: 14, stiffness: 130 } });

  // Sent badge
  const sentS = spring({ frame: frame - 240, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ padding: '72px 96px', display: 'flex', gap: 60 }}>
      {/* Left: title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 620 }}>
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
          ◆ Outreach · ai-drafted
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: COLORS.ink,
            letterSpacing: -2,
            lineHeight: 1.05,
            marginTop: 18,
            opacity: titleS,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Ready to send in <span style={{ color: COLORS.brand }}>seconds</span>.
        </div>
        <div
          style={{
            fontSize: 22,
            color: COLORS.inkSoft,
            marginTop: 22,
            lineHeight: 1.5,
            opacity: subjectS,
            transform: `translateY(${interpolate(subjectS, [0, 1], [10, 0])}px)`,
            maxWidth: 520,
          }}
        >
          Verified contact, signal context, your tone — written for you.
        </div>

        {/* Sent badge */}
        <Sequence from={240}>
          <div
            style={{
              marginTop: 36,
              opacity: sentS,
              transform: `translateY(${interpolate(sentS, [0, 1], [10, 0])}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: `${COLORS.green}1F`,
              color: '#0E7B3E',
              padding: '14px 20px',
              borderRadius: 12,
              width: 'fit-content',
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 999, background: COLORS.green }} />
            Sent · est. reply in 2.3 days
          </div>
        </Sequence>
      </div>

      {/* Right: email composer */}
      <div
        style={{
          flex: 1,
          background: '#FFFFFF',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 22,
          padding: '28px 32px',
          boxShadow: '0 30px 60px -30px rgba(15,14,20,0.25)',
          display: 'flex',
          flexDirection: 'column',
          opacity: titleS,
          transform: `translateY(${interpolate(titleS, [0, 1], [20, 0])}px) scale(${interpolate(titleS, [0, 1], [0.98, 1])})`,
        }}
      >
        {/* To row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, letterSpacing: 1.4, textTransform: 'uppercase', width: 50 }}>To</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: `${COLORS.brand}14`,
              border: `1px solid ${COLORS.brand}40`,
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 14,
              color: COLORS.ink,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandGlow})`,
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              S
            </span>
            <span style={{ fontWeight: 600 }}>Sarah Chen</span>
            <span style={{ color: COLORS.muted, fontSize: 13 }}>· VP Sales, HashiCorp</span>
          </div>
        </div>

        {/* Subject */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, letterSpacing: 1.4, textTransform: 'uppercase', width: 50 }}>Subj</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: COLORS.ink, opacity: subjectS }}>
            Quick thought on your new RevOps hire
          </div>
        </div>

        {/* Body with typewriter */}
        <div
          style={{
            flex: 1,
            paddingTop: 20,
            fontSize: 15.5,
            lineHeight: 1.65,
            color: COLORS.inkSoft,
            whiteSpace: 'pre-wrap',
            fontFamily: FONTS.onest,
          }}
        >
          {visibleBody}
          {charsVisible < EMAIL_BODY.length && (
            <span style={{ opacity: cursor ? 1 : 0, color: COLORS.brand, fontWeight: 700 }}>▍</span>
          )}
        </div>

        {/* Send button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 18, borderTop: `1px solid ${COLORS.border}` }}>
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandGlow})`,
              color: '#FFF',
              padding: '12px 26px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              transform: `scale(${frame > sendDelay ? sendS : sendPulse})`,
              boxShadow: `0 10px 30px -10px ${COLORS.brand}80`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {frame > sendDelay ? '✓ Sent' : 'Send →'}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
