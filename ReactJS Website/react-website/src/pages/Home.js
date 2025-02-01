import React, { useEffect, useRef } from 'react';
import { Container, Box, Typography, Grid, Paper, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlayArrow, AutoAwesome, Extension, Speed, EmojiEvents, Star, Timer, CheckCircle } from '@mui/icons-material';

const MosaicBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const createPoints = () => {
      pointsRef.current = [];
      const gridSize = window.innerWidth < 768 ? 40 : 50;
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          pointsRef.current.push({
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: window.innerWidth < 768 ? 2 : 3,
            speed: 0.1,
            opacity: 0.15
          });
        }
      }
    };

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createPoints();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      pointsRef.current.forEach(point => {
        const dx = mouseRef.current.x - point.x;
        const dy = mouseRef.current.y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = window.innerWidth < 768 ? 120 : 150;

        if (distance < maxDistance && mouseRef.current.x !== 0) {
          const angle = Math.atan2(dy, dx);
          const force = (maxDistance - distance) / maxDistance;
          const targetX = point.x - Math.cos(angle) * force * 20;
          const targetY = point.y - Math.sin(angle) * force * 20;
          
          point.x += (targetX - point.x) * point.speed;
          point.y += (targetY - point.y) * point.speed;
          point.size = (window.innerWidth < 768 ? 2 : 3) + force * 3;
          point.opacity = 0.15 + force * 0.4;
        } else {
          point.x += (point.baseX - point.x) * point.speed;
          point.y += (point.baseY - point.y) * point.speed;
          point.size = window.innerWidth < 768 ? 2 : 3;
          point.opacity = 0.15;
        }

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 41, 59, ${point.opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    createPoints();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        touchAction: 'none'
      }}
    />
  );
};

const SlideSection = ({ children, index }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [200, 0, -200]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.8, 1, 0.8]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    ['-5deg', '5deg']
  );

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        scale,
        y,
        rotate,
        width: '100%',
        perspective: 1000
      }}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 1,
        delay: index * 0.3,
        type: "spring",
        stiffness: 50
      }}
    >
      {children}
    </motion.div>
  );
};

const getDailyChallenge = () => {
  const challenges = [
    {
      title: "Vitesse Éclair",
      description: "Atteignez 100 points en moins de 5 minutes",
      reward: "500 points bonus + Skin Néon",
      icon: <Timer sx={{ fontSize: 40, color: '#FFD700' }} />,
      points: 500,
      unlockable: 'néon'
    },
    {
      title: "Maître du Snake",
      description: "Atteignez le niveau 5 sans perdre",
      reward: "1000 points bonus + Skin Rétro",
      icon: <Star sx={{ fontSize: 40, color: '#FFD700' }} />,
      points: 1000,
      unlockable: 'rétro'
    },
    {
      title: "Collectionneur",
      description: "Collectez 30 fruits dans une seule partie",
      reward: "750 points bonus + Skin Pastel",
      icon: <Extension sx={{ fontSize: 40, color: '#FFD700' }} />,
      points: 750,
      unlockable: 'pastel'
    }
  ];
  
  // Utilise la date du jour pour sélectionner un défi
  const today = new Date();
  const index = (today.getFullYear() + today.getMonth() + today.getDate()) % challenges.length;
  return challenges[index];
};

const DailyChallenge = () => (
  <Box
    sx={{
      p: 3,
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(0, 0, 0, 0.1)',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#000000' }}>
      Défi du Jour
    </Typography>

    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          width: '80px',
          height: '80px',
          backgroundColor: '#F0F9FF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          mb: 2
        }}
      >
        <Extension sx={{ fontSize: 40, color: '#000000' }} />
      </Box>

      <Typography variant="h5" sx={{ color: '#000000', fontWeight: 600, mb: 1 }}>
        Collectionneur
      </Typography>

      <Typography sx={{ color: '#666666', mb: 2 }}>
        Collectez 30 fruits dans une seule partie
      </Typography>

      <Box
        sx={{
          p: 2,
          backgroundColor: '#F0F9FF',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}
      >
        <Star sx={{ color: '#000000' }} />
        <Typography sx={{ color: '#000000', fontWeight: 500 }}>
          750 points bonus + Skin Pastel
        </Typography>
      </Box>
    </Box>
  </Box>
);

const Footer = () => (
  <Box
    sx={{
      position: 'fixed',
      bottom: 5,
      right: 5,
      padding: '5px 10px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      color: '#fff',
      borderRadius: '20px',
      fontSize: '12px',
      zIndex: 99999
    }}
  >
    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
      ModernSNAKE by{' '}
      <Link
        href="https://github.com/glownydev"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          textDecoration: 'none',
          transition: 'opacity 0.3s ease',
          '&:hover': {
            opacity: 0.4,
            textDecoration: 'none',
            color: 'rgba(255, 255, 255, 0.7)'
          },
          '&:visited': {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        }}
      >
        glownydev
      </Link>
    </Typography>
  </Box>
);

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 32, color: '#1E293B' }} />,
      title: "Design Moderne",
      description: "Redécouvrez le jeu Snake avec des visuels élégants et des animations fluides."
    },
    {
      icon: <Extension sx={{ fontSize: 32, color: '#1E293B' }} />,
      title: "Modes Personnalisés",
      description: "Choisissez parmi différents modes de jeu et personnalisez l'apparence de votre serpent."
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 32, color: '#1E293B' }} />,
      title: "Contrôles Réactifs",
      description: "Profitez de contrôles précis et fluides optimisés pour ordinateur et mobile."
    },
    {
      icon: <Extension sx={{ fontSize: 32, color: '#1E293B' }} />,
      title: "Défis Progressifs",
      description: "Affrontez une difficulté croissante avec des obstacles dynamiques et des bonus."
    }
  ];

  const slides = [
    {
      title: "Snake Nouvelle Génération",
      description: "Découvrez le jeu Snake comme jamais auparavant avec notre interprétation moderne du classique. Des animations fluides, des contrôles réactifs et des visuels époustouflants créent une expérience de jeu immersive.",
      icon: <Speed sx={{ fontSize: 60, color: '#1E293B' }} />,
      image: require("../screenshots/snake-game.png")
    },
    {
      title: "Compétition & Réussite",
      description: "Relevez des défis avec des niveaux de difficulté progressifs, débloquez des succès et affrontez des joueurs du monde entier. Chaque partie apporte de nouveaux défis et des opportunités de vous améliorer.",
      icon: <EmojiEvents sx={{ fontSize: 60, color: '#1E293B' }} />,
      image: require("../screenshots/snake-menu.png")
    },
    {
      title: "Fonctionnalités Modernes",
      description: "Profitez des power-ups, des capacités spéciales et des différents modes de jeu qui ajoutent des rebondissements passionnants au gameplay classique. Personnalisez l'apparence de votre serpent et débloquez de nouvelles fonctionnalités.",
      icon: <AutoAwesome sx={{ fontSize: 60, color: '#1E293B' }} />,
      image: require("../screenshots/snake-pause.png")
    }
  ];

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    backgroundColor: '#F8FAFC',
    padding: '2rem',
    transition: 'all 0.6s ease-in-out',
    filter: 'grayscale(100%)',
    '&:hover': {
      transform: 'scale(1.05)',
      filter: 'grayscale(0%)'
    }
  };

  const dailyChallenge = getDailyChallenge();

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <MosaicBackground />
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="h1"
              align="center"
              sx={{
                mb: 3,
                color: '#1E293B',
                maxWidth: '800px',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
              }}
            >
              Une Version Moderne d'un Jeu Classique
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              sx={{
                mb: 6,
                maxWidth: '600px',
                mx: 'auto',
                fontWeight: 400,
                color: '#64748B'
              }}
            >
              Redécouvrez Snake avec des graphismes améliorés, des contrôles fluides et de nouvelles fonctionnalités passionnantes
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              component={Link}
              to="/play"
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              sx={{
                mb: 8,
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#1E293B',
                border: '2px solid #1E293B',
                '&:hover': {
                  backgroundColor: 'rgba(30, 41, 59, 0.05)',
                  border: '2px solid #0F172A',
                }
              }}
            >
              Commencer à Jouer
            </Button>
          </motion.div>

          <Box sx={{ my: { xs: 8, md: 16 } }}>
            {slides.map((slide, index) => (
              <SlideSection key={index} index={index}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 4, md: 8 },
                    mb: { xs: 8, md: 16 },
                    mx: 'auto',
                    maxWidth: '1400px',
                    height: { md: '600px' }
                  }}
                >
                  <Box
                    sx={{
                      flex: '1',
                      position: 'relative',
                      minHeight: { xs: '300px', md: '100%' },
                      borderRadius: '32px',
                      overflow: 'hidden',
                      boxShadow: '0 16px 48px rgba(30, 41, 59, 0.12)',
                    }}
                  >
                    <Box
                      component="img"
                      src={slide.image}
                      alt={slide.title}
                      sx={imageStyle}
                    />
                  </Box>

                  <Box
                    sx={{
                      flex: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      p: { xs: 4, md: 6 },
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '32px',
                      border: '1px solid rgba(30, 41, 59, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      maxHeight: { xs: 'auto', md: '600px' }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        mb: 4
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          background: 'rgba(30, 41, 59, 0.05)',
                          backdropFilter: 'blur(10px)',
                          transform: 'rotate(-5deg)',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'rotate(0deg) scale(1.1)',
                          }
                        }}
                      >
                        {slide.icon}
                      </Box>
                      <Typography
                        variant="h2"
                        sx={{
                          color: '#1E293B',
                          fontWeight: 800,
                          fontSize: { xs: '2rem', md: '2.5rem' },
                          lineHeight: 1.2
                        }}
                      >
                        {slide.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748B',
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                        lineHeight: 1.8
                      }}
                    >
                      {slide.description}
                    </Typography>
                  </Box>
                </Box>
              </SlideSection>
            ))}
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
                <motion.div 
                  variants={itemVariants}
                  custom={index}
                >
                  <Paper
                    sx={{
                      p: 4,
                      height: '100%',
                      background: '#FFFFFF',
                      border: '1px solid rgba(30, 41, 59, 0.1)',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 8px 32px rgba(30, 41, 59, 0.1)',
                        borderColor: 'rgba(30, 41, 59, 0.2)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ 
                        color: '#1E293B',
                        fontWeight: 600,
                        fontSize: { xs: '1.25rem', md: '1.5rem' }
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748B',
                        lineHeight: 1.7,
                        fontSize: { xs: '1rem', md: '1.1rem' }
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Home; 