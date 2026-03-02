import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveAppSetting } from '../store/slices/appSettingSlice';
import { saveConfigToBackend } from '../store/slices/configSlice';
import { AppDispatch, RootState } from '../store/store';

interface UseSettingsFormReturn {
  darkMode: 'dark' | 'light' | 'auto';
  contentMode: 'full' | 'compact';
  themeType: string;
  fontFamily: string;
  fontFamilyMonospace: string;
  fontSize: number;
  syntaxHighlighterTheme: string;
  setDarkMode: (mode: 'dark' | 'light' | 'auto') => void;
  setContentMode: (mode: 'full' | 'compact') => void;
  setThemeType: (theme: string) => void;
  setFontFamily: (font: string) => void;
  setFontFamilyMonospace: (font: string) => void;
  setFontSize: (size: number) => void;
  setSyntaxHighlighterTheme: (theme: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleToggleDarkMode: (mode: 'dark' | 'light' | 'auto') => void;
  handleToggleTheme: (theme: string) => void;
  handleToggleContentMode: (mode: 'full' | 'compact') => void;
  handleReset: () => void;
}

export const useSettingsForm = (): UseSettingsFormReturn => {
  const dispatch: AppDispatch = useDispatch();
  const {
    darkMode: initialDarkMode,
    contentMode: initialContentMode
  } = useSelector((state: RootState) => state.appSetting);

  const {
    theme: initialTheme,
    syntaxHighlighterTheme: initialSyntaxHighlighterTheme,
    fontFamily: initialFontFamily,
    fontFamilyMonospace: initialFontFamilyMonospace,
    fontSize: initialFontSize,
  } = useSelector((state: RootState) => state.config);

  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [contentMode, setContentMode] = useState(initialContentMode);
  const [theme, setTheme] = useState(initialTheme);
  const [fontFamily, setFontFamily] = useState(initialFontFamily);
  const [fontFamilyMonospace, setFontFamilyMonospace] = useState(initialFontFamilyMonospace);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [syntaxHighlighterTheme, setSyntaxHighlighterTheme] = useState(initialSyntaxHighlighterTheme);

  useEffect(() => {
    setContentMode(initialContentMode);
    setDarkMode(initialDarkMode);
    setTheme(initialTheme);
    setSyntaxHighlighterTheme(initialSyntaxHighlighterTheme);
    setFontFamily(initialFontFamily);
    setFontFamilyMonospace(initialFontFamilyMonospace);
    setFontSize(initialFontSize);
  }, [
    initialContentMode,
    initialDarkMode,
    initialTheme,
    initialSyntaxHighlighterTheme,
    initialFontFamily,
    initialFontFamilyMonospace,
    initialFontSize
  ]);

  const handleSave = useCallback(() => {
    dispatch(saveConfigToBackend({ theme: theme, syntaxHighlighterTheme, fontFamily, fontFamilyMonospace, fontSize }));
    dispatch(saveAppSetting({ darkMode, contentMode }));
  }, [contentMode, darkMode, theme, dispatch, fontFamily, fontFamilyMonospace, fontSize, syntaxHighlighterTheme]);

  const handleCancel = useCallback(() => {
    setDarkMode(initialDarkMode);
    setContentMode(initialContentMode);
    setTheme(initialTheme);
    setFontFamily(initialFontFamily);
    setFontFamilyMonospace(initialFontFamilyMonospace);
    setFontSize(initialFontSize);
    setSyntaxHighlighterTheme(initialSyntaxHighlighterTheme);
  }, [
    initialContentMode,
    initialDarkMode,
    initialTheme,
    initialFontFamily,
    initialFontFamilyMonospace,
    initialFontSize,
    initialSyntaxHighlighterTheme,
  ]);

  const handleToggleDarkMode = useCallback((mode: 'dark' | 'light' | 'auto') => {
    setDarkMode(mode);
  }, []);

  const handleToggleTheme = useCallback((theme: string) => {
    setTheme(theme);
  }, []);

  const handleToggleContentMode = useCallback((mode: 'full' | 'compact') => {
    setContentMode(mode);
  }, []);

  const handleReset = useCallback(() => {
    const defaultDarkMode = 'auto';
    const defaultContentMode = 'compact';
    const defaultTheme = 'default';
    const defaultFontFamily = 'Inter';
    const defaultFontFamilyMonospace = 'JetBrains Mono';
    const defaultFontSize = 14;
    const defaultSyntaxHighlighterTheme = 'auto';

    setDarkMode(defaultDarkMode);
    setContentMode(defaultContentMode);
    setTheme(defaultTheme);
    setFontFamily(defaultFontFamily);
    setFontFamilyMonospace(defaultFontFamilyMonospace);
    setFontSize(defaultFontSize);
    setSyntaxHighlighterTheme(defaultSyntaxHighlighterTheme);

    dispatch(saveConfigToBackend({
      theme: defaultTheme,
      syntaxHighlighterTheme: defaultSyntaxHighlighterTheme,
      fontFamily: defaultFontFamily,
      fontFamilyMonospace: defaultFontFamilyMonospace,
      fontSize: defaultFontSize,
    }));
    dispatch(saveAppSetting({ darkMode: defaultDarkMode, contentMode: defaultContentMode }));
  }, [dispatch]);

  return {
    darkMode,
    contentMode,
    themeType: theme,
    fontFamily,
    fontFamilyMonospace,
    fontSize,
    syntaxHighlighterTheme,
    setDarkMode,
    setContentMode,
    setThemeType: setTheme,
    setFontFamily,
    setFontFamilyMonospace,
    setFontSize,
    setSyntaxHighlighterTheme,
    handleSave,
    handleCancel,
    handleToggleDarkMode,
    handleToggleTheme,
    handleToggleContentMode,
    handleReset,
  };
};
