import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowUp, FaArrowDown, FaChevronDown } from 'react-icons/fa';
import styles from './ScrollNavigationIndicators.module.css';

const ScrollNavigationIndicators = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showIndicators, setShowIndicators] = useState(false);
  const rafIdRef = useRef(null);

  const routes = [
    { path: '/', label: 'Home', number: '01' },
    { path: '/about', label: 'About', number: '02' },
    { path: '/projects', label: 'Projects', number: '03' },
    { path: '/skills', label: 'Skills', number: '04' },
    { path: '/contact', label: 'Contact', number: '05' }
  ];

  const currentIndex = routes.findIndex(route => route.path === location.pathname);
  const nextRoute = routes[currentIndex + 1];
  const prevRoute = routes[currentIndex - 1];

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        setShowIndicators(window.scrollY > 200);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (!prevRoute && !nextRoute) return null;

  return (
    <>
      {/* Page Number Indicator */}
      <div className={styles.pageNumber}>
        <span className={styles.currentNumber}>{routes[currentIndex]?.number}</span>
        <span className={styles.totalPages}>/{routes.length}</span>
      </div>

      {/* Navigation Indicators */}
      <div className={styles.indicators}>
        {prevRoute && showIndicators && (
          <button
            className={styles.prev}
            onClick={() => handleNavigation(prevRoute.path)}
            aria-label={`Go to ${prevRoute.label}`}
          >
            <FaArrowUp />
            <span>{prevRoute.label}</span>
          </button>
        )}
        
        {nextRoute && showIndicators && (
          <button
            className={styles.next}
            onClick={() => handleNavigation(nextRoute.path)}
            aria-label={`Go to ${nextRoute.label}`}
          >
            <span>{nextRoute.label}</span>
            <FaArrowDown />
          </button>
        )}
      </div>

      {/* Scroll Hint - Only show at top */}
      {!showIndicators && (
        <div className={styles.scrollHint}>
          <span>Scroll to explore</span>
          <FaChevronDown />
        </div>
      )}
    </>
  );
};

export default ScrollNavigationIndicators;