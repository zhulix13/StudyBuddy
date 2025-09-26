import React from "react";

interface GridBackgroundProps {
  className?: string;
  gridSize?: number;
  fadeIntensity?: number;
  children?: React.ReactNode;
}

const GridBackground: React.FC<GridBackgroundProps> = ({ 
  className = "", 
  gridSize = 40,
  fadeIntensity = 20,
  children 
}) => {
  const gridStyles = {
    backgroundSize: `${gridSize}px ${gridSize}px`,
    backgroundImage: [
      'linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)',
      'linear-gradient(to bottom, rgba(148, 163, 184, 0.3) 1px, transparent 1px)'
    ].join(', ')
  };

  const darkGridStyles = {
    backgroundSize: `${gridSize}px ${gridSize}px`,
    backgroundImage: [
      'linear-gradient(to right, rgba(71, 85, 105, 0.4) 1px, transparent 1px)',
      'linear-gradient(to bottom, rgba(71, 85, 105, 0.4) 1px, transparent 1px)'
    ].join(', ')
  };

  return (
    <div className={`relative ${className}`}>
      {/* Light mode grid */}
      <div
        className="absolute inset-0 dark:hidden"
        style={gridStyles}
      />
      
      {/* Dark mode grid */}  
      <div
        className="absolute inset-0 hidden dark:block"
        style={darkGridStyles}
      />
      
      {/* Radial fade overlay */}
      <div 
        className="pointer-events-none absolute inset-0 bg-white dark:bg-gray-900"
        style={{
          maskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`
        }}
      />
      
      {children}
    </div>
  );
};

export default GridBackground;