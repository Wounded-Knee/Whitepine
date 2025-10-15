'use client';

import { useState } from 'react';

interface ButtonConfig {
  id: string;
  button: string;
  content?: React.ReactNode;
}

interface ConditionalOutputProps {
  buttons: ButtonConfig[];
}

export default function ConditionalOutput({ buttons }: ConditionalOutputProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // If a button was clicked, find and render its content
  if (selectedId) {
    const selectedButton = buttons.find(b => b.id === selectedId);
    if (selectedButton?.content) {
      return (
        <div className={`conditional-output-content conditional-output-${selectedId}`}>
          {selectedButton.content}
        </div>
      );
    }
  }

  // Render the initial button choices
  return (
    <div className="conditional-output-initial">
      <div className="action-buttons flex gap-4 mt-6">
        {buttons.map((buttonConfig) => (
          <button
            key={buttonConfig.id}
            onClick={() => setSelectedId(buttonConfig.id)}
            className="px-6 py-3 font-semibold rounded-lg border border-muted-foreground/20 hover:bg-muted transition"
          >
            {buttonConfig.button}
          </button>
        ))}
      </div>
    </div>
  );
}

