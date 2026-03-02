import { act, render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../../../../utils';
import MarkdownCode from '../../../../../../src/components/Content/MarkdownContent/MarkdownRenderer/MarkdownCode';

describe('MarkdownCode', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore({
      config: {
        fontFamilyMonospace: 'monospace',
        syntaxHighlighterTheme: 'github',
      },
    });
  });

  it('should render inline code correctly', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <MarkdownCode inline>{'console.log("hello");'}</MarkdownCode>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render code block correctly', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <MarkdownCode className="language-js">{'console.log("hello");'}</MarkdownCode>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render mermaid chart correctly', async () => {
    let asFragment: unknown;
    await act(async () => {
      ({ asFragment } = render(
        <Provider store={store}>
          <MarkdownCode className="language-mermaid">{'graph TD; A-->B'}</MarkdownCode>
        </Provider>
      ));
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
