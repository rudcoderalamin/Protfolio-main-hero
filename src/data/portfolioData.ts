export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  metrics?: string;
  github?: string;
  live?: string;
  imageUrl?: string;
  category?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: 'web' | 'fullstack' | 'uiux' | 'graphics' | 'android';
  tags: string[];
}

export interface AboutConfig {
  greeting: string;
  bioSummary: string;
  educationalBackground: string;
  workPhilosophy: string;
  highlights: string[];
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  badge?: string;
}

export interface SkillCategory {
  category: string;
  skills: { name: string; level: string }[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  type: string;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  details: string;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  caption: string;
  tag: string;
}

export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
  openNewTab?: boolean;
}

export interface PhotoRotationConfig {
  showBadge: boolean; // Hide or Show the badge underneath photo
  autoRotate: boolean; // Enable or disable auto-rotation
  intervalSeconds: number; // Duration in seconds (default 5s)
  badgePrefix: string; // e.g. "Photo" or "ছবি"
  badgeAutoRotateText: string; // e.g. "Auto-rotates 5s" or custom text
  badgeTooltip?: string;
}

export interface ThemeConfig {
  preset: string; // 'blueprint' | 'dots' | 'dots-dark' | 'isometric' | 'hexagon' | 'circuit' | 'crosshairs' | 'cyber' | 'aurora' | 'terminal' | 'sunset' | 'minimal' | 'obsidian' | 'spotlight' | 'custom'
  backgroundColor: string;
  patternType: string;
  gridColor: string;
  gridSize: number;
  patternOpacity: number;
  textColorMode: 'dark' | 'light' | 'auto';
  accentColor: string;
  backgroundImageUrl?: string;
  backgroundOverlayOpacity?: number;
  rgbBorderBlink?: boolean; // Controls device-responsive outermost edge RGB blinking & traveling lines
  rgbProfileRing?: boolean; // Controls neon RGB color ring around the profile photo
  cursorRgbLight?: boolean; // Controls cursor-following RGB ambient glow / laser light
  interactiveEffect?: 'none' | 'cursor_rgb' | 'water_ripples' | 'neon_particles' | 'cosmic_aurora'; // Interactive background theme
}

export const DEFAULT_PROFILE_PHOTOS: ProfilePhoto[] = [
  {
    id: "official-portrait",
    url: "/Profile-Photo.png",
    caption: "Al Amin Islam — Official Profile Portrait",
    tag: "Official"
  },
  {
    id: "saree-traditional",
    url: "/photo-saree.jpg",
    caption: "Aesthetic Rooftop Portrait",
    tag: "Aesthetic"
  }
];

export const PORTFOLIO_DATA = {
  // Brand & Identity
  name: "Al Amin Islam",
  nickname: "Al Amin",
  brandInitials: "root",
  logoSubtitle: "Fullstack Developer",
  logoBadgeText: "root",
  logoImageUrl: "",
  faviconUrl: "/Profile-Photo.png",
  faviconOriginalUrl: "/Profile-Photo.png",
  faviconCircle: true,
  browserTitle: "Al Amin Islam | Fullstack Web Developer",
  greetingPrefix: "Hi, I'm",
  greetingEmoji: "👋",
  title: "Fullstack Web Developer",
  titles: [
    "Fullstack Web Developer",
    "Competitive Programmer",
    "Next.js & React Specialist",
    "Problem Solver",
    "MERN & TypeScript Engineer"
  ],
  bio: "Fullstack Web Developer specializing in React, Next.js, and Node.js. A dedicated competitive programmer (CodeChef 2⭐, 620+ problems) blending advanced problem-solving with modern design to build scalable, high-performance applications.",
  experienceYears: "1+ Year Exp.",

  // Contact & Socials
  email: "alaminislam.dev@gmail.com",
  phone: "+880 1700-000000",
  whatsappNumber: "8801700000000",
  location: "Dhaka, Bangladesh",
  socials: {
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
    github: "https://github.com/alaminislam",
    codeforces: "https://codeforces.com",
    codechef: "https://codechef.com",
    leetcode: "https://leetcode.com",
    twitter: "",
    youtube: ""
  },

  // Hero Quick Action Buttons & Text
  heroButtons: {
    resumeText: "Resume",
    contactText: "Contact Me",
    bookCallText: "Book a Call",
    reloadTooltip: "Auto-rotates every 5s • Click to cycle"
  },

  // Profile Photo Auto-Rotation Details & Badge Settings (User Controllable)
  autoRotateSeconds: 5,
  photoRotation: {
    showBadge: true,
    autoRotate: true,
    intervalSeconds: 5,
    badgePrefix: "Photo",
    badgeAutoRotateText: "Auto-rotates 5s",
    badgeTooltip: "Click to cycle next photo manually. Automatically changes every 5 seconds & on web reload."
  } as PhotoRotationConfig,

  // Hero Quick Stats Pills
  heroStats: {
    stat1Value: "620+",
    stat1Label: "Problems Solved",
    stat2Value: "15+",
    stat2Label: "Fullstack Projects",
    stat3Value: "2nd Position",
    stat3Label: "DUET IUPC"
  },

  // Navbar Labels & Brand Details
  navbar: {
    brandText: "Al Amin Islam",
    brandSubtitle: "Fullstack Developer",
    brandSubtitleUrl: "",
    logoBadgeText: "root",
    logoImageUrl: "",
    showStatusDot: true,
    statusDotText: "Active & Available",
    navHome: "Home",
    navAbout: "About Me",
    navSkills: "Skills",
    navServices: "Services",
    navProjects: "Projects",
    navExperience: "Experience",
    navEducation: "Education",
    navAchievements: "Achievements",
    navContact: "Contact",
    bookCallBtnText: "Book a Call"
  },

  // About Me Section Configuration
  about: {
    greeting: "Hi, I'm Al Amin Islam",
    bioSummary: "A passionate Fullstack Web Developer and dedicated Competitive Programmer based in Dhaka, Bangladesh. I bridge elegant frontend craftsmanship with performant, secure backend architectures, transforming complex ideas into intuitive digital experiences.",
    educationalBackground: "Diploma in Computer Science & Technology from Tangail Polytechnic Institute (2021-2025). Rooted in strong algorithmic foundations, data structures, and modern software engineering paradigms.",
    workPhilosophy: "I believe in clean, modular code, agile iterations, and performance-first architecture. My approach is centered around empathetic user experience, test-driven reliability, proactive communication, and rapid turnaround without sacrificing scalability.",
    highlights: [
      "End-to-End Product Architecture (React/Next.js & Node.js)",
      "Problem-Solving Mindset (620+ Algorithmic Challenges Solved)",
      "Agile & Collaborative Work Style with Clean Code Discipline",
      "Pixel-Perfect UI/UX Implementation with Modern Design Systems"
    ]
  } as AboutConfig,

  // Services Offered Section Configuration
  services: [
    {
      id: "srv-fullstack",
      title: "Full Stack Web Development",
      description: "Complete modern web applications built from scratch with Next.js, React, Node.js, Express, and PostgreSQL/MongoDB. Scalable REST APIs, secure auth, and real-time data sync.",
      icon: "fullstack",
      tags: ["Next.js", "React", "Node.js", "Express", "PostgreSQL", "MongoDB"]
    },
    {
      id: "srv-web",
      title: "Web Development",
      description: "High-performance, responsive, and SEO-optimized frontend websites crafted with modern Tailwind CSS, smooth animations, and clean modular component architecture.",
      icon: "web",
      tags: ["React.js", "TypeScript", "Tailwind CSS", "Vite", "Performance"]
    },
    {
      id: "srv-uiux",
      title: "UI/UX Design",
      description: "User-centered interface design, wireframing, component design systems, and high-fidelity interactive prototypes in Figma for web and mobile platforms.",
      icon: "uiux",
      tags: ["Figma", "Design Systems", "Wireframing", "User Journeys", "Prototypes"]
    },
    {
      id: "srv-graphics",
      title: "Graphic Design",
      description: "Visual branding, logos, vector icons, marketing banners, and high-resolution digital assets with impeccable typography, contrast, and modern aesthetics.",
      icon: "graphics",
      tags: ["Vector Art", "Brand Identity", "Illustrations", "Banners", "Typography"]
    },
    {
      id: "srv-android",
      title: "Android App Development",
      description: "Feature-packed, responsive Android mobile applications engineered with intuitive touch interactions, offline caching, push notifications, and seamless API integration.",
      icon: "android",
      tags: ["Android", "React Native", "Mobile UI", "APIs", "Offline Cache"]
    }
  ] as ServiceItem[],

  // Dynamic Background & Visual Theme Configuration
  theme: {
    preset: "blueprint", // 'blueprint' | 'dots' | 'cyber' | 'aurora' | 'minimal' | 'obsidian' | 'spotlight' | 'sunset' | 'custom'
    backgroundColor: "#ffffff",
    patternType: "blueprint",
    gridColor: "#38bdf8",
    gridSize: 34,
    patternOpacity: 25,
    textColorMode: "dark", // 'dark' = dark text on light bg, 'light' = white/bright text on dark bg
    accentColor: "#0284c7",
    rgbBorderBlink: true,
    rgbProfileRing: false,
    cursorRgbLight: false,
    interactiveEffect: "water_ripples"
  } as ThemeConfig,

  // Footer Texts, Executable Code & Custom Links
  footer: {
    copyrightText: "© {year} Al Amin Islam. Built with Next.js & Tailwind CSS.",
    copyrightUrl: "",
    statusBadge: "Available for Hire",
    statusBadgeUrl: "",
    poweredByText: "Powered by Al Amin",
    poweredByUrl: "https://github.com/alaminislam3504",
    customHtml: "", // Allows writing custom HTML or links to execute in footer
    links: [
      {
        id: "link-fb",
        label: "Facebook",
        url: "https://facebook.com",
        openNewTab: true
      },
      {
        id: "link-dev",
        label: "Developed by Al Amin Islam",
        url: "https://facebook.com",
        openNewTab: true
      }
    ] as FooterLinkItem[]
  },

  // Detailed Modal Section Headers & Subtitles
  sectionTitles: {
    experience: "Work Experience & History",
    skills: "Technical Skills & Competencies",
    projects: "Featured Software Projects",
    achievements: "Competitive Programming & Awards",
    education: "Education & Qualifications",
    contact: "Get In Touch",
    home: "Al Amin Islam"
  },
  sectionSubtitles: {
    experience: "Professional background & technical deliverables",
    skills: "Languages, frameworks, databases & developer tooling",
    projects: "High-performance web applications built from scratch",
    achievements: "Contest honors, ratings, and problem-solving track record",
    education: "Formal coursework and foundational computer science",
    contact: "Let’s discuss your next project, technical opportunity, or collaboration.",
    home: "Fullstack Software Engineer & Competitive Programmer"
  },

  // Contact Modal Texts (Every word/label customizable)
  contactModal: {
    title: "Get in Touch",
    subtitle: "Let's discuss your next project or opportunity",
    badge: "Direct Reach",
    directEmailLabel: "Direct Email",
    directPhoneLabel: "Phone / WhatsApp",
    directLocationLabel: "Location",
    directInfoNote: "I typically reply within 2-4 hours.",
    nameLabel: "Your Full Name",
    namePlaceholder: "e.g. John Doe",
    emailLabel: "Email Address",
    emailPlaceholder: "john@example.com",
    phoneLabel: "Phone / WhatsApp (Optional)",
    phonePlaceholder: "+880 1700-000000",
    subjectLabel: "Subject / Topic",
    subjectPlaceholder: "e.g. New Web Project / Consultation",
    messageLabel: "Your Message",
    messagePlaceholder: "Describe your project or questions in detail...",
    submitBtnText: "Send Message",
    sendBtnText: "Send Message",
    submittingText: "Sending Message...",
    sendingBtnText: "Sending...",
    successTitle: "Message Sent Successfully!",
    successSubtitle: "Your message has been dispatched. I'll get back to you shortly.",
    successDescription: "Thank you for reaching out! Your inquiry has been sent to Al Amin Islam. You will receive a response shortly.",
    successCloseBtn: "Close Window",
    copyEmailTooltip: "Click to copy email"
  },

  // Book Call / Discussion Modal Texts
  bookCallModal: {
    title: "Schedule a 1-on-1 Call",
    subtitle: "Pick a convenient time for our technical or project discussion",
    serviceBadge: "Free 30-min Consultation",
    durationBadge: "30 Mins • Google Meet / Zoom",
    step1Title: "Select Topic & Time",
    step2Title: "Contact Details",
    nameLabel: "Your Full Name",
    namePlaceholder: "e.g. John Doe",
    emailLabel: "Email Address",
    emailPlaceholder: "john@example.com",
    phoneLabel: "Phone / WhatsApp (Optional)",
    phonePlaceholder: "+880 1700-000000",
    topicLabel: "Topic / Discussion Purpose",
    topicDefault: "Fullstack Project Consultation",
    projectLabel: "Project Scope & Details",
    messageLabel: "Your Message / Project Scope",
    messagePlaceholder: "Share details about your idea, timeline, or requirements...",
    confirmBtnText: "Confirm Booking",
    backBtnText: "Back",
    submitBtnText: "Submit Inquiry",
    submittingText: "Submitting...",
    successTitle: "Call Confirmed!",
    successSubtitle: "A calendar invitation with the meeting link has been prepared.",
    successDescription: "Thank you for contacting me. I will review your requirements and reach out via email or phone within 24 hours.",
    successCloseBtn: "Done"
  },

  // Resume Modal Texts
  resumeModal: {
    title: "Professional Resume & CV",
    subtitle: "Summary of background, contest achievements, and skills",
    downloadBtnText: "Download Text CV",
    openNewTabBtnText: "Open in New Tab",
    printBtnText: "Print / PDF",
    copyBtnText: "Copy Summary",
    copiedText: "Copied to Clipboard!",
    copiedBtnText: "Copied",
    copySummaryTooltip: "Copy Resume summary",
    summaryTitle: "Quick Overview",
    summaryText: "Highlights 620+ solved algorithms and fullstack projects.",
    summaryHeading: "Professional Summary",
    competitiveHeading: "Competitive Programming Highlights",
    achievementsHeader: "Competitive Programming & Honors",
    skillsHeading: "Core Technical Competencies",
    skillsHeader: "Technical Skills",
    projectsHeading: "Key Featured Projects",
    projectsHeader: "Featured Fullstack Projects",
    educationHeading: "Academic Qualifications",
    educationHeader: "Education"
  },

  // WhatsApp Floating Widget Texts
  whatsappWidget: {
    headerName: "Al Amin Islam",
    statusText: "Online • Typically replies fast",
    greetingMessage: "Hi there! 👋 How can I help you today? Feel free to send a message directly to my WhatsApp.",
    greetingText: "Hi there! 👋 How can I help you today? Feel free to send a message directly to my WhatsApp.",
    timeLabel: "Just now",
    timeText: "Just now",
    inputPlaceholder: "Type a message...",
    placeholder: "Type your message here...",
    sendBtnText: "Chat on WhatsApp",
    buttonText: "Start WhatsApp Chat",
    defaultMessage: "Hello Al Amin! I saw your portfolio and would like to talk."
  },

  // Stats Breakdown
  stats: [
    { label: "Algorithmic Problems Solved", value: "620+" },
    { label: "CodeChef Rating", value: "1406 (2⭐)" },
    { label: "Years of Experience", value: "1+ Year" },
    { label: "Fullstack Projects Delivered", value: "15+" }
  ],

  // Experience (Focused on Institutional Accomplishments without company or year names)
  experiences: [
    {
      id: "exp-1",
      role: "Full-Stack Web Systems & High-Impact Deliverables",
      company: "",
      period: "",
      type: "Institutional Milestones",
      highlights: [
        "Architected scalable telemedicine platform delivering sub-second API response times and encrypted health record persistence.",
        "Engineered concurrent event ticketing engine with automated calendar synchronization and zero double-booking concurrency bugs.",
        "Optimized client-side rendering pipelines achieving 98+ Google Lighthouse performance scores across Core Web Vitals.",
        "Created production-grade REST APIs with secure JWT authentication, rate limiting, and relational schema validation."
      ]
    },
    {
      id: "exp-2",
      role: "Campus Software Solutions & Academic Initiatives",
      company: "",
      period: "",
      type: "Campus Contributions",
      highlights: [
        "Spearheaded polytechnic campus student automation tools simplifying internal project submissions, contest archives, and notices.",
        "Conducted hands-on technical workshops and bootcamps on React, TypeScript, and modern Git collaborative workflows.",
        "Mentored junior engineering teams in algorithmic problem-solving for regional inter-polytechnic competitions."
      ]
    },
    {
      id: "exp-3",
      role: "Algorithmic Problem Solving & Competitive Programming",
      company: "",
      period: "",
      type: "Algorithmic Accomplishments",
      highlights: [
        "Solved 620+ algorithmic challenges across CodeChef (2-Star, 1406 rating), Codeforces, and LeetCode.",
        "Represented institute in national collegiate programming contests (DUET IUPC, ICPC Asia Dhaka Regional).",
        "Formulated optimal computational solutions utilizing advanced Graph Theory, Dynamic Programming, and Greedy strategies."
      ]
    }
  ],

  // Skills
  skills: [
    {
      category: "Frontend",
      skills: [
        { name: "React.js", level: "Advanced" },
        { name: "Next.js", level: "Advanced" },
        { name: "TypeScript", level: "Advanced" },
        { name: "Tailwind CSS", level: "Expert" },
        { name: "Redux Toolkit", level: "Intermediate" },
        { name: "HTML5 / CSS3", level: "Expert" }
      ]
    },
    {
      category: "Backend & Database",
      skills: [
        { name: "Node.js", level: "Advanced" },
        { name: "Express.js", level: "Advanced" },
        { name: "PostgreSQL", level: "Advanced" },
        { name: "MongoDB", level: "Advanced" },
        { name: "Prisma ORM", level: "Intermediate" },
        { name: "RESTful APIs", level: "Expert" }
      ]
    },
    {
      category: "Programming Languages & CS",
      skills: [
        { name: "C++", level: "Expert" },
        { name: "JavaScript (ES6+)", level: "Expert" },
        { name: "TypeScript", level: "Advanced" },
        { name: "Data Structures", level: "Expert" },
        { name: "Algorithms", level: "Expert" },
        { name: "SQL", level: "Advanced" }
      ]
    },
    {
      category: "Tools, Design & Mobile",
      skills: [
        { name: "Git / GitHub", level: "Advanced" },
        { name: "Figma (UI/UX)", level: "Advanced" },
        { name: "Android App Dev", level: "Intermediate" },
        { name: "Postman", level: "Advanced" },
        { name: "Docker", level: "Intermediate" },
        { name: "Vercel / Cloud", level: "Advanced" }
      ]
    }
  ],

  // Projects
  projects: [
    {
      id: "proj-1",
      title: "Life Care Plus — Telemedicine Platform",
      description: "A comprehensive telemedicine and healthcare management ecosystem with real-time appointment booking, doctor directory, electronic prescriptions, and live tele-consultation.",
      tech: ["Next.js", "Express.js", "Prisma", "PostgreSQL", "Tailwind CSS"],
      metrics: "Reduced patient waiting times by ~30% and simplified appointment workflows.",
      github: "https://github.com/alaminislam",
      live: "https://alamin-islam-portfolio.vercel.app",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
      category: "fullstack"
    },
    {
      id: "proj-2",
      title: "EventSphere — Smart Ticket & Event Booking",
      description: "Smart event management and booking system with multi-tier ticket reservations, interactive schedule planner, automated calendar sync, and organizer dashboard.",
      tech: ["Next.js", "Node.js", "MongoDB", "Tailwind CSS", "JWT"],
      metrics: "Seamless checkout flow supporting concurrent ticketing without duplicate seat claims.",
      github: "https://github.com/alaminislam",
      live: "https://alamin-islam-portfolio.vercel.app",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
      category: "web"
    },
    {
      id: "proj-3",
      title: "TouristBook — Tourism & Hotel Booking",
      description: "Tourism discovery and spot reservation platform featuring curated Bangladeshi tour packages, review mechanisms, and secure traveler reservations.",
      tech: ["React.js", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
      metrics: "Interactive destination guides with multi-factor authentication.",
      github: "https://github.com/alaminislam",
      live: "https://alamin-islam-portfolio.vercel.app",
      imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80",
      category: "web"
    },
    {
      id: "proj-4",
      title: "HealthTrack Mobile — Android Fitness Companion",
      description: "Android lifestyle and activity tracker app featuring workout routines, daily calorie calculation, biometric stats charts, and instant push notification reminders.",
      tech: ["Android", "React Native", "TypeScript", "Tailwind", "REST APIs"],
      metrics: "Smooth 60 FPS mobile transitions and offline-first data caching.",
      github: "https://github.com/alaminislam",
      live: "https://alamin-islam-portfolio.vercel.app",
      imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&auto=format&fit=crop&q=80",
      category: "android"
    },
    {
      id: "proj-5",
      title: "Job-Cast — Real-time Dev Job Alert Bot",
      description: "Automated WhatsApp and Telegram notification bot dispatching real-time tech job openings filtered by developer stack and experience level.",
      tech: ["Node.js", "Twilio API", "Cron Scheduling", "Express"],
      metrics: "Delivers daily curated job feeds to active software engineers.",
      github: "https://github.com/alaminislam",
      live: "https://alamin-islam-portfolio.vercel.app",
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
      category: "fullstack"
    }
  ],

  // Achievements (Awards received from several educational institutions)
  achievements: [
    {
      id: "ach-1",
      title: "2nd Position - National IUPC 2025",
      organization: "Dhaka University of Engineering & Technology (DUET)",
      year: "2025",
      description: "Secured 2nd position among polytechnic competitive programming teams nationwide in a rigorous 5-hour on-site programming contest solving algorithmic problems in C++.",
      badge: "National Silver"
    },
    {
      id: "ach-2",
      title: "ICPC Asia Dhaka Regional Contestant",
      organization: "International Collegiate Programming Contest / Leading University",
      year: "2024",
      description: "Successfully qualified for and participated in the world's most prestigious collegiate programming contest solving complex algorithmic challenges under strict time and memory constraints.",
      badge: "Regional Finalist"
    },
    {
      id: "ach-3",
      title: "Champion - National Skills & Web Prototyping Competition",
      organization: "Tangail Polytechnic Institute & Technical Education Board",
      year: "2024",
      description: "Awarded 1st place gold trophy for building and demonstrating a full-stack, responsive web application during a rapid 6-hour hackathon.",
      badge: "1st Place Gold"
    },
    {
      id: "ach-4",
      title: "Inter-Polytechnic Programming Olympiad — Top Solver",
      organization: "Regional Polytechnic IT Association",
      year: "2023",
      description: "Honored with the Top Problem Solver recognition for solving the highest number of contest problems in competitive data structures and algorithms.",
      badge: "Top Problem Solver"
    },
    {
      id: "ach-5",
      title: "Academic & Technical Excellence Award",
      organization: "Institute Academic Council & Directorate of Technical Education",
      year: "2024",
      description: "Recognized with an Academic Excellence citation for software project innovation, outstanding semester GPA, and peer mentorship in web technology.",
      badge: "Academic Excellence"
    }
  ],

  // Education (4-5 editable sections for admin)
  education: [
    {
      id: "edu-1",
      degree: "Diploma in Computer Science & Technology",
      institution: "Tangail Polytechnic Institute (TPI)",
      period: "2021 - 2025",
      details: "Comprehensive academic training in Algorithms, Data Structures, Database Systems (DBMS), Software Engineering, Computer Networks, and Object-Oriented Programming (OOP)."
    },
    {
      id: "edu-2",
      degree: "Secondary School Certificate (SSC) — Science",
      institution: "Technical & Secondary Education Board",
      period: "2019 - 2021",
      details: "Rigorous coursework in Higher Mathematics, Physics, Chemistry, and Information & Communication Technology with outstanding academic distinction."
    },
    {
      id: "edu-3",
      degree: "Full-Stack Web Development Professional Specialization",
      institution: "Professional Dev Academy & Online Specialization",
      period: "2023 - 2024",
      details: "Intensive training in modern MERN & Next.js ecosystem, state management with Redux Toolkit, PostgreSQL with Prisma ORM, RESTful API architecture, and Cloud Deployment."
    },
    {
      id: "edu-4",
      degree: "Competitive Programming & Algorithmic Problem Solving",
      institution: "Competitive Programming Platforms & National Bootcamps",
      period: "2022 - Present",
      details: "Advanced problem-solving track covering Graph Algorithms, Dynamic Programming, Combinatorics, Number Theory, and time/space complexity optimization."
    },
    {
      id: "edu-5",
      degree: "UI/UX Design & Mobile App Engineering Workshop",
      institution: "Design & Software Engineering Training Track",
      period: "2023 - 2024",
      details: "Specialized in user journey wireframing, Figma design systems, cross-platform Android mobile layouts, and modern accessibility standards."
    }
  ]
};
