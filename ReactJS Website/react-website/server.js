const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
}));

const httpServer = createServer(app);

// Configuration plus détaillée de Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Stockage des joueurs en ligne
const onlinePlayers = new Map();

// Route de test
app.get('/health', (req, res) => {
  res.json({ status: 'ok', playersCount: onlinePlayers.size });
});

io.on('connection', (socket) => {
  console.log('🟢 Nouvelle connexion:', socket.id);
  const { username, score } = socket.handshake.query;
  console.log('📝 Données reçues:', { username, score });
  
  try {
    // Ajouter le joueur à la liste
    onlinePlayers.set(socket.id, { 
      id: socket.id,
      username, 
      score: parseInt(score) || 0 
    });
    
    // Envoyer la liste mise à jour à tous les clients
    const playersList = Array.from(onlinePlayers.values());
    console.log('👥 Liste des joueurs mise à jour:', playersList);
    io.emit('players:update', playersList);
    
    // Mise à jour du score
    socket.on('score:update', (data) => {
      console.log('🎯 Mise à jour du score:', { socketId: socket.id, ...data });
      if (onlinePlayers.has(socket.id)) {
        onlinePlayers.set(socket.id, {
          ...onlinePlayers.get(socket.id),
          score: data.score
        });
        io.emit('players:update', Array.from(onlinePlayers.values()));
      }
    });

    // Vérifier les achievements
    socket.on('check:achievements', (data) => {
      console.log('🏆 Vérification des achievements:', { socketId: socket.id, ...data });
      const player = onlinePlayers.get(socket.id);
      if (player) {
        if (data.score >= 100) {
          socket.emit('achievement:unlock', {
            name: 'Score Master',
            description: 'Atteindre 100 points'
          });
        }
        if (data.level >= 5) {
          socket.emit('achievement:unlock', {
            name: 'Level Up Pro',
            description: 'Atteindre le niveau 5'
          });
        }
      }
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
      console.log('🔴 Déconnexion:', socket.id);
      onlinePlayers.delete(socket.id);
      io.emit('players:update', Array.from(onlinePlayers.values()));
    });

  } catch (error) {
    console.error('❌ Erreur lors de la gestion de la connexion:', error);
    socket.emit('error', { message: 'Erreur interne du serveur' });
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Serveur socket.io démarré sur le port ${PORT}
📝 Configuration:
- CORS: activé pour http://localhost:3000
- Transports: websocket, polling
- Ping timeout: 60s
- Ping interval: 25s
  `);
}); 