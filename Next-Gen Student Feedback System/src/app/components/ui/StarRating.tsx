import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export const StarRating = ({ rating, onRate, readonly = false }: StarRatingProps) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRate?.(star)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"
          )}
          disabled={readonly}
        >
          <Star
            className={cn(
              "w-5 h-5",
              star <= rating ? "fill-[#7A6AD8] text-[#7A6AD8]" : "text-[#C8BFE7]"
            )}
          />
        </button>
      ))}
    </div>
  );
};
