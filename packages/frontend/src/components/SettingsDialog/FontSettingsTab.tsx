import {
  Box,
  MenuItem,
  Select,
  Slider,
  Typography
} from '@mui/material';
import React, { useCallback } from 'react';
import { WEB_SAFE_FONTS, WEB_SAFE_MONOSPACE_FONTS, } from '../../constants';

interface FontSettingsTabProps {
  fontSize: number;
  fontFamily: string;
  fontFamilyMonospace: string;
  setFontSize: (size: number) => void;
  setFontFamily: (font: string) => void;
  setFontFamilyMonospace: (font: string) => void;
}

const FontSettingsTab: React.FC<FontSettingsTabProps> = ({
  fontSize,
  fontFamily,
  fontFamilyMonospace,
  setFontSize,
  setFontFamily,
  setFontFamilyMonospace,
}) => {

  const handleFontSelect = useCallback((e) => {
    setFontFamily(e.target.value as string);
  }, [setFontFamily]);

  const handleMonospaceFontSelect = useCallback((e) => {
    setFontFamilyMonospace(e.target.value as string);
  }, [setFontFamilyMonospace]);

  const handleChangeFontSize = useCallback((_, newValue) => {
    setFontSize(newValue as number);
  }, [setFontSize]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Font Size</Typography>
      <Slider
        value={fontSize}
        onChange={handleChangeFontSize}
        aria-label="Font Size"
        aria-labelledby="font-size-slider"
        valueLabelDisplay="auto"
        step={1}
        marks
        min={10}
        max={24}
        size="small"
        sx={{ mb: 1 }}
      />

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }} id="font-family-label">Font Family</Typography>
      <Select
        labelId="font-family-label"
        id="fontFamily"
        value={fontFamily}
        onChange={handleFontSelect}
        fullWidth
        variant="outlined"
        size="small"
        sx={{ mb: 1 }}
        data-testid="font-family-select"
      >
        {WEB_SAFE_FONTS.map((font) => (
          <MenuItem key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </MenuItem>
        ))}
      </Select>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }} id="monospace-font-family-label">Monospace Font Family</Typography>
      <Select
        labelId="monospace-font-family-label"
        id="fontFamilyMonospace"
        value={fontFamilyMonospace}
        onChange={handleMonospaceFontSelect}
        fullWidth
        variant="outlined"
        size="small"
        sx={{ mb: 1 }}
        data-testid="monospace-font-family-select"
      >
        {WEB_SAFE_MONOSPACE_FONTS.map((font) => (
          <MenuItem key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default FontSettingsTab;
