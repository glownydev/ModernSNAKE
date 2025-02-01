import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

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

const Chat = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { username, text: newMessage, timestamp: new Date() }]);
      setNewMessage('');
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        top: '420px',
        right: '20px',
        width: '250px',
        height: '300px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        border: '2px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 99999
      }}
    >
      <BubbleBackground />
      
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            backgroundColor: '#FFFFFF',
            borderRadius: '15px 15px 0 0'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Chat en ligne
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#F1F1F1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#CCCCCC',
              borderRadius: '4px',
            },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                backgroundColor: msg.username === username ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                p: 1,
                borderRadius: '8px',
                alignSelf: msg.username === username ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              <Typography variant="caption" sx={{ color: '#666666' }}>
                {msg.username}
              </Typography>
              <Typography variant="body2">
                {msg.text}
              </Typography>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            gap: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: '0 0 15px 15px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TextField
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Votre message..."
            fullWidth
            onKeyDown={(e) => e.stopPropagation()}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          />
          <Box
            component="button"
            type="submit"
            sx={{
              border: 'none',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default Chat; 