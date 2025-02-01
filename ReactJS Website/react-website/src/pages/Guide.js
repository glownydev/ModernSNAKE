import React, { useRef, useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  KeyboardArrowUp, 
  KeyboardArrowDown, 
  KeyboardArrowLeft, 
  KeyboardArrowRight,
  TouchApp,
  Speed,
  EmojiEvents,
  Star
} from '@mui/icons-material';

const GuideSection = ({ title, children, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
  >
    <Paper
      sx={{
        p: 4,
        mb: 4,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        border: '1px solid rgba(30, 41, 59, 0.1)',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px rgba(30, 41, 59, 0.1)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            background: 'rgba(30, 41, 59, 0.05)',
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h4"
          sx={{
            color: '#1E293B',
            fontWeight: 700,
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  </motion.div>
);

const InteractiveSnake = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 15, y: 10 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const scale = window.devicePixelRatio || 1;

    canvas.width = canvas.offsetWidth * scale;
    canvas.height = canvas.offsetHeight * scale;
    ctx.scale(scale, scale);

    const cellSize = Math.min(
      canvas.offsetWidth / 20,
      canvas.offsetHeight / 20
    );

    const handleKeyPress = (e) => {
      switch(e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dessiner la grille
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.1)';
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          ctx.strokeRect(
            i * cellSize,
            j * cellSize,
            cellSize,
            cellSize
          );
        }
      }

      // Dessiner le serpent
      ctx.fillStyle = '#1E293B';
      snake.forEach(segment => {
        ctx.fillRect(
          segment.x * cellSize,
          segment.y * cellSize,
          cellSize - 2,
          cellSize - 2
        );
      });

      // Dessiner la nourriture
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(
        food.x * cellSize,
        food.y * cellSize,
        cellSize - 2,
        cellSize - 2
      );
    };

    const moveSnake = () => {
      const newSnake = [...snake];
      const head = {
        x: (newSnake[0].x + direction.x + gridSize) % gridSize,
        y: (newSnake[0].y + direction.y + gridSize) % gridSize
      };

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setFood({
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize)
        });
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    window.addEventListener('keydown', handleKeyPress);
    const moveInterval = setInterval(moveSnake, 200);
    const renderInterval = setInterval(gameLoop, 1000 / 60);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(moveInterval);
      clearInterval(renderInterval);
    };
  }, [snake, direction, food]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '500px',
        aspectRatio: '1',
        margin: '0 auto',
        mb: 4,
        border: '2px solid #1E293B',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </Box>
  );
};

const BubbleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let bubbles = [];
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const colors = ['#FFE4E1', '#E0FFE0', '#E0E0FF', '#FFFFD0'];

    const createBubble = () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 50,
      size: Math.random() * 60 + 40,
      speed: Math.random() * 1 + 0.5,
      text: '+' + Math.floor(Math.random() * 50).toString(),
      opacity: Math.random() * 0.3 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: (Math.random() - 0.5) * 0.5
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.03 && bubbles.length < 8) {
        bubbles.push(createBubble());
      }

      bubbles = bubbles.filter(bubble => {
        bubble.y -= bubble.speed;
        bubble.rotation += 0.01;
        
        ctx.save();
        ctx.translate(bubble.x, bubble.y);
        ctx.rotate(bubble.rotation);
        
        ctx.beginPath();
        ctx.fillStyle = bubble.color;
        ctx.arc(0, 0, bubble.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(0, 0, 0, ${bubble.opacity + 0.2})`;
        ctx.font = `bold ${bubble.size / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bubble.text, 0, 0);
        
        ctx.restore();
        
        return bubble.y + bubble.size > 0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6
      }}
    />
  );
};

const Guide = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8, position: 'relative', minHeight: '100vh' }}>
      <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
        <BubbleBackground />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
            Comment jouer à Snake
          </Typography>
          
          <Box className="css-sp31av" sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            p: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '2px solid rgba(0, 0, 0, 0.1)',
          }}>
            <InteractiveSnake />

            <GuideSection 
              title="Contrôles" 
              icon={<KeyboardArrowUp sx={{ fontSize: 40, color: '#1E293B' }} />}
              delay={0.2}
            >
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
                    Clavier
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <KeyboardArrowUp sx={{ color: '#64748B' }} /> Monter
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <KeyboardArrowDown sx={{ color: '#64748B' }} /> Descendre
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <KeyboardArrowLeft sx={{ color: '#64748B' }} /> Gauche
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <KeyboardArrowRight sx={{ color: '#64748B' }} /> Droite
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 600 }}>
                    Tactile
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TouchApp sx={{ color: '#64748B' }} /> 
                    Glissez dans la direction souhaitée
                  </Box>
                </Grid>
              </Grid>
            </GuideSection>

            <GuideSection 
              title="Objectifs" 
              icon={<Star sx={{ fontSize: 40, color: '#1E293B' }} />}
              delay={0.4}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Mangez les pommes pour grandir et marquer des points
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Évitez de heurter les murs et votre propre corps
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Plus vous grandissez, plus vous marquez de points
                </Typography>
              </Box>
            </GuideSection>

            <GuideSection 
              title="Power-ups" 
              icon={<Speed sx={{ fontSize: 40, color: '#1E293B' }} />}
              delay={0.6}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Bonus de vitesse : Accélérez temporairement
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Points bonus : Doublez vos points pendant un court moment
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Invincibilité : Traversez les murs sans mourir
                </Typography>
              </Box>
            </GuideSection>

            <GuideSection 
              title="Astuces" 
              icon={<EmojiEvents sx={{ fontSize: 40, color: '#1E293B' }} />}
              delay={0.8}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Planifiez votre trajectoire à l'avance
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Utilisez les power-ups stratégiquement
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Évitez de vous retrouver coincé dans les coins
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.1rem', lineHeight: 1.8 }}>
                  • Commencez lentement et augmentez progressivement la vitesse
                </Typography>
              </Box>
            </GuideSection>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Guide; 