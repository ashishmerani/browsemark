import { configureStore } from '@reduxjs/toolkit';
import contentReducer from '../src/store/slices/contentSlice';
import fileTreeReducer from '../src/store/slices/fileTreeSlice';
import outlineReducer from '../src/store/slices/outlineSlice';
import appSettingReducer from '../src/store/slices/appSettingSlice';
import historyReducer from '../src/store/slices/historySlice';
import configReducer from '../src/store/slices/configSlice';
import plantUMLReducer from '../src/store/slices/plantUMLSlice';
import { RootState } from '../src/store/store';

export const createTestStore = (
  initialState: Partial<RootState> = {},
): ReturnType<typeof configureStore> => {
  const defaultState: RootState = {
    appSetting: {
      darkMode: 'dark',
      contentMode: 'compact',
      fileTreeOpen: true,
      outlineOpen: true,
    },
    fileTree: {
      fileTree: [
        { path: 'test.md', status: ' ' },
        { folder: [{ path: 'folder/subfile.md', status: 'M' }] },
      ],
      filteredFileTree: [
        { path: 'test.md', status: ' ' },
        { folder: [{ path: 'folder/subfile.md', status: 'M' }] },
      ],
      loading: false,
      error: null,
      searchQuery: '',
      expandedNodes: [],
      mountedDirectoryPath: '',
    },
    content: {
      content: '',
      loading: false,
      error: null,
      scrollPosition: 0,
    },
    outline: {
      outline: [],
      loading: false,
      error: null,
    },
    history: {
      currentPath: null,
      isDirectory: false,
    },
    config: {
      theme: 'default',
      fontFamily: 'Inter',
      fontFamilyMonospace: 'JetBrains Mono',
      fontSize: 14,
      syntaxHighlighterTheme: 'auto',
    },
    plantUML: {
      svgCache: {},
      loading: {},
      errors: {},
    },
  };

  const state: RootState = {
    ...defaultState,
    ...initialState,
    appSetting: {
      ...defaultState.appSetting,
      ...(initialState.appSetting || {}),
    },
    fileTree: {
      ...defaultState.fileTree,
      ...(initialState.fileTree || {}),
    },
    content: {
      ...defaultState.content,
      ...(initialState.content || {}),
    },
    outline: {
      ...defaultState.outline,
      ...(initialState.outline || {}),
    },
    history: {
      ...defaultState.history,
      ...(initialState.history || {}),
    },
    config: {
      ...defaultState.config,
      ...(initialState.config || {}),
    },
    plantUML: {
      ...defaultState.plantUML,
      ...(initialState.plantUML || {}),
    },
  };

  return configureStore({
    reducer: {
      content: contentReducer,
      fileTree: fileTreeReducer,
      outline: outlineReducer,
      appSetting: appSettingReducer,
      history: historyReducer,
      config: configReducer,
      plantUML: plantUMLReducer,
    },
    preloadedState: state,
  });
};
