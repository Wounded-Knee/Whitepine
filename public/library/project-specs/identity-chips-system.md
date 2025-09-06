# Identity Chips System

## Overview
The Identity Chips system provides a comprehensive set of React components for displaying various types of identity data in the Whitepine application. Each chip represents a specific identity category with unique styling and data visualization capabilities.

## Architecture

### Component Hierarchy
```
BaseChip (Foundation)
├── IdentityChip (Base Identity)
    ├── EconomicIdentityChip
    ├── EducationalIdentityChip
    ├── IndustrialIdentityChip
    ├── MaritalIdentityChip
    ├── PoliticalIdentityChip
    ├── RacialIdentityChip
    ├── ReligiousIdentityChip
    └── SexualIdentityChip
```

### Base Components

#### BaseChip
- **Purpose**: Foundation component for all identity chips
- **Props**: `id`, `name`, `description`, `abbr`, `populationEstimate`, `isActive`, `className`, `onClick`, `children`
- **Features**: 
  - Consistent styling and layout
  - Population estimate display
  - Active/inactive state handling
  - Click interaction support
  - Responsive design with Tailwind CSS

#### IdentityChip
- **Purpose**: Base identity component with common identity properties
- **Extends**: BaseChip
- **Additional Props**: `parentId`, `slug`, `identityType`
- **Features**:
  - Parent-child relationship indicators
  - Identity type badges
  - Enhanced visual hierarchy

### Specialized Identity Chips

#### EconomicIdentityChip
- **Color Scheme**: Green (green-500, green-50, green-100)
- **Special Features**: Income range display with currency formatting
- **Data**: `incomeRange.low`, `incomeRange.high`

#### EducationalIdentityChip
- **Color Scheme**: Purple (purple-500, purple-50, purple-100)
- **Special Features**: Educational attainment display
- **Future**: Ready for additional educational-specific fields

#### IndustrialIdentityChip
- **Color Scheme**: Orange (orange-500, orange-50, orange-100)
- **Special Features**: Professional/industrial sector display
- **Future**: Ready for additional industrial-specific fields

#### MaritalIdentityChip
- **Color Scheme**: Pink (pink-500, pink-50, pink-100)
- **Special Features**: Marital status display
- **Future**: Ready for additional marital-specific fields

#### PoliticalIdentityChip
- **Color Scheme**: Red (red-500, red-50, red-100)
- **Special Features**: Political affiliation display
- **Future**: Ready for additional political-specific fields

#### RacialIdentityChip
- **Color Scheme**: Amber (amber-500, amber-50, amber-100)
- **Special Features**: Racial identity display
- **Future**: Ready for additional racial-specific fields

#### ReligiousIdentityChip
- **Color Scheme**: Emerald (emerald-500, emerald-50, emerald-100)
- **Special Features**: Religious affiliation display
- **Future**: Ready for additional religious-specific fields

#### SexualIdentityChip
- **Color Scheme**: Rose (rose-500, rose-50, rose-100)
- **Special Features**: Sexual identity display
- **Future**: Ready for additional sexual identity-specific fields

## Data Structure

### Base Identity Schema
```typescript
interface BaseChipProps {
  id: string
  name: string
  description: string
  abbr?: string
  populationEstimate?: {
    year: number
    source: string
    estimate: number
  }
  isActive?: boolean
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}
```

### Identity Schema
```typescript
interface IdentityChipProps extends BaseChipProps {
  parentId?: number | null
  slug: string
  identityType?: string
}
```

### Economic Identity Schema
```typescript
interface EconomicIdentityChipProps extends IdentityChipProps {
  incomeRange?: {
    low: number
    high: number
  }
}
```

## Usage Examples

### Basic Usage
```tsx
import { BaseChip } from '@/components/Chips'

<BaseChip
  id="identity-1"
  name="Sample Identity"
  description="A sample identity description"
  abbr="SI"
  populationEstimate={{
    year: 2025,
    source: "Census Bureau",
    estimate: 15000000
  }}
  onClick={() => console.log('Chip clicked!')}
/>
```

### Economic Identity
```tsx
import { EconomicIdentityChip } from '@/components/Chips'

<EconomicIdentityChip
  id="economic-1"
  name="Middle Class"
  description="Households with annual income $50K-$150K"
  abbr="MC"
  slug="middle-class"
  incomeRange={{
    low: 50000,
    high: 150000
  }}
  populationEstimate={{
    year: 2025,
    source: "Census Bureau",
    estimate: 45000000
  }}
/>
```

### Custom Styling
```tsx
<EconomicIdentityChip
  {...identityData}
  className="w-full max-w-md shadow-lg"
  onClick={handleChipClick}
/>
```

## Laboratory Page

### Location
`/lab/identity-chips`

### Features
- Interactive demonstrations of all chip types
- Sample data for testing and development
- Click interactions with visual feedback
- Comprehensive documentation and examples
- Federal-themed design consistent with Whitepine application

### Navigation
Accessible from the main laboratory page (`/lab`) with a dedicated card and description.

## Styling Guidelines

### Color Schemes
Each identity type has a unique color scheme for easy visual identification:
- **Economic**: Green (financial/prosperity)
- **Educational**: Purple (knowledge/wisdom)
- **Industrial**: Orange (energy/innovation)
- **Marital**: Pink (relationships/love)
- **Political**: Red (power/authority)
- **Racial**: Amber (diversity/culture)
- **Religious**: Emerald (spirituality/growth)
- **Sexual**: Rose (identity/expression)

### Responsive Design
- Flexbox layout for flexible positioning
- Responsive text sizing
- Mobile-friendly touch targets
- Consistent spacing and padding

### Interactive States
- Hover effects with color transitions
- Click feedback with ring highlights
- Disabled state styling for inactive chips
- Smooth transitions (200ms duration)

## Future Enhancements

### Planned Features
- Advanced filtering and search capabilities
- Chip grouping and categorization
- Export functionality for chip data
- Integration with identity management systems
- Real-time data updates from database

### Extensibility
- Easy addition of new identity types
- Customizable color schemes
- Plugin architecture for specialized data
- Internationalization support

## Technical Details

### Dependencies
- React 18+ with TypeScript
- Tailwind CSS for styling
- Next.js 15 App Router compatibility

### Performance
- Optimized re-renders with React.memo
- Efficient prop spreading
- Minimal bundle size impact
- Lazy loading ready

### Accessibility
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes

## Development

### File Structure
```
src/app/components/Chips/
├── index.ts                    # Export file
├── BaseChip.tsx               # Foundation component
├── IdentityChip.tsx           # Base identity component
├── EconomicIdentityChip.tsx   # Economic specialization
├── EducationalIdentityChip.tsx # Educational specialization
├── IndustrialIdentityChip.tsx # Industrial specialization
├── MaritalIdentityChip.tsx    # Marital specialization
├── PoliticalIdentityChip.tsx  # Political specialization
├── RacialIdentityChip.tsx     # Racial specialization
├── ReligiousIdentityChip.tsx  # Religious specialization
└── SexualIdentityChip.tsx     # Sexual identity specialization
```

### Testing
- Component rendering tests
- Props validation tests
- Interaction behavior tests
- Accessibility compliance tests
- Visual regression tests

### Contributing
1. Follow existing component patterns
2. Maintain consistent TypeScript interfaces
3. Use Tailwind CSS for styling
4. Add comprehensive JSDoc comments
5. Update this documentation for changes

