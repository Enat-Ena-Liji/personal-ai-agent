import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaProjectDiagram, FaCode, FaEnvelope, FaBars, FaTimes, FaGithub, FaLinkedin, FaFileDownload, FaArrowUp, FaFilePdf, FaFileWord, FaExternalLinkAlt, FaCheck, FaTimes as FaTimesIcon } from 'react-icons/fa';
import { SiLeetcode, SiHackerrank, SiGmail } from 'react-icons/si';
import styles from './Header.module.css';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notification, setNotification] = useState(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: '/', label: 'Home', icon: <FaHome /> },
    { id: '/about', label: 'About', icon: <FaUser /> },
    { id: '/projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: '/skills', label: 'Skills', icon: <FaCode /> },
    { id: '/contact', label: 'Contact', icon: <FaEnvelope /> },
  ];

  const codingProfiles = [
    { name: 'GitHub', icon: <FaGithub />, url: 'https://github.com/danielayen', color: '#333' },
    { name: 'LeetCode', icon: <SiLeetcode />, url: 'https://leetcode.com/danielayen', color: '#FFA116' },
    { name: 'HackerRank', icon: <SiHackerrank />, url: 'https://hackerrank.com/danielayen', color: '#2EC866' },
    { name: 'LinkedIn', icon: <FaLinkedin />, url: 'https://linkedin.com/in/danielayen', color: '#0077B5' },
    { name: 'Gmail', icon: <SiGmail />, url: 'mailto:daniel.ayen@example.com', color: '#EA4335' },
  ];

  const resumeVersions = [
    { format: 'pdf', label: 'PDF Resume', icon: <FaFilePdf />, size: '245 KB' },
    { format: 'docx', label: 'Word Resume', icon: <FaFileWord />, size: '180 KB' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResumeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const navigateToSection = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    navigate(path);
    setIsOpen(false);
    setShowResumeDropdown(false);
  };

  const downloadResume = (format) => {
    setNotification({
      type: 'success',
      message: `Resume (${format.toUpperCase()}) downloading...`
    });
    setTimeout(() => setNotification(null), 3000);
    setShowResumeDropdown(false);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      >
        <div className={styles.container}>
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.logo}
            onClick={scrollToTop}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && scrollToTop()}
          >
            <div className={styles.logoIcon}>
              <FaCode className={styles.logoSvg} />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoName}><DaniFolio/></span>
              <span className={styles.logoSubtitle}>Full Stack Developer</span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${styles.navItem} ${isActive(item.id) ? styles.active : ''}`}
                    onClick={() => navigateToSection(item.id)}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                    {isActive(item.id) && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={styles.activeIndicator}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side Actions */}
          <div className={styles.headerActions}>
            {/* Resume Dropdown */}
            <div className={styles.resumeWrapper} ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.resumeBtn}
                onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                aria-label="Download resume"
                aria-expanded={showResumeDropdown}
              >
                <FaFileDownload />
                <span>Resume</span>
              </motion.button>
              
              <AnimatePresence>
                {showResumeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={styles.resumeDropdown}
                  >
                    {resumeVersions.map((version) => (
                      <button 
                        key={version.format}
                        onClick={() => downloadResume(version.format)}
                        className={styles.dropdownItem}
                      >
                        <span className={styles.itemIcon}>{version.icon}</span>
                        <div className={styles.itemContent}>
                          <span className={styles.itemTitle}>{version.label}</span>
                          <span className={styles.itemSize}>{version.size}</span>
                        </div>
                      </button>
                    ))}
                    <div className={styles.dropdownDivider}></div>
                    <button 
                      onClick={() => navigateToSection('/contact')}
                      className={styles.dropdownItem}
                    >
                      <span className={styles.itemIcon}><FaEnvelope /></span>
                      <span className={styles.itemTitle}>Request Custom Version</span>
                      <FaExternalLinkAlt className={styles.itemExternal} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={styles.mobileToggle}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                  >
                    <FaTimes />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: -90 }}
                  >
                    <FaBars />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={styles.mobileMenu}
            >
              <div className={styles.mobileMenuContent}>
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${styles.mobileNavItem} ${isActive(item.id) ? styles.active : ''}`}
                    onClick={() => navigateToSection(item.id)}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    <span className={styles.mobileNavIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                ))}
                
                <div className={styles.mobileDivider}></div>
                
                <div className={styles.mobileProfiles}>
                  <h4 className={styles.mobileProfilesTitle}>Connect With Me</h4>
                  <div className={styles.mobileProfilesGrid}>
                    {codingProfiles.map((profile, index) => (
                      <motion.a
                        key={profile.name}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.mobileProfile}
                        aria-label={profile.name}
                      >
                        {profile.icon}
                        <span>{profile.name}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>
                
                <div className={styles.mobileResume}>
                  <button 
                    className={styles.mobileResumeBtn}
                    onClick={() => downloadResume('pdf')}
                  >
                    <FaFileDownload />
                    <span>Download Resume</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        <motion.div 
          className={styles.scrollProgress}
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) || 0 
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 30 }}
        />
      </motion.header>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`${styles.notificationToast} ${styles[notification.type]}`}
          >
            <div className={styles.notificationContent}>
              {notification.type === 'success' ? <FaCheck /> : <FaTimesIcon />}
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            className={styles.scrollTopBtn}
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <FaArrowUp />
            <span className={styles.scrollTopTooltip}>Back to Top</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcut Hint */}
      <div className={styles.keyboardHint}>
        <kbd>⌘</kbd> + <kbd>K</kbd> to search
      </div>
    </>
  );
};

export default Header;