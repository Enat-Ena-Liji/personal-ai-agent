import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub, FaExternalLinkAlt, FaStar, FaCodeBranch,
  FaEye, FaServer, FaMobileAlt, FaDatabase,
  FaExpand, FaTimes, FaPlay, FaCalendarAlt,
  FaUsers, FaJava, FaRocket, FaCode
} from 'react-icons/fa';
import {SiReact, SiPython,
  SiMysql, SiPostgresql, SiDocker, SiTypescript,
  SiNodedotjs
} from 'react-icons/si';
import styles from './ProjectCard.module.css';

const ProjectCard = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  if (!project) {
    console.error('ProjectCard: project prop is undefined');
    return null;
  }

  const {
    type = 'fullstack',
    featured = false,
    stats = { stars: 0, forks: 0, views: 0, linesOfCode: 0, commits: 0, branches: 0 },
    title = 'Untitled Project',
    shortDescription = 'No description available.',
    date = new Date().toISOString(),
    teamSize = 1,
    technologies = [],
    images = ['/placeholder.jpg'],
    video = null,
    links = { github: '#', demo: null, docs: null },
    status = 'completed',
    progress = 0,
    fullDescription = 'No detailed description available.',
    features = [],
    challenges = [],
    duration = 'N/A'
  } = project;

  const techIcons = {
    React: <SiReact />,
    'Node.js': <SiNodedotjs />,
    TypeScript: <SiTypescript />,
    Python: <SiPython />,
    Java: <FaJava />,
    MySQL: <SiMysql />,
    PostgreSQL: <SiPostgresql />,
    Docker: <SiDocker />,
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleImageChange = (direction) => {
    if (!images || images.length === 0) return;
    
    if (direction === 'next') {
      setActiveImage((prev) => (prev + 1) % images.length);
    } else {
      setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      {/* Compact Card View */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -10 }}
        className={styles.card}
      >
        <div className={styles.header}>
          <div className={styles.badgeGroup}>
            <span className={`${styles.badgeType} ${styles[type]}`}>
              {type}
            </span>
            {featured && (
              <span className={styles.badgeFeatured}>
                <FaStar /> Featured
              </span>
            )}
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <FaStar />
              <span>{stats?.stars || 0}</span>
            </div>
            <div className={styles.stat}>
              <FaCodeBranch />
              <span>{stats?.forks || 0}</span>
            </div>
            <div className={styles.stat}>
              <FaEye />
              <span>{stats?.views || 0}</span>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.icon}>
            {type === 'fullstack' && <FaServer />}
            {type === 'frontend' && <SiReact />}
            {type === 'mobile' && <FaMobileAlt />}
            {type === 'backend' && <FaDatabase />}
          </div>

          <h3 className={styles.title}>{title}</h3>
          
          <p className={styles.description}>{shortDescription}</p>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <FaCalendarAlt />
              <span>{formatDate(date)}</span>
            </div>
            <div className={styles.metaItem}>
              <FaUsers />
              <span>{teamSize === 1 ? 'Solo' : `${teamSize} members`}</span>
            </div>
          </div>

          <div className={styles.tech}>
            {technologies.slice(0, 4).map((tech) => (
              <span key={tech} className={styles.techTag}>
                {techIcons[tech] || <FaCode />}
                <span>{tech}</span>
              </span>
            ))}
            {technologies.length > 4 && (
              <span className={styles.techMore}>
                +{technologies.length - 4}
              </span>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.links}>
            <motion.a
              href={links?.github || '#'}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`${styles.link} ${styles.github}`}
            >
              <FaGithub /> Code
            </motion.a>
            
            {links?.demo && (
              <motion.a
                href={links.demo}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`${styles.link} ${styles.demo}`}
              >
                <FaExternalLinkAlt /> Live Demo
              </motion.a>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.expandBtn}
            onClick={() => setIsExpanded(true)}
          >
            <FaExpand /> Details
          </motion.button>
        </div>

        {status === 'in-progress' && (
          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <motion.div
                className={styles.progressFill}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <span className={styles.progressText}>{progress}% complete</span>
          </div>
        )}
      </motion.div>

      {/* Expanded Modal View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleSection}>
                  <h2 className={styles.modalTitle}>{title}</h2>
                  <div className={styles.modalSubtitle}>
                    <span className={styles.modalDate}>
                      <FaCalendarAlt /> {formatDate(date)}
                    </span>
                    <span className={styles.modalDuration}>
                      Duration: {duration}
                    </span>
                  </div>
                </div>

                <button
                  className={styles.modalClose}
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className={styles.modalContent}>
                {images && images.length > 0 && (
                  <div className={styles.gallery}>
                    <div className={styles.galleryMain}>
                      {video && !videoPlaying ? (
                        <div className={styles.videoPlaceholder}>
                          <button
                            className={styles.playVideoBtn}
                            onClick={() => setVideoPlaying(true)}
                          >
                            <FaPlay /> Watch Demo
                          </button>
                        </div>
                      ) : video && videoPlaying ? (
                        <div className={styles.videoContainer}>
                          <video src={video} controls autoPlay />
                        </div>
                      ) : (
                        <img
                          src={images[activeImage] || '/placeholder.jpg'}
                          alt={`${title} screenshot ${activeImage + 1}`}
                          className={styles.galleryImage}
                        />
                      )}
                    </div>

                    {!video && images.length > 1 && (
                      <div className={styles.galleryControls}>
                        <button
                          className={styles.galleryBtn}
                          onClick={() => handleImageChange('prev')}
                        >
                          ←
                        </button>
                        <div className={styles.galleryThumbnails}>
                          {images.map((img, index) => (
                            <button
                              key={index}
                              className={`${styles.thumbnail} ${activeImage === index ? styles.active : ''}`}
                              onClick={() => setActiveImage(index)}
                            >
                              <img src={img} alt={`Thumbnail ${index + 1}`} />
                            </button>
                          ))}
                        </div>
                        <button
                          className={styles.galleryBtn}
                          onClick={() => handleImageChange('next')}
                        >
                          →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.details}>
                  <div className={styles.detailsSection}>
                    <h3 className={styles.sectionTitle}>
                      <FaRocket /> Project Overview
                    </h3>
                    <p className={styles.sectionContent}>{fullDescription}</p>
                  </div>

                  {features && features.length > 0 && (
                    <div className={styles.detailsSection}>
                      <h3 className={styles.sectionTitle}>
                        <FaCode /> Key Features
                      </h3>
                      <ul className={styles.featuresList}>
                        {features.map((feature, index) => (
                          <li key={index} className={styles.featureItem}>
                            <span className={styles.featureIcon}>✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailsSection}>
                      <h3 className={styles.sectionTitle}>Technology Stack</h3>
                      <div className={styles.techStackGrid}>
                        {technologies.map((tech) => (
                          <div key={tech} className={styles.techStackItem}>
                            <div className={styles.techIcon}>
                              {techIcons[tech] || <FaCode />}
                            </div>
                            <span className={styles.techName}>{tech}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.detailsSection}>
                      <h3 className={styles.sectionTitle}>Project Stats</h3>
                      <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>{stats?.linesOfCode || 0}</span>
                          <span className={styles.statLabel}>Lines of Code</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>{stats?.commits || 0}</span>
                          <span className={styles.statLabel}>Commits</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>{stats?.branches || 0}</span>
                          <span className={styles.statLabel}>Branches</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statValue}>{duration}</span>
                          <span className={styles.statLabel}>Duration</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {challenges && challenges.length > 0 && (
                    <div className={styles.detailsSection}>
                      <h3 className={styles.sectionTitle}>Challenges & Solutions</h3>
                      <div className={styles.challengesList}>
                        {challenges.map((challenge, index) => (
                          <div key={index} className={styles.challengeItem}>
                            <h4 className={styles.challengeTitle}>{challenge.title}</h4>
                            <p className={styles.challengeSolution}>{challenge.solution}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.modalLinks}>
                    <a
                      href={links?.github || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.modalLink} ${styles.github}`}
                    >
                      <FaGithub /> View Source Code
                    </a>
                    {links?.demo && (
                      <a
                        href={links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.modalLink} ${styles.demo}`}
                      >
                        <FaExternalLinkAlt /> Launch Live Demo
                      </a>
                    )}
                    {links?.docs && (
                      <a
                        href={links.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.modalLink} ${styles.docs}`}
                      >
                        📚 View Documentation
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

ProjectCard.defaultProps = {
  project: {
    id: 1,
    title: 'Project Title',
    type: 'fullstack',
    featured: false,
    date: new Date().toISOString(),
    duration: 'N/A',
    teamSize: 1,
    status: 'completed',
    progress: 100,
    shortDescription: 'A brief description of the project.',
    fullDescription: 'Detailed description of the project.',
    technologies: [],
    features: [],
    images: ['/placeholder.jpg'],
    video: null,
    links: {
      github: '#',
      demo: null,
      docs: null
    },
    stats: {
      stars: 0,
      forks: 0,
      views: 0,
      linesOfCode: 0,
      commits: 0,
      branches: 0
    },
    challenges: []
  }
};

export default ProjectCard;