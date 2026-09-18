export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  metrics?: string;
  github?: string;
  live?: string;
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
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

export const DEFAULT_PROFILE_PHOTOS: ProfilePhoto[] = [
  {
    id: "official-portrait",
    url: "/imran-hasan.jpg",
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
  brandInitials: "AI",
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

  // Hero Quick Stats Pills
  heroStats: {
    stat1Value: "620+",
    stat1Label: "Problems Solved",
    stat2Value: "15+",
    stat2Label: "Fullstack Projects",
    stat3Value: "2nd Position",
    stat3Label: "DUET IUPC"
  },

  // Navbar Labels
  navbar: {
    brandText: "Al Amin Islam",
    brandSubtitle: "Fullstack Dev",
    navHome: "Home",
    navSkills: "Skills",
    navProjects: "Projects",
    navExperience: "Experience",
    navAchievements: "Awards",
    navEducation: "Education",
    bookCallBtnText: "Book a Call"
  },

  // Footer Texts
  footer: {
    copyrightText: "© {year} Al Amin Islam. Built with Next.js & Tailwind CSS.",
    statusBadge: "Available for Hire"
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

  // Rotation Settings
  autoRotateSeconds: 5,

  // Stats Breakdown
  stats: [
    { label: "Algorithmic Problems Solved", value: "620+" },
    { label: "CodeChef Rating", value: "1406 (2⭐)" },
    { label: "Years of Experience", value: "1+ Year" },
    { label: "Fullstack Projects Delivered", value: "15+" }
  ],

  // Experience
  experiences: [
    {
      id: "exp-1",
      role: "Full-Stack Web Developer",
      company: "Freelance & Open Source Contributor",
      period: "2023 - Present",
      type: "Full-time / Contract",
      highlights: [
        "Architecting responsive web applications with Next.js, TypeScript, Node.js, Express, and PostgreSQL/MongoDB.",
        "Engineered scalable REST APIs and secure authentication pipelines using JWT, OAuth, and Prisma ORM.",
        "Optimized frontend performance, achieving 95+ Google Lighthouse scores across Core Web Vitals.",
        "Collaborated on client deliverables delivering telemedicine platforms and smart event systems."
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
      category: "Problem Solving & Tools",
      skills: [
        { name: "C++ / Data Structures", level: "Advanced" },
        { name: "Algorithms & Math", level: "Advanced" },
        { name: "Docker", level: "Intermediate" },
        { name: "Git / GitHub", level: "Advanced" },
        { name: "Postman", level: "Advanced" },
        { name: "Vercel / Cloud Run", level: "Advanced" }
      ]
    }
  ],

  // Projects
  projects: [
    {
      id: "proj-1",
      title: "Life Care Plus",
      description: "A comprehensive telemedicine and healthcare management ecosystem with real-time appointment booking, doctor directory, electronic prescriptions, and live tele-consultation.",
      tech: ["Next.js", "Express.js", "Prisma", "PostgreSQL", "Tailwind CSS"],
      metrics: "Reduced patient waiting times by ~30% and simplified appointment workflows.",
      github: "https://github.com/alaminislam",
      live: "https://alamin-islam-portfolio.vercel.app"
    },
    {
      id: "proj-2",
      title: "EventSphere",
      description: "Smart event management and booking system with multi-tier ticket reservations, interactive schedule planner, automated calendar sync, and organizer dashboard.",
      tech: ["Next.js", "Node.js", "MongoDB", "Tailwind CSS", "JWT"],
      metrics: "Seamless checkout flow supporting concurrent ticketing without duplicate seat claims.",
      github: "https://github.com/alaminislam",
      live: "https://alamin-islam-portfolio.vercel.app"
    },
    {
      id: "proj-3",
      title: "TouristBook",
      description: "Tourism discovery and spot reservation platform featuring curated Bangladeshi tour packages, review mechanisms, and secure traveler reservations.",
      tech: ["React.js", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
      metrics: "Interactive destination guides with multi-factor authentication.",
      github: "https://github.com/alaminislam",
      live: "https://alamin-islam-portfolio.vercel.app"
    },
    {
      id: "proj-4",
      title: "Job-Cast",
      description: "Automated WhatsApp and Telegram notification bot dispatching real-time tech job openings filtered by developer stack and experience level.",
      tech: ["Node.js", "Twilio API", "Cron Scheduling", "Express"],
      metrics: "Delivers daily curated job feeds to active software engineers.",
      github: "https://github.com/alaminislam",
      live: "https://alamin-islam-portfolio.vercel.app"
    }
  ],

  // Achievements
  achievements: [
    {
      id: "ach-1",
      title: "2nd Position - DUET IUPC 2025",
      organization: "Dhaka University of Engineering & Technology (DUET)",
      year: "2025",
      description: "Secured 2nd position among polytechnic competitive programming teams in a high-intensity 5-hour national contest."
    },
    {
      id: "ach-2",
      title: "ICPC Asia Dhaka Regional Contestant",
      organization: "International Collegiate Programming Contest",
      year: "2024 / 2025",
      description: "Qualified and competed in the prestigious ICPC regional contest solving complex algorithmic challenges under strict time and memory limits."
    },
    {
      id: "ach-3",
      title: "CodeChef 2-Star Competitive Programmer (1406 Max Rating)",
      organization: "CodeChef",
      year: "2024",
      description: "Achieved Division 2 ranking with 620+ total algorithmic problems solved across CodeChef, Codeforces, and LeetCode."
    },
    {
      id: "ach-4",
      title: "Champion - Institute Level Skill Competition",
      organization: "Technical Education Board",
      year: "2024",
      description: "Awarded 1st place in web application development and rapid prototyping."
    }
  ],

  // Education
  education: [
    {
      id: "edu-1",
      degree: "Diploma in Computer Science & Technology",
      institution: "Tangail Polytechnic Institute (TPI)",
      period: "2021 - 2025",
      details: "Focus on Algorithms, Data Structures, Database Management Systems, Software Engineering, and Object-Oriented Programming."
    }
  ]
};
