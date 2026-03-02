import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '@mui/material';

let renderCounter = 0;

interface MermaidProps {
  chart: string;
}

const MermaidRenderer: React.FC<MermaidProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chart) return;

    let cancelled = false;

    const renderMermaid = async () => {
      // Unique ID per render attempt — avoids all ID collisions
      const id = `mermaid-${++renderCounter}`;

      // Re-initialize each time to reset internal parser state
      mermaid.initialize({
        startOnLoad: false,
        theme: theme.palette.mode === 'dark' ? 'dark' : 'neutral',
        securityLevel: 'loose',
      });

      try {
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(svg);
      } catch (error) {
        console.error('Error rendering mermaid chart:', error);
        if (!cancelled) setSvg(null);
      } finally {
        // mermaid.render() creates a hidden element with this ID — always clean it up
        const temp = document.getElementById(id);
        if (temp) temp.remove();
      }
    };

    renderMermaid();

    return () => {
      cancelled = true;
    };
  }, [chart, theme.palette.mode]);

  if (!svg) {
    return <pre><code>{chart}</code></pre>;
  }

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default MermaidRenderer;
