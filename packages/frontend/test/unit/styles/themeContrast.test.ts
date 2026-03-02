import { themes, AppTheme } from '../../../src/styles/themes';

// WCAG 2.1 minimum contrast ratios
const WCAG_AA_NORMAL_TEXT = 4.5;
const WCAG_AA_LARGE_TEXT = 3.0;

// MUI default text colors by mode
const MUI_TEXT = {
  light: '#212121', // rgba(0,0,0,0.87) on white ≈ #212121
  dark: '#ffffff',
};

// Fixed CSS variable values from markdown.css
const CODE_BACKGROUND = {
  light: '#f0f4f5',
  dark: '#1a2228',
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(color1: string, color2: string): number {
  const l1 = relativeLuminance(...hexToRgb(color1));
  const l2 = relativeLuminance(...hexToRgb(color2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Theme contrast ratios (WCAG AA)', () => {
  const modes: Array<'light' | 'dark'> = ['light', 'dark'];

  it('should have 21 themes', () => {
    expect(themes).toHaveLength(21);
  });

  describe.each(themes.map(t => [t.name, t] as [string, AppTheme]))('%s', (_name, theme) => {
    modes.forEach(mode => {
      const palette = theme[mode];
      const textColor = MUI_TEXT[mode];

      it(`${mode}: body text vs background ≥ ${WCAG_AA_NORMAL_TEXT}:1`, () => {
        const ratio = contrastRatio(textColor, palette.background);
        expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      });

      it(`${mode}: body text vs paper ≥ ${WCAG_AA_NORMAL_TEXT}:1`, () => {
        const ratio = contrastRatio(textColor, palette.paper);
        expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      });

      it(`${mode}: primary (links/accents) vs background ≥ ${WCAG_AA_LARGE_TEXT}:1`, () => {
        const ratio = contrastRatio(palette.primary, palette.background);
        expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT);
      });

      it(`${mode}: body text vs inline code background ≥ ${WCAG_AA_NORMAL_TEXT}:1`, () => {
        const ratio = contrastRatio(textColor, CODE_BACKGROUND[mode]);
        expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      });
    });
  });
});
