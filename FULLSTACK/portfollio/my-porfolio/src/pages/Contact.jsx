import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaUser,
  FaHeading,
  FaComment,
  FaWhatsapp,
  FaTelegram,
  FaClock,
  FaGlobe
} from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import styles from './Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeContact, setActiveContact] = useState('email');

  const contactMethods = [
    {
      id: 'email',
      label: 'Email',
      icon: <FaEnvelope />,
      value: 'daniel ayen21 12@gmai l.com',
      color: '#EA4335',
      action: 'mailto:danielayen2112@gmail.com'
    },
    {
      id: 'phone',
      label: 'Phone',
      icon: <FaPhone />,
      value: '+251 938 803 929',
      color: '#25D366',
      action: 'tel:+251938803929'
    },
    {
      id: 'location',
      label: 'Location',
      icon: <FaMapMarkerAlt />,
      value: 'Injibara University, Ethiopia',
      color: '#4285F4',
      action: 'https://maps.google.com'
    },
    {
      id: 'hours',
      label: 'Response Time',
      icon: <FaClock />,
      value: 'Within 24 hours',
      color: '#FF6B6B'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Thank you! Your message has been sent successfully.'
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (err) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Sorry, there was an error sending your message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactClick = (contact) => {
    if (contact.action) {
      if (contact.id === 'email') {
        window.location.href = contact.action;
      } else {
        window.open(contact.action, '_blank');
      }
    }
    setActiveContact(contact.id);
  };

  useEffect(() => {
    if (formStatus.submitted) {
      const timer = setTimeout(() => {
        setFormStatus({
          submitted: false,
          success: false,
          message: ''
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formStatus.submitted]);

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
              <FaEnvelope />
              <span>Get In Touch</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Let's <span className="highlight">Connect</span> & Create Together
            </h1>
            
            <p className={styles.heroSubtitle}>
              Have a project in mind? Want to collaborate? Or just want to say hello?
              I'd love to hear from you!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className={styles.methods}>
        <div className="container">
          <div className={styles.methodsGrid}>
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${styles.methodCard} ${activeContact === method.id ? styles.active : ''}`}
                onClick={() => handleContactClick(method)}
                style={{ '--method-color': method.color }}
              >
                <div className={styles.methodIcon}>
                  {method.icon}
                </div>
                <div className={styles.methodContent}>
                  <h3 className={styles.methodLabel}>{method.label}</h3>
                  <p className={styles.methodValue}>{method.value}</p>
                </div>
                {method.action && (
                  <div className={styles.methodAction}>
                    {method.id === 'email' ? 'Send Email' : 'Open'}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={styles.formSection}
            >
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Send Me a Message</h2>
                <p className={styles.sectionDescription}>
                  Fill out the form below and I'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    <FaUser /> Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    <FaEnvelope /> Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.formLabel}>
                    <FaHeading /> Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    <FaComment /> Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formTextarea}
                    placeholder="Tell me about your project or inquiry..."
                    rows="6"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner}></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Message
                    </>
                  )}
                </motion.button>

                {formStatus.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${styles.formStatus} ${formStatus.success ? styles.success : styles.error}`}
                  >
                    {formStatus.success ? <FaCheckCircle /> : <FaExclamationCircle />}
                    <span>{formStatus.message}</span>
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={styles.infoSection}
            >
              <div className={styles.infoCard}>
                <div className={styles.infoHeader}>
                  <h3 className={styles.infoTitle}>Quick Information</h3>
                  <p className={styles.infoSubtitle}>
                    Here's how you can reach me directly
                  </p>
                </div>

                <div className={styles.infoContent}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FaGlobe />
                    </div>
                    <div>
                      <h4>Based In</h4>
                      <p>Injibara University, Ethiopia</p>
                      <span className={styles.infoNote}>Available for remote work worldwide</span>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FaClock />
                    </div>
                    <div>
                      <h4>Response Time</h4>
                      <p>Usually within 24 hours</p>
                      <span className={styles.infoNote}>Monday - Friday, 9AM - 6PM EAT</span>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <SiGmail />
                    </div>
                    <div>
                      <h4>Preferred Contact</h4>
                      <p>Email for formal inquiries</p>
                      <span className={styles.infoNote}>Quickest response via email</span>
                    </div>
                  </div>
                </div>

                <div className={styles.infoDivider}></div>

                {/* Direct Contact Buttons */} 
                <div className={styles.directContact}>
                  <a
                    href="https://wa.me/251938803929"
                    target="_blank"  
                    rel="noopener noreferrer"
                    className={`${styles.directBtn} ${styles.whatsapp}`}
                  >
                    <FaWhatsapp />
                    Chat on WhatsApp
                  </a>
                  <a
                    href="https://t.me/username"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.directBtn} ${styles.telegram}`}
                  >
                    <FaTelegram />
                    Message on Telegram
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.map}>
        <div className="container">
          <div className={styles.mapContainer}>
            <div className={styles.mapPlaceholder}>
              <div className={styles.mapOverlay}>
                <h3>Based in Ethiopia</h3>
                <p>Injibara University, Amhara Region</p>
                <span className={styles.mapNote}>Available for remote work worldwide</span>
              </div>
              <div className={styles.mapFrame}>
                <div className={styles.mapMock}>
                  <div className={styles.mapMarker}>
                    <FaMapMarkerAlt />
                  </div>
                  <h4>Injibara University</h4>
                  <p>Software Engineering Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};  

export default Contact;
