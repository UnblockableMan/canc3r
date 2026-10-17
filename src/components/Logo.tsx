"use client";

// Inline SVG logo that uses CSS variables (var(--text), var(--accent))
// so the colors change automatically with the current theme.
// If we used <img src="logo.svg">, the SVG would be isolated in its own
// document context and couldn't inherit CSS vars from the page.

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <svg
      viewBox="0 0 280 100"
      className={className}
      style={{ width: "auto", height: "1em", display: "inline-block" }}
    >
      <defs>
        <linearGradient id="c3-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--text)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <text
        x={showWordmark ? "65" : "140"}
        y="76"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize={showWordmark ? "82" : "96"}
        fontWeight="400"
        fill="url(#c3-logo-grad)"
        textAnchor="middle"
        letterSpacing="-2"
      >
        C3
      </text>
      {showWordmark && (
        <>
          <text
            x="112"
            y="68"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontStyle="italic"
            fontSize="30"
            fontWeight="400"
            fill="var(--text)"
            letterSpacing="-0.5"
          >
            by canc3r
          </text>
        </>
      )}
    </svg>
  );
}
