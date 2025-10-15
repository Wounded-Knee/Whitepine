/**
 * MDX components map - all imports at module level for proper bundling
 */

// Import all MDX files at module level so webpack bundles them
import AboutIndex from '@/content/marketing/about/index.mdx';
import AboutFunding from '@/content/marketing/about/funding.mdx';
import AboutMissionVision from '@/content/marketing/about/mission-vision.mdx';
import AboutFoundingStory from '@/content/marketing/about/founding-story.mdx';
import AboutTeamAdvisors from '@/content/marketing/about/team-advisors.mdx';
import AboutGovernanceTransparency from '@/content/marketing/about/governance-transparency.mdx';
import AboutPartnersSupporters from '@/content/marketing/about/partners-supporters.mdx';
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
import PlatformHowItWorks from '@/content/marketing/platform/how-it-works.mdx';
import PlatformTechnologyEthics from '@/content/marketing/platform/technology-ethics.mdx';
import PlatformDevelopmentRoadmap from '@/content/marketing/platform/development-roadmap.mdx';
import PlatformLivePrototype from '@/content/marketing/platform/live-prototype.mdx';
import PlatformDocumentation from '@/content/marketing/platform/documentation.mdx';
import StoriesPeoplePlaces from '@/content/marketing/stories/people-places.mdx';
import StoriesMultimediaGallery from '@/content/marketing/stories/multimedia-gallery.mdx';
import StoriesCommunityVoices from '@/content/marketing/stories/community-voices.mdx';
import TransparencyFinancialReports from '@/content/marketing/transparency/financial-reports.mdx';
import TransparencyGrantsFunding from '@/content/marketing/transparency/grants-funding.mdx';
import TransparencyImpactMetrics from '@/content/marketing/transparency/impact-metrics.mdx';
import TransparencyPolicies from '@/content/marketing/transparency/policies.mdx';
import ParticipateJoinPilot from '@/content/marketing/participate/join-pilot.mdx';
import ParticipateHokaHey from '@/content/marketing/participate/hoka-hey/index.mdx';
import ParticipatePartnerWithUs from '@/content/marketing/participate/partner-with-us.mdx';
import ParticipateDonate from '@/content/marketing/participate/donate.mdx';
import ParticipateNewsletter from '@/content/marketing/participate/newsletter.mdx';
import ContactIndex from '@/content/marketing/contact/index.mdx';
import SymbolsIndex from '@/content/marketing/symbols/index.mdx';
import SymbolsGreatTreeOfPeace from '@/content/marketing/symbols/great-tree-of-peace.mdx';
import SymbolsSpiritOf1776 from '@/content/marketing/symbols/spirit-of-1776.mdx';
import SymbolsThirteenArrows from '@/content/marketing/symbols/thirteen-arrows.mdx';

// Export a synchronous map of all components
export const mdxComponents: Record<string, React.ComponentType> = {
  'about': AboutIndex,
  'about/funding': AboutFunding,
  'about/mission-vision': AboutMissionVision,
  'about/founding-story': AboutFoundingStory,
  'about/team-advisors': AboutTeamAdvisors,
  'about/governance-transparency': AboutGovernanceTransparency,
  'about/partners-supporters': AboutPartnersSupporters,
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
  'platform/how-it-works': PlatformHowItWorks,
  'platform/technology-ethics': PlatformTechnologyEthics,
  'platform/development-roadmap': PlatformDevelopmentRoadmap,
  'platform/live-prototype': PlatformLivePrototype,
  'platform/documentation': PlatformDocumentation,
  'stories/people-places': StoriesPeoplePlaces,
  'stories/multimedia-gallery': StoriesMultimediaGallery,
  'stories/community-voices': StoriesCommunityVoices,
  'transparency/financial-reports': TransparencyFinancialReports,
  'transparency/grants-funding': TransparencyGrantsFunding,
  'transparency/impact-metrics': TransparencyImpactMetrics,
  'transparency/policies': TransparencyPolicies,
  'participate/join-pilot': ParticipateJoinPilot,
  'participate/hoka-hey': ParticipateHokaHey,
  'participate/partner-with-us': ParticipatePartnerWithUs,
  'participate/donate': ParticipateDonate,
  'participate/newsletter': ParticipateNewsletter,
  'contact': ContactIndex,
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

