import React from 'react';
import { motion } from 'framer-motion';
import {
  FaUser, FaUniversity, FaLaptopCode, FaRocket,
  FaLightbulb
} from 'react-icons/fa';
import styles from './About.module.css';
import profilePic from '../assets/images/8mg/about-pro.png';

const About = () => {z
  return ( 
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.grid}>
            {/* Left: Profile image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
              className={styles.imageContainer}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={profilePic}
                  alt="Daniel - Software Engineering Student & Full-Stack Developer"
                  className={styles.image}
                />
              </div>
            </motion.div>

            {/* Right: Centered text content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={styles.content}
            >
              <div className={styles.badge}>
                <FaUser />
                <span>About Me</span>
              </div>
              
              <h1 className={styles.title}>
                Passionate <span className="highlight">Software Engineer</span> & Problem Solver
              </h1>
              
              <p className={styles.subtitle}>
                I'm a strong foundation in full-stack development, I specialize in building scalable, 
                user-centric web applications that blend creativity with technical excellence.
                My career goal is to become a senior software engineer at an innovative company,
                perhaps in the fintech or edtech space, while contributing to open-source projects
                that empower underrepresented communities in Africa.
                I'm always eager to connect, collaborate, or discuss ideas.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Personal Info */}
      <section className={styles.personalInfo}>
        <div className="container">
          <div className={styles.infoGrid}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={styles.infoCard}
            >
              <div className={styles.infoIcon}>
                <FaUniversity />
              </div>
              <h3>Injibara University</h3>
              <p>Bachelor of Science in Software Engineering</p>
              <span className={styles.infoDetail}>2022 - 2026 (Expected)</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={styles.infoCard}
            >
              <div className={styles.infoIcon}>
                <FaLaptopCode />
              </div>
              <h3>Full Stack Focus</h3>
              <p>React, Node.js, Python, Databases</p>
              <span className={styles.infoDetail}>3+ Years Experience</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={styles.infoCard}
            >
              <div className={styles.infoIcon}>
                <FaRocket />
              </div>
              <h3>Career Goals</h3>
              <p>Senior Full Stack Developer</p>
              <span className={styles.infoDetail}>Tech Lead & Mentor</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className={styles.philosophy}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={styles.philosophyContent}
          >
            <div className={styles.philosophyIcon}>
              <FaLightbulb />
            </div>
            <h2 className={styles.philosophyTitle}>My Development Philosophy</h2>
            <p className={styles.philosophyText}>
              I believe in writing clean, maintainable code that not only solves problems 
              but also creates delightful user experiences. Every line of code should have 
              a purpose, and every feature should provide value. I'm passionate about 
              continuous learning and believe that the best developers are those who 
              never stop growing.
            </p>
            <div className={styles.principles}>
              <div className={styles.principle}>
                <span>01</span>
                <h4>User-Centric Design</h4>
                <p>Always prioritize the end-user experience</p>
              </div>
              <div className={styles.principle}>
                <span>02</span>
                <h4>Clean Code</h4>
                <p>Write code that others can read and maintain</p>
              </div>
              <div className={styles.principle}>
                <span>03</span>
                <h4>Continuous Learning</h4>
                <p>Stay updated with emerging technologies</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}; 

export default About;
