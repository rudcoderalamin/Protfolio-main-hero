import React from 'react';

// Brand Monogram logo from screenshot (blue & cyan stylized i-figure)
export const BrandLogo: React.FC<{ className?: string }> = ({ className = "w-9 h-9" }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    id="brand-logo-svg"
  >
    {/* Dot / Head */}
    <circle cx="24" cy="10" r="6" fill="#0284c7" />
    {/* Arch / Body curve */}
    <path
      d="M17 21C20.866 21 24 24.134 24 28V42C24 43.1046 23.1046 44 22 44H19C17.8954 44 17 43.1046 17 42V21Z"
      fill="#0284c7"
    />
    <path
      d="M24 21C27.866 21 31 24.134 31 28V33C31 34.1046 30.1046 35 29 35H24V21Z"
      fill="#06b6d4"
    />
  </svg>
);

// Docker Icon (Top-Left floating badge)
export const DockerIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    id="docker-icon"
  >
    <path
      d="M60.6 28.5c-1.4-.9-4.3-.8-6.6.5-.7-3.9-3.7-6.9-3.7-6.9s-1.8 3.5-.8 7.3c-2.3 1.2-5.7 1.2-8.3-.3l-1.3-.8-.9 1.1c-4.4 5.3-10.8 8.4-17.6 8.5H18c-1.2 0-2.3-.3-3.4-.8l-1.3-.7-1.1 1c-5.4 4.8-5.7 12.8-1 18 4.4 4.8 11.2 7.7 20 7.7 22.8 0 30.9-14.7 30.9-25.2 0-3.7-1-6.8-2.5-9.3z"
      fill="#0284C7"
    />
    {/* Containers */}
    <rect x="18" y="27" width="5" height="5" rx="0.8" fill="#38BDF8" />
    <rect x="25" y="27" width="5" height="5" rx="0.8" fill="#38BDF8" />
    <rect x="32" y="27" width="5" height="5" rx="0.8" fill="#38BDF8" />
    <rect x="25" y="20" width="5" height="5" rx="0.8" fill="#38BDF8" />
    <rect x="32" y="20" width="5" height="5" rx="0.8" fill="#38BDF8" />
    <rect x="39" y="27" width="5" height="5" rx="0.8" fill="#38BDF8" />
    <rect x="32" y="13" width="5" height="5" rx="0.8" fill="#38BDF8" />
  </svg>
);

// Next.js Icon (Top-Right floating badge)
export const NextjsIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    id="nextjs-icon"
  >
    <circle cx="64" cy="64" r="64" fill="#000000" />
    <path
      d="M89.7 101.4L44.8 44H36V84H45.6V56.2L84.8 106.6C86.5 105 88.1 103.3 89.7 101.4Z"
      fill="white"
    />
    <rect x="82.4" y="44" width="9.6" height="40" fill="white" />
  </svg>
);

// PostgreSQL Icon (Bottom-Left floating badge)
export const PostgresIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    id="postgres-icon"
  >
    {/* Elephant head outline and shading in classic Postgres blue/steel */}
    <path
      d="M32 6C18 6 9 17 9 30c0 10 6 18 13 22l-1 6h7l1-5c1 .3 2 .5 3 .5 1 0 2-.2 3-.5l1 5h7l-1-6c7-4 13-12 13-22 0-13-9-24-23-24z"
      fill="#336791"
    />
    <path
      d="M32 10c-11 0-18 8-18 19 0 8 4 15 10 18l1-5c-2-2-4-5-4-9 0-6 4-11 11-11s11 5 11 11c0 4-2 7-4 9l1 5c6-3 10-10 10-18 0-11-7-19-18-19z"
      fill="#4F8BB8"
    />
    <circle cx="24" cy="24" r="2.5" fill="#FFFFFF" />
    <circle cx="40" cy="24" r="2.5" fill="#FFFFFF" />
    <path
      d="M28 36c2 2 6 2 8 0"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Elephant trunk */}
    <path
      d="M32 30v14c0 2-1 3-3 3s-3-1-3-3"
      stroke="#E2E8F0"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// TypeScript Icon (Bottom-Right floating badge)
export const TypeScriptIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    id="typescript-icon"
  >
    <rect width="64" height="64" rx="12" fill="#3178C6" />
    <path
      d="M14 26h18v6h-6v20h-6V32h-6v-6zM34 44.5c2 2.5 5 4 8.5 4 4.5 0 7-2 7-5 0-3-2-4.5-6.5-6.5-5.5-2.2-9-5-9-10.5 0-5.5 4.5-9.5 11-9.5 4 0 7 1.5 9 3.5l-3.5 5c-1.5-1.5-3.5-2.5-6-2.5-3 0-5 1.5-5 3.5 0 2 1.5 3 6 5 6 2.5 9.5 5 9.5 11 0 6-4.5 10.5-12.5 10.5-5 0-9-1.8-11.5-5l3.5-4z"
      fill="#FFFFFF"
    />
  </svg>
);

// Social Icons:
export const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} id="facebook-icon">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

export const LinkedInIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} id="linkedin-icon">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export const GitHubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} id="github-icon">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

// Codeforces / Contest Bar Chart icon
export const ContestChartIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} id="contest-chart-icon">
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="6" width="4" height="15" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>
);

export const CodeforcesIcon = ContestChartIcon;

// CodeChef / Competitive Programming icon
export const CodeChefIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} id="codechef-icon">
    <path d="M12 2a4 4 0 0 0-4 4c0 1.11.45 2.11 1.18 2.83A6.98 6.98 0 0 0 5 15v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a6.98 6.98 0 0 0-4.18-6.17A3.99 3.99 0 0 0 16 6a4 4 0 0 0-4-4zm-2 17v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h-4z" />
  </svg>
);

// LeetCode / Algorithmic Code Icon
export const LeetCodeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} id="leetcode-icon">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 5.844a1.375 1.375 0 0 0 1.945 1.945l5.406-5.406A1.374 1.374 0 0 0 13.483 0zm-5.7 6.75l-4.5 4.5a3.75 3.75 0 0 0 0 5.303l5.88 5.88a3.75 3.75 0 0 0 5.304 0l4.5-4.5a1.375 1.375 0 1 0-1.945-1.945l-4.5 4.5a1 1 0 0 1-1.414 0l-5.88-5.88a1 1 0 0 1 0-1.414l4.5-4.5a1.375 1.375 0 0 0-.945-2.444zM10.5 11.25a1.25 1.25 0 1 0 0 2.5h8a1.25 1.25 0 1 0 0-2.5h-8z" />
  </svg>
);

// WhatsApp Icon
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} id="whatsapp-icon">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.22-.19-.47-.32z" />
  </svg>
);
