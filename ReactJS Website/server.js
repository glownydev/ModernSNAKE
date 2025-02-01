const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du build React
app.use(express.static(path.join(__dirname, 'build')));

// Les routes API ici
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Gestion des connexions Socket.IO
const onlinePlayers = new Map();

io.on('connection', (socket) => {
  console.log('Nouveau joueur connecté');

  socket.on('playerJoin', (data) => {
    onlinePlayers.set(socket.id, {
      id: socket.id,
      username: data.username,
      score: data.score || 0
    });
    io.emit('playersList', Array.from(onlinePlayers.values()));
  });

  socket.on('updateScore', (data) => {
    const player = onlinePlayers.get(socket.id);
    if (player) {
      player.score = data.score;
      io.emit('playersList', Array.from(onlinePlayers.values()));
    }
  });

  socket.on('message', (data) => {
    io.emit('message', {
      ...data,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    onlinePlayers.delete(socket.id);
    io.emit('playersList', Array.from(onlinePlayers.values()));
    console.log('Joueur déconnecté');
  });
});

// Pour toutes les autres routes, renvoyer l'app React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 