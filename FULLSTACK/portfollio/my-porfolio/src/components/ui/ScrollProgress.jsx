import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import styles from './ScrollProgress.module.css';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafIdRef = useRef(null);
  
  const smoothProgress = useSpring(0, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const winScroll = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        
        setScrollProgress(scrolled);
        smoothProgress.set(scrolled / 100);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [smoothProgress]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Progress Bar */}
      <motion.div 
        className={styles.bar}
        style={{ scaleX: smoothProgress }}
      />

      {/* Progress Circle */}
      <div className={styles.circle} onClick={scrollToTop}>
        <svg width="50" height="50" viewBox="0 0 50 50">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64ffda" />
              <stop offset="100%" stopColor="#00d2ff" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="22"
            fill="none"
            stroke="rgba(100, 255, 218, 0.1)"
            strokeWidth="3"
          />
          <circle
            cx="25"
            cy="25"
            r="22"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 22}`}
            strokeDashoffset={`${2 * Math.PI * 22 * (1 - scrollProgress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        <span className={styles.percentage}>{Math.round(scrollProgress)}%</span>
      </div>
    </>
  );
}; 

export default ScrollProgress;