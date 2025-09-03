import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageGalleryProps {
  images: string[];
  title: string;
  virtualTourUrl?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title, virtualTourUrl }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isVirtualTourPlaying, setIsVirtualTourPlaying] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsFullscreen(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? Math.min(zoom * 1.5, 5) : Math.max(zoom / 1.5, 0.5);
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 'out' : 'in';
    handleZoom(direction);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
    resetView();
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    resetView();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isFullscreen) return;
    
    switch (e.key) {
      case 'Escape':
        setIsFullscreen(false);
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case '+':
      case '=':
        handleZoom('in');
        break;
      case '-':
        handleZoom('out');
        break;
      case '0':
        resetView();
        break;
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, selectedImageIndex, zoom]);

  const currentImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div className="relative overflow-hidden rounded-lg bg-gray-100">
          <img
            ref={imageRef}
            src={currentImage}
            alt={`${title} - Image ${selectedImageIndex + 1}`}
            className="w-full h-96 object-cover cursor-zoom-in transition-transform duration-200 hover:scale-105"
            onClick={() => handleImageClick(selectedImageIndex)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleImageClick(selectedImageIndex)}
                className="bg-white/90 hover:bg-white"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnail Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              index === selectedImageIndex
                ? 'border-orange-500 scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={image}
              alt={`${title} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </button>
        ))}
      </div>

      {/* Virtual Tour Section */}
      {virtualTourUrl && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Virtual Tour</h3>
              <p className="text-sm text-blue-700">Explore the studio in 360°</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVirtualTourPlaying(!isVirtualTourPlaying)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              {isVirtualTourPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Tour
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Tour
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-none w-screen h-screen p-0 bg-black">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 text-white hover:bg-black/70"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 text-white hover:bg-black/70"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/50 rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoom('out')}
                className="text-white hover:bg-white/20"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetView}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleZoom('in')}
                className="text-white hover:bg-white/20"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Image */}
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
            >
              <img
                src={currentImage}
                alt={`${title} - Fullscreen ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageGallery; 