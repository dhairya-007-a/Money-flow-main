import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  imageUrl?: string;
  className?: string;
  size?: number;
}

const DEFAULT_IMAGE_MAP: Record<string, string> = {
  'here-i-paid': './dollars.png',
  'bills': './budget.png',
  'food': './food.png',
  'CreditCard': './dollars.png',
  'Zap': './budget.png',
  'Utensils': './food.png',
};

const resolveImagePath = (src?: string): string | null => {
  if (!src) return null;
  if (src.startsWith('/')) {
    return '.' + src;
  }
  return src;
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, imageUrl, className = "w-5 h-5", size }) => {
  const [hasError, setHasError] = useState(false);
  const rawSrc = imageUrl || DEFAULT_IMAGE_MAP[name];
  const imgSrc = !hasError ? resolveImagePath(rawSrc) : null;

  if (imgSrc) {
    return (
      <img 
        src={imgSrc} 
        alt={name} 
        onError={() => setHasError(true)}
        className={`${className} object-contain rounded-md drop-shadow-xs flex-shrink-0 inline-block`}
        style={size ? { width: size, height: size } : undefined}
      />
    );
  }

  // @ts-expect-error Dynamic Lucide icon lookup
  const IconComponent = Icons[name] || Icons.Sparkles;
  
  return <IconComponent className={className} size={size} />;
};
