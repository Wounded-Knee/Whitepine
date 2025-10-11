/**
 * MDX components map - all imports at module level for proper bundling
 */

// Import all MDX files at module level so webpack bundles them
import AboutUs from '@/content/marketing/about-us.mdx';
import Declaration from '@/content/marketing/declaration-of-civic-constitutional-assembly.mdx';
import InstrumentsOfPowerIndex from '@/content/marketing/instruments-of-power/index.mdx';
import InstrumentsOfPowerConstitutionalConvention from '@/content/marketing/instruments-of-power/constitutional-convention/index.mdx';
import InstrumentsOfPowerDemonstrations from '@/content/marketing/instruments-of-power/demonstrations/index.mdx';
import InstrumentsOfPowerDirectDemocracy from '@/content/marketing/instruments-of-power/direct-democracy/index.mdx';
import InstrumentsOfPowerEconomicVeto from '@/content/marketing/instruments-of-power/economic-veto/index.mdx';
import InstrumentsOfPowerGeneralElections from '@/content/marketing/instruments-of-power/general-elections/index.mdx';
import InstrumentsOfPowerPetitions from '@/content/marketing/instruments-of-power/petitions/index.mdx';
import InstrumentsOfPowerPrimaries from '@/content/marketing/instruments-of-power/primaries/index.mdx';
import InstrumentsOfPowerRecallElections from '@/content/marketing/instruments-of-power/recall-elections/index.mdx';
import InstrumentsOfPowerStrikes from '@/content/marketing/instruments-of-power/strikes/index.mdx';
import SymbolsIndex from '@/content/marketing/symbols/index.mdx';
import SymbolsGreatTreeOfPeace from '@/content/marketing/symbols/great-tree-of-peace.mdx';
import SymbolsSpiritOf1776 from '@/content/marketing/symbols/spirit-of-1776.mdx';
import SymbolsThirteenArrows from '@/content/marketing/symbols/thirteen-arrows.mdx';

// Export a synchronous map of all components
export const mdxComponents: Record<string, React.ComponentType> = {
  'about-us': AboutUs,
  'declaration-of-civic-constitutional-assembly': Declaration,
  'instruments-of-power': InstrumentsOfPowerIndex,
  'instruments-of-power/constitutional-convention': InstrumentsOfPowerConstitutionalConvention,
  'instruments-of-power/demonstrations': InstrumentsOfPowerDemonstrations,
  'instruments-of-power/direct-democracy': InstrumentsOfPowerDirectDemocracy,
  'instruments-of-power/economic-veto': InstrumentsOfPowerEconomicVeto,
  'instruments-of-power/general-elections': InstrumentsOfPowerGeneralElections,
  'instruments-of-power/petitions': InstrumentsOfPowerPetitions,
  'instruments-of-power/primaries': InstrumentsOfPowerPrimaries,
  'instruments-of-power/recall-elections': InstrumentsOfPowerRecallElections,
  'instruments-of-power/strikes': InstrumentsOfPowerStrikes,
  'symbols': SymbolsIndex,
  'symbols/great-tree-of-peace': SymbolsGreatTreeOfPeace,
  'symbols/spirit-of-1776': SymbolsSpiritOf1776,
  'symbols/thirteen-arrows': SymbolsThirteenArrows,
};

export function getMdxComponent(slug: string): React.ComponentType | null {
  // Normalize slug - remove /index suffix
  const normalizedSlug = slug.endsWith('/index') ? slug.slice(0, -6) : slug;
  return mdxComponents[normalizedSlug] || null;
}

