'use client';

import React from 'react';
import { Chrono } from 'react-chrono';

export const SpiritOf1776Timeline: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Detect current theme on mount and listen for changes
  React.useEffect(() => {
    setMounted(true);
    
    const updateTheme = () => {
      const root = document.documentElement;
      setIsDark(root.classList.contains('dark'));
    };

    // Initial theme detection
    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const items = [
    {
      title: '1776–1783',
      cardTitle: 'The Revolution',
      cardDetailedText: 'The first patriots fought on frostbitten fields for a future they would never see, shedding blood so that others might live free.',
    },
    {
      title: '1861–1865',
      cardTitle: 'The Civil War',
      cardDetailedText: 'When the nation\'s soul was divided, that same spirit returned. Brother fought brother, and more than 600,000 died to redeem the founding promise that all men are created equal.',
    },
    {
      title: '1941–1945',
      cardTitle: 'World War II',
      cardDetailedText: 'American soldiers carried the ideals of 1776 across oceans, standing against tyranny once more so that liberty might survive in the world.',
    },
    {
      title: '1950s–1960s',
      cardTitle: 'The Civil Rights Movement',
      cardDetailedText: 'Though fought without armies, it too was marked in blood. The martyrs of that struggle—King, Evers, the Selma marchers—proved again that freedom\'s cost is eternal vigilance and moral courage.',
    },
    {
      title: 'Present Day',
      cardTitle: 'Modern Guardians of Liberty',
      cardDetailedText: 'Whether on distant battlefields or city streets, each generation has added its own measure of sacrifice to the ledger of freedom.',
    },
  ];

  // Light theme colors
  const lightTheme = {
    primary: '#dc2626',
    secondary: '#f3f4f6',
    cardBgColor: '#ffffff',
    titleColor: '#1f2937',
    titleColorActive: '#dc2626',
    cardTitleColor: '#111827',
    cardDetailsColor: '#374151',
    cardSubtitleColor: '#6b7280',
    toolbarBtnBgColor: '#ffffff',
    toolbarBtnFgColor: '#1f2937',
    toolbarTextColor: '#1f2937',
  };

  // Dark theme colors
  const darkTheme = {
    primary: '#ef4444',
    secondary: '#1e293b',
    cardBgColor: '#1e293b',
    titleColor: '#f1f5f9',
    titleColorActive: '#ef4444',
    cardTitleColor: '#f8fafc',
    cardDetailsColor: '#e2e8f0',
    cardSubtitleColor: '#94a3b8',
    toolbarBtnBgColor: '#334155',
    toolbarBtnFgColor: '#f1f5f9',
    toolbarTextColor: '#f1f5f9',
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="my-8 min-h-[600px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="my-8 timeline-wrapper hide-controls" data-theme={isDark ? 'dark' : 'light'}>
      <style jsx global>{`
        /* Hide control panel */
        .timeline-wrapper.hide-controls [class*="TimelineControl"],
        .timeline-wrapper.hide-controls nav,
        .timeline-wrapper.hide-controls [role="toolbar"] {
          display: none !important;
        }
        
        /* Control panel backdrop */
        html.dark .timeline-wrapper > div > div:first-child,
        html.dark .timeline-wrapper [class*="TimelineControl"],
        html.dark .timeline-wrapper [class*="TimelineMain"] > div:first-child,
        html.dark .timeline-wrapper nav,
        html.dark .timeline-wrapper [role="toolbar"] {
          background-color: #1e293b !important;
          border-color: #334155 !important;
        }
        
        /* Control panel buttons */
        html.dark .timeline-wrapper button {
          background-color: #334155 !important;
          color: #f1f5f9 !important;
          border-radius: 0.375rem !important;
        }
        
        html.dark .timeline-wrapper button:hover {
          background-color: #475569 !important;
        }
        
        /* Card content details */
        html.dark .timeline-wrapper [class*="TimelineContentDetails"],
        html.dark .timeline-wrapper div[class*="ContentDetails"],
        html.dark .timeline-wrapper div[aria-expanded] {
          background-color: #1e293b !important;
          color: #e2e8f0 !important;
          border-radius: 0.5rem !important;
        }
        
        /* Timeline cards */
        html.dark .timeline-wrapper [class*="TimelineCard"],
        html.dark .timeline-wrapper article {
          background-color: #1e293b !important;
          border-radius: 0.75rem !important;
        }
        
        /* Rounded corners for all cards in both modes */
        .timeline-wrapper [class*="TimelineCard"],
        .timeline-wrapper article {
          border-radius: 0.75rem !important;
        }
        
        .timeline-wrapper [class*="TimelineContentDetails"] {
          border-radius: 0.5rem !important;
        }
      `}</style>
      <Chrono 
        items={items}
        mode="VERTICAL_ALTERNATING"
        theme={isDark ? darkTheme : lightTheme}
        fontSizes={{
          cardSubtitle: '0.875rem',
          cardText: '0.875rem',
          cardTitle: '1.125rem',
          title: '0.875rem',
        }}
        cardHeight={180}
        slideShow={false}
        scrollable={{ scrollbar: false }}
        enableOutline
        disableClickOnCircle
        hideControls
      />
    </div>
  );
};

