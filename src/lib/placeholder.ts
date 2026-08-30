// Generates deterministic SVG placeholder images as data URLs.
// Used to give every product a high-quality looking preview without external CDN.

const PALETTES: [string, string][] = [
  ["#1a1a1a", "#3a3a3a"],
  ["#2c2c2c", "#4a4a4a"],
  ["#1f1f1f", "#2c2c2c"],
  ["#0f0f0f", "#2c2c2c"],
  ["#262626", "#404040"],
  ["#1a1a1a", "#2c2c2c"],
  ["#0a0a0a", "#262626"],
  ["#1f1f1f", "#3a3a3a"],
];

export function placeholderImage(
  text: string,
  width = 800,
  height = 1000,
  idx = 0
): string {
  const [bg1, bg2] = PALETTES[idx % PALETTES.length];
  // Create gradient background with the text label
  const lines = text.split(" ").slice(0, 3).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g${idx})"/>
    <text x="50%" y="48%" font-family="Inter, Arial, sans-serif" font-size="${Math.floor(width / 16)}" font-weight="700" fill="rgba(255,255,255,0.92)" text-anchor="middle" letter-spacing="2">${escapeXml(lines.toUpperCase())}</text>
    <text x="50%" y="55%" font-family="Inter, Arial, sans-serif" font-size="${Math.floor(width / 28)}" font-weight="400" fill="rgba(255,255,255,0.55)" text-anchor="middle" letter-spacing="6">RUHVIQUE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export function bannerImage(
  title: string,
  subtitle: string,
  width = 1600,
  height = 700
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0a0a"/>
        <stop offset="100%" stop-color="#2c2c2c"/>
      </linearGradient>
      <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.04)"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#dots)"/>
    <text x="50%" y="44%" font-family="Playfair Display, Georgia, serif" font-size="${Math.floor(width / 12)}" font-weight="900" fill="rgba(255,255,255,0.95)" text-anchor="middle" letter-spacing="6">${escapeXml(title.toUpperCase())}</text>
    <text x="50%" y="56%" font-family="Inter, Arial, sans-serif" font-size="${Math.floor(width / 50)}" font-weight="400" fill="rgba(255,255,255,0.7)" text-anchor="middle" letter-spacing="8">${escapeXml(subtitle.toUpperCase())}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
