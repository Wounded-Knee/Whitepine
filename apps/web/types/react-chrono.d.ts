declare module 'react-chrono' {
  import { FC } from 'react';

  export interface TimelineItem {
    title?: string;
    cardTitle?: string;
    cardSubtitle?: string;
    cardDetailedText?: string | string[] | React.ReactNode;
    url?: string;
    media?: {
      type: 'IMAGE' | 'VIDEO';
      source: {
        url: string;
      };
    };
  }

  export interface TimelineTheme {
    primary?: string;
    secondary?: string;
    cardBgColor?: string;
    titleColor?: string;
    titleColorActive?: string;
    cardTitleColor?: string;
    cardDetailsColor?: string;
    cardMediaBgColor?: string;
    detailsColor?: string;
    cardSubtitleColor?: string;
    toolbarBtnBgColor?: string;
    toolbarBtnFgColor?: string;
    toolbarTextColor?: string;
  }

  export interface TimelineFontSizes {
    cardSubtitle?: string;
    cardText?: string;
    cardTitle?: string;
    title?: string;
  }

  export interface ChronoProps {
    items?: TimelineItem[];
    mode?: 'VERTICAL' | 'HORIZONTAL' | 'VERTICAL_ALTERNATING';
    theme?: TimelineTheme;
    fontSizes?: TimelineFontSizes;
    cardHeight?: number;
    slideShow?: boolean;
    scrollable?: {
      scrollbar?: boolean;
    };
    enableOutline?: boolean;
    disableClickOnCircle?: boolean;
    hideControls?: boolean;
    allowDynamicUpdate?: boolean;
    cardWidth?: number;
    lineWidth?: number;
    cardLess?: boolean;
    useReadMore?: boolean;
    children?: React.ReactNode;
  }

  export const Chrono: FC<ChronoProps>;
}

