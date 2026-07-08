import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaChevronDown, FaArrowUp as FaArrowUpAlt } from 'react-icons/fa';
import styles from './UnifiedScroll.module.css';

const UnifiedScroll = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIndicators, setShowIndicators] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDynamicHeading, setShowDynamicHeading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const rafIdRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const scrollTimeoutRef = useRef(null);

  // Define all pages/sections with their labels
  const sections = [
    { path: '/', label: 'Home', number: '01' },
    { path: '/about', label: 'About', number: '02' },
    { path: '/projects', label: 'Projects', number: '03' },
    { path: '/skills', label: 'Skills', number: '04' },
    { path: '/contact', label: 'Contact', number: '05' }
  ];

  // Smooth progress spring animation
  const smoothProgress = useSpring(0, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  // Get current page index
  const currentIndex = sections.findIndex(section => section.path === location.pathname);
  const nextSection = sections[currentIndex + 1];
  const prevSection = sections[currentIndex - 1];

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const winScroll = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate scroll progress
      const height = documentHeight - windowHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      
      smoothProgress.set(scrolled / 100);
      
      // Show/hide indicators based on scroll position
      setShowIndicators(winScroll > 100);
      setShowScrollTop(winScroll > 400);
      
      // Show dynamic heading when scrolling
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      setShowDynamicHeading(true);
      scrollTimeoutRef.current = setTimeout(() => {
        setShowDynamicHeading(false);
      }, 1000);

      lastScrollYRef.current = winScroll;
    });
  }, [smoothProgress]);

  // Navigation with smooth scroll
  const handleNavigation = useCallback((path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate, location.pathname]);

  // Scroll to next section
  const handleNextSection = useCallback(() => {
    if (nextSection) {
      handleNavigation(nextSection.path);
    }
  }, [nextSection, handleNavigation]);

  // Scroll to previous section
  const handlePrevSection = useCallback(() => {
    if (prevSection) {
      handleNavigation(prevSection.path);
    }
  }, [prevSection, handleNavigation]);

  // Handle wheel events for page navigation
  const handleWheel = useCallback((e) => {
    // Only trigger navigation at top or bottom of page
    const atTop = window.scrollY < 20;
    const atBottom = (document.documentElement.scrollHeight - window.innerHeight - window.scrollY) < 20;

    if (e.deltaY > 0 && atBottom && nextSection) {
      e.preventDefault();
      handleNavigation(nextSection.path);
    } else if (e.deltaY < 0 && atTop && prevSection) {
      e.preventDefault();
      handleNavigation(prevSection.path);
    }
  }, [nextSection, prevSection, handleNavigation]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, handleWheel]);

  // Update active section based on current path
  useEffect(() => {
    setActiveSection(currentIndex);
  }, [currentIndex]);

  // Don't render on pages without next/prev
  if (sections.length === 0) return null;

  return (
    <>
      {/* Progress Bar */}
      <motion.div 
        className={styles.scrollProgressBar}
        style={{ scaleX: smoothProgress }}
      >
        <div className={styles.scrollProgressFill} />
      </motion.div>

      {/* Dynamic Heading - Shows current page title when scrolling */}
      <div className={`${styles.dynamicHeading} ${showDynamicHeading ? styles.visible : ''}`}>
        <h2>{sections[currentIndex]?.label || 'Home'}</h2>
      </div>

      {/* Page Progress Indicator */}
      <div className={styles.pageProgress}>
        <span className={styles.currentPageNum}>{sections[currentIndex]?.number || '01'}</span>
        <span className={styles.totalPages}>/{sections.length}</span>
      </div>

      {/* Section Dots Navigation */}
      <div className={styles.sectionsIndicator}>
        {sections.map((section, index) => (
          <div
            key={section.path}
            className={`${styles.sectionDot} ${index === activeSection ? styles.active : ''}`}
            onClick={() => handleNavigation(section.path)}
            title={section.label}
          >
            <span className={styles.sectionLabel}>{section.label}</span>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <AnimatePresence>
        {showIndicators && (
          <div className={styles.scrollNav}>
            {prevSection && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`${styles.scrollNavBtn} ${styles.scrollNavUp}`}
                onClick={handlePrevSection}
                aria-label={`Go to ${prevSection.label}`}
              >
                <FaArrowUp />
                <span>{prevSection.label}</span>
              </motion.button>
            )}
            
            {nextSection && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`${styles.scrollNavBtn} ${styles.scrollNavDown}`}
                onClick={handleNextSection}
                aria-label={`Go to ${nextSection.label}`}
              >
                <span>{nextSection.label}</span>
                <FaArrowDown />
              </motion.button>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Scroll Hint - Only show at top */}
      <AnimatePresence>
        {!showIndicators && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={styles.scrollHint}
          >
            <span>Scroll to explore</span>
            <FaChevronDown />
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
            <FaArrowUpAlt />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default UnifiedScroll;