'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface CommentaryRange {
  min: number;
  max: number;
  content: React.ReactNode;
}

interface PyramidCounterProps {
  maxBlocks?: number;
  commentaryRanges?: CommentaryRange[];
}

// Tier color configuration
const TIER_COLORS = [
  { max: 1000, fill: '#CD7F32', stroke: '#8B5A2B' },        // Bronze
  { max: 10000, fill: '#C0C0C0', stroke: '#808080' },       // Silver
  { max: 100000, fill: '#FFD700', stroke: '#DAA520' },      // Gold
  { max: 1000000, fill: '#E5E4E2', stroke: '#B9B8B5' },     // Platinum
];

export default function PyramidCounter({ 
  maxBlocks = 1000000, 
  commentaryRanges = [] 
}: PyramidCounterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/users/count`);
        if (!response.ok) throw new Error('Failed to fetch user count');
        const data = await response.json();
        setUserCount(data.count);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching user count:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  // Get tier color based on block index
  const getTierColor = (blockIndex: number): { fill: string; stroke: string } => {
    for (const tier of TIER_COLORS) {
      if (blockIndex < tier.max) {
        return { fill: tier.fill, stroke: tier.stroke };
      }
    }
    return TIER_COLORS[TIER_COLORS.length - 1];
  };

  // Calculate pyramid geometry
  const calculatePyramidGeometry = (totalBlocks: number) => {
    // For a pyramid, row n has (2n - 1) blocks
    // Total blocks up to row n: n^2
    // So for totalBlocks, we need sqrt(totalBlocks) rows
    const rows = Math.ceil(Math.sqrt(totalBlocks));
    return rows;
  };

  // Draw pyramid on canvas
  const drawPyramid = useCallback((canvas: HTMLCanvasElement, count: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas for HiDPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const rows = calculatePyramidGeometry(maxBlocks);
    const maxBlocksPerRow = 2 * rows - 1;
    
    // Fixed block size: 3x3 pixels
    const blockSize = 3;

    let blockIndex = 0;

    // Draw from top to bottom
    for (let row = 0; row < rows; row++) {
      const blocksInRow = 2 * row + 1; // 1, 3, 5, 7, ...
      const rowWidth = blocksInRow * blockSize;
      const xOffset = (rect.width - rowWidth) / 2;
      const y = row * blockSize;

      for (let col = 0; col < blocksInRow; col++) {
        if (blockIndex >= maxBlocks) break;

        const x = xOffset + col * blockSize;
        const { fill, stroke } = getTierColor(blockIndex);

        if (blockIndex < count) {
          // Filled block - fill entire 3x3 square
          ctx.fillStyle = fill;
          ctx.fillRect(x, y, blockSize, blockSize);
        } else {
          // Unfilled block - draw border only (hollow center)
          // Draw 8 outer pixels, leaving center pixel empty
          ctx.fillStyle = stroke;
          // Top row (3 pixels)
          ctx.fillRect(x, y, 3, 1);
          // Bottom row (3 pixels)
          ctx.fillRect(x, y + 2, 3, 1);
          // Left pixel (middle)
          ctx.fillRect(x, y + 1, 1, 1);
          // Right pixel (middle)
          ctx.fillRect(x + 2, y + 1, 1, 1);
        }

        blockIndex++;
      }

      if (blockIndex >= maxBlocks) break;
    }
  }, [maxBlocks]);

  // Render canvas when count changes
  useEffect(() => {
    if (userCount === null || !canvasRef.current) return;

    drawPyramid(canvasRef.current, userCount);

    // Redraw on window resize
    const handleResize = () => {
      if (canvasRef.current && userCount !== null) {
        drawPyramid(canvasRef.current, userCount);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userCount, maxBlocks, drawPyramid]);

  // Get active commentary based on current count
  const getActiveCommentary = () => {
    if (userCount === null) return null;
    
    for (const range of commentaryRanges) {
      if (userCount >= range.min && userCount <= range.max) {
        return range.content;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="pyramid-counter-loading flex items-center justify-center py-8">
        <p>Loading pyramid...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pyramid-counter-error text-red-500 py-8">
        <p>Error loading user count: {error}</p>
      </div>
    );
  }

  // Calculate canvas dimensions based on 3x3 pixel blocks
  const rows = Math.ceil(Math.sqrt(maxBlocks));
  const maxBlocksPerRow = 2 * rows - 1;
  const canvasWidth = maxBlocksPerRow * 3; // 3px per block
  const canvasHeight = rows * 3; // 3px per row

  return (
    <div className="pyramid-counter">
      <div className="pyramid-stats text-center mb-4">
        <p className="text-2xl font-bold">
          {userCount?.toLocaleString()} / {maxBlocks.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          voices standing with us
        </p>
      </div>

      <div className="pyramid-canvas-container overflow-auto max-h-[600px] border border-border rounded-lg p-4 bg-muted/10">
        <canvas
          ref={canvasRef}
          className="pyramid-canvas mx-auto"
          style={{ 
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            display: 'block',
            margin: '0 auto',
            imageRendering: 'pixelated'
          }}
        />
      </div>

      {getActiveCommentary() && (
        <div className="pyramid-commentary mt-6 text-center">
          {getActiveCommentary()}
        </div>
      )}
    </div>
  );
}

