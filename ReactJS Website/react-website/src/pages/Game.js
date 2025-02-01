import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Container, Box, Typography, IconButton, Dialog, Button, Grid, Paper, TextField, Snackbar, Alert, Link } from '@mui/material';
import { PlayArrow, Pause, Refresh, EmojiEvents, Palette, CalendarToday, Close, Lock, Public, Person, Star, Timer, Extension, Error, Edit, SmartToy, KeyboardArrowUp, KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Chat from '../components/Chat';

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 100;
const SPEED_INCREASE = 5;

const THEME = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  primary: '#000000',
  secondary: '#333333',
  text: '#000000',
  textSecondary: '#666666',
  border: 'rgba(0, 0, 0, 0.1)',
  error: '#FF0000'
};

const SKINS = {
  classique: {
    snake: '#000000',
    food: '#333333',
    head: '#000000',
    name: 'Classique',
    description: 'Design élégant noir et blanc'
  },
  néon: {
    snake: '#000000',
    food: '#333333',
    head: '#000000',
    name: 'Néon',
    description: 'Style moderne'
  },
  rétro: {
    snake: '#000000',
    food: '#333333',
    head: '#000000',
    name: 'Rétro',
    description: 'Style vintage'
  },
  pastel: {
    snake: '#000000',
    food: '#333333',
    head: '#000000',
    name: 'Pastel',
    description: 'Design minimaliste'
  }
};

const FRUITS = {
  pomme: {
    color: '#FF0000',
    name: 'Pomme',
    icon: '🍎',
    unlocked: true,
    points: 10,
    description: 'Fruit de base',
    requiredScore: 0
  },
  banane: {
    color: '#FFD700',
    name: 'Banane',
    icon: '🍌',
    unlocked: false,
    points: 15,
    condition: "Atteindre 100 points",
    description: 'Donne 15 points au lieu de 10',
    requiredScore: 100
  },
  fraise: {
    color: '#FF69B4',
    name: 'Fraise',
    icon: '🍓',
    unlocked: false,
    points: 20,
    condition: "Atteindre 250 points",
    description: 'Donne 20 points et accélère le serpent',
    requiredScore: 250
  },
  raisin: {
    color: '#800080',
    name: 'Raisin',
    icon: '🍇',
    unlocked: false,
    points: 25,
    condition: "Atteindre 500 points",
    description: 'Donne 25 points et un bonus aléatoire',
    requiredScore: 500
  }
};

const DAILY_CHALLENGES = [
  {
    id: 1,
    title: "Défi du Jour",
    description: "Atteignez 100 points sans toucher les bords",
    reward: "Trophée Doré",
    points: 500
  },
  {
    id: 2,
    title: "Défi Hebdomadaire",
    description: "Collectez 20 fruits en moins de 2 minutes",
    reward: "Skin Néon",
    points: 1000
  }
];

const LOCKED_SKINS = {
  néon: {
    condition: "Complétez le défi 'Vitesse Éclair'",
    locked: true
  },
  rétro: {
    condition: "Complétez le défi 'Maître du Snake'",
    locked: true
  },
  pastel: {
    condition: "Complétez le défi 'Collectionneur'",
    locked: true
  }
};

const ONLINE_PRICE = 4.99;
const ONLINE_FEATURES = [
  "Classement mondial",
  "Mode multijoueur",
  "Défis entre amis",
  "Skins exclusifs",
  "Statistiques avancées"
];

const NPC_BOTS = [
  { name: 'SnakeBot-Pro', skill: 'expert', avatar: '🤖' },
  { name: 'AI-Master', skill: 'expert', avatar: '🦾' },
  { name: 'NoviceBot', skill: 'débutant', avatar: '🤖' },
  { name: 'TrainingAI', skill: 'intermédiaire', avatar: '🦿' }
];

const ONLINE_BOTS = [
  { username: 'Snaky', baseScore: 150 },
  { username: 'Lolipop', baseScore: 120 },
  { username: 'VipérionPRO', baseScore: 200 },
  { username: 'SnakeKing', baseScore: 180 },
  { username: 'Serpentard', baseScore: 160 },
  { username: 'CobraMaster', baseScore: 190 },
  { username: 'PythonGamer', baseScore: 140 },
  { username: 'AnacondaPro', baseScore: 170 }
];

const GAME_MODES = {
  classic: {
    id: 'classic',
    name: 'Mode Classique',
    description: 'Le jeu classique du serpent avec des défis à débloquer.',
    icon: <Extension sx={{ color: THEME.primary }} />,
    features: [
      "Score illimité",
      "Déblocage de fruits spéciaux",
      "Défis quotidiens",
      "Skins exclusifs",
      "Mode hors-ligne"
    ]
  },
  online: {
    id: 'online',
    name: 'Mode En Ligne',
    description: 'Affrontez des joueurs du monde entier',
    icon: <Public sx={{ color: THEME.primary }} />,
    features: ONLINE_FEATURES,
    submodes: [
      {
        id: 'competitive',
        name: 'Gros Mangeur',
        description: 'Mangez les autres joueurs pour grandir',
        icon: '🐍',
        features: [
          "Mangez les joueurs plus petits",
          "Évitez les plus gros",
          "Grandissez en mangeant des joueurs",
          "Combat permanent"
        ]
      },
      {
        id: 'friendly',
        name: 'Course aux Points',
        description: 'Collectez le plus de points en 2 minutes',
        icon: '🏃',
        features: [
          "Pas de combat entre joueurs",
          "2 minutes chrono",
          "Collectez les pommes",
          "Le plus de points gagne"
        ]
      }
    ]
  },
  training: {
    id: 'training',
    name: 'Mode Entraînement',
    description: 'Entraînez-vous avec des bots',
    icon: <SmartToy sx={{ color: '#FF4444' }} />,
    features: [
      "Bots de différents niveaux",
      "Entraînement personnalisé",
      "Statistiques détaillées",
      "Progression adaptative"
    ]
  }
};

const UnlockNotification = ({ reward, onClose, onClick }) => (
  <motion.div
    initial={{ x: -300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
    transition={{ type: "spring", stiffness: 100 }}
    onClick={onClick}
    style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      zIndex: 9999,
      cursor: 'pointer'
    }}
  >
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#FFFFFF',
        color: '#000000',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        minWidth: '300px'
      }}
    >
      <EmojiEvents sx={{ color: '#000000', fontSize: 40 }} />
      <Box>
        <Typography variant="subtitle1" sx={{ color: '#000000', fontWeight: 600 }}>
          Nouveau déblocage !
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666' }}>
          {reward}
        </Typography>
      </Box>
      <IconButton 
        size="small" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        sx={{ 
          ml: 'auto',
          color: '#666666',
          '&:hover': { color: '#000000' }
        }}
      >
        <Close />
      </IconButton>
    </Paper>
  </motion.div>
);

const CustomSnackbar = ({ open, message, severity, onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={6000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  >
    <Alert
      onClose={onClose}
      severity={severity}
      sx={{
        minWidth: '300px',
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        color: 'white',
        '& .MuiAlert-icon': {
          color: '#FFD700'
        },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px'
      }}
    >
      {message}
    </Alert>
  </Snackbar>
);

const RANDOM_USERNAMES = [
  "Snake_Master", "Viper_Pro", "Python_King", "Cobra_Elite", 
  "Serpent_Lord", "Dragon_Snake", "Neon_Snake", "Shadow_Viper",
  "Thunder_Snake", "Crystal_Cobra", "Golden_Python", "Royal_Serpent"
];

const generateRandomUsername = () => {
  const randomName = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomName}_${randomNumber}`;
};

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
    <Typography variant="caption">
      ModernSNAKE by{' '}
      <Link
        href="https://github.com/glownydev"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: '#9333ea',
          textDecoration: 'none !important',
          '&:hover': {
            opacity: 0.4,
            textDecoration: 'none !important'
          },
          '&:visited': {
            color: '#9333ea',
            textDecoration: 'none !important'
          },
          '&:link': {
            color: '#9333ea',
            textDecoration: 'none !important'
          }
        }}
      >
        glownydev
      </Link>
    </Typography>
  </Box>
);

const UsernameDialog = ({ open, onClose, onSubmit, username, setUsername }) => {
  const [inputValue, setInputValue] = useState(username || '');

  const handleRandomUsername = () => {
    const randomUsername = generateRandomUsername();
    setInputValue(randomUsername);
  };

  const handleSubmit = () => {
    if (inputValue && inputValue.trim()) {
      onSubmit(inputValue);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          p: 4,
          maxWidth: '400px',
          width: '90%',
          zIndex: 99999
        }
      }}
    >
      <Typography variant="h4" sx={{ color: '#000000', mb: 3, fontWeight: 700 }}>
        Choisissez votre pseudo
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Entrez votre pseudo"
        autoFocus
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            color: '#000000',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
            },
          }
        }}
        InputProps={{
          startAdornment: (
            <Person sx={{ color: '#666666', mr: 1 }} />
          ),
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && inputValue.trim()) {
            handleSubmit();
          }
        }}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleRandomUsername}
          sx={{
            py: 2,
            borderColor: '#000000',
            color: '#000000',
            '&:hover': {
              borderColor: '#333333',
              backgroundColor: 'rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          Pseudo Aléatoire
        </Button>
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        disabled={!inputValue || !inputValue.trim()}
        sx={{
          py: 2,
          backgroundColor: '#000000',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#333333',
          },
          '&.Mui-disabled': {
            backgroundColor: '#CCCCCC',
            color: '#666666'
          },
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: 600
        }}
      >
        Commencer l'aventure
      </Button>
    </Dialog>
  );
};

const SERVERS = [
  {
    id: 'production',
    name: 'Serveur Principal',
    location: '🌍 Global',
    ping: '10-50ms',
    url: process.env.NODE_ENV === 'production' 
      ? window.location.origin
      : 'http://localhost:3001'
  }
];

const ServerSelector = ({ selectedServer, onSelectServer }) => (
  <Box sx={{ mb: 3 }}>
    <Typography sx={{ mb: 2, color: THEME.primary, fontWeight: 600 }}>
      Sélectionnez un serveur :
    </Typography>
    <Grid container spacing={2}>
      {SERVERS.map((server) => (
        <Grid item xs={12} sm={4} key={server.id}>
          <Paper
            elevation={0}
            onClick={() => onSelectServer(server)}
            sx={{
              p: 2,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: selectedServer?.id === server.id ? THEME.primary : 'transparent',
              borderRadius: '12px',
              backgroundColor: selectedServer?.id === server.id ? `${THEME.border}` : 'white',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: THEME.border,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  mr: 1
                }}
              />
              <Typography sx={{ fontWeight: 600, color: THEME.primary }}>
                {server.name}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', color: THEME.textSecondary }}>
              {server.location}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: THEME.textSecondary }}>
              Ping: {server.ping}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const GameMenu = ({ 
  onClose, 
  onStartGame, 
  onStartChallenge, 
  hasOnlineAccess, 
  setHasOnlineAccess, 
  username, 
  setUsername,
  addGameNotification,
  setShowGameModeDialog
}) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);

  const handleStartGame = (mode) => {
    if (mode === 'online') {
      if (!hasOnlineAccess) {
        setShowPaymentDialog(true);
      } else {
        setShowGameModeDialog(true);
      }
    } else {
      onStartGame(mode);
    }
  };

  return (
    <Dialog 
      open={true} 
      maxWidth="md" 
      fullWidth 
      PaperProps={{
        sx: {
          borderRadius: '24px',
          background: '#FFFFFF',
          backdropFilter: 'blur(10px)',
          p: 4,
          border: `2px solid ${THEME.primary}`,
          boxShadow: `0 8px 32px ${THEME.border}`,
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton 
          onClick={onClose}
          sx={{ 
            position: 'absolute',
            right: 0,
            top: 0,
            color: THEME.primary
          }}
        >
          <Close />
        </IconButton>
        
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 4, 
              fontWeight: 800, 
              color: THEME.primary,
              textAlign: 'center'
            }}
          >
            Choisissez votre mode de jeu
          </Typography>
        </motion.div>

        {hasOnlineAccess && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ServerSelector
              selectedServer={selectedServer}
              onSelectServer={setSelectedServer}
            />
          </motion.div>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {['classic', 'online', 'training'].map((id, index) => {
            const mode = GAME_MODES[id];
            return (
              <Grid item xs={12} key={id}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                >
                  <Paper
                    elevation={0}
                    onClick={() => handleStartGame(id)}
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: mode.color || THEME.primary,
                      borderRadius: '16px',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      backgroundColor: id === 'training' ? 'rgba(255, 0, 0, 0.05)' : 'transparent',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {mode.icon}
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {mode.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          {mode.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      {mode.features.map((feature, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: '#000000'
                            }}
                          />
                          <Typography variant="body2" sx={{ color: '#666666' }}>
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Défis Quotidiens
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {DAILY_CHALLENGES.map((challenge, index) => (
            <Grid item xs={12} key={challenge.id}>
              <Paper
                elevation={0}
                onClick={() => onStartChallenge(challenge.id)}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CalendarToday sx={{ color: '#000000' }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {challenge.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      {challenge.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Dialog>
  );
};

const PauseMenu = ({ onResume, onRestart, onChangeSkin, currentSkin, achievements, onChangeFruit, currentFruit, onChangeMode }) => {
  const [activeTab, setActiveTab] = useState('skins');

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '80%', md: '70%' },
        maxWidth: '600px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        p: { xs: 2, sm: 3, md: 4 },
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        zIndex: 10,
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 800, color: '#1E293B', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Pause
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            onClick={onResume}
            startIcon={<PlayArrow />}
            sx={{ 
              py: 1.5, 
              mb: 2,
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              border: 'none',
              '&:hover': {
                backgroundColor: '#0F172A',
                border: 'none'
              }
            }}
          >
            Reprendre
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onChangeMode}
            startIcon={<Extension />}
            sx={{ 
              py: 1.5, 
              mb: 2,
              borderColor: '#1E293B',
              color: '#1E293B',
              '&:hover': {
                borderColor: '#0F172A',
                backgroundColor: 'rgba(15, 23, 42, 0.1)'
              }
            }}
          >
            Changer de Mode
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={activeTab === 'skins' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('skins')}
                    sx={{
                      borderRadius: '12px 12px 0 0',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      ...(activeTab === 'skins' ? {
                        backgroundColor: '#1E293B',
                        color: '#FFFFFF',
                        '&:hover': { backgroundColor: '#0F172A' }
                      } : {})
                    }}
                  >
                    Skins
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant={activeTab === 'fruits' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('fruits')}
                    sx={{
                      borderRadius: '12px 12px 0 0',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      ...(activeTab === 'fruits' ? {
                        backgroundColor: '#1E293B',
                        color: '#FFFFFF',
                        '&:hover': { backgroundColor: '#0F172A' }
                      } : {})
                    }}
                  >
                    Fruits
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {activeTab === 'skins' ? (
              <Grid container spacing={1}>
                {Object.entries(SKINS).map(([skinId, skin]) => (
                  <Grid item xs={6} sm={6} key={skinId}>
                    <Paper
                      elevation={0}
                      onClick={() => !LOCKED_SKINS[skinId]?.locked && onChangeSkin(skinId)}
                      sx={{
                        p: { xs: 1, sm: 2 },
                        cursor: LOCKED_SKINS[skinId]?.locked ? 'not-allowed' : 'pointer',
                        border: `2px solid ${currentSkin === skinId ? skin.head : 'transparent'}`,
                        borderRadius: '16px',
                        transition: 'all 0.3s ease',
                        opacity: LOCKED_SKINS[skinId]?.locked ? 0.5 : 1,
                        position: 'relative',
                        '&:hover': !LOCKED_SKINS[skinId]?.locked && {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(30, 41, 59, 0.1)'
                        }
                      }}
                    >
                      {LOCKED_SKINS[skinId]?.locked && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Lock sx={{ color: '#1E293B', fontSize: 24 }} />
                          <Typography variant="caption" sx={{ color: '#1E293B', textAlign: 'center' }}>
                            {LOCKED_SKINS[skinId]?.condition}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, opacity: LOCKED_SKINS[skinId]?.locked ? 0.3 : 1 }}>
                        <Box
                          sx={{
                            width: { xs: 16, sm: 20 },
                            height: { xs: 16, sm: 20 },
                            borderRadius: '50%',
                            backgroundColor: skin.snake
                          }}
                        />
                        <Box
                          sx={{
                            width: { xs: 16, sm: 20 },
                            height: { xs: 16, sm: 20 },
                            borderRadius: '50%',
                            backgroundColor: skin.head
                          }}
                        />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                        {skin.name}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={1}>
                {Object.entries(FRUITS).map(([fruitId, fruit]) => (
                  <Grid item xs={6} sm={6} key={fruitId}>
                    <Paper
                      elevation={0}
                      onClick={() => onChangeFruit(fruitId)}
                      sx={{
                        p: { xs: 1, sm: 2 },
                        cursor: 'pointer',
                        border: `2px solid ${currentFruit === fruitId ? fruit.color : 'transparent'}`,
                        borderRadius: '16px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(30, 41, 59, 0.1)'
                        }
                      }}
                    >
                      <Typography variant="h4" sx={{ mb: 1, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                        {fruit.icon}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                        {fruit.name}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const BubbleBackground = () => {
  const canvasRef = useRef(null);
  const bubblesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const createBubbles = () => {
      bubblesRef.current = [];
      const numBubbles = 100;
      for (let i = 0; i < numBubbles; i++) {
        bubblesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 6 + 2,
          speed: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          direction: Math.random() < 0.6 ? 1 : -1,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.03 + 0.01
        });
      }
    };

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      createBubbles();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      bubblesRef.current.forEach(bubble => {
        bubble.y -= bubble.speed * bubble.direction;
        
        bubble.x += Math.sin(bubble.wobble) * 0.5;
        bubble.wobble += bubble.wobbleSpeed;

        if (bubble.direction === 1 && bubble.y < -20) {
          bubble.y = height + Math.random() * 20;
          bubble.x = Math.random() * width;
        } else if (bubble.direction === -1 && bubble.y > height + 20) {
          bubble.y = -Math.random() * 20;
          bubble.x = Math.random() * width;
        }

        const gradient = ctx.createRadialGradient(
          bubble.x, bubble.y, 0,
          bubble.x, bubble.y, bubble.size
        );
        gradient.addColorStop(0, `rgba(30, 41, 59, ${bubble.opacity})`);
        gradient.addColorStop(0.6, `rgba(30, 41, 59, ${bubble.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(30, 41, 59, 0)`);

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    createBubbles();
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
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
        zIndex: 0
      }}
    />
  );
};

const SnakeUsername = ({ username, position }) => (
  <Box
    sx={{
      position: 'absolute',
      left: `${position[0] * CELL_SIZE}px`,
      top: `${position[1] * CELL_SIZE - 20}px`,
      transform: 'translateX(-50%)',
      backgroundColor: THEME.surface,
      color: THEME.text,
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      zIndex: 2,
      border: `1px solid ${THEME.border}`,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      pointerEvents: 'none'
    }}
  >
    {username}
  </Box>
);

const PlayerInfo = ({ username, score, level, gameMode, onChangeUsername, highScore, gamesPlayed, winRate }) => (
  <Box
    sx={{
      position: 'fixed',
      top: 100,
      left: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      zIndex: 99999,
      width: '250px',
    }}
  >
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '16px',
          background: '#FFFFFF',
          border: '2px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          marginBottom: '40px' // Ajout d'un espace après les stats
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Person sx={{ color: THEME.primary, fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: THEME.text, fontWeight: 'bold', fontSize: '1.1rem' }}>
                {username || 'Joueur'}
              </Typography>
              <IconButton
                size="small"
                onClick={onChangeUsername}
                sx={{ color: THEME.textSecondary }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
            <Typography sx={{ color: THEME.textSecondary, fontSize: '0.9rem' }}>
              {GAME_MODES[gameMode]?.name || 'Mode Classique'}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography sx={{ color: THEME.textSecondary, fontSize: '0.8rem' }}>SCORE</Typography>
            <Typography sx={{ color: THEME.text, fontWeight: 'bold', fontSize: '1.2rem' }}>{score}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{ color: THEME.textSecondary, fontSize: '0.8rem' }}>NIVEAU</Typography>
            <Typography sx={{ color: THEME.text, fontWeight: 'bold', fontSize: '1.2rem' }}>{level}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{ color: THEME.textSecondary, fontSize: '0.8rem' }}>MEILLEUR SCORE</Typography>
            <Typography sx={{ color: THEME.text, fontWeight: 'bold', fontSize: '1.2rem' }}>{highScore || 0}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{ color: THEME.textSecondary, fontSize: '0.8rem' }}>PARTIES JOUÉES</Typography>
            <Typography sx={{ color: THEME.text, fontWeight: 'bold', fontSize: '1.2rem' }}>{gamesPlayed || 0}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ color: THEME.textSecondary, fontSize: '0.8rem' }}>TAUX DE VICTOIRE</Typography>
            <Typography sx={{ color: THEME.text, fontWeight: 'bold', fontSize: '1.2rem' }}>{winRate || '0%'}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  </Box>
);

const OnlinePlayersPanel = ({ players }) => (
  <Paper
    elevation={0}
    sx={{
      position: 'fixed',
      top: 100,
      right: '20px',
      p: 2,
      borderRadius: '16px',
      background: '#FFFFFF',
      border: '2px solid rgba(0, 0, 0, 0.1)',
      width: '250px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      zIndex: 99999,
      marginBottom: '40px' // Ajout d'un espace après la liste des joueurs
    }}
  >
    <Typography sx={{ color: '#000000', fontWeight: 'bold', mb: 2 }}>
      Joueurs en ligne ({players.length})
    </Typography>
    <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
      {players.map((player, index) => (
        <Box
          key={player.id || index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
            p: 1,
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
          }}
        >
          <Person sx={{ color: '#000000', fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: '#000000', fontSize: '0.9rem' }}>
              {player.username}
            </Typography>
            <Typography sx={{ color: '#666666', fontSize: '0.8rem' }}>
              Score: {player.score}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  </Paper>
);

const GameNotification = ({ notification, onClose }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 100, opacity: 0 }}
    transition={{ type: "spring", stiffness: 100 }}
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 99999,
      cursor: 'pointer',
      width: '90%',
      maxWidth: '400px'
    }}
  >
    <Paper
      onClick={notification.action}
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#FFFFFF',
        color: '#000000',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        border: '2px solid rgba(0, 0, 0, 0.1)',
        width: '100%'
      }}
    >
      {notification.icon}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ color: '#000000', fontWeight: 700, mb: 0.5 }}>
          {notification.title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666' }}>
          {notification.message}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        sx={{ color: '#666666', '&:hover': { color: '#000000' } }}
      >
        <Close />
      </IconButton>
    </Paper>
  </motion.div>
);

const MAX_PLAYERS = 20;
const MIN_PLAYERS = 8;

const ENVIRONMENTS = {
  prairie: {
    color: '#90EE90',
    name: 'Prairie'
  },
  desert: {
    color: '#FFD700',
    name: 'Désert'
  },
  neige: {
    color: '#F0F8FF',
    name: 'Neige'
  },
  lave: {
    color: '#FF4500',
    name: 'Lave'
  }
};

const EASTER_EGGS = {
  'konami': {
    sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    reward: 'Mode Rainbow',
    unlocked: false
  },
  'snake': {
    sequence: ['s', 'n', 'a', 'k', 'e'],
    reward: 'Mode Géant',
    unlocked: false
  },
  'glowny': {
    sequence: ['g', 'l', 'o', 'w', 'n', 'y'],
    reward: 'Mode Invisible',
    unlocked: false
  }
};

const CHAT_BOTS = [
  {
    name: 'SnakeBot',
    messages: [
      "Bien joué !",
      "Attention au mur !",
      "Tu peux y arriver !",
      "Nouveau record en vue !",
      "Quelle partie incroyable !",
      "N'oublie pas les power-ups !",
      "Tu es très fort aujourd'hui !"
    ],
    responseDelay: 2000
  },
  {
    name: 'ProGamer',
    messages: [
      "GG !",
      "Wow, belle performance !",
      "Tu vas battre le record !",
      "Impressionnant !",
      "Continue comme ça !",
      "Tu joues depuis longtemps ?",
      "Excellent mouvement !"
    ],
    responseDelay: 3000
  },
  {
    name: 'CoachSnake',
    messages: [
      "Essaie d'anticiper tes mouvements",
      "La patience est la clé",
      "Concentre-toi sur ton objectif",
      "N'oublie pas de respirer",
      "Tu progresses bien !",
      "Garde ton calme",
      "La pratique fait la perfection"
    ],
    responseDelay: 4000
  }
];

const GameInstructions = () => (
  <Box
    sx={{
      position: 'fixed',
      top: '500px', // Ajusté pour laisser de l'espace après les stats
      left: '20px',
      backgroundColor: '#FFFFFF',
      padding: '15px',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      border: '2px solid rgba(0, 0, 0, 0.1)',
      zIndex: 99999,
      width: '250px'
    }}
  >
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#000000' }}>
      Contrôles
    </Typography>
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ 
            border: '2px solid #000', 
            borderRadius: '4px', 
            padding: '2px 6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            minWidth: '40px',
            textAlign: 'center'
          }}>
            ↑ Z
          </Box>
          <Typography variant="body2">Haut</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ 
            border: '2px solid #000', 
            borderRadius: '4px', 
            padding: '2px 6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            minWidth: '40px',
            textAlign: 'center'
          }}>
            ↓ S
          </Box>
          <Typography variant="body2">Bas</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ 
            border: '2px solid #000', 
            borderRadius: '4px', 
            padding: '2px 6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            minWidth: '40px',
            textAlign: 'center'
          }}>
            ← Q
          </Box>
          <Typography variant="body2">Gauche</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ 
            border: '2px solid #000', 
            borderRadius: '4px', 
            padding: '2px 6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            minWidth: '40px',
            textAlign: 'center'
          }}>
            → D
          </Box>
          <Typography variant="body2">Droite</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            border: '2px solid #000', 
            borderRadius: '4px', 
            padding: '2px 6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            minWidth: '40px',
            textAlign: 'center'
          }}>
            ESC
          </Box>
          <Typography variant="body2">Pause</Typography>
        </Box>
      </Grid>
    </Grid>
  </Box>
);

const GameModeDialog = ({ open, onClose, onSelectMode }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: '24px',
        p: 3,
        maxHeight: '90vh',
        overflowY: 'auto'
      }
    }}
  >
    <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
      Choisissez votre style de jeu
    </Typography>
    
    <Grid container spacing={2}>
      {GAME_MODES.online.submodes.map((mode) => (
        <Grid item xs={12} key={mode.id}>
          <Paper
            onClick={() => onSelectMode(mode.id)}
            sx={{
              p: 3,
              cursor: 'pointer',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '16px',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h3" sx={{ color: '#000000' }}>
                {mode.icon}
              </Typography>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {mode.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {mode.description}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {mode.features.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#000000'
                    }}
                  />
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Dialog>
);

const Game = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [gameMode, setGameMode] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [snake, setSnake] = useState([[5, 5]]);
  const [food, setFood] = useState([10, 10]);
  const [direction, setDirection] = useState([1, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [skin, setSkin] = useState('classique');
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef();
  const canvasRef = useRef(null);
  const [achievements, setAchievements] = useState([
    { name: "Premier Pas", unlocked: false },
    { name: "Score 50", unlocked: false },
    { name: "Vitesse Max", unlocked: false },
    { name: "Défi Quotidien", unlocked: false }
  ]);
  const [currentFruit, setCurrentFruit] = useState('pomme');
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [unlockedReward, setUnlockedReward] = useState('');
  const [unlockedSkins, setUnlockedSkins] = useState(() => {
    const saved = localStorage.getItem('unlockedSkins');
    return saved ? JSON.parse(saved) : { classique: true };
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || '';
  });
  const [hasOnlineAccess, setHasOnlineAccess] = useState(() => {
    return localStorage.getItem('onlineAccess') === 'true';
  });
  const [unlockedFruits, setUnlockedFruits] = useState(() => {
    const saved = localStorage.getItem('unlockedFruits');
    return saved ? JSON.parse(saved) : { pomme: true };
  });
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [gameNotifications, setGameNotifications] = useState([]);
  const [connectionError, setConnectionError] = useState(false);
  const [activeTab, setActiveTab] = useState('game');
  const [socketServerUrl, setSocketServerUrl] = useState(SERVERS[0].url);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('gameStats');
    return saved ? JSON.parse(saved) : {
      highScore: 0,
      gamesPlayed: 0,
      wins: 0,
      totalScore: 0
    };
  });
  const [virtualPlayers, setVirtualPlayers] = useState([]);
  const [currentEnvironment, setCurrentEnvironment] = useState('prairie');
  const [worldOffset, setWorldOffset] = useState({ x: 0, y: 0 });
  const [environmentGrid, setEnvironmentGrid] = useState({});
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [showGameModeDialog, setShowGameModeDialog] = useState(false);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  const addGameNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      duration: notification.duration || 5000
    };
    
    setGameNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      setGameNotifications(prev => 
        prev.filter(n => n.id !== newNotification.id)
      );
    }, newNotification.duration);
  }, []);

  const generateFood = useCallback(() => {
    const newFood = [
      Math.floor(Math.random() * GRID_SIZE),
      Math.floor(Math.random() * GRID_SIZE)
    ];
    if (snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1])) {
      return generateFood();
    }
    return newFood;
  }, [snake]);

  const resetGame = useCallback(() => {
    setSnake([[5, 5]]);
    setFood(generateFood());
    setDirection([1, 0]);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
    setShowMenu(false);
  }, [generateFood]);

  const initializeOnlineGame = useCallback((server = null) => {
    setGameMode('online');
    setShowMenu(false);
    resetGame();
    
    if (server) {
      setSocketServerUrl(server.url);
      const newSocket = io(server.url);
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('playerJoin', { username, score: 0 });
      });

      newSocket.on('connect_error', () => {
        setConnectionError(true);
        setTimeout(() => setConnectionError(false), 3000);
      });
    }
  }, [username, resetGame]);

  const startGame = useCallback((mode, server = null) => {
    if (mode === 'online') {
      if (!username) {
        setShowUsernameDialog(true);
        return;
      }
      setShowGameModeDialog(true);
    } else {
      setGameMode(mode);
      setShowMenu(false);
      resetGame();
    }
  }, [username, resetGame]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsPaused(prev => !prev);
      return;
    }

    if (isPaused || gameOver) return;

    const keyDirections = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      z: [0, -1],
      s: [0, 1],
      q: [-1, 0],
      d: [1, 0]
    };

    const newDirection = keyDirections[e.key.toLowerCase()];
    if (newDirection) {
      e.preventDefault(); // Empêche le défilement de la page
      setDirection(newDirection); // Application immédiate de la direction
    }
  }, [isPaused, gameOver]);

  const getEnvironmentKey = (x, y) => {
    const chunkSize = GRID_SIZE;
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);
    return `${chunkX},${chunkY}`;
  };

  const getEnvironmentAt = (x, y) => {
    const key = getEnvironmentKey(x, y);
    if (!environmentGrid[key]) {
      const environments = Object.keys(ENVIRONMENTS);
      environmentGrid[key] = environments[Math.floor(Math.random() * environments.length)];
      setEnvironmentGrid({...environmentGrid});
    }
    return environmentGrid[key];
  };

  const checkCollision = useCallback((head) => {
    // Collision avec soi-même uniquement
    if (snake.length > 1 && snake.slice(1).some(segment => segment[0] === head[0] && segment[1] === head[1])) {
      return true;
    }

    // Pas de collision avec les bords en mode défi
    if (challenge?.id === 1) {
      return false;
    }

    // Collision avec les bords en mode normal
    if (head[0] < 0 || head[0] >= GRID_SIZE || head[1] < 0 || head[1] >= GRID_SIZE) {
      return true;
    }

    return false;
  }, [snake, challenge]);

  const createNewVirtualPlayer = () => {
    const randomBot = ONLINE_BOTS[Math.floor(Math.random() * ONLINE_BOTS.length)];
    return {
      ...randomBot,
      id: Math.random().toString(36),
      isVirtual: true,
      score: randomBot.baseScore,
      position: [
        snake[0][0] + (Math.random() - 0.5) * GRID_SIZE * 2,
        snake[0][1] + (Math.random() - 0.5) * GRID_SIZE * 2
      ],
      direction: [
        Math.random() > 0.5 ? 1 : -1,
        Math.random() > 0.5 ? 1 : -1
      ],
      speed: 0.1 + Math.random() * 0.2
    };
  };

  const addNotification = (message, severity = 'success') => {
    const newNotif = { id: Date.now(), message, severity };
    setNotifications(prev => [...prev, newNotif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 6000);
  };

  const unlockFruit = (fruitId) => {
    const newUnlockedFruits = { ...unlockedFruits, [fruitId]: true };
    setUnlockedFruits(newUnlockedFruits);
    localStorage.setItem('unlockedFruits', JSON.stringify(newUnlockedFruits));
    addNotification(`${FRUITS[fruitId].name} débloqué ! 🎉`);
  };

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;

    const newSnake = [...snake];
    const head = [
      newSnake[0][0] + direction[0],
      newSnake[0][1] + direction[1]
    ];

    // Gestion des bords
    if (head[0] < 0) head[0] = GRID_SIZE - 1;
    if (head[0] >= GRID_SIZE) head[0] = 0;
    if (head[1] < 0) head[1] = GRID_SIZE - 1;
    if (head[1] >= GRID_SIZE) head[1] = 0;

    // Collision avec soi-même uniquement si le serpent a plus d'un segment
    if (snake.length > 1 && snake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Gestion de la nourriture
    if (head[0] === food[0] && head[1] === food[1]) {
      setFood(generateFood());
      const points = FRUITS[currentFruit]?.points || 10;
      setScore(prev => prev + points);
      
      if (selectedGameMode !== 'friendly') {
        newSnake.push([...newSnake[newSnake.length - 1]]);
      }
      
      // Accélération plus rapide
      if (score > 0 && score % 30 === 0) { // Changé de 50 à 30 pour une accélération plus fréquente
        setLevel(prev => prev + 1);
        setSpeed(prev => Math.max(prev - SPEED_INCREASE, 40)); // Vitesse minimale réduite à 40
      }
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, score, generateFood, currentFruit, selectedGameMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(gameLoop, speed);
      return () => clearInterval(gameLoopRef.current);
    }
  }, [gameLoop, gameOver, speed, isPaused]);

  const drawGame = useCallback((ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const cellWidth = ctx.canvas.width / GRID_SIZE;
    const cellHeight = ctx.canvas.height / GRID_SIZE;

    // Dessiner la grille
    ctx.strokeStyle = '#EEEEEE';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_SIZE; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, ctx.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_SIZE; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(ctx.canvas.width, y * cellHeight);
      ctx.stroke();
    }

    // Dessiner le serpent
    ctx.fillStyle = '#000000';
    snake.forEach((segment, index) => {
      const radius = Math.min(cellWidth, cellHeight) / 4;
      const x = segment[0] * cellWidth;
      const y = segment[1] * cellHeight;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + cellWidth - radius, y);
      ctx.quadraticCurveTo(x + cellWidth, y, x + cellWidth, y + radius);
      ctx.lineTo(x + cellWidth, y + cellHeight - radius);
      ctx.quadraticCurveTo(x + cellWidth, y + cellHeight, x + cellWidth - radius, y + cellHeight);
      ctx.lineTo(x + radius, y + cellHeight);
      ctx.quadraticCurveTo(x, y + cellHeight, x, y + cellHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();
    });

    // Dessiner le fruit actuel
    const fruitX = food[0] * cellWidth + cellWidth / 2;
    const fruitY = food[1] * cellHeight + cellHeight / 2;
    const fruitSize = Math.min(cellWidth, cellHeight) / 2;

    ctx.font = `${fruitSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(FRUITS[currentFruit].icon, fruitX, fruitY);

    // Dessiner les autres joueurs (carrés arrondis colorés)
    if (gameMode === 'online' && virtualPlayers) {
      virtualPlayers.forEach(player => {
        ctx.fillStyle = player.score > score ? '#FF4444' : '#44FF44';
        const x = Math.floor(player.position[0]) * cellWidth;
        const y = Math.floor(player.position[1]) * cellHeight;
        
        // Dessiner le carré arrondi du joueur
        const radius = Math.min(cellWidth, cellHeight) / 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + cellWidth - radius, y);
        ctx.quadraticCurveTo(x + cellWidth, y, x + cellWidth, y + radius);
        ctx.lineTo(x + cellWidth, y + cellHeight - radius);
        ctx.quadraticCurveTo(x + cellWidth, y + cellHeight, x + cellWidth - radius, y + cellHeight);
        ctx.lineTo(x + radius, y + cellHeight);
        ctx.quadraticCurveTo(x, y + cellHeight, x, y + radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // Dessiner le pseudo au-dessus
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          player.username,
          (x + cellWidth / 2),
          y - 5
        );
      });
    }

    // Dessiner la pomme (cercle rouge avec tige et feuille)
    const appleX = food[0] * cellWidth + cellWidth / 2;
    const appleY = food[1] * cellHeight + cellHeight / 2;
    const appleRadius = Math.min(cellWidth, cellHeight) / 2.5;

    // Corps de la pomme
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(appleX, appleY, appleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Tige
    ctx.strokeStyle = '#663300';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(appleX, appleY - appleRadius);
    ctx.lineTo(appleX, appleY - appleRadius - 5);
    ctx.stroke();

    // Feuille
    ctx.fillStyle = '#33CC33';
    ctx.beginPath();
    ctx.ellipse(
      appleX + 4,
      appleY - appleRadius - 3,
      4,
      2,
      Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [snake, food, currentFruit, gameMode, virtualPlayers, score]);

  // Optimiser la mise à jour des joueurs virtuels
  useEffect(() => {
    if (gameMode === 'online') {
      // Initialiser les joueurs virtuels immédiatement
      const initialVirtualPlayers = ONLINE_BOTS.slice(0, 8).map(bot => ({
        ...bot,
        id: Math.random().toString(36),
        isVirtual: true,
        score: bot.baseScore,
        position: [
          Math.floor(Math.random() * GRID_SIZE),
          Math.floor(Math.random() * GRID_SIZE)
        ],
        direction: [
          Math.random() > 0.5 ? 1 : -1,
          Math.random() > 0.5 ? 1 : -1
        ],
        speed: 0.1 + Math.random() * 0.2
      }));
      setVirtualPlayers(initialVirtualPlayers);

      const updateInterval = setInterval(() => {
        setVirtualPlayers(prevPlayers => 
          prevPlayers.map(player => {
            const newX = Math.max(0, Math.min(GRID_SIZE - 1, 
              player.position[0] + player.direction[0] * player.speed
            ));
            const newY = Math.max(0, Math.min(GRID_SIZE - 1, 
              player.position[1] + player.direction[1] * player.speed
            ));

            if (newX <= 0 || newX >= GRID_SIZE - 1) {
              player.direction[0] *= -1;
            }
            if (newY <= 0 || newY >= GRID_SIZE - 1) {
              player.direction[1] *= -1;
            }

            return {
              ...player,
              position: [newX, newY]
            };
          })
        );
      }, 100);

      return () => clearInterval(updateInterval);
    }
  }, [gameMode]);

  useEffect(() => {
    if (gameMode === 'training') {
      // Un seul bot pour le mode entraînement
      const trainingBot = {
        ...NPC_BOTS[0],
        id: 'training-bot',
        isVirtual: true,
        score: 100,
        position: [
          Math.floor(Math.random() * GRID_SIZE),
          Math.floor(Math.random() * GRID_SIZE)
        ],
        direction: [1, 0],
        speed: 0.15
      };
      setVirtualPlayers([trainingBot]);
    }
  }, [gameMode]);

  useEffect(() => {
    if (socket && gameMode === 'online') {
      const allPlayers = [
        ...onlinePlayers.filter(p => !p.isVirtual),
        ...virtualPlayers.map(vp => ({
          id: vp.id,
          username: vp.username,
          score: vp.score,
          isVirtual: true
        }))
      ].slice(0, MAX_PLAYERS);
      
      setOnlinePlayers(allPlayers);
    }
  }, [virtualPlayers, socket, gameMode]);

  const handleChangeUsername = () => {
    setShowUsernameDialog(true);
  };

  useEffect(() => {
    if (gameOver) {
      const newStats = {
        highScore: Math.max(stats.highScore, score),
        gamesPlayed: stats.gamesPlayed + 1,
        wins: stats.wins + (score >= 100 ? 1 : 0),
        totalScore: stats.totalScore + score
      };
      setStats(newStats);
      localStorage.setItem('gameStats', JSON.stringify(newStats));
    }
  }, [gameOver, score]);

  const winRate = useMemo(() => {
    if (stats.gamesPlayed === 0) return '0%';
    return `${Math.round((stats.wins / stats.gamesPlayed) * 100)}%`;
  }, [stats.wins, stats.gamesPlayed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Ajuster la taille du canvas pour qu'elle corresponde à sa taille d'affichage
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      if (ctx && !gameOver) {
        drawGame(ctx);
      }
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [drawGame, gameOver]);

  useEffect(() => {
    if (!showMenu && !gameOver) {
      const colors = ['#FFE4E1', '#E0FFE0', '#E0E0FF', '#FFFFD0'];
      let colorIndex = 0;
      
      const interval = setInterval(() => {
        setBackgroundColor(colors[colorIndex]);
        colorIndex = (colorIndex + 1) % colors.length;
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [showMenu, gameOver]);

  const handleSelectGameMode = useCallback((submode) => {
    setSelectedGameMode(submode);
    setShowGameModeDialog(false);
    
    if (!username) {
      setShowUsernameDialog(true);
      return;
    }
    
    if (submode === 'friendly') {
      setTimeout(() => {
        setGameOver(true);
        addGameNotification({
          title: 'Temps écoulé !',
          message: `Score final : ${score} points`,
          duration: 5000
        });
      }, 120000);
    }
    
    initializeOnlineGame(selectedServer);
  }, [username, selectedServer, score, addGameNotification, initializeOnlineGame]);

  const handleUsernameSubmit = useCallback((newUsername) => {
    setUsername(newUsername);
    localStorage.setItem('username', newUsername);
    setShowUsernameDialog(false);
    
    if (selectedGameMode) {
      initializeOnlineGame(selectedServer);
      addGameNotification({
        title: 'Bienvenue !',
        message: `Vous jouez en tant que ${newUsername}`,
        icon: <Person sx={{ color: '#10B981', fontSize: 40 }} />,
        duration: 3000
      });
    }
  }, [selectedGameMode, selectedServer, initializeOnlineGame, addGameNotification]);

  const startChallenge = useCallback((challengeId) => {
    const challenge = DAILY_CHALLENGES.find(c => c.id === challengeId);
    if (challenge) {
      setChallenge(challenge);
      setGameMode('challenge');
      setShowMenu(false);
      resetGame();
      
      addGameNotification({
        title: challenge.title,
        message: challenge.description,
        icon: <CalendarToday sx={{ color: '#FFD700', fontSize: 40 }} />,
        duration: 5000
      });
    }
  }, [resetGame, addGameNotification]);

  const handleChangeMode = useCallback(() => {
    setIsPaused(false);
    setShowMenu(true);
  }, []);

  // Ajout de la logique des bots de chat
  useEffect(() => {
    if (gameMode === 'online' && username) {
      const chatInterval = setInterval(() => {
        const randomBot = CHAT_BOTS[Math.floor(Math.random() * CHAT_BOTS.length)];
        const randomMessage = randomBot.messages[Math.floor(Math.random() * randomBot.messages.length)];
        
        if (socket) {
          socket.emit('message', {
            username: randomBot.name,
            message: randomMessage,
            isBot: true
          });
        }
      }, 5000 + Math.random() * 5000); // Message aléatoire toutes les 5-10 secondes

      return () => clearInterval(chatInterval);
    }
  }, [gameMode, username, socket]);

  // Ajout de la gestion du mouvement tactile
  const handleTouchStart = useCallback((e) => {
    e.preventDefault(); // Empêche le scroll
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault(); // Empêche le scroll
    if (!touchStartX || !touchStartY || isPaused || gameOver) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Seuil minimum pour détecter un swipe
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Mouvement horizontal
        const newDirection = [deltaX > 0 ? 1 : -1, 0];
        if (newDirection[0] !== -direction[0]) { // Empêche le demi-tour
          setDirection(newDirection);
        }
      } else {
        // Mouvement vertical
        const newDirection = [0, deltaY > 0 ? 1 : -1];
        if (newDirection[1] !== -direction[1]) { // Empêche le demi-tour
          setDirection(newDirection);
        }
      }
      // Mettre à jour le point de départ pour le prochain mouvement
      setTouchStartX(touch.clientX);
      setTouchStartY(touch.clientY);
    }
  }, [touchStartX, touchStartY, direction, isPaused, gameOver]);

  const handleTouchEnd = useCallback(() => {
    setTouchStartX(null);
    setTouchStartY(null);
  }, []);

  // Ajout des contrôles mobiles simplifiés
  const MobileControls = () => (
    <Box
      sx={{
        position: 'fixed',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '20px',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}
    >
      <IconButton
        onClick={() => !isPaused && !gameOver && setDirection([0, -1])}
        sx={{
          width: '60px',
          height: '60px',
          backgroundColor: '#FFFFFF',
          '&:active': { backgroundColor: '#EEEEEE' }
        }}
      >
        <KeyboardArrowUp sx={{ fontSize: 40 }} />
      </IconButton>
      <Box sx={{ display: 'flex', gap: 4 }}>
        <IconButton
          onClick={() => !isPaused && !gameOver && setDirection([-1, 0])}
          sx={{
            width: '60px',
            height: '60px',
            backgroundColor: '#FFFFFF',
            '&:active': { backgroundColor: '#EEEEEE' }
          }}
        >
          <KeyboardArrowLeft sx={{ fontSize: 40 }} />
        </IconButton>
        <IconButton
          onClick={() => !isPaused && !gameOver && setDirection([0, 1])}
          sx={{
            width: '60px',
            height: '60px',
            backgroundColor: '#FFFFFF',
            '&:active': { backgroundColor: '#EEEEEE' }
          }}
        >
          <KeyboardArrowDown sx={{ fontSize: 40 }} />
        </IconButton>
        <IconButton
          onClick={() => !isPaused && !gameOver && setDirection([1, 0])}
          sx={{
            width: '60px',
            height: '60px',
            backgroundColor: '#FFFFFF',
            '&:active': { backgroundColor: '#EEEEEE' }
          }}
        >
          <KeyboardArrowRight sx={{ fontSize: 40 }} />
        </IconButton>
      </Box>
    </Box>
  );

  useEffect(() => {
    // Vérifier le déblocage des fruits en fonction du score
    Object.entries(FRUITS).forEach(([fruitId, fruit]) => {
      if (!unlockedFruits[fruitId] && score >= fruit.requiredScore) {
        unlockFruit(fruitId);
        addGameNotification({
          title: 'Nouveau Fruit Débloqué !',
          message: `Vous avez débloqué : ${fruit.name}`,
          icon: <Star sx={{ color: '#FFD700', fontSize: 40 }} />,
          duration: 5000
        });
      }
    });
  }, [score, unlockedFruits]);

  return (
    <Container 
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        zIndex: 1,
        padding: { xs: '20px', sm: '40px' },
        touchAction: 'none' // Empêche le scroll sur mobile pendant le jeu
      }}
    >
      <BubbleBackground />
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '95vw', sm: '80vw', md: '70vh' },
          aspectRatio: '1',
          border: '2px solid #1E293B',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 8px 32px rgba(30, 41, 59, 0.1)',
          mx: 'auto',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${SKINS[skin].background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.1,
            zIndex: 0,
            transition: 'opacity 0.3s ease'
          }
        }}
      >
        <canvas
          ref={canvasRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            position: 'relative',
            zIndex: 1,
            touchAction: 'none' // Empêche le scroll sur le canvas
          }}
        />

        {!showMenu && !gameOver && <MobileControls />}

        {!showMenu && !gameOver && (
          <SnakeUsername
            username={username}
            position={snake[0]}
          />
        )}

        {gameOver && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              textAlign: 'center',
              zIndex: 2
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Game Over
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ mb: 4 }}
            >
              Score: {score}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                resetGame();
              }}
              sx={{ 
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                '&:hover': {
                  backgroundColor: '#F1F5F9'
                }
              }}
            >
              Rejouer
            </Button>
          </Box>
        )}
      </Box>

      <Box
        sx={{ 
          mt: { xs: 2, sm: 3 },
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: { xs: '95vw', sm: '80vw', md: '70vh' },
          mx: 'auto'
        }}
      >
        <IconButton
          onClick={() => setIsPaused(prev => !prev)}
          sx={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(30, 41, 59, 0.1)',
            }
          }}
        >
          {isPaused ? <PlayArrow /> : <Pause />}
        </IconButton>
        <IconButton
          onClick={() => resetGame()}
          sx={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(30, 41, 59, 0.1)',
            }
          }}
        >
          <Refresh />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ 
            ml: 2,
            color: '#1E293B',
            fontWeight: 600
          }}
        >
          Score: {score}
        </Typography>
      </Box>

      {showMenu && (
        <GameMenu
          onClose={() => setShowMenu(false)}
          onStartGame={startGame}
          onStartChallenge={startChallenge}
          hasOnlineAccess={hasOnlineAccess}
          setHasOnlineAccess={setHasOnlineAccess}
          username={username}
          setUsername={setUsername}
          addGameNotification={addGameNotification}
          setShowGameModeDialog={setShowGameModeDialog}
        />
      )}

      {isPaused && !gameOver && !showMenu && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onRestart={resetGame}
          onChangeSkin={setSkin}
          currentSkin={skin}
          achievements={achievements}
          onChangeFruit={setCurrentFruit}
          currentFruit={currentFruit}
          onChangeMode={handleChangeMode}
        />
      )}

      <AnimatePresence>
        {showNotification && (
          <UnlockNotification
            reward={unlockedReward}
            onClose={() => setShowNotification(false)}
            onClick={() => {
              setShowNotification(false);
              navigate('/menu');
            }}
          />
        )}
      </AnimatePresence>

      {notifications.map(notif => (
        <CustomSnackbar
          key={notif.id}
          open={true}
          message={notif.message}
          severity={notif.severity}
          onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
        />
      ))}

      <AnimatePresence>
        {gameNotifications.map(notification => (
          <GameNotification
            key={notification.id}
            notification={notification}
            onClose={() => setGameNotifications(prev => 
              prev.filter(n => n.id !== notification.id)
            )}
          />
        ))}
      </AnimatePresence>

      {!showMenu && (
        <PlayerInfo
          username={username}
          score={score}
          level={level}
          gameMode={gameMode}
          onChangeUsername={handleChangeUsername}
          highScore={stats.highScore}
          gamesPlayed={stats.gamesPlayed}
          winRate={winRate}
        />
      )}

      {gameMode === 'online' && (
        <OnlinePlayersPanel players={onlinePlayers} />
      )}

      {connectionError && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'fixed', 
            top: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            borderRadius: '12px',
            backgroundColor: '#FF0000',
            color: 'white',
            zIndex: 99999,
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          Erreur de connexion au serveur
        </Alert>
      )}

      <UsernameDialog
        open={showUsernameDialog}
        onClose={() => setShowUsernameDialog(false)}
        onSubmit={handleUsernameSubmit}
        username={username}
        setUsername={setUsername}
      />

      {!showMenu && !gameOver && (
        <GameInstructions />
      )}

      <GameModeDialog
        open={showGameModeDialog}
        onClose={() => setShowGameModeDialog(false)}
        onSelectMode={handleSelectGameMode}
      />
      <Footer />
      {gameMode === 'online' && username && <Chat username={username} />}
    </Container>
  );
};

export default Game; 