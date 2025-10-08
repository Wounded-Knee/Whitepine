# Typography Guide

This document describes the typography system used in the White Pine application.

## Font Families

We use a sophisticated font pairing system with three font families:

### 1. Inter (Body Text)
- **Purpose**: Body text, UI elements, general content
- **Variable**: `--font-inter` or use Tailwind class `font-sans`
- **Characteristics**: Clean, modern, highly legible sans-serif
- **Usage**: Default for all body text and interface elements

### 2. Playfair Display (Headings)
- **Purpose**: Headlines, titles, hero text
- **Variable**: `--font-playfair` or use Tailwind class `font-serif`
- **Characteristics**: Elegant serif font with high contrast
- **Usage**: All h1-h6 elements, marketing headlines, emphasis

### 3. JetBrains Mono (Code)
- **Purpose**: Code snippets, technical content
- **Variable**: `--font-mono` or use Tailwind class `font-mono`
- **Usage**: `<code>`, `<pre>`, technical documentation

## Typography Scale

We use a fluid, responsive type scale that adapts to screen sizes:

```css
--font-size-xs:   clamp(0.75rem,  0.7rem + 0.25vw,  0.875rem)   /* 12-14px */
--font-size-sm:   clamp(0.875rem, 0.825rem + 0.25vw, 1rem)      /* 14-16px */
--font-size-base: clamp(1rem,     0.95rem + 0.25vw,  1.125rem)  /* 16-18px */
--font-size-lg:   clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)   /* 18-20px */
--font-size-xl:   clamp(1.25rem,  1.15rem + 0.5vw,   1.5rem)    /* 20-24px */
--font-size-2xl:  clamp(1.5rem,   1.35rem + 0.75vw,  1.875rem)  /* 24-30px */
--font-size-3xl:  clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)   /* 30-36px */
--font-size-4xl:  clamp(2.25rem,  1.95rem + 1.5vw,   3rem)      /* 36-48px */
--font-size-5xl:  clamp(3rem,     2.5rem + 2.5vw,    3.75rem)   /* 48-60px */
```

### Using the Type Scale

**With CSS Variables:**
```tsx
<h1 style={{ fontSize: 'var(--font-size-5xl)' }}>
  Large Heading
</h1>
```

**With Tailwind Classes:**
```tsx
<h1 className="text-5xl">Large Heading</h1>
```

## Line Heights

We provide semantic line height variables:

- `--line-height-tight`: 1.25 (headings, compact text)
- `--line-height-snug`: 1.375 (subheadings)
- `--line-height-normal`: 1.5 (standard body text)
- `--line-height-relaxed`: 1.625 (long-form content)
- `--line-height-loose`: 2 (extra spacing for emphasis)

## Letter Spacing

Strategic letter spacing for readability:

- `--letter-spacing-tighter`: -0.05em (large headings)
- `--letter-spacing-tight`: -0.025em (headings)
- `--letter-spacing-normal`: 0 (body text)
- `--letter-spacing-wide`: 0.025em (small caps, buttons)
- `--letter-spacing-wider`: 0.05em (all caps text)
- `--letter-spacing-widest`: 0.1em (spaced uppercase)

## Heading Hierarchy

All headings automatically use Playfair Display serif font with appropriate sizing:

```tsx
<h1>Main Page Title</h1>        /* 5xl, tight line-height, tight letter-spacing */
<h2>Section Heading</h2>         /* 4xl, tight line-height, tight letter-spacing */
<h3>Subsection</h3>              /* 3xl, snug line-height, tight letter-spacing */
<h4>Minor Heading</h4>           /* 2xl, snug line-height */
<h5>Small Heading</h5>           /* xl, snug line-height */
<h6>Smallest Heading</h6>        /* lg, normal line-height */
```

## Typography Components

We provide reusable typography components in `/components/ui/typography.tsx`:

```tsx
import { 
  TypographyH1, 
  TypographyH2, 
  TypographyP,
  TypographyLead,
  TypographyMuted 
} from '@/components/ui/typography';

<TypographyH1>Page Title</TypographyH1>
<TypographyLead>Introductory paragraph with larger text</TypographyLead>
<TypographyP>Regular body paragraph</TypographyP>
<TypographyMuted>Secondary information</TypographyMuted>
```

## Prose Styling

For long-form content (blog posts, articles, MDX), use the `.prose` class:

```tsx
<div className="prose">
  <MDXContent />
</div>
```

The prose class provides:
- Proper spacing between elements
- Styled lists with primary color markers
- Beautiful blockquotes with border accents
- Well-formatted code blocks
- Styled links with subtle underlines
- Optimal line length (65 characters)

## MDX Components

MDX content automatically uses our typography system. All markdown elements are styled with custom components defined in `mdx-components.tsx`.

## Best Practices

### 1. Use Text Balance for Headings
```tsx
<h1 className="text-balance">
  This heading will balance line breaks nicely
</h1>
```

### 2. Use Text Pretty for Body Text
```tsx
<p className="text-pretty">
  Body text with improved line breaking
</p>
```

### 3. Maintain Hierarchy
- Only one h1 per page
- Don't skip heading levels (h1 → h3)
- Use semantic HTML (`<h2>` not `<div className="text-2xl">`)

### 4. Consider Reading Width
- Keep line length under 65-75 characters for readability
- Use the `.prose` class or `max-w-prose` for long-form content

### 5. Font Loading
All fonts use `display: swap` to prevent FOIT (Flash of Invisible Text):
```tsx
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});
```

## Accessibility

Our typography system includes:
- Proper font rendering: `antialiased`, `text-rendering: optimizeLegibility`
- OpenType features enabled: kerning, ligatures, contextual alternates
- Sufficient contrast ratios with theme colors
- Fluid scaling that maintains readability at all sizes
- Semantic HTML structure

## Dark Mode

Typography automatically adapts to dark mode:
- Body text: Uses `text-foreground` which adjusts per theme
- Headings: Full contrast with `text-foreground`
- Muted text: Uses `text-muted-foreground` for secondary content
- All colors are theme-aware via HSL variables

## Examples

### Hero Section
```tsx
<section>
  <h1 
    className="font-serif font-bold text-foreground text-balance"
    style={{ 
      fontSize: 'var(--font-size-5xl)',
      lineHeight: 'var(--line-height-tight)',
      letterSpacing: 'var(--letter-spacing-tight)'
    }}
  >
    Welcome to White Pine
  </h1>
  <p 
    className="text-muted-foreground mt-4"
    style={{ 
      fontSize: 'var(--font-size-xl)',
      lineHeight: 'var(--line-height-relaxed)'
    }}
  >
    A modern platform for civic engagement
  </p>
</section>
```

### Card Layout
```tsx
<article className="bg-card p-6 rounded-lg">
  <h2 
    className="font-serif font-semibold mb-3"
    style={{ 
      fontSize: 'var(--font-size-2xl)',
      lineHeight: 'var(--line-height-snug)'
    }}
  >
    Card Title
  </h2>
  <p 
    className="text-muted-foreground"
    style={{ lineHeight: 'var(--line-height-relaxed)' }}
  >
    Card description text
  </p>
</article>
```

## Migration from Old Typography

If you encounter old typography patterns, update them as follows:

**Old:**
```tsx
<h1 className="text-4xl font-bold text-gray-900 dark:text-white">
```

**New:**
```tsx
<h1 
  className="font-serif font-bold text-foreground"
  style={{ 
    fontSize: 'var(--font-size-5xl)',
    lineHeight: 'var(--line-height-tight)'
  }}
>
```

Or use the component:
```tsx
<TypographyH1>Title</TypographyH1>
```

