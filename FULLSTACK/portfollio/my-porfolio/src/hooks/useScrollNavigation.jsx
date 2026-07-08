import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useScrollNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTimeoutRef = useRef(null);
  const lastScrollPositionRef = useRef(0);
  const navigationCooldownRef = useRef(false);
  const rafIdRef = useRef(null);

  const routes = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Projects' },
    { path: '/skills', label: 'Skills' },
    { path: '/contact', label: 'Contact' }
  ];

  const handleNavigation = useCallback((direction) => {
    if (navigationCooldownRef.current) return;

    const currentIndex = routes.findIndex(route => route.path === location.pathname);
    
    if (direction === 'down' && currentIndex < routes.length - 1) {
      navigationCooldownRef.current = true;
      navigate(routes[currentIndex + 1].path);
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      setTimeout(() => {
        navigationCooldownRef.current = false;
      }, 800);
    }
    
    if (direction === 'up' && currentIndex > 0) {
      navigationCooldownRef.current = true;
      navigate(routes[currentIndex - 1].path);
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      setTimeout(() => {z
        navigationCooldownRef.current = false;
      }, 800);
    }
  }, [location.pathname, navigate, routes]);

  useEffect(() => {
    let isThrottled = false;
    
    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (isThrottled) return;
        isThrottled = true;
        setTimeout(() => { isThrottled = false; }, 100);

        const isScrollingDown = currentScrollY > lastScrollPositionRef.current;
        const isAtBottom = documentHeight - (currentScrollY + windowHeight) < 50;
        const isAtTop = currentScrollY < 20;

        if (isScrollingDown && isAtBottom) {
          handleNavigation('down');
        } else if (!isScrollingDown && isAtTop) {
          handleNavigation('up');
        }

        lastScrollPositionRef.current = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleNavigation]);

  return null;
};

export default useScrollNavigation;