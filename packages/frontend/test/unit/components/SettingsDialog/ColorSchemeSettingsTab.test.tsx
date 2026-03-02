import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import ColorSchemeSettingsTab from '../../../../src/components/SettingsDialog/ColorSchemeSettingsTab';

describe('ColorSchemeSettingsTab', () => {
  const defaultProps = {
    darkMode: 'dark' as const,
    theme: 'default',
    syntaxHighlighterTheme: 'auto',
    handleToggleDarkMode: vi.fn(),
    setSyntaxHighlighterTheme: vi.fn(),
    handleToggleTheme: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    const { asFragment } = render(<ColorSchemeSettingsTab {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should call handleToggleDarkMode when dark mode is toggled', () => {
    render(<ColorSchemeSettingsTab {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /light/i }));
    expect(defaultProps.handleToggleDarkMode).toHaveBeenCalledWith('light');
  });

  it('should call handleToggleTheme when theme selection changes', () => {
    render(<ColorSchemeSettingsTab {...defaultProps} />);
    // Open the theme select dropdown (first Select)
    const themeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(themeSelect);
    // Select a different theme from the listbox
    const listbox = within(screen.getByRole('listbox'));
    const options = listbox.getAllByRole('option');
    // Click the second option (not the currently selected one)
    fireEvent.click(options[1]);
    expect(defaultProps.handleToggleTheme).toHaveBeenCalled();
  });

  it('should call setSyntaxHighlighterTheme when syntax theme changes', () => {
    render(<ColorSchemeSettingsTab {...defaultProps} />);
    // Open the syntax highlighter theme select (second Select)
    const selects = screen.getAllByRole('combobox');
    const syntaxSelect = selects[1];
    fireEvent.mouseDown(syntaxSelect);
    // Select a non-auto option from the listbox
    const listbox = within(screen.getByRole('listbox'));
    const options = listbox.getAllByRole('option');
    // Click the second option (first non-auto)
    fireEvent.click(options[1]);
    expect(defaultProps.setSyntaxHighlighterTheme).toHaveBeenCalled();
  });
});
