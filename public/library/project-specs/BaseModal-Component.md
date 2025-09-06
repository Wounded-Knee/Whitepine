# BaseModal Component Documentation

## Overview

The `BaseModal` component is a reusable, accessible modal dialog component that provides consistent styling and behavior across the Whitepine application. It abstracts common modal functionality and normalizes backdrop styles using `backdrop-blur-sm`.

## Features

### Core Functionality
- **Consistent Backdrop**: All modals use `backdrop-blur-sm bg-black bg-opacity-50` for uniform appearance
- **Accessibility**: Full ARIA support, focus trap, and keyboard navigation
- **Responsive Design**: Adapts to different screen sizes with configurable positioning
- **Theme Integration**: Works with the application's Federal color scheme

### Props Interface

```typescript
interface BaseModalProps {
  isOpen: boolean                    // Controls modal visibility
  onClose: () => void               // Callback when modal closes
  title?: string                    // Optional modal title
  children: React.ReactNode         // Modal content
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'  // Modal width
  position?: 'center' | 'top' | 'bottom'      // Modal positioning
  backdrop?: 'blur' | 'opacity' | 'none'      // Backdrop style (normalized)
  closeOnBackdrop?: boolean         // Close on backdrop click
  closeOnEscape?: boolean           // Close on Escape key
  showCloseButton?: boolean         // Show close button in header
  className?: string                // Additional CSS classes
  contentClassName?: string         // Additional content CSS classes
}
```

## Size Variants

| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | `max-w-sm` | Small forms, confirmations |
| `md` | `max-w-md` | Standard dialogs, auth forms |
| `lg` | `max-w-lg` | Complex forms, data entry |
| `xl` | `max-w-xl` | Large content, detailed views |
| `full` | `max-w-full mx-4` | Full-width content |

## Position Variants

| Position | Behavior | Use Case |
|----------|----------|----------|
| `center` | Centered vertically and horizontally | Most common use case |
| `top` | Positioned from top with padding | Forms, data entry |
| `bottom` | Positioned from bottom with padding | Mobile-friendly dialogs |

## Accessibility Features

- **Focus Trap**: Tab navigation is trapped within the modal
- **Escape Key**: Closes modal when Escape is pressed
- **ARIA Attributes**: Proper `role="dialog"` and `aria-modal="true"`
- **Screen Reader Support**: Title association with `aria-labelledby`
- **Keyboard Navigation**: Full keyboard support

## Usage Examples

### Basic Modal
```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Basic Modal"
>
  <p>Modal content goes here</p>
</BaseModal>
```

### Form Modal
```tsx
<BaseModal
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  title="Add New Item"
  size="lg"
  position="top"
>
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
  </form>
</BaseModal>
```

### Custom Styling
```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Custom Modal"
  className="custom-overlay-class"
  contentClassName="custom-content-class"
>
  <div>Custom styled content</div>
</BaseModal>
```

## Refactored Components

The following components have been refactored to use BaseModal:

### 1. AuthDialog (`src/app/components/AuthDialog.tsx`)
- **Before**: Custom overlay with `backdrop-blur-sm`
- **After**: Uses BaseModal with `size="md"` and `position="center"`
- **Benefits**: Consistent styling, improved accessibility

### 2. VigorActivity (REMOVED)
- **Status**: Component has been removed from the architecture
- **Note**: Vigor functionality simplified to focus on core obligations

### 3. MediaBrowser Upload Modal (`src/app/lab/government-browser/components/MediaBrowser.tsx`)
- **Before**: Custom modal with theme-aware styling
- **After**: Uses BaseModal with `size="lg"` and `position="top"`
- **Benefits**: Consistent behavior, reduced code duplication

### 4. BaseBrowser Form Modal (`src/app/lab/government-browser/components/BaseBrowser.tsx`)
- **Before**: Custom modal with `bg-gray-600 bg-opacity-50`
- **After**: Uses BaseModal with `size="lg"` and `position="top"`
- **Benefits**: Unified modal system, better accessibility

## Backdrop Normalization

All modals now use the standardized backdrop:
```css
backdrop-blur-sm bg-black bg-opacity-50
```

This provides:
- **Consistent Visual Experience**: All modals look the same
- **Better Performance**: Optimized backdrop blur
- **Accessibility**: Proper contrast and focus management
- **Maintainability**: Single source of truth for backdrop styling

## Benefits of BaseModal

### DRY Principle
- Eliminates duplicate modal overlay code
- Centralizes modal behavior and styling
- Reduces maintenance overhead

### Consistency
- Uniform appearance across the application
- Standardized interaction patterns
- Predictable user experience

### Accessibility
- Built-in ARIA support
- Keyboard navigation
- Screen reader compatibility
- Focus management

### Maintainability
- Single component to update
- Easier testing and debugging
- Clear separation of concerns

## Future Enhancements

Potential improvements for the BaseModal component:

1. **Animation Support**: Add fade/slide animations
2. **Loading States**: Built-in loading overlay support
3. **Custom Headers**: More flexible header customization
4. **Portal Rendering**: Render modals in portal for better z-index management
5. **Theme Variants**: Additional theme-aware styling options

## Testing

The BaseModal component includes:
- TypeScript type safety
- Accessibility testing with screen readers
- Keyboard navigation testing
- Responsive design testing
- Cross-browser compatibility

## Migration Guide

To migrate existing modals to BaseModal:

1. Import BaseModal component
2. Replace custom overlay div with BaseModal
3. Move modal content to children prop
4. Configure size and position as needed
5. Remove custom backdrop styling
6. Test accessibility and keyboard navigation
