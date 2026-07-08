import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SkillIcon from '../components/common/SkillIcon';
import {
  FaCode,
  FaServer,
  FaDatabase,
  FaMobileAlt,
  FaCloud,
  FaToolbox,
  FaLayerGroup,
  FaProjectDiagram,
  FaUsers,
  FaJava,
  FaCalendarAlt
} from 'react-icons/fa';
import {  
  SiReact,
  SiNodedotjs,
  SiTypescript,
  SiPython,
  SiCplusplus,
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiGit,
  SiJira,
  SiFigma,
  SiTailwindcss,
  SiNextdotjs,
  SiExpress, 
  SiRedux
} from 'react-icons/si';
import styles from './Skills.module.css';

const Skills = () => {
 
  const [activeSkill, setActiveSkill] = useState(null);

  const categories = [
    { id: 'all', label: 'All Skills', icon: <FaLayerGroup />, color: '#64ffda' },
    { id: 'frontend', label: 'Frontend', icon: <SiReact />, color: '#61DAFB' },
    { id: 'backend', label: 'Backend', icon: <FaServer />, color: '#339933' },
    { id: 'database', label: 'Database', icon: <FaDatabase />, color: '#47A248' },
    { id: 'mobile', label: 'Mobile', icon: <FaMobileAlt />, color: '#34B7F1' },
    { id: 'devops', label: 'DevOps', icon: <FaCloud />, color: '#2496ED' },
    { id: 'tools', label: 'Tools', icon: <FaToolbox />, color: '#F0DB4F' },
    { id: 'design', label: 'Design', icon: <SiFigma />, color: '#F24E1E' },
  ];

  const allSkills = useMemo(() => [
    // Frontend
    { name: 'React', category: 'frontend', proficiency: 95, years: 3, projects: 15, icon: <SiReact />, color: '#61DAFB', description: 'Building dynamic user interfaces with React hooks, context API, and modern patterns.' },
    { name: 'Next.js', category: 'frontend', proficiency: 85, years: 2, projects: 2, icon: <SiNextdotjs />, color: '#000000', description: 'Server-side rendering and static site generation for React applications.' },
    { name: 'TypeScript', category: 'frontend', proficiency: 90, years: 2, projects: 2, icon: <SiTypescript />, color: '#3178C6', description: 'Type-safe JavaScript development for scalable applications.' },
    { name: 'JavaScript', category: 'frontend', proficiency: 95, years: 4, projects: 5, icon: <FaCode />, color: '#F7DF1E', description: 'Expert in ES6+ features, asynchronous programming, and modern JavaScript patterns.' },
    { name: 'HTML/CSS', category: 'frontend', proficiency: 98, years: 5, projects: 10, icon: <FaLayerGroup />, color: '#E34F26', description: 'Semantic HTML5, advanced CSS3, Flexbox, Grid, and responsive design.' },
    { name: 'Tailwind CSS', category: 'frontend', proficiency: 88, years: 2, projects: 10, icon: <SiTailwindcss />, color: '#38B2AC', description: 'Utility-first CSS framework for rapid UI development.' },
    // { name: 'Redux', category: 'frontend', proficiency: 85, years: 2, projects: 2, icon: <SiRedux />, color: '#764ABC', description: 'State management for complex React applications.' },
    
    // Backend
    { name: 'Node.js', category: 'backend', proficiency: 92, years: 3, projects: 8, icon: <SiNodedotjs />, color: '#339933', description: 'Building scalable server-side applications and APIs.' },
    { name: 'Express', category: 'backend', proficiency: 90, years: 3, projects: 5, icon: <SiExpress />, color: '#000000', description: 'Minimalist web framework for Node.js applications.' },
    { name: 'Python', category: 'backend', proficiency: 80, years: 2, projects: 1, icon: <SiPython />, color: '#3776AB', description: 'Backend development, scripting, and data analysis.' },
    { name: 'Java', category: 'backend', proficiency: 75, years: 3, projects: 8, icon: <FaJava />, color: '#007396', description: 'Object-oriented programming and enterprise applications.' },
    { name: 'C++', category: 'backend', proficiency: 70, years: 2, projects: 1, icon: <SiCplusplus />, color: '#00599C', description: 'System programming and performance-critical applications.' },
    
    { name: 'Java', category: 'mobile', proficiency: 75, years: 3, projects: 8, icon: <FaJava />, color: '#007396', description: 'Object-oriented programming and enterprise applications.' },

    // Database
    { name: 'MySQL', category: 'database', proficiency: 88, years: 3, projects: 12, icon: <SiMysql />, color: '#4479A1', description: 'Relational database design, optimization, and administration.' },
    { name: 'PostgreSQL', category: 'database', proficiency: 85, years: 2, projects: 9, icon: <SiPostgresql />, color: '#336791', description: 'Advanced SQL, transactions, and complex queries.' },
    { name: 'MongoDB', category: 'database', proficiency: 82, years: 2, projects: 7, icon: <SiMongodb />, color: '#47A248', description: 'NoSQL database for flexible document storage.' },
    
    // DevOps & Tools
    { name: 'Docker', category: 'devops', proficiency: 78, years: 1, projects: 2, icon: <SiDocker />, color: '#2496ED', description: 'Containerization and deployment automation.' },
    { name: 'Git', category: 'tools', proficiency: 95, years: 4, projects: 30, icon: <SiGit />, color: '#F05032', description: 'Version control, branching strategies, and collaboration.' },
    { name: 'Jira', category: 'tools', proficiency: 85, years: 2, projects: 15, icon: <SiJira />, color: '#0052CC', description: 'Project management and agile development workflows.' },
    
    // Design
    { name: 'Figma', category: 'design', proficiency: 80, years: 2, projects: 8, icon: <SiFigma />, color: '#F24E1E', description: 'UI/UX design, prototyping, and design systems.' },
  ], []);

  const categoryStats = useMemo(() => {
    const stats = {};
    categories.forEach(cat => {
      if (cat.id !== 'all') {
        const categorySkills = allSkills.filter(skill => skill.category === cat.id);
        stats[cat.id] = {
          count: categorySkills.length,
          avgProficiency: Math.round(categorySkills.reduce((sum, skill) => sum + skill.proficiency, 0) / categorySkills.length) || 0,
          totalProjects: categorySkills.reduce((sum, skill) => sum + skill.projects, 0),
        };
      }
    });
    return stats;
  }, [allSkills, categories]);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroContent}
          >
            <div className="hero-badge">
              <FaCode />
              <span>Technical Expertise</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              My <span className="highlight">Technology</span> Toolkit
            </h1>
            
            <p className={styles.heroSubtitle}>
              A comprehensive overview of my technical skills, proficiency levels, 
              and hands-on experience with modern technologies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className={styles.breakdown}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Skill Distribution</h2>
            <p className={styles.sectionDescription}>
              Breakdown of my skills across different technology categories
            </p>
          </div>

          <div className={styles.breakdownGrid}>
            {categories
              .filter(cat => cat.id !== 'all')
              .map((category, index) => {
                const stats = categoryStats[category.id] || { count: 0, avgProficiency: 0, totalProjects: 0 };
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={styles.breakdownCard}
                    style={{ '--category-color': category.color }}
                  >
                    <div className={styles.breakdownHeader}>
                      <div className={styles.categoryIcon} style={{ color: category.color }}>
                        {category.icon}
                      </div>
                      <div className={styles.categoryInfo}>
                        <h3 className={styles.categoryName}>{category.label}</h3>
                        <span className={styles.skillCount}>{stats.count} skills</span>
                      </div>
                    </div>
                    
                    <div className={styles.breakdownProgress}>
                      <div className={styles.progressInfo}>
                        <span className={styles.progressLabel}>Average Proficiency</span>
                        <span className={styles.progressValue}>{stats.avgProficiency}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <motion.div
                          className={styles.progressFill}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stats.avgProficiency}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                    
                    <div className={styles.breakdownStats}>
                      <div className={styles.stat}>
                        <FaProjectDiagram />
                        <div>
                          <span className={styles.statValue}>{stats.totalProjects}</span>
                          <span className={styles.statLabel}>Projects</span>
                        </div>
                      </div>
                      <div className={styles.stat}>
                        <FaCalendarAlt />
                        <div>
                          <span className={styles.statValue}>
                            {stats.count > 0 ? Math.round(allSkills
                              .filter(s => s.category === category.id)
                              .reduce((sum, s) => sum + s.years, 0) / stats.count * 10) / 10 : 0}
                          </span>
                          <span className={styles.statLabel}>Avg Years</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.breakdownSkills}>
                      {allSkills
                        .filter(skill => skill.category === category.id)
                        .slice(0, 3)
                        .map(skill => (
                          <span key={skill.name} className={styles.skillTag}>
                            {skill.name}
                          </span>
                        ))}
                      {stats.count > 3 && (
                        <span className={styles.moreSkills}>+{stats.count - 3} more</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Interactive Skill Icons */}
      <section className={styles.interactive}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Interactive Skill Visualization</h2>
            <p className={styles.sectionDescription}>
              Click on any skill icon to view detailed information
            </p>
          </div>

          <div className={styles.interactiveGrid}>
            {allSkills.slice(0, 12).map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={styles.interactiveItem}
                onClick={() => setActiveSkill(skill)}
              >
                <SkillIcon
                  skill={skill.name}
                  level={skill.proficiency}
                  category={skill.category}
                  size="medium"
                  interactive={true}
                />
                <span className={styles.interactiveName}>{skill.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Detail Modal */}
      {activeSkill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.modalOverlay}
          onClick={() => setActiveSkill(null)}
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
                <div className={styles.modalIcon} style={{ color: activeSkill.color }}>
                  {activeSkill.icon}
                </div>
                <div>
                  <h2 className={styles.modalTitle}>{activeSkill.name}</h2>
                  <span className={styles.modalCategory}>{activeSkill.category}</span>
                </div>
              </div>
              
              <button
                className={styles.modalClose}
                onClick={() => setActiveSkill(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.skillOverview}>
                <p className={styles.overviewDescription}>{activeSkill.description}</p>
                
                <div className={styles.overviewStats}>
                  <div className={styles.overviewStat}>
                    <div className={styles.statValue}>{activeSkill.proficiency}%</div>
                    <div className={styles.statLabel}>Proficiency</div>
                  </div>
                  <div className={styles.overviewStat}>
                    <div className={styles.statValue}>{activeSkill.years}</div>
                    <div className={styles.statLabel}>Years Experience</div>
                  </div>
                  <div className={styles.overviewStat}>
                    <div className={styles.statValue}>{activeSkill.projects}</div>
                    <div className={styles.statLabel}>Projects</div>
                  </div>
                </div>
              </div>

              <div className={styles.skillDetails}>
                <h3 className={styles.detailsTitle}>Related Projects</h3>
                <div className={styles.relatedProjects}>
                  {Array.from({ length: Math.min(3, activeSkill.projects) }).map((_, index) => (
                    <div key={index} className={styles.projectChip}>
                      Project {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.ctaContent}
          >
            <h2 className={styles.ctaTitle}>Ready to Leverage These Skills?</h2>
            <p className={styles.ctaDescription}>
              I'm always excited to apply my technical expertise to new challenges 
              and innovative projects.
            </p>
            <div className={styles.ctaActions}>
              <a href="/projects" className="btn btn-primary">
                View My Projects
              </a>
              <a href="/contact" className="btn btn-outline">
                Start a Conversation
              </a>
            </div>
          </motion.div>
        </div>  
      </section>
    </div>
  );
};

export default Skills;