interface LogoProps {
  size?: 'sm' | 'md'
}

export default function Logo({ size = 'md' }: LogoProps) {
  const markSize = size === 'sm' ? 26 : 30
  const fontSize = size === 'sm' ? 15 : 20

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: markSize, height: markSize,
        background: 'linear-gradient(135deg,#00BCD4,#0D2E6E)',
        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: markSize * 0.6, color: 'white', lineHeight: 1 }}>b</span>
      </div>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize, letterSpacing: '-0.5px', color: '#111827', lineHeight: 1 }}>
        brainfi
      </span>
    </div>
  )
}
