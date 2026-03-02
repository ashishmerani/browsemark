---
title: Math and Code
description: KaTeX math formulas and syntax-highlighted code blocks
---

# Math and Code

browsemark renders LaTeX math with KaTeX and code blocks with syntax highlighting across common languages.

## Inline Math

The quadratic formula $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ renders inline with text.

Einstein's equation $E = mc^2$ is a classic example.

## Block Math

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

A matrix:

$$
\begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

## Code Blocks

### TypeScript

```typescript
interface FileTreeItem {
  path: string;
  status: string;
  isDirectory?: boolean;
}

const slugify = (str: string): string =>
  str.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-/]/g, '');
```

### Python

```python
def fibonacci(n: int) -> list[int]:
    """Generate the first n Fibonacci numbers."""
    if n <= 0:
        return []
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq[:n]
```

### Bash

```bash
# Serve a directory with browsemark
npx browsemark ./docs --port 3000

# Or serve the current directory
npx browsemark
```

### JSON

```json
{
  "name": "browsemark",
  "version": "1.0.0",
  "description": "Zero-config CLI for viewing markdown files in the browser"
}
```

## See Also

- [[tables-and-alerts]] — Tables and GitHub alerts
- [[_getting-started|Getting Started]] — Feature overview
