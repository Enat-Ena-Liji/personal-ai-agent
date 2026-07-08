import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {FaArrowDown,FaRocket,FaCode,FaGithub,FaLinkedin,FaTwitter,FaCalendarAlt} from 'react-icons/fa';
import {SiReact,SiNodedotjs,SiTypescript,SiMongodb,SiTailwindcss} from 'react-icons/si';
import styles from './Home.module.css';
import profileImage from '../assets/images/8mg/profiles.jpg';

const Home = () => {
  git addconst [currentTime, setCurrentTime] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollPercent = (scrollTop / (docHeight - windowHeight)) * 100;
      setScrollProgress(scrollPercent);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Section */}

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroMain}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={styles.heroText}
              >
                <div className={styles.heroBadge}>
                  <span className="badge-dot"></span>
                  <span>Software Engineer</span>
                </div>
                <h1 className={styles.heroTitle}>
                  Hi, I'm <span className="highlight">Daniel Ayen</span>
                </h1>
                <h2 className={styles.heroSubtitle}>
                  I build <span className="highlight">digital experiences</span>
                  <br />that make an impact
                </h2>
                <p className={styles.heroDescription}>
                  Full Stack Developer & 3rd Year Software Engineering student
                  at Injibara University, passionate about creating elegant
                  solutions with modern technologies.
                </p>
                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>10+</span>
                    <span className={styles.statLabel}>Technologies</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>5+</span>
                    <span className={styles.statLabel}>Projects</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>95%</span>
                    <span className={styles.statLabel}>Satisfaction</span>
                  </div>
                </div>
                <div className={styles.heroActions}>
                  <Link to="/skills" className="btn btn-primary">
                    <FaRocket /> My Skills
                  </Link>
                  <Link to="/projects" className="btn btn-outline">
                    View Projects
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={styles.heroVisual} 
              >
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className={styles.profileContainer}>
                    <img src={profileImage} alt="Profile" className={styles.profileImage} />
                    <div className={styles.imageFrame}></div>

                    <div className={styles.techBadges}>
                      <motion.div
                        className={`${styles.badge} ${styles.react}`}
                        animate={{ y: [-15, 15, -15] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <SiReact />
                      </motion.div>
                      <motion.div
                        className={`${styles.badge} ${styles.node}`}
                        animate={{ y: [15, -15, 15] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                      >
                        <SiNodedotjs />
                      </motion.div>
                      <motion.div
                        className={`${styles.badge} ${styles.typescript}`}
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      >
                        <SiTypescript />
                      </motion.div>
                      <motion.div
                        className={`${styles.badge} ${styles.mongodb}`}
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      >
                        <SiMongodb />
                      </motion.div>
                      <motion.div
                        className={`${styles.badge} ${styles.tailwind}`}
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                      >
                        <SiTailwindcss />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={styles.heroFooter}
            >
              <div className={styles.socialLinks}>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <FaGithub />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
              </div>
              <div className={styles.scrollDown}>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaArrowDown />
                </motion.div>
                <span>Scroll to explore</span>
              </div>
              <div className={styles.currentTime}>
                <FaCalendarAlt />
                <span>{currentTime}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={styles.ctaCard}
          >
            <h2 className={styles.ctaTitle}>Let's Build Something Amazing</h2>
            <p className={styles.ctaDescription}>
              Have a project in mind? I'd love to help bring your ideas to life
              with clean code and modern solutions.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/contact" className="btn btn-primary">
                Start a Project
              </Link>
              <Link to="/about" className="btn btn-outline">
                Learn More About Me
              </Link>
            </div>
          </motion.div>
        </div>  
      </section>

      <ScrollNavigationIndicators />
    </div>
  );
};

export default Home;