import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeart, FaCoffee, FaCopyright,
  FaRegEnvelope, FaPhone, FaMapMarkerAlt
} from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Contact Info */}
        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <FaRegEnvelope />
            <a href="mailto:hello@example.com">hello@example.com</a>
          </div>
          <div className={styles.contactItem}>
            <FaPhone />
            <a href="tel:+251912345678">+251 912 345 678</a>
          </div>
          <div className={styles.contactItem}>
            <FaMapMarkerAlt />
            <span>Injibara University, Ethiopia</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <FaCopyright className={styles.copyrightIcon} />
              <span>{currentYear} DaniFolio. All rights reserved.</span>
            </div>
            
            <div className={styles.madeWith}>
              <span>Made with</span>
              <FaHeart className={styles.heartIcon} />
              <span>and</span>
              <FaCoffee className={styles.coffeeIcon} />
              <span>by Software Engineer</span>
            </div>
            
            <div className={styles.footerLinks}>
              <a href="#privacy">Privacy Policy</a>
              <span className={styles.divider}>•</span>
              <a href="#terms">Terms of Service</a>
              <span className={styles.divider}>•</span>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className={styles.floatingElements}>
        <motion.div
          className={`${styles.floatingElement} ${styles.element1}`}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {`{ }`}
        </motion.div>
        <motion.div
          className={`${styles.floatingElement} ${styles.element2}`}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        >
          {'</>'}
        </motion.div>
        <motion.div
          className={`${styles.floatingElement} ${styles.element3}`}
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          {'console.log()'}
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;