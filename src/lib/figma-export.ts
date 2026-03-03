// Figma design export utilities

export interface FigmaDesignData {
  name: string;
  colors: string[];
  typography: { fontFamily: string; fontSize: number; fontWeight: number; lineHeight?: number }[];
  components: { name: string; type: string; description?: string }[];
  styles?: any[];
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function exportAsJSON(data: FigmaDesignData): string {
  return JSON.stringify({
    name: data.name,
    colors: data.colors,
    typography: data.typography,
    components: data.components,
  }, null, 2);
}

export function exportAsCSS(data: FigmaDesignData): string {
  const lines: string[] = [
    `/* Figma Design Tokens: ${data.name} */`,
    `/* Generated ${new Date().toLocaleDateString("pl-PL")} */`,
    "",
    "/* === CSS Variables === */",
    ":root {",
  ];

  data.colors.forEach((hex, i) => {
    lines.push(`  --figma-color-${i + 1}: ${hex};`);
    lines.push(`  --figma-color-${i + 1}-hsl: ${hexToHsl(hex)};`);
  });

  const uniqueFonts = [...new Set(data.typography.map(t => t.fontFamily))];
  uniqueFonts.forEach((f, i) => {
    lines.push(`  --figma-font-${i + 1}: '${f}', sans-serif;`);
  });

  lines.push("}", "");

  // Tailwind config snippet
  lines.push("/* === Tailwind Config (tailwind.config.ts) === */");
  lines.push("/*");
  lines.push("  theme: {");
  lines.push("    extend: {");
  lines.push("      colors: {");
  data.colors.forEach((hex, i) => {
    lines.push(`        'figma-${i + 1}': '${hex}',`);
  });
  lines.push("      },");
  lines.push("      fontFamily: {");
  uniqueFonts.forEach((f, i) => {
    const key = f.toLowerCase().replace(/\s+/g, "-");
    lines.push(`        '${key}': ['${f}', 'sans-serif'],`);
  });
  lines.push("      },");
  lines.push("    },");
  lines.push("  },");
  lines.push("*/");
  lines.push("");

  // Utility classes
  lines.push("/* === Utility Classes === */");
  data.typography.forEach((t, i) => {
    lines.push(`.figma-text-${i + 1} {`);
    lines.push(`  font-family: '${t.fontFamily}', sans-serif;`);
    lines.push(`  font-size: ${t.fontSize}px;`);
    lines.push(`  font-weight: ${t.fontWeight};`);
    if (t.lineHeight) lines.push(`  line-height: ${t.lineHeight}px;`);
    lines.push("}");
  });

  return lines.join("\n");
}

export function exportAsTXT(data: FigmaDesignData): string {
  const lines: string[] = [
    `═══════════════════════════════════════`,
    `  STYLIZACJA FIGMA: ${data.name}`,
    `  Data: ${new Date().toLocaleDateString("pl-PL")}`,
    `═══════════════════════════════════════`,
    "",
    `── KOLORY (${data.colors.length}) ──`,
    ...data.colors.map((c, i) => `  ${i + 1}. ${c}`),
    "",
    `── TYPOGRAFIA (${data.typography.length}) ──`,
    ...data.typography.map((t, i) =>
      `  ${i + 1}. ${t.fontFamily} | waga: ${t.fontWeight} | rozmiar: ${t.fontSize}px${t.lineHeight ? ` | interlinia: ${t.lineHeight}px` : ""}`
    ),
    "",
    `── KOMPONENTY (${data.components.length}) ──`,
    ...data.components.map((c, i) =>
      `  ${i + 1}. ${c.name} (${c.type})${c.description ? ` — ${c.description}` : ""}`
    ),
  ];
  return lines.join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
