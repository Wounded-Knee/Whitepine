'use client';

import React from 'react';
import { Chrono } from 'react-chrono';
import './DirectDemocracyTimeline.css';

interface TimelineItem {
  state: string;
  event: string;
  type: string;
  date_range: string;
  summary: string;
  challenges_overcome: string;
}

interface DirectDemocracyTimelineProps {
  data: TimelineItem[];
  hideControls?: boolean;
}

export const DirectDemocracyTimeline: React.FC<DirectDemocracyTimelineProps> = ({ data, hideControls = false }) => {
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

  const items = data.map((item) => ({
    title: item.date_range,
    cardTitle: `${item.state} — ${item.event}`,
    cardSubtitle: item.type,
    cardDetailedText: (
      <span className="block space-y-3 text-sm">
        <span className="block">
          <strong className="font-semibold text-gray-900 dark:text-gray-100">Summary: </strong>
          <span className="text-gray-700 dark:text-gray-300">{item.summary}</span>
        </span>
        <span className="block mt-3">
          <strong className="font-semibold text-gray-900 dark:text-gray-100">Challenges Overcome: </strong>
          <span className="text-gray-700 dark:text-gray-300">{item.challenges_overcome}</span>
        </span>
      </span>
    )
  }));

  // Light theme colors
  const lightTheme = {
    primary: '#2563eb',
    secondary: '#f3f4f6',
    cardBgColor: '#ffffff',
    titleColor: '#1f2937',
    titleColorActive: '#2563eb',
    cardTitleColor: '#111827',
    cardDetailsColor: '#374151',
    cardSubtitleColor: '#6b7280',
    toolbarBtnBgColor: '#ffffff',
    toolbarBtnFgColor: '#1f2937',
    toolbarTextColor: '#1f2937',
  };

  // Dark theme colors
  const darkTheme = {
    primary: '#60a5fa',
    secondary: '#1e293b',
    cardBgColor: '#1e293b',
    titleColor: '#f1f5f9',
    titleColorActive: '#60a5fa',
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
    <div className={`my-8 timeline-wrapper ${hideControls ? 'hide-controls' : ''}`} data-theme={isDark ? 'dark' : 'light'}>
      <style jsx global>{`
        /* Hide control panel when hideControls is true */
        .timeline-wrapper.hide-controls [class*="TimelineControl"],
        .timeline-wrapper.hide-controls nav,
        .timeline-wrapper.hide-controls [role="toolbar"] {
          display: none !important;
        }
        
        /* Control panel backdrop - most important fix */
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
          cardTitle: '1rem',
          title: '0.875rem',
        }}
        cardHeight={200}
        slideShow={false}
        scrollable={{ scrollbar: false }}
        enableOutline
        disableClickOnCircle
      />
    </div>
  );
};

