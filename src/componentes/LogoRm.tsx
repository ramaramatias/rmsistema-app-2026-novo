export const LogoRm = ({ size }: { size: number; compact?: boolean }) => (
  <img
    src="/rm-icon.png"
    alt="RM"
    width={size}
    height={size}
    decoding="async"
    style={{ width: size, height: size, borderRadius: Math.max(6, Math.round(size * 0.18)), objectFit: 'cover', display: 'block', flexShrink: 0, boxShadow: '0 4px 10px rgba(15,23,42,0.16)' }}
  />
);
