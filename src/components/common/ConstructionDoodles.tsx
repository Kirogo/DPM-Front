import React from 'react';

export const ConstructionDoodles: React.FC = () => {
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
      <defs>
        <pattern id="construction-doodles" patternUnits="userSpaceOnUse" width="250" height="250" patternTransform="rotate(5)">
          
          {/* ✏️ Pencils (Architect's pencils) */}
          <g opacity="0.35">
            {/* Pencil 1 - Angled */}
            <path d="M40,30 L55,15 L60,20 L45,35 L40,30" fill="none" stroke="#5A7863" strokeWidth="1.5"/>
            <line x1="45" y1="35" x2="50" y2="40" stroke="#5A7863" strokeWidth="1.5"/>
            <circle cx="52" cy="42" r="2" fill="none" stroke="#5A7863" strokeWidth="1.5"/>
            
            {/* Pencil 2 - Straight */}
            <path d="M80,50 L95,50 L97,65 L82,65 L80,50" fill="none" stroke="#90AB8B" strokeWidth="1.5"/>
            <line x1="82" y1="65" x2="82" y2="70" stroke="#90AB8B" strokeWidth="1.5"/>
            <circle cx="82" cy="72" r="2" fill="none" stroke="#90AB8B" strokeWidth="1.5"/>
            
            {/* Pencil 3 - Horizontal */}
            <path d="M150,30 L165,32 L163,47 L148,45 L150,30" fill="none" stroke="#3B4953" strokeWidth="1.5"/>
            <line x1="148" y1="45" x2="143" y2="47" stroke="#3B4953" strokeWidth="1.5"/>
            <circle cx="141" cy="48" r="2" fill="none" stroke="#3B4953" strokeWidth="1.5"/>
          </g>

          {/* 📐 Rulers/T-squares */}
          <g opacity="0.3">
            {/* T-Square */}
            <line x1="180" y1="80" x2="220" y2="80" stroke="#5A7863" strokeWidth="2"/>
            <line x1="200" y1="70" x2="200" y2="90" stroke="#5A7863" strokeWidth="2"/>
            
            {/* Triangle Ruler */}
            <path d="M30,140 L60,140 L45,115 L30,140" fill="none" stroke="#90AB8B" strokeWidth="1.5"/>
            <line x1="45" y1="115" x2="45" y2="125" stroke="#90AB8B" strokeWidth="1" strokeDasharray="3 2"/>
            
            {/* Measuring Tape */}
            <circle cx="200" cy="150" r="10" fill="none" stroke="#3B4953" strokeWidth="1.5"/>
            <path d="M210,150 L225,145" stroke="#3B4953" strokeWidth="1.5"/>
          </g>

          {/* 📏 Ruler with measurements */}
          <g opacity="0.4">
            <line x1="100" y1="180" x2="160" y2="180" stroke="#5A7863" strokeWidth="2"/>
            <line x1="100" y1="175" x2="100" y2="185" stroke="#5A7863" strokeWidth="1"/>
            <line x1="120" y1="175" x2="120" y2="185" stroke="#5A7863" strokeWidth="1"/>
            <line x1="140" y1="175" x2="140" y2="185" stroke="#5A7863" strokeWidth="1"/>
            <line x1="160" y1="175" x2="160" y2="185" stroke="#5A7863" strokeWidth="1"/>
            <text x="105" y="195" fontSize="8" fill="#5A7863" opacity="0.5">0</text>
            <text x="155" y="195" fontSize="8" fill="#5A7863" opacity="5">10</text>
          </g>

          {/* 🏗️ Blueprint/Floor Plan Elements */}
          <g opacity="0.25">
            {/* Room Outline */}
            <rect x="30" y="30" width="50" height="40" fill="none" stroke="#3B4953" strokeWidth="1"/>
            <line x1="30" y1="40" x2="80" y2="40" stroke="#3B4953" strokeWidth="0.5" strokeDasharray="3 2"/>
            <line x1="30" y1="50" x2="80" y2="50" stroke="#3B4953" strokeWidth="0.5" strokeDasharray="3 2"/>
            <line x1="45" y1="30" x2="45" y2="70" stroke="#3B4953" strokeWidth="0.5" strokeDasharray="3 2"/>
            <line x1="60" y1="30" x2="60" y2="70" stroke="#3B4953" strokeWidth="0.5" strokeDasharray="3 2"/>
            
            {/* Door Symbol */}
            <path d="M70,50 L80,55 L70,60" fill="none" stroke="#3B4953" strokeWidth="1"/>
            
            {/* Window Symbol */}
            <rect x="120" y="40" width="20" height="15" fill="none" stroke="#90AB8B" strokeWidth="1"/>
            <line x1="130" y1="40" x2="130" y2="55" stroke="#90AB8B" strokeWidth="1"/>
          </g>

          {/* 📝 Blueprint Notes/Dimensions */}
          <g opacity="0.2">
            <line x1="170" y1="190" x2="190" y2="170" stroke="#5A7863" strokeWidth="0.8"/>
            <line x1="190" y1="170" x2="200" y2="180" stroke="#5A7863" strokeWidth="0.8"/>
            <text x="185" y="165" fontSize="6" fill="#5A7863">3.5m</text>
            
            <circle cx="55" cy="190" r="3" fill="none" stroke="#90AB8B" strokeWidth="0.8"/>
            <circle cx="55" cy="190" r="6" fill="none" stroke="#90AB8B" strokeWidth="0.8" strokeDasharray="2 1"/>
          </g>

          {/* 🔧 Construction Tools */}
          <g opacity="0.3">
            {/* Hammer */}
            <line x1="140" y1="110" x2="155" y2="95" stroke="#5A7863" strokeWidth="2"/>
            <rect x="156" y="88" width="8" height="8" transform="rotate(45 160 92)" fill="none" stroke="#5A7863" strokeWidth="1.5"/>
            
            {/* Wrench */}
            <path d="M190,110 L205,125" stroke="#90AB8B" strokeWidth="2"/>
            <circle cx="207" cy="127" r="4" fill="none" stroke="#90AB8B" strokeWidth="1.5"/>
            <path d="M188,108 L183,103" stroke="#90AB8B" strokeWidth="2"/>
            
            {/* Level */}
            <rect x="40" y="80" width="30" height="5" rx="2" fill="none" stroke="#3B4953" strokeWidth="1.5"/>
            <circle cx="55" cy="82.5" r="1.5" fill="#3B4953" opacity="0.4"/>
          </g>

          {/* 📊 Graph Paper/Grid Background (subtle) */}
          <path d="M10,10 L10,240 M30,10 L30,240 M50,10 L50,240 M70,10 L70,240 M90,10 L90,240 M110,10 L110,240 M130,10 L130,240 M150,10 L150,240 M170,10 L170,240 M190,10 L190,240 M210,10 L210,240 M230,10 L230,240" stroke="#EBF4DD" strokeWidth="0.8" opacity="0.15"/>
          <path d="M10,10 L240,10 M10,30 L240,30 M10,50 L240,50 M10,70 L240,70 M10,90 L240,90 M10,110 L240,110 M10,130 L240,130 M10,150 L240,150 M10,170 L240,170 M10,190 L240,190 M10,210 L240,210 M10,230 L240,230" stroke="#EBF4DD" strokeWidth="0.8" opacity="0.15"/>

          {/* 🏛️ Building Outline */}
          <g opacity="0.2">
            <polyline points="170,200 170,170 190,150 210,170 210,200" fill="none" stroke="#5A7863" strokeWidth="1.5"/>
            <line x1="180" y1="200" x2="180" y2="175" stroke="#5A7863" strokeWidth="1"/>
            <line x1="190" y1="200" x2="190" y2="165" stroke="#5A7863" strokeWidth="1"/>
            <line x1="200" y1="200" x2="200" y2="175" stroke="#5A7863" strokeWidth="1"/>
          </g>

          {/* 📐 Protractor */}
          <g opacity="0.25">
            <path d="M220,40 A20,20 0 0,1 240,60" fill="none" stroke="#90AB8B" strokeWidth="1.5"/>
            <line x1="230" y1="50" x2="235" y2="45" stroke="#90AB8B" strokeWidth="1"/>
            <text x="225" y="35" fontSize="6" fill="#90AB8B">45°</text>
          </g>

          {/* 🖊️ Ink Pen */}
          <g opacity="0.35">
            <path d="M70,150 L85,135 L88,138 L73,153 L70,150" fill="none" stroke="#3B4953" strokeWidth="1.5"/>
            <line x1="73" y1="153" x2="70" y2="156" stroke="#3B4953" strokeWidth="1.5"/>
          </g>
        </pattern>
        
        {/* Soft Gradient Overlay */}
        <linearGradient id="doodle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EBF4DD" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#90AB8B" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#construction-doodles)"/>
      <rect width="100%" height="100%" fill="url(#doodle-gradient)"/>
    </svg>
  );
};