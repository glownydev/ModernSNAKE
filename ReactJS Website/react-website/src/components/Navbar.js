import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Grid3x3, CircleOutlined, HelpOutline } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ModernLogo = () => (
  <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <rect x="20" y="20" width="60" height="60" rx="12" fill="currentColor" fillOpacity="0.1" />
      <motion.path
        d="M35 50 L45 50 Q50 50 50 45 L50 35"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.path
        d="M65 50 L55 50 Q50 50 50 55 L50 65"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
      />
      <circle cx="35" cy="50" r="3" fill="currentColor" />
      <circle cx="65" cy="50" r="3" fill="currentColor" />
    </motion.g>
  </svg>
);

const MosaicDots = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      opacity: 0.5,
      pointerEvents: 'none'
    }}
  >
    {[...Array(12)].map((_, i) => (
      <Box
        key={i}
        component={motion.div}
        animate={{
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          delay: i * 0.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          bgcolor: 'primary.main',
          transform: `rotate(${i * 30}deg) translate(30px)`,
          left: `${(i % 4) * 25}%`,
          top: `${Math.floor(i / 4) * 50}%`,
        }}
      />
    ))}
  </Box>
);

const Navbar = () => {
  const location = useLocation();
  const [konami, setKonami] = useState([]);
  const [easterEggActive, setEasterEggActive] = useState(false);

  // Konami Code Easter Egg
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKeyDown = (e) => {
      setKonami(prev => {
        const newKonami = [...prev, e.key];
        if (newKonami.length > konamiCode.length) {
          newKonami.shift();
        }
        
        if (JSON.stringify(newKonami) === JSON.stringify(konamiCode)) {
          setEasterEggActive(true);
          setTimeout(() => setEasterEggActive(false), 5000);
        }
        
        return newKonami;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: { xs: '95%', sm: '90%', md: '1200px' },
        zIndex: 10,
        mt: 2,
        background: easterEggActive ? 
          'linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ff0000)' : 
          'rgba(255, 255, 255, 0.9)',
        backgroundSize: '400% 400%',
        animation: easterEggActive ? 'gradient 3s ease infinite' : 'none',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        '& .MuiButton-root': {
          minWidth: '100px',
          height: '44px',
          borderRadius: '8px',
        }
      }}
    >
        <Toolbar 
          sx={{ 
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            gap: { xs: 2, md: 4 },
            px: { xs: 2, md: 4 }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ 
              scale: easterEggActive ? [1, 1.2, 0.8, 1.1, 0.9, 1] : 1.05,
              transition: { duration: easterEggActive ? 0.8 : 0.2 }
            }}
          >
            <Typography
              component={Link}
              to="/"
              sx={{ 
                color: '#1E293B',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                fontSize: '2.25rem',
                fontWeight: 800,
                position: 'relative',
                letterSpacing: '-0.02em',
                '&:hover': {
                  color: '#0F172A',
                  '& .logo-animation': {
                    transform: 'scale(1.05) rotate(360deg)',
                  }
                }
              }}
            >
              <Box 
                className="logo-animation"
                sx={{ 
                  position: 'relative',
                  transition: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }}
              >
                <ModernLogo />
              </Box>
              <span>Snake</span>
            </Typography>
          </motion.div>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                component={Link}
                to="/guide"
                variant="outlined"
                startIcon={<HelpOutline />}
                sx={{ 
                  minWidth: 100,
                  height: 44,
                  borderWidth: '2px',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderWidth: '2px',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)'
                  }
                }}
              >
                Guide
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                component={Link}
                to="/play"
                variant="contained"
                sx={{ 
                  minWidth: 130,
                  height: 44,
                  borderWidth: '2px',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  background: easterEggActive ? 
                    'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)' : 
                    'transparent',
                  backgroundSize: '200% 200%',
                  animation: easterEggActive ? 'gradient 3s ease infinite' : 'none',
                  '&:hover': {
                    borderWidth: '2px',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)'
                  }
                }}
              >
                {location.pathname === '/play' ? 'En jeu' : 'Jouer'}
              </Button>
            </motion.div>
          </Box>
        </Toolbar>
    </Box>
  );
};

export default Navbar;

// Ajout des keyframes pour les animations
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
document.head.appendChild(style); 