const TWEMOJI: Record<string, string> = {
  "🚗": "1f697",
  "🏷️": "1f3f7",
  "✈️": "2708",
  "⚙️": "2699",
  "🌙": "1f319",
  "☀️": "2600",
  "☀": "2600",
  "🥚": "1f95a",
  "❤️": "2764",
  "❤": "2764",
  "🩸": "1fa78",
  "🔔": "1f514",
  "⏰": "23f0",
  "🧪": "1f9ea",
  "⛅": "26c5",
  "🌫️": "1f32b",
  "🌦️": "1f326",
  "🌧️": "1f327",
  "❄️": "2744",
  "⛈️": "26c8",
  "✨": "2728",
  "📋": "1f4cb",
  "🧳": "1f9f3",
  "🎬": "1f3ac",
};

const BASE = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg";

export function Emoji({ char, size = 22 }: { char: string; size?: number }) {
  const code = TWEMOJI[char];
  if (!code) return <span style={{ fontSize: size, lineHeight: 1 }}>{char}</span>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${BASE}/${code}.svg`}
      alt={char}
      width={size}
      height={size}
      className="inline-block"
      style={{ verticalAlign: "-0.1em" }}
      draggable={false}
    />
  );
}
