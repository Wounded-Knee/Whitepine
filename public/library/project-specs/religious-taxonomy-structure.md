# Religious Identity Taxonomy Structure

## Overview
This document outlines the comprehensive religious identity taxonomy implemented in the Whitepine application. The taxonomy is based on Pew Research Center data and provides a 4-level hierarchical structure for religious identities in the United States.

## Taxonomy Structure

### Level 0: Top-Level Categories (7 main groups)
```
1. Christian (CHR) - 180M people
2. Non-Religious (NR) - 28M people  
3. Jewish (JEW) - 7M people
4. Muslim (MUS) - 3.5M people
5. Buddhist (BUD) - 1.2M people
6. Hindu (HIN) - 800K people
7. Other Religions (OTH) - 2M people
```

### Level 1: Major Denominations/Traditions

#### Christian Denominations
```
Christian
├── Protestant (PROT) - 100M people
├── Catholic (CATH) - 70M people
└── Orthodox (ORTH) - 10M people
```

#### Non-Religious Categories
```
Non-Religious
├── Agnostic (AGN) - 15M people
└── Atheist (ATH) - 13M people
```

#### Jewish Denominations
```
Jewish
├── Reform Judaism (REF) - 3.5M people
├── Conservative Judaism (CON) - 1.5M people
├── Orthodox Judaism (ORTH) - 1M people
└── Secular/Cultural Jewish (SEC) - 1M people
```

#### Muslim Denominations
```
Muslim
├── Sunni Islam (SUN) - 2.8M people
└── Shia Islam (SHI) - 700K people
```

#### Buddhist Traditions
```
Buddhist
├── Theravada Buddhism (THE) - 400K people
├── Mahayana Buddhism (MAH) - 500K people
└── Vajrayana Buddhism (VAJ) - 300K people
```

#### Other Religions
```
Other Religions
├── Sikh (SIK) - 500K people
├── Jain (JAI) - 100K people
├── Bahá'í (BAH) - 200K people
├── Unitarian Universalist (UU) - 300K people
├── Native American/Indigenous (NAI) - 400K people
└── Wicca/Pagan (WIC) - 500K people
```

### Level 2: Protestant Denominations
```
Protestant
├── Baptist (BAP) - 30M people
├── Methodist (MET) - 12M people
├── Lutheran (LUT) - 8M people
├── Presbyterian (PRE) - 5M people
├── Pentecostal (PEN) - 15M people
├── Episcopal/Anglican (EPI) - 3M people
├── Non-denominational Protestant (NDP) - 20M people
└── Other Protestant (OPR) - 7M people
```

### Level 2: Orthodox Denominations
```
Orthodox
├── Greek Orthodox (GRO) - 5M people
├── Russian Orthodox (RUS) - 2M people
└── Other Orthodox (OOR) - 3M people
```

### Level 3: Baptist Sub-denominations
```
Baptist
├── Southern Baptist (SBC) - 15M people
├── American Baptist (ABC) - 5M people
├── Independent Baptist (IBP) - 8M people
└── Other Baptist (OBP) - 2M people
```

### Level 3: Pentecostal Sub-denominations
```
Pentecostal
├── Assemblies of God (AOG) - 3M people
├── Church of God in Christ (COG) - 2M people
├── Foursquare Gospel (FSG) - 1M people
└── Other Pentecostal (OPN) - 9M people
```

## Data Sources
- **Primary Source**: Pew Research Center Religious Landscape Study
- **Year**: 2025 estimates
- **Population**: United States only
- **Methodology**: Self-identification surveys

## Implementation Details

### Database Schema
- **Collection**: `identities` (with discriminator `ReligiousIdentity`)
- **Hierarchical Structure**: Uses `parentId` field for parent-child relationships
- **Unique Identifiers**: Numeric `id` field for efficient querying
- **Slugs**: URL-friendly identifiers for web routing

### Mock Data Structure
The Picker component includes comprehensive mock data that mirrors the database structure, allowing for:
- **Offline functionality** when API is unavailable
- **Development and testing** without database dependencies
- **Consistent user experience** across different environments

### Navigation Features
- **Hierarchical browsing** through parent-child relationships
- **Breadcrumb navigation** showing current path
- **Sibling navigation** allowing easy switching between related identities
- **Search functionality** with case-insensitive filtering
- **Panel persistence** when children or siblings are available

## Usage Examples

### Selecting a Religious Identity
1. **Top-level selection**: Choose "Christian" to see Protestant, Catholic, Orthodox options
2. **Denomination selection**: Choose "Protestant" to see Baptist, Methodist, Lutheran, etc.
3. **Sub-denomination selection**: Choose "Baptist" to see Southern Baptist, American Baptist, etc.
4. **Final selection**: Choose "Southern Baptist" for the most specific identity

### Navigation Patterns
- **Drill-down**: Christian → Protestant → Baptist → Southern Baptist
- **Sibling switching**: Baptist → Methodist → Lutheran (all Protestant denominations)
- **Back navigation**: Use breadcrumbs to return to parent categories
- **Search**: Type "baptist" to find all Baptist-related identities

## Future Enhancements
- **Geographic variations** (regional religious preferences)
- **Historical data** (religious affiliation changes over time)
- **Demographic breakdowns** (age, education, income correlations)
- **Interfaith categories** (people identifying with multiple traditions)
- **Emerging traditions** (new religious movements and practices)

## Technical Notes
- **ID Format**: Uses hierarchical numbering (1, 1-1, 1-1-1, 1-1-1-1)
- **Population Estimates**: Updated annually based on latest survey data
- **Validation**: Parent-child relationships are validated to prevent circular references
- **Performance**: Indexed for efficient hierarchical queries
- **Scalability**: Designed to accommodate additional levels and categories as needed
