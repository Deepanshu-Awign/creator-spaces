import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudioCard from "@/components/StudioCard";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Studio } from "@/types/studio";

// Studio interface moved to shared types file

interface HorizontalStudioScrollerProps {
  studios: Studio[];
  title: string;
}

const HorizontalStudioScroller = ({ studios, title }: HorizontalStudioScrollerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isMobile = useIsMobile();

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = isMobile ? 280 : 320; // Card width + gap
      const currentScroll = scrollRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
      
      setTimeout(checkScrollability, 300);
    }
  };

  if (studios.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-neutral-900">{title}</h2>
        
        {/* Desktop scroll controls */}
        {!isMobile && studios.length > 5 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-8 h-8 p-0 rounded-full border-neutral-300 hover:border-neutral-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-8 h-8 p-0 rounded-full border-neutral-300 hover:border-neutral-400"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div 
        ref={scrollRef}
        className={`flex gap-4 ${isMobile ? 'overflow-x-auto pb-4' : 'overflow-hidden'} scrollbar-hide`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onScroll={checkScrollability}
      >
        {studios.map((studio) => (
          <div 
            key={studio.id} 
            className={`flex-shrink-0 ${isMobile ? 'w-72' : 'w-80'}`}
          >
            <StudioCard studio={studio} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalStudioScroller;