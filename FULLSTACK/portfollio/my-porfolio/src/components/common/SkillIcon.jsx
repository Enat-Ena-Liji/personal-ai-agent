import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaCode, FaServer, FaDatabase, FaMobileAlt,
  FaCloud, FaRobot, FaToolbox, FaJs, FaLayerGroup, FaJava
} from 'react-icons/fa';
import {
  SiReact, SiNodedotjs, SiPython, 
  SiCplusplus, SiTypescript, 
  SiMysql, SiPostgresql, SiMongodb, SiDocker,
  SiGit, SiJira, SiFigma
} from 'react-icons/si';
import styles from './SkillIcon.module.css';

const SkillIcon = ({ skill, level, category, size = 'medium', interactive = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);

  const skillCategories = {
    frontend: { color: '#61DAFB', icon: <SiReact /> },
    backend: { color: '#339933', icon: <FaServer /> },
    database: { color: '#47A248', icon: <FaDatabase /> },
    mobile: { color: '#34B7F1', icon: <FaMobileAlt /> },
    devops: { color: '#2496ED', icon: <FaCloud /> },
    ai_ml: { color: '#FF6B6B', icon: <FaRobot /> },
    tools: { color: '#F0DB4F', icon: <FaToolbox /> },
    design: { color: '#F24E1E', icon: <SiFigma /> },
    languages: { color: '#3776AB', icon: <FaCode /> }
  };

  const skillIcons = {
    'React': <SiReact />,
    'Next.js': <SiReact />,
    'TypeScript': <SiTypescript />,
    'JavaScript': <FaJs />,
    'HTML/CSS': <FaLayerGroup />,
    'Node.js': <SiNodedotjs />,
    'Express': <SiNodedotjs />,
    'Python': <SiPython />,
    'Java': <FaJava />,
    'C++': <SiCplusplus />,
    'MySQL': <SiMysql />,
    'PostgreSQL': <SiPostgresql />,
    'MongoDB': <SiMongodb />,
    'Docker': <SiDocker />,
    'Git': <SiGit />,
    'Figma': <SiFigma />,
    'Jira': <SiJira />,
    'default': <FaCode />
  };

  const levelColors = {
    beginner: '#FF6B6B',
    intermediate: '#FFD93D',
    advanced: '#6BCF7F',
    expert: '#4D96FF'
  };

  const levelText = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert'
  };

  const categoryInfo = skillCategories[category] || skillCategories.languages;
  const icon = skillIcons[skill] || skillIcons.default;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(level);
    }, 300);
    return () => clearTimeout(timer);
  }, [level]);

  const calculateLevel = (progress) => {
    if (progress >= 90) return 'expert';
    if (progress >= 70) return 'advanced';
    if (progress >= 40) return 'intermediate';
    return 'beginner';
  };

  const currentLevel = calculateLevel(level);

  const sizeClass = styles[size];
  const containerClass = `${styles.container} ${sizeClass} ${interactive ? styles.interactive : ''}`;

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={containerClass}
        style={{ '--skill-color': categoryInfo.color }}
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
        onClick={() => interactive && setIsExpanded(true)}
      >
        {isHovered && (
          <motion.div
            className={styles.glow}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        )}

        <div className={styles.inner}>
          <div className={styles.content}>
            {icon}
          </div>
        </div>

        <svg className={styles.progressRing} width="80" height="80" viewBox="0 0 80 80">
          <circle
            className={styles.progressRingBackground}
            cx="40"
            cy="40"
            r="35"
          />
          <motion.circle
            className={styles.progressRingForeground}
            cx="40"
            cy="40"
            r="35"
            stroke={levelColors[currentLevel]}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>

        <div className={styles.levelBadge} style={{ backgroundColor: levelColors[currentLevel] }}>
          {Math.round(progress)}%
        </div>

        {isHovered && interactive && (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {skill}
          </motion.div>
        )}
      </motion.div>

      {!interactive && (
        <div className={styles.label}>
          <span className={styles.name}>{skill}</span>
          <span className={styles.level} style={{ color: levelColors[currentLevel] }}>
            {levelText[currentLevel]}
          </span>
        </div>
      )}

      {interactive && isExpanded && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExpanded(false)}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setIsExpanded(false)}
              aria-label="Close"
            >
              ×
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalIcon} style={{ color: categoryInfo.color }}>
                {icon}
              </div>
              <div className={styles.modalTitle}>
                <h3>{skill}</h3>
                <span className={styles.modalCategory}>{category}</span>
              </div>
            </div>

            <div className={styles.progressDetails}>
              <div className={styles.progressInfo}>
                <div className={styles.progressLabels}>
                  <span className={styles.progressLevel} style={{ color: levelColors[currentLevel] }}>
                    {levelText[currentLevel]}
                  </span>
                  <span className={styles.progressPercentage}>{Math.round(progress)}%</span>
                </div>
                <div className={styles.progressBarContainer}>
                  <motion.div
                    className={styles.progressBarFill}
                    style={{ 
                      backgroundColor: levelColors[currentLevel],
                      width: `${progress}%`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <div className={styles.timeline}>
                <h4>Experience Timeline</h4>
                <div className={styles.timelineBar}>
                  {[0, 25, 50, 75, 100].map((point) => (
                    <div key={point} className={styles.timelinePoint}>
                      <div 
                        className={`${styles.timelineMarker} ${progress >= point ? styles.active : ''}`}
                        style={{ backgroundColor: progress >= point ? levelColors[currentLevel] : '#ccc' }}
                      />
                      <span className={styles.timelineLabel}>{point}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.relatedProjects}>
                <h4>Related Projects</h4>
                <div className={styles.projectsGrid}>
                  {['Project A', 'Project B', 'Project C'].map((project) => (
                    <div key={project} className={styles.projectChip}>
                      {project}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.description}>
                <h4>About This Skill</h4>
                <p>
                  {skill} is a {category} technology that I have been working with for 
                  over {Math.round(progress / 20)} years. I have used it in various projects
                  including web applications, APIs, and database management systems.
                </p>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>{Math.round(progress / 10)}</div>
                  <div className={styles.metricLabel}>Projects</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>{Math.round(progress * 10)}</div>
                  <div className={styles.metricLabel}>Hours</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricValue}>{Math.round(progress / 5)}</div>
                  <div className={styles.metricLabel}>Years</div>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={`${styles.actionBtn} ${styles.viewProjects}`}>
                View Projects
              </button>
              <button className={`${styles.actionBtn} ${styles.learnMore}`}>
                Learn More
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

SkillIcon.defaultProps = {
  skill: 'React',
  level: 85,
  category: 'frontend',
  size: 'medium',
  interactive: true
};

export default SkillIcon;