"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/store/settings";

/**
 * Panic mode — when activated (via Esc Esc Esc triple-tap, the toolbar
 * panic button, or the Settings panel toggle), overlays a believable fake
 * page so teachers walking by don't notice you're on a proxy site.
 *
 * The disguise is rendered from scratch (NOT loaded from the real site)
 * so it's instant, works offline, and doesn't leak your real IP/network
 * to the destination site before the panic is even useful.
 *
 * Disguises available:
 *   google-docs   A Google Docs document editing screen
 *   classroom     Google Classroom class page
 *   khan-academy  Khan Academy lesson page
 *   wikipedia     Wikipedia article
 *   google        Plain Google search home
 */
export function PanicMode() {
  const panicMode = useSettings((s) => s.panicMode);
  const disguise = useSettings((s) => s.panicDisguise);
  const setPanicMode = useSettings((s) => s.setPanicMode);
  const escapeCounter = useRef(0);

  // When panic mode is on, the URL bar stays on the same page (we can't
  // change history from JS without user gesture), but the visible UI
  // is replaced. Also drop the page title + favicon to match.
  useEffect(() => {
    if (!panicMode) {
      document.title = "C3.";
      return;
    }
    const titles: Record<string, string> = {
      "google-docs": "Untitled document - Google Docs",
      "classroom": "Classes",
      "khan-academy": "Khan Academy | Free Online Courses, Lessons & Practice",
      "wikipedia": "Wikipedia, the free encyclopedia",
      "google": "Google",
    };
    document.title = titles[disguise] || titles["google-docs"];
  }, [panicMode, disguise]);

  // Single Esc when in panic mode = exit panic (so the triple-Esc to enter
  // panic doesn't immediately exit because the third Esc was registered).
  useEffect(() => {
    if (!panicMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        escapeCounter.current += 1;
        if (escapeCounter.current >= 1) {
          // Wait 600ms — if user keeps mashing Esc, they want out.
          setTimeout(() => {
            if (escapeCounter.current >= 1) {
              setPanicMode(false);
              escapeCounter.current = 0;
            }
          }, 600);
        }
      }
      // Also exit on Ctrl+P (panic)
      if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPanicMode(false);
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [panicMode, setPanicMode]);

  if (!panicMode) return null;

  return (
    <div className="panic-overlay" style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "#fff",
      color: "#202124",
      fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
      overflow: "auto",
    }}>
      {disguise === "google-docs" && <GoogleDocsDisguise />}
      {disguise === "classroom" && <ClassroomDisguise />}
      {disguise === "khan-academy" && <KhanAcademyDisguise />}
      {disguise === "wikipedia" && <WikipediaDisguise />}
      {disguise === "google" && <GoogleDisguise />}

      {/* Subtle exit hint — only visible on hover in the bottom-right corner */}
      <div style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        fontSize: 10,
        color: "#bbb",
        opacity: 0.5,
        pointerEvents: "none",
        userSelect: "none",
      }}>
        C3 panic mode — press Esc or Ctrl+P to exit
      </div>
    </div>
  );
}

function GoogleDocsDisguise() {
  return (
    <div>
      {/* Google Docs top bar */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #dadce0",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path fill="#4285F4" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
          <path fill="#A1C2FA" d="M14 2v6h6z"/>
          <path fill="#3367D6" d="M8 12h8v1H8zm0 3h8v1H8zm0-6h5v1H8z"/>
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 15, color: "#202124" }}>Untitled document</span>
          <div style={{ fontSize: 11, color: "#5f6368", display: "flex", gap: 12 }}>
            <span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Help</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#5f6368" }}>Last edit was 1 minute ago</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a73e8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>U</div>
        </div>
      </div>
      {/* Document body */}
      <div style={{
        maxWidth: 816,
        margin: "24px auto",
        background: "#fff",
        minHeight: 1122,
        padding: "80px 96px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        color: "#202124",
        fontSize: 11,
        lineHeight: 1.55,
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, marginBottom: 8, color: "#202124" }}>Document Title</h1>
        <p style={{ marginBottom: 12 }}>
          This is a paragraph of placeholder text for the document. The contents here are generic and meant to look like a real document that someone might be writing for class. It is intentionally boring and unremarkable, so that anyone glancing at the screen wouldn't think twice about it.
        </p>
        <p style={{ marginBottom: 12 }}>
          The American Revolution (1765–1783) was a colonial revolt that took place between 1765 and 1783. Thirteen of Great Britain's North American colonies rejected the imperial government's authority and founded the United States of America.
        </p>
        <h2 style={{ fontSize: 16, fontWeight: 400, marginTop: 16, marginBottom: 8 }}>Section Heading</h2>
        <p style={{ marginBottom: 12 }}>
          Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. The general equation is 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.
        </p>
        <p style={{ marginBottom: 12 }}>
          The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: a² + b² = c².
        </p>
        <p style={{ marginBottom: 12 }}>
          The French Revolution began in 1789 with the storming of the Bastille. It led to the abolition of the French monarchy and the rise of Napoleon Bonaparte. The ideals of liberty, equality, and fraternity spread throughout Europe.
        </p>
        <p style={{ marginBottom: 12, color: "#5f6368" }}>
          [continues on next page…]
        </p>
      </div>
    </div>
  );
}

function ClassroomDisguise() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #dadce0", padding: "8px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="40" height="40" viewBox="0 0 24 24">
          <path fill="#fbbc04" d="M3 5h18v3H3z"/>
          <path fill="#4285F4" d="M3 10h18v3H3z"/>
          <path fill="#34a853" d="M3 15h18v3H3z"/>
          <path fill="#ea4335" d="M3 5h3v13H3z"/>
        </svg>
        <span style={{ fontSize: 22, color: "#3c4043" }}>Google Classroom</span>
      </div>
      <div style={{ padding: "24px 48px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 400, color: "#202124", marginBottom: 8 }}>Classes</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 24 }}>
          {[
            { name: "AP English Literature", section: "Section 3 · Period 4", color: "#1e8e3e", teacher: "Ms. Johnson" },
            { name: "AP Calculus AB", section: "Section 2 · Period 5", color: "#9334e6", teacher: "Mr. Chen" },
            { name: "AP US History", section: "Section 1 · Period 2", color: "#e8710a", teacher: "Mrs. Williams" },
            { name: "AP Biology", section: "Section 4 · Period 6", color: "#1a73e8", teacher: "Dr. Martinez" },
            { name: "AP Computer Science A", section: "Section 5 · Period 7", color: "#d93025", teacher: "Mr. Patel" },
            { name: "AP Spanish Language", section: "Section 2 · Period 3", color: "#9aa0a6", teacher: "Sra. Rodriguez" },
          ].map((c) => (
            <div key={c.name} style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", border: "1px solid #dadce0" }}>
              <div style={{ background: c.color, height: 100, padding: "12px 16px", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, opacity: 0.9 }}>{c.section}</div>
                <div style={{ fontSize: 20, fontWeight: 400 }}>{c.name}</div>
              </div>
              <div style={{ background: "#fff", padding: "12px 16px", fontSize: 13, color: "#5f6368" }}>
                <div style={{ fontWeight: 500, color: "#3c4043", marginBottom: 4 }}>{c.teacher}</div>
                <div style={{ fontSize: 11 }}>Assignment due tomorrow</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KhanAcademyDisguise() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={{ background: "#002ed0", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, color: "#fff" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Khan Academy</span>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 20, fontSize: 14 }}>
          <span>Courses</span><span>Search</span><span>Profile</span>
        </nav>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ fontSize: 12, color: "#002ed0", marginBottom: 8 }}>Course: Algebra 1 · Unit 12</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>Solving quadratic equations by factoring</h1>
        <p style={{ fontSize: 14, color: "#4a4a4a", marginBottom: 24, lineHeight: 1.6 }}>
          A quadratic equation is an equation of the form ax² + bx + c = 0, where a ≠ 0. Factoring is one of the most common methods for solving quadratic equations when the polynomial is factorable.
        </p>
        <div style={{ background: "#f0f3ff", padding: 20, borderRadius: 8, marginBottom: 24 }}>
          <div style={{ fontSize: 16, color: "#002ed0", fontWeight: 600, marginBottom: 8 }}>Example</div>
          <p style={{ fontSize: 14, color: "#1a1a1a" }}>Solve: x² + 5x + 6 = 0</p>
          <p style={{ fontSize: 14, color: "#4a4a4a", marginTop: 8 }}>Step 1: Factor the polynomial into (x + 2)(x + 3) = 0</p>
          <p style={{ fontSize: 14, color: "#4a4a4a" }}>Step 2: Set each factor equal to zero: x = -2 or x = -3</p>
        </div>
        <button style={{ background: "#002ed0", color: "#fff", padding: "12px 24px", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 600 }}>
          Mark as complete
        </button>
      </div>
    </div>
  );
}

function WikipediaDisguise() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid #a2a9b1", padding: "8px 16px", fontSize: 13, color: "#54595d", display: "flex", gap: 12 }}>
        <span style={{ fontWeight: 600, color: "#000" }}>Wikipedia</span>
        <span>The Free Encyclopedia</span>
        <span style={{ marginLeft: "auto" }}>English</span>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, fontFamily: "'Linux Libertine','Georgia',serif", borderBottom: "1px solid #a2a9b1", paddingBottom: 8, marginBottom: 12 }}>Photosynthesis</h1>
        <p style={{ fontSize: 14, color: "#202122", marginBottom: 8 }}>
          <b>Photosynthesis</b> is a biological process by which plants, algae, and certain bacteria convert light energy, usually from the Sun, into chemical energy stored in glucose. The general equation for photosynthesis is:
        </p>
        <p style={{ fontSize: 16, color: "#202122", margin: "12px auto", textAlign: "center", fontFamily: "serif" }}>
          6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
        </p>
        <p style={{ fontSize: 14, color: "#202122", marginBottom: 12 }}>
          The process occurs in two stages: the light-dependent reactions and the Calvin cycle. The light-dependent reactions take place in the thylakoid membranes, while the Calvin cycle occurs in the stroma of the chloroplast.
        </p>
        <div style={{ fontSize: 11, color: "#54595d", borderTop: "1px solid #a2a9b1", marginTop: 16, paddingTop: 8 }}>
          From Wikipedia, the free encyclopedia. This article is licensed under CC BY-SA.
        </div>
      </div>
    </div>
  );
}

function GoogleDisguise() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <svg width="272" height="92" viewBox="0 0 272 92">
        <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S81 39.2 81 47.18c0 7.9 5.79 13.44 12.51 13.44S106.01 55.08 106.01 47.18z"/>
        <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.86 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.54 12.51-13.44z"/>
        <path fill="#FBBC04" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.81-13.07l8.54-3.55c1.52 3.64 5.26 7.94 11.27 7.94 7.37 0 11.96-4.55 11.96-13.11v-3.22h-.34c-2.2 2.71-6.45 5.08-11.81 5.08-11.21 0-21.48-9.75-21.48-22.32 0-12.65 10.27-22.48 21.48-22.48 5.36 0 9.61 2.37 11.81 5.0h.34v-3.65h9.25zm-8.55 21.11c0-7.86-5.22-13.61-11.86-13.61-6.74 0-12.4 5.75-12.4 13.61 0 7.78 5.66 13.45 12.4 13.45 6.64 0 11.86-5.67 11.86-13.45z"/>
        <path fill="#34A853" d="M225 3.65v62.5h-9.6V3.65h9.6z"/>
        <path fill="#EA4335" d="M262.55 50.97l7.57 5.04c-2.44 3.62-8.32 9.84-18.49 9.84-12.6 0-22.04-9.74-22.04-22.18 0-13.19 9.52-22.18 20.93-22.18 11.5 0 17.14 9.16 18.98 14.11l1.01 2.52-29.67 12.29c2.27 4.45 5.8 6.72 10.79 6.72 5 0 8.46-2.44 10.99-6.16zm-23.28-7.98l19.84-8.24c-1.09-2.77-4.37-4.71-8.24-4.71-4.95 0-11.84 4.38-11.6 12.95z"/>
      </svg>
      <div style={{ display: "flex", gap: 16 }}>
        <input
          style={{ width: 480, padding: "12px 16px", border: "1px solid #dfe1e5", borderRadius: 24, fontSize: 14, outline: "none" }}
          placeholder="Search Google or type a URL"
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button style={{ background: "#f8f9fa", border: "1px solid #f8f9fa", borderRadius: 4, padding: "8px 16px", fontSize: 13, color: "#3c4043" }}>Google Search</button>
        <button style={{ background: "#f8f9fa", border: "1px solid #f8f9fa", borderRadius: 4, padding: "8px 16px", fontSize: 13, color: "#3c4043" }}>I'm Feeling Lucky</button>
      </div>
    </div>
  );
}
