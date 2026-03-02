import GitHubIcon from '@mui/icons-material/GitHub';
import SettingsIcon from '@mui/icons-material/Settings';
import UnfoldLess from '@mui/icons-material/UnfoldLess';
import UnfoldMore from '@mui/icons-material/UnfoldMore';
import ViewSidebarOutlined from '@mui/icons-material/ViewSidebarOutlined';
import { AppBar, Box, IconButton, Link, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store/store';
import Logo from './Logo';

interface AppHeaderProps {
  handleFileSelect: (path: string) => void;
  onSettingsClick: () => void;
  fileTreeOpen: boolean;
  outlineOpen: boolean;
  contentMode: 'full' | 'compact';
  onToggleFileTree: () => void;
  onToggleOutline: () => void;
  onToggleContentMode: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  handleFileSelect,
  onSettingsClick,
  fileTreeOpen,
  outlineOpen,
  contentMode,
  onToggleFileTree,
  onToggleOutline,
  onToggleContentMode,
}) => {
  const { mountedDirectoryPath } = useSelector((state: RootState) => state.fileTree);

  const vaultName = useMemo(() => {
    if (!mountedDirectoryPath) return '';
    const segments = mountedDirectoryPath.replace(/\/+$/, '').split('/');
    return segments[segments.length - 1] || '';
  }, [mountedDirectoryPath]);

  const handleFileSelectClick = useCallback(() => {
    handleFileSelect('');
  }, [handleFileSelect]);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid ', borderColor: 'divider' }}
    >
      <Toolbar>
        <Tooltip title="Top page">
          <IconButton disableRipple onClick={handleFileSelectClick} color="inherit">
            <div style={{ height: '56px', marginTop: '-8px', marginLeft: '-16px' }}>
              <Logo />
            </div>
          </IconButton>
        </Tooltip>
        {vaultName && (
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              color: 'text.secondary',
              fontSize: '0.8rem',
              opacity: 0.7,
              ml: 0.5,
            }}
          >
            {vaultName}
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Toggle file tree">
          <IconButton
            onClick={onToggleFileTree}
            color="inherit"
            sx={{ mr: 0.5, opacity: fileTreeOpen ? 1 : 0.4 }}
          >
            <ViewSidebarOutlined />
          </IconButton>
        </Tooltip>
        <Tooltip title="Toggle outline">
          <IconButton
            onClick={onToggleOutline}
            color="inherit"
            sx={{ mr: 0.5, opacity: outlineOpen ? 1 : 0.4 }}
          >
            <ViewSidebarOutlined sx={{ transform: 'scaleX(-1)' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={contentMode === 'compact' ? 'Full width' : 'Compact'}>
          <IconButton
            onClick={onToggleContentMode}
            color="inherit"
            sx={{ mr: 1 }}
          >
            {contentMode === 'compact' ? (
              <UnfoldMore sx={{ transform: 'rotate(90deg)' }} />
            ) : (
              <UnfoldLess sx={{ transform: 'rotate(90deg)' }} />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton sx={{ mr: 2 }} onClick={onSettingsClick} color="inherit">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="GitHub Repository">
          <IconButton
            color="inherit"
            href="https://github.com/ashishmerani/browsemark"
            target="_blank"
            rel="noopener"
            sx={{ mr: 2 }}
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ fontSize: '0.9rem', pt: '2px', fontFamily: '"JetBrains Mono", monospace' }}>
          <Tooltip title="Changelog">
            <Link href="https://github.com/ashishmerani/browsemark/blob/main/CHANGELOG.md" target="_blank" rel="noopener">
              v{process.env.APP_VERSION}
            </Link>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
