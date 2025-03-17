import { EmotionDetection } from '../types';

// Type of theme colors
export type EmotionTheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  text: string;
  muted: string;
};

// Mapping emotions to color palettes (dark theme focused)
const emotionColorMap: Record<string, EmotionTheme> = {
  // Default/neutral theme (dark blue with subtle green accents)
  'neutral': {
    primary: '#3b82f6',      // Bright blue
    secondary: '#0ea5e9',    // Sky blue
    accent: '#22d3ee',       // Cyan
    background: '#0f172a',   // Deep blue-black
    foreground: '#e2e8f0',   // Light slate
    card: 'rgba(15, 23, 42, 0.75)',   // Transparent deep blue
    cardForeground: '#f8fafc', // Almost white
    border: '#1e293b',       // Slate border
    text: '#f1f5f9',         // Light text
    muted: '#64748b',        // Muted text
  },
  
  // Calm emotion - cool blues and teals (relaxing)
  'calm': {
    primary: '#0ea5e9',      // Sky blue
    secondary: '#06b6d4',    // Cyan
    accent: '#0891b2',       // Dark cyan
    background: '#0c1221',   // Very dark blue
    foreground: '#e2e8f0',   // Light slate
    card: 'rgba(12, 18, 33, 0.75)',   // Transparent dark blue
    cardForeground: '#f8fafc', // Almost white
    border: '#1e293b',       // Slate border
    text: '#f1f5f9',         // Light text
    muted: '#64748b',        // Muted text
  },
  
  // Happy emotion - purples and violets (uplifting but not jarring)
  'happy': {
    primary: '#8b5cf6',      // Violet
    secondary: '#a855f7',    // Purple
    accent: '#d946ef',       // Fuchsia
    background: '#15162c',   // Dark purple-blue
    foreground: '#e9d5ff',   // Light purple
    card: 'rgba(21, 22, 44, 0.75)',   // Transparent dark purple
    cardForeground: '#f5f3ff', // Almost white with purple tint
    border: '#2e1065',       // Deep purple border
    text: '#f5f3ff',         // Light purple text
    muted: '#a78bfa',        // Muted purple
  },
  
  // Sad emotion - deep blues and subtle turquoise (comforting)
  'sad': {
    primary: '#38bdf8',      // Lighter blue
    secondary: '#0ea5e9',    // Sky blue
    accent: '#0284c7',       // Darker blue
    background: '#0f2942',   // Deep navy
    foreground: '#e0f2fe',   // Very light blue
    card: 'rgba(15, 41, 66, 0.75)',   // Transparent deep navy
    cardForeground: '#f0f9ff', // Almost white with blue tint
    border: '#0c4a6e',       // Dark blue border
    text: '#e0f2fe',         // Light blue text
    muted: '#7dd3fc',        // Muted light blue
  },
  
  // Angry emotion - deep purples and dark reds (calming for anger)
  'angry': {
    primary: '#c026d3',      // Fuchsia
    secondary: '#db2777',    // Pink
    accent: '#be123c',       // Rose
    background: '#27121d',   // Very dark magenta
    foreground: '#fce7f3',   // Light pink
    card: 'rgba(39, 18, 29, 0.75)',   // Transparent dark magenta
    cardForeground: '#fdf2f8', // Almost white with pink tint
    border: '#831843',       // Dark pink border
    text: '#fce7f3',         // Light pink text
    muted: '#f0abfc',        // Muted pink
  },
  
  // Surprised emotion - teals and cyans (refreshing)
  'surprised': {
    primary: '#06b6d4',      // Cyan
    secondary: '#0891b2',    // Darker cyan
    accent: '#0ea5e9',       // Sky blue
    background: '#042f2e',   // Very dark teal
    foreground: '#ccfbf1',   // Light teal
    card: 'rgba(4, 47, 46, 0.75)',    // Transparent dark teal
    cardForeground: '#f0fdfa', // Almost white with teal tint
    border: '#134e4a',       // Dark teal border
    text: '#ccfbf1',         // Light teal text
    muted: '#5eead4',        // Muted teal
  },
  
  // Fearful emotion - dark purples with hints of blue (secure feeling)
  'fearful': {
    primary: '#7c3aed',      // Violet
    secondary: '#6d28d9',    // Purple
    accent: '#4f46e5',       // Indigo
    background: '#1e1b4b',   // Deep indigo
    foreground: '#ede9fe',   // Light purple
    card: 'rgba(30, 27, 75, 0.75)',   // Transparent deep indigo
    cardForeground: '#f5f3ff', // Almost white with purple tint
    border: '#4338ca',       // Indigo border
    text: '#ede9fe',         // Light purple text
    muted: '#a5b4fc',        // Muted indigo
  },
  
  // Disgusted emotion - deep emerald greens (refreshing)
  'disgusted': {
    primary: '#059669',      // Emerald
    secondary: '#10b981',    // Green
    accent: '#14b8a6',       // Teal
    background: '#022c22',   // Very dark green
    foreground: '#d1fae5',   // Light green
    card: 'rgba(2, 44, 34, 0.75)',    // Transparent dark green
    cardForeground: '#ecfdf5', // Almost white with green tint
    border: '#065f46',       // Dark green border
    text: '#d1fae5',         // Light green text
    muted: '#6ee7b7',        // Muted green
  },
};

// Default theme
const defaultTheme = emotionColorMap.neutral;

/**
 * Gets a theme based on emotion
 */
export function getEmotionTheme(emotion?: string): EmotionTheme {
  if (!emotion) return defaultTheme;
  
  // Convert to lowercase and try to find an exact match
  const normalizedEmotion = emotion.toLowerCase();
  
  // Check for direct match
  if (emotionColorMap[normalizedEmotion]) {
    return emotionColorMap[normalizedEmotion];
  }
  
  // Check for partial matches
  for (const key of Object.keys(emotionColorMap)) {
    if (normalizedEmotion.includes(key) || key.includes(normalizedEmotion)) {
      return emotionColorMap[key];
    }
  }
  
  // Map similar emotions
  if (normalizedEmotion.includes('joy') || normalizedEmotion.includes('happ')) {
    return emotionColorMap.happy;
  } else if (normalizedEmotion.includes('sad') || normalizedEmotion.includes('depress') || normalizedEmotion.includes('sorrow')) {
    return emotionColorMap.sad;
  } else if (normalizedEmotion.includes('ang') || normalizedEmotion.includes('mad') || normalizedEmotion.includes('frust')) {
    return emotionColorMap.angry;
  } else if (normalizedEmotion.includes('fear') || normalizedEmotion.includes('nerv') || normalizedEmotion.includes('anx')) {
    return emotionColorMap.fearful;
  } else if (normalizedEmotion.includes('disgust') || normalizedEmotion.includes('dislike')) {
    return emotionColorMap.disgusted;
  } else if (normalizedEmotion.includes('surp') || normalizedEmotion.includes('amaz')) {
    return emotionColorMap.surprised;
  } else if (normalizedEmotion.includes('calm') || normalizedEmotion.includes('peace') || normalizedEmotion.includes('relax')) {
    return emotionColorMap.calm;
  }
  
  // Default to neutral
  return defaultTheme;
}

/**
 * Applies the emotion theme to the document
 */
export function applyEmotionTheme(emotion?: string): void {
  const theme = getEmotionTheme(emotion);
  
  // Apply the CSS variables to the document
  const root = document.documentElement;
  
  // Apply theme colors
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-foreground', '#ffffff');
  
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--secondary-foreground', '#ffffff');
  
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-foreground', '#ffffff');
  
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--foreground', theme.foreground);
  
  root.style.setProperty('--card', theme.card);
  root.style.setProperty('--card-foreground', theme.cardForeground);
  
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--input', theme.border);
  
  root.style.setProperty('--muted', 'rgba(255, 255, 255, 0.1)');
  root.style.setProperty('--muted-foreground', theme.muted);
  
  root.style.setProperty('--popover', theme.card);
  root.style.setProperty('--popover-foreground', theme.cardForeground);

  // Set custom properties for glassmorphism
  root.style.setProperty('--glass-background', `rgba(${hexToRgb(theme.background)}, 0.7)`);
  root.style.setProperty('--glass-border', `rgba(${hexToRgb(theme.border)}, 0.5)`);
  root.style.setProperty('--glass-shadow', `0 8px 32px rgba(0, 0, 0, 0.1)`);
  root.style.setProperty('--glass-highlight', `linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))`);
}

/**
 * Helper function to convert hex to rgb
 */
function hexToRgb(hex: string): string {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Gets a glass card style for consistent glassmorphism
 */
export function getGlassStyle(opacity: number = 0.7): React.CSSProperties {
  return {
    background: `rgba(var(--glass-background), ${opacity})`,
    backdropFilter: 'blur(12px) saturate(180%)',
    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow)',
    borderRadius: 'var(--radius)',
    position: 'relative',
    overflow: 'hidden',
  } as React.CSSProperties;
}

// Animation keyframes for the glass highlight
export const glassHighlightKeyframes = `
  @keyframes glassHighlight {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    20% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }
`;

// CSS for the glass highlight
export const glassHighlightStyle = `
  .glass-highlight::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: var(--glass-highlight);
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
    animation: glassHighlight 6s ease-in-out infinite;
    pointer-events: none;
  }
`;

/**
 * Function to update the app theme based on emotion analysis
 */
export function updateThemeFromEmotionAnalysis(analysis: { primaryEmotion: EmotionDetection }): void {
  if (analysis?.primaryEmotion?.name) {
    applyEmotionTheme(analysis.primaryEmotion.name);
  } else {
    applyEmotionTheme('neutral');
  }
}