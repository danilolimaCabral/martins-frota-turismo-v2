import { motion } from "framer-motion";

export default function Logo3D({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.05, rotateY: 10 }}
      transition={{ duration: 0.3 }}
      style={{ perspective: 1000 }}
    >
      <svg
        viewBox="0 0 300 80"
        className="w-full h-full"
        style={{
          filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))"
        }}
      >
        {/* Texto MARTINS com efeito 3D */}
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2175D9" />
            <stop offset="100%" stopColor="#1E5FB8" />
          </linearGradient>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7730" />
            <stop offset="100%" stopColor="#FF5500" />
          </linearGradient>
          
          {/* Sombra 3D */}
          <filter id="shadow3d">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="4" dy="4" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* MARTINS */}
        <text
          x="10"
          y="45"
          fontFamily="Arial Black, sans-serif"
          fontSize="38"
          fontWeight="900"
          fill="url(#blueGradient)"
          filter="url(#shadow3d)"
        >
          MARTINS
        </text>

        {/* MV com destaque laranja */}
        <text
          x="200"
          y="45"
          fontFamily="Arial Black, sans-serif"
          fontSize="42"
          fontWeight="900"
          fill="url(#orangeGradient)"
          filter="url(#shadow3d)"
        >
          MV
        </text>

        {/* Viagens e Turismo */}
        <text
          x="15"
          y="65"
          fontFamily="Arial, sans-serif"
          fontSize="12"
          fontWeight="600"
          fill="#2175D9"
          letterSpacing="2"
        >
          VIAGENS E TURISMO
        </text>

        {/* Elemento decorativo laranja (onda) */}
        <motion.path
          d="M 190 20 Q 210 10, 230 20 T 270 20"
          stroke="url(#orangeGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        
        {/* Círculos decorativos */}
        <circle cx="275" cy="20" r="8" fill="url(#orangeGradient)" opacity="0.8">
          <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="265" cy="15" r="5" fill="url(#blueGradient)" opacity="0.6">
          <animate attributeName="r" values="5;8;5" dur="2.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </motion.div>
  );
}
