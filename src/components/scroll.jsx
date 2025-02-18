import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show the button when the user scrolls down
  const checkScrollPosition = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Add event listener for scroll
  useEffect(() => {
    window.addEventListener('scroll', checkScrollPosition);

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
    };
  }, []);

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        style={styles.scrollButton}
      >
    <FaArrowUp />
      </button>
    )
  );
};

const styles = {
  scrollButton: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '15px',
    fontSize: '18px',
    cursor: 'pointer',
    zIndex: 1000,
  },
};

export default ScrollToTopButton;
