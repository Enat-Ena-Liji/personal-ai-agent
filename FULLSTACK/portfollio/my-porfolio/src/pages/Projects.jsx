import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '../components/common/ProjectCard';
import ScrollNavigationIndicators from '../components/common/ScrollNavigationIndicators';
import {FaCode,FaSearch,FaStar,FaFire,FaCalendarAlt,FaLayerGroup,FaServer,FaMobileAlt,FaDatabase} from 'react-icons/fa';
import {SiReact,SiNodedotjs} from 'react-icons/si';
import styles from './Projects.module.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isGridView, setIsGridView] = useState(true);
  const projectsPerPage = 9;

  const categories = [
    { id: 'all', label: 'All Projects', icon: <FaLayerGroup /> },
    { id: 'fullstack', label: 'Full Stack', icon: <FaServer /> },
    { id: 'frontend', label: 'Frontend', icon: <SiReact /> },
    { id: 'backend', label: 'Backend', icon: <SiNodedotjs /> },
    { id: 'mobile', label: 'Mobile', icon: <FaMobileAlt /> },
    { id: 'database', label: 'Database', icon: <FaDatabase /> },
  ];

 // Mock projects data
  const mockProjects = useMemo(() => [
        {
    id: 10,
    title: 'University Department Allocation System',
    type: 'fullstack',
    featured: true,
    date: '2024-02-15',
    duration: '3 months',
    teamSize: 1,
    status: 'completed',
    progress: 100,
    shortDescription: 'A comprehensive system for allocating freshman students to departments based on GPA, entrance scores, and affirmative action criteria.',
    fullDescription: `A full-stack web application that automates the university department allocation process with:
    
    • Complex scoring algorithm: 50% GPA + 20% Entrance Exam + 30% COC Exam
    • Affirmative action bonuses (+5 each for female, region, handicap)
    • 20% female quota enforcement
    • Multi-role workflow (Admin, Registrar, Dean, Dept Head, Teacher, Student)
    • Grade approval pipeline with audit trail
    • Real-time countdown timer synchronized with server
    • Preference ranking system with validation
    • Complete audit logging for all actions
    
    The system handles 70+ functional requirements and includes comprehensive database design with 15+ tables and complete audit trails.`,
    technologies: ['React', 'Node.js', 'Express', 'PostgreSQL', 'JWT', 'Redis'],
    features: [
      'Complex allocation algorithm with 50% GPA + 20% Entrance + 30% COC',
      'Multi-role workflow with 6 distinct user roles',
      'Grade approval pipeline with audit trail',
      'Real-time countdown timer synchronized with server',
      'Affirmative action bonuses (+5 each for female, region, handicap)',
      '20% female quota enforcement',
      'Preference ranking system with validation',
      'Complete audit logging for all actions',
      '70+ functional requirements implemented',
      '15+ database tables with complex relationships'
    ],
    images: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop'],
    video: null,
    links: {
      github: 'https://github.com/yourusername/udas',
      demo: 'https://udas-demo.herokuapp.com',
      docs: 'https://github.com/yourusername/udas#readme'
    },
    stats: {
      stars: 0,
      forks: 0,
      views: 0,
      linesOfCode: 25000,
      commits: 0,
      branches: 0
    },
    challenges: [
      {
        title: 'Complex allocation algorithm with multiple criteria',
        solution: 'Implemented a scoring system that combines GPA (50%), Entrance Exam (20%), and COC Exam (30%) with affirmative action bonuses, using a preference chaining algorithm that tries each choice sequentially.'
      },
      {
        title: 'Multi-role workflow with strict permissions',
        solution: 'Implemented JWT-based authentication with role-based access control (RBAC) and impersonation capabilities for higher roles.'
      },
      {
        title: 'Real-time deadline enforcement',
        solution: 'Server-synchronized countdown timer with WebSocket connections to prevent local tampering.'
      }
    ],
    complexity: 'high'
  },
  {
      id: 1,
      title: 'E-Commerce Platform',
      type: 'fullstack',
      featured: true,
      date: '2024-01-15',
      duration: '3 months',
      teamSize: 3,
      status: 'completed',
      progress: 100,
      shortDescription: 'A full-featured e-commerce platform with real-time inventory management and payment integration.',
      fullDescription: 'This project involved building a complete e-commerce solution from scratch. Features include user authentication, product catalog, shopping cart, payment processing with Stripe, order management, and admin dashboard.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Redux', 'Stripe'],
      features: [
        'User authentication with JWT',
        'Real-time inventory management',
        'Payment processing with Stripe',
        'Admin dashboard with analytics',
        'Responsive design for all devices'
      ],
      images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop'],
      video: null,
      links: {
        github: 'https://github.com',
        demo: 'https://weather-condition-one.vercel.app',
        docs: null
      },
      stats: {
        stars: 45,
        forks: 12,
        views: 1200,
        linesOfCode: 15000,
        commits: 156,
        branches: 8
      },
      challenges: [
        {
          title: 'Real-time inventory sync',
          solution: 'Implemented WebSocket connections and database transactions'
        }
      ],
      complexity: 'high'
 },
    {
    id: 11,
    title: 'Evangadi Forum - Programming Q&A Platform',
    type: 'fullstack',
    featured: true,
    date: '2024-01-20',
    duration: '2 weeks',
    teamSize: 1,
    status: 'completed',
    progress: 100,
    shortDescription: 'A community-driven Q&A platform where programming students can ask questions, provide answers, and collaborate on solving coding problems.',
    fullDescription: `A fully-functional Q&A platform built for Evangadi Networks, enabling programming students to ask questions and get answers from the community.

Key Features:
• Secure user authentication with signup/login
• Password validation (minimum 8 characters)
• Unique email and username enforcement
• Questions listing with newest first
• Question titles displayed with author usernames
• Detailed question view with full description
• Answer posting system with author tracking
• Ask question page with guided instructions
• Persistent user sessions across pages
• Responsive design for all devices

The platform follows Stack Overflow-style conventions and provides an intuitive interface for students to collaborate on programming problems. Users can only post questions and answers when logged in, ensuring accountability and quality content.`,
    technologies: ['React', 'Node.js', 'Express', 'MySQL', 'JWT', 'Bcrypt'],
    features: [
      'Complete user authentication system',
      'Password validation (8+ characters)',
      'Unique email/username enforcement',
      'Questions listed by title with author info',
      'Newest questions appear first',
      'Detailed question view with all answers',
      'Answer posting with author tracking',
      'Ask question page with guided instructions',
      'Protected routes for authenticated users',
      'Responsive mobile-friendly design'
    ],
    images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop'],
    video: null,
    links: {
      github: 'https://github.com/yourusername/evangadi-forum',
      demo: 'https://evangadi-forum-tau-one.vercel.app/',
      docs: 'https://github.com/yourusername/evangadi-forum#readme'
    },
    stats: {
      stars: 0,
      forks: 0,
      views: 0,
      linesOfCode: 8500,
      commits: 0,
      branches: 0
    },
    challenges: [
      {
        title: 'Implementing secure authentication with JWT',
        solution: 'Used HTTP-only cookies for JWT storage to prevent XSS attacks, with bcrypt for password hashing and proper validation middleware.'
      },
      {
        title: 'Maintaining user sessions across pages',
        solution: 'Implemented persistent login state using React Context API with token verification on each protected route.'
      },
      {
        title: 'Real-time question ordering',
        solution: 'Questions are fetched from MySQL with ORDER BY created_at DESC to ensure newest questions appear first, with proper indexing for performance.'
      }
    ],
    complexity: 'medium'
  },
  
     {
    id: 12,
    title: 'Abe\'s Garage - Complete Garage Management System',
    type: 'fullstack',
    featured: true,
    date: '2024-03-01',
    duration: '3 months',
    teamSize: 1,
    status: 'completed',
    progress: 100,
    shortDescription: 'A comprehensive business management system that streamlines garage operations, customer management, order tracking, and service delivery with real business value ROI calculation.',
    fullDescription: `A complete business management system for Abe's Garage that demonstrates the full software development lifecycle from business analysis to deployment.

**Business Analysis & Value Proposition:**
• Identified 7 major business problems through workflow observation
• Calculated $445,750 total value added over 5 years
• $260,000 from customer retention (10% return rate)
• $120,000 from new customer acquisition (5 additional customers/month)
• $40,625 from customer time savings (15 mins per visit)
• $16,250 from manager time savings (30 mins/day)
• $7,800 from reduced phone calls (8 calls/day)
• $1,075 from automated receipt generation
• Fair project price: $18,000 (20% of net profit)

**System Architecture:**
• Microservices architecture with 6 core services
• RESTful API design with JWT authentication
• AWS EC2 hosting with CloudWatch monitoring
• MySQL database with 7+ tables and relationships
• Bootstrap 5 template with custom modifications

**Core Features:**
• Public-facing pages (Home, About, Services, Contact)
• Employee management with role-based access
• Customer management with vehicle history
• Order management with task assignment
• Service catalog with pricing and estimates
• Order tracking with unique hash (no login required)
• Responsive design for all devices

**Technical Implementation:**
• 50+ RESTful API endpoints
• 15+ database tables with foreign key constraints
• JWT authentication with HTTP-only cookies
• Bcrypt password hashing
• Comprehensive error handling and logging
• Git version control with feature branching
• AWS deployment with automated backups`,
    technologies: ['React', 'Node.js', 'Express', 'MySQL', 'JWT', 'AWS', 'Bootstrap'],
    features: [
      'Complete business analysis with $445,750 value calculation',
      'Full system design with microservices architecture',
      'Customer management with vehicle history tracking',
      'Order management with task assignment',
      'Employee management with role-based access',
      'Public pages (Home, About, Services, Contact)',
      'Order tracking without login (unique hash)',
      'Service history and customer retention',
      'AWS deployment with CloudWatch monitoring',
      'Responsive Bootstrap template'
    ],
    images: ['https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&auto=format&fit=crop'],
    video: null,
    links: {
      github: 'https://github.com/yourusername/abe-garage',
      demo: 'https://abe-garage.herokuapp.com',
      docs: 'https://github.com/yourusername/abe-garage#readme'
    },
    stats: {
      stars: 0,
      forks: 0,
      views: 0,
      linesOfCode: 35000,
      commits: 0,
      branches: 0
    },
    challenges: [
      {
        title: 'Quantifying business value and ROI',
        solution: 'Conducted thorough workflow analysis, interviewed stakeholders, calculated time savings and revenue increases based on realistic assumptions, resulting in a $445,750 value proposition.'
      },
      {
        title: 'Designing microservices architecture for small scale',
        solution: 'Created loosely coupled services (Auth, Employees, Customers, Orders, Services, Vehicles) that can run on a single server but are structured for easy separation as the business grows.'
      },
      {
        title: 'Implementing secure order tracking without login',
        solution: 'Generated unique order hashes using UUID v4, stored in database with expiration, and created public route /order/:hash for customers to check status without authentication.'
      },
      {
        title: 'Role-based access control with JWT',
        solution: 'Implemented JWT tokens with role claims, middleware to check permissions for each route, and different dashboard views based on user role (Admin, Manager, Staff).'
      }
    ],
    complexity: 'high'
  },
 
    {
      id: 3,
      title: 'AI-Powered Analytics Dashboard',
      type: 'frontend',
      featured: false,
      date: '2024-02-01',
      duration: '1.5 months',
      teamSize: 1,
      status: 'in-progress',
      progress: 75,
      shortDescription: 'Dashboard for visualizing AI model predictions with interactive charts and real-time data.',
      fullDescription: 'An advanced analytics dashboard built with React and TypeScript for visualizing machine learning model predictions and real-time data streams.',
      technologies: ['React', 'TypeScript', 'D3.js', 'Chart.js', 'Tailwind'],
      features: [
        'Interactive data visualizations',
        'Real-time data updates',
        'Custom chart configurations',
        'Export functionality',
        'Responsive design'
      ],
      images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop'],
      stats: {
        stars: 18,
        forks: 5,
        views: 560,
        linesOfCode: 6500,
        commits: 67,
        branches: 4
      },
      challenges: [
        {
          title: 'Real-time data synchronization',
          solution: 'Implemented WebSocket connections with automatic reconnection'
        }
      ],
      complexity: 'high'
    },
    {
      id: 4,
      title: 'Task Management System',
      type: 'fullstack',
      featured: false,
      date: '2023-09-10',
      duration: '1 month',
      teamSize: 1,
      status: 'completed',
      progress: 100,
      shortDescription: 'Collaborative task management system with drag-and-drop interface.',
      fullDescription: 'A collaborative task management system with drag-and-drop functionality, team collaboration features, and real-time updates.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Express'],
      features: [
        'Drag-and-drop interface',
        'Team collaboration',
        'Real-time updates',
        'File attachments',
        'Progress tracking'
      ],
      images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&auto=format&fit=crop'],
      stats: {
        stars: 25,
        forks: 6,
        views: 720,
        linesOfCode: 5000,
        commits: 82,
        branches: 3
      },
      challenges: [
        {
          title: 'Drag-and-drop performance',
          solution: 'Optimized with React DnD and virtual scrolling'
        }
      ],
      complexity: 'medium'
    },
    {
      id: 5,
      title: 'Weather Forecast App',
      type: 'mobile',
      featured: false,
      date: '2023-07-15',
      duration: '3 weeks',
      teamSize: 1,
      status: 'completed',
      progress: 100,
      shortDescription: 'Mobile weather application with location-based forecasts and alerts.',
      fullDescription: 'A mobile weather application built with React Native that provides location-based forecasts, severe weather alerts, and beautiful UI.',
      technologies: ['React Native', 'Expo', 'OpenWeather API'],
      features: [
        'Location-based forecasts',
        'Severe weather alerts',
        'Beautiful UI/UX',
        'Offline functionality',
        'Push notifications'
      ],
      images: ['https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&auto=format&fit=crop'],
       links: {
        github: 'https://github.com',
        demo: 'https://weather-condition-one.vercel.app',
        docs: null
      },
      stats: {
        stars: 15,
        forks: 4,
        views: 430,
        linesOfCode: 3500,
        commits: 45,
        branches: 2
      },
      challenges: [
        {
          title: 'Offline data synchronization',
          solution: 'Implemented local storage with periodic sync'
        }
      ],
      complexity: 'low'
    },
    {
      id: 6,
      title: 'Blog Platform API',
      type: 'backend',
      featured: false,
      date: '2023-05-20',
      duration: '2 weeks',
      teamSize: 1,
      status: 'completed',
      progress: 100,
      shortDescription: 'RESTful API for a blog platform with authentication and CRUD operations.',
      fullDescription: 'A comprehensive RESTful API for a blog platform with authentication, CRUD operations, comment system, and admin panel.',
      technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
      features: [
        'User authentication',
        'CRUD operations',
        'Comment system',
        'Admin panel',
        'Search functionality'
      ],
      images: ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop'],
      stats: {
        stars: 20,
        forks: 3,
        views: 380,
        linesOfCode: 2800,
        commits: 32,
        branches: 2
      },
      challenges: [
        {
          title: 'Authentication security',
          solution: 'Implemented JWT with refresh tokens and rate limiting'
        }
      ],
      complexity: 'medium'
    },
      {
      id: 2,
      title: 'Real-Time Chat Application',
      type: 'fullstack',
      featured: true,
      date: '2023-11-20',
      duration: '2 months',
      teamSize: 2,
      status: 'completed',
      progress: 100,
      shortDescription: 'Real-time messaging application with WebSocket implementation and media sharing.',
      fullDescription: 'A real-time chat application built with React, Node.js, and Socket.io. Features include instant messaging, file sharing, user presence indicators, and message history.',
      technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'JWT'],
      features: [
        'Real-time messaging',
        'File and image sharing',
        'User presence indicators',
        'Message history',
        'Private and group chats'
      ],
      images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop'],
      video: null,
      links: {
        github: 'https://github.com',
        demo: 'https://text-to-speech-converter-ivory.vercel.app/',
        docs: null
      },
      stats: {
        stars: 32,
        forks: 8,
        views: 890,
        linesOfCode: 8000,
        commits: 98,
        branches: 5
      },
      challenges: [
        {
          title: 'Scalability for concurrent users',
          solution: 'Implemented Redis for session management and message queuing'
        }
      ],
      complexity: 'medium'
    },
    // {
    //   id: 7,
    //   title: 'Portfolio Website',
    //   type: 'frontend',
    //   featured: false,
    //   date: '2023-03-01',
    //   duration: '2 weeks',
    //   teamSize: 1,
    //   status: 'completed',
    //   progress: 100,
    //   shortDescription: 'Personal portfolio website with interactive animations and responsive design.',
    //   fullDescription: 'A modern portfolio website with interactive animations, responsive design, and performance optimizations.',
    //   technologies: ['React', 'Framer Motion', 'CSS3', 'Vite'],
    //   features: [
    //     'Interactive animations',
    //     'Responsive design',
    //     'Performance optimized',
    //     'SEO friendly',
    //     'Accessibility compliant'
    //   ],
    //   images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'],
    //   stats: {
    //     stars: 30,
    //     forks: 7,
    //     views: 950,
    //     linesOfCode: 4200,
    //     commits: 54,
    //     branches: 3
    //   },
    //   challenges: [
    //     {
    //       title: 'Animation performance',
    //       solution: 'Used Framer Motion with optimized rendering'
    //     }
    //   ],
    //   complexity: 'low'
    // },

    // {
    //   id: 8,
    //   title: 'E-Learning Platform',
    //   type: 'fullstack',
    //   featured: true,
    //   date: '2023-12-10',
    //   duration: '4 months',
    //   teamSize: 4,
    //   status: 'completed',
    //   progress: 100,
    //   shortDescription: 'Comprehensive e-learning platform with video courses and progress tracking.',
    //   fullDescription: 'A comprehensive e-learning platform with video courses, progress tracking, quizzes, certificates, and instructor dashboards.',
    //   technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Stripe'],
    //   features: [
    //     'Video course hosting',
    //     'Progress tracking',
    //     'Interactive quizzes',
    //     'Certificate generation',
    //     'Instructor dashboards'
    //   ],
    //   images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop'],
    //   stats: {
    //     stars: 55,
    //     forks: 15,
    //     views: 1800,
    //     linesOfCode: 22000,
    //     commits: 210,
    //     branches: 12
    //   },
    //   challenges: [
    //     {
    //       title: 'Video streaming at scale',
    //       solution: 'Implemented AWS CloudFront with adaptive bitrate streaming'
    //     }
    //   ],
    //   complexity: 'high'
    // },
  
  
  

 

    // {
    //   id: 9,
    //   title: 'Fitness Tracker App',
    //   type: 'mobile',
    //   featured: false,
    //   date: '2024-01-05',
    //   duration: '2 months',
    //   teamSize: 2,
    //   status: 'completed',
    //   progress: 100,
    //   shortDescription: 'Mobile fitness application with workout tracking and progress analytics.',
    //   fullDescription: 'A mobile fitness application with workout tracking, progress analytics, social features, and health integration.',
    //   technologies: ['React Native', 'Firebase', 'Redux'],
    //   features: [
    //     'Workout tracking',
    //     'Progress analytics',
    //     'Social features',
    //     'Health integration',
    //     'Personalized plans'
    //   ],
    //   images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop'],
    //   stats: {
    //     stars: 28,
    //     forks: 9,
    //     views: 810,
    //     linesOfCode: 9200,
    //     commits: 112,
    //     branches: 6
    //   },
    //   challenges: [
    //     {
    //       title: 'Real-time synchronization',
    //       solution: 'Used Firebase Realtime Database with offline support'
    //     }
    //   ],
    //   complexity: 'medium'
    // },
    
 

  ], []);

  useEffect(() => {
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
    
    // Calculate category counts
    const categoryCounts = categories.reduce((acc, cat) => ({ ...acc, [cat.id]: 0 }), {});
    mockProjects.forEach(project => {
      if (categoryCounts[project.type] !== undefined) {
        categoryCounts[project.type]++;
      }
      categoryCounts.all++;
    });
  }, [mockProjects, categories]);

  useEffect(() => {
    let filtered = [...projects]; 

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.type === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.shortDescription.toLowerCase().includes(query) ||
        project.technologies.some(tech => tech.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'stars':
          aValue = a.stats.stars;
          bValue = b.stats.stars;
          break;
        case 'complexity':
          const complexityOrder = { low: 1, medium: 2, high: 3 };
          aValue = complexityOrder[a.complexity] || 0;
          bValue = complexityOrder[b.complexity] || 0;
          break;
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, sortOrder, projects]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroContent}
          >
            <div className="hero-badge">
              <FaCode />
              <span>Project Gallery</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Showcase of <span className="highlight">Innovation</span>
            </h1>
            
            <p className={styles.heroSubtitle}>
              Explore my collection of projects that demonstrate technical expertise, 
              problem-solving skills, and passion for software development.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Display */}
      <section className={styles.display}>
        <div className="container">
          <div className={styles.displayHeader}>
            <h2 className={styles.displayTitle}>
              Showing {filteredProjects.length} of {projects.length} Projects
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {filteredProjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.noProjects}
              >
                <div className={styles.noProjectsIcon}>
                  <FaSearch />
                </div>
                <h3>No projects found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={isGridView ? 'grid' : 'list'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`${styles.projectsContainer} ${isGridView ? styles.gridView : styles.listView}`}
              >
                {currentProjects.map(project => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isGridView ? (
                      <ProjectCard project={project} />
                    ) : (
                      <div className={styles.projectListItem}>
                        <div className={styles.listItemHeader}>
                          <div className={styles.itemBadges}>
                            <span className={`${styles.badgeType} ${styles[project.type]}`}>
                              {project.type}
                            </span>
                            {project.featured && (
                              <span className={styles.badgeFeatured}>
                                <FaStar /> Featured
                              </span>
                            )}
                          </div>
                          <div className={styles.itemStats}>
                            <span className={styles.stat}>
                              <FaStar /> {project.stats.stars}
                            </span>
                          </div>
                        </div>
                        
                        <div className={styles.listItemContent}>
                          <h3 className={styles.itemTitle}>{project.title}</h3>
                          <p className={styles.itemDescription}>{project.shortDescription}</p>
                          
                          <div className={styles.itemTech}>
                            {project.technologies.slice(0, 5).map(tech => (
                              <span key={tech} className={styles.techTag}>
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 5 && (
                              <span className={styles.techMore}>
                                +{project.technologies.length - 5}
                              </span>
                            )}
                          </div>
                          
                          <div className={styles.itemMeta}>
                            <span className={styles.metaItem}>
                              <FaCalendarAlt /> {new Date(project.date).toLocaleDateString()}
                            </span>
                            <span className={styles.metaItem}>
                              Duration: {project.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {filteredProjects.length > projectsPerPage && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className={styles.paginationNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className={styles.paginationEllipsis}>...</span>
                          <button
                            className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                            onClick={() => paginate(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => paginate(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
              </div>
              
              <button
                className={styles.paginationBtn}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.ctaContent}
          >
            <h2 className={styles.ctaTitle}>Have a Project in Mind?</h2>
            <p className={styles.ctaDescription}>
              I'm always open to discussing new opportunities and interesting projects.
              Let's bring your ideas to life!
            </p>
            <div className={styles.ctaActions}>
              <a href="/contact" className="btn btn-primary">
                Start a Conversation
              </a>
              <a href="/skills" className="btn btn-outline">
                View My Skills
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <ScrollNavigationIndicators />
    </div>
  );
};

export default Projects; 