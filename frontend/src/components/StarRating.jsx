import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  value = 0,
  onChange,
  readOnly = true,
  max = 10,
  size = 18,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const activeValue = hoverValue || value;

  return (
    <div className="star-rating-widget" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {Array.from({ length: max }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= activeValue;

        return (
          <span
            key={starNumber}
            className={!readOnly ? 'star-interactive' : ''}
            onClick={() => !readOnly && onChange && onChange(starNumber)}
            onMouseEnter={() => !readOnly && setHoverValue(starNumber)}
            onMouseLeave={() => !readOnly && setHoverValue(0)}
            role={!readOnly ? 'button' : undefined}
            tabIndex={!readOnly ? 0 : undefined}
            aria-label={!readOnly ? `Rate ${starNumber} out of ${max}` : undefined}
            style={{ display: 'inline-flex', padding: '2px' }}
          >
            <Star
              size={size}
              fill={isFilled ? '#f5c518' : 'none'}
              color={isFilled ? '#f5c518' : '#3d4052'}
              strokeWidth={2}
            />
          </span>
        );
      })}

      <span
        style={{
          marginLeft: '8px',
          fontWeight: 700,
          fontSize: `${size * 0.9}px`,
          color: activeValue > 0 ? '#f5c518' : 'var(--text-muted)',
        }}
      >
        {activeValue > 0 ? `${activeValue}/${max}` : 'Select rating'}
      </span>
    </div>
  );
};

export default StarRating;
