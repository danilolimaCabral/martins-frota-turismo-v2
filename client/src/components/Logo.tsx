interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Bus body */}
        <rect
          x="8"
          y="16"
          width="32"
          height="20"
          rx="3"
          className="fill-primary"
        />
        {/* Windows */}
        <rect x="12" y="20" width="6" height="6" rx="1" fill="white" opacity="0.9" />
        <rect x="21" y="20" width="6" height="6" rx="1" fill="white" opacity="0.9" />
        <rect x="30" y="20" width="6" height="6" rx="1" fill="white" opacity="0.9" />
        {/* Wheels */}
        <circle cx="16" cy="38" r="3" className="fill-secondary" />
        <circle cx="32" cy="38" r="3" className="fill-secondary" />
        {/* Top accent */}
        <path
          d="M12 16C12 14.8954 12.8954 14 14 14H34C35.1046 14 36 14.8954 36 16V18H12V16Z"
          className="fill-secondary"
        />
        {/* Front detail */}
        <rect x="18" y="30" width="12" height="4" rx="1" fill="white" opacity="0.3" />
      </svg>
      
      {showText && (
        <div>
          <h1 className="text-2xl font-bold text-primary leading-none" style={{fontFamily: 'Poppins'}}>
            Martins
          </h1>
          <p className="text-xs text-muted-foreground leading-none mt-0.5">
            Viagens e Turismo
          </p>
        </div>
      )}
    </div>
  );
}
