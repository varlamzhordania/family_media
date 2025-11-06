// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());  


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
 

const PORT = process.env.PORT || 3000;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'https://localhost:7880'; // or LiveKit Cloud URL

if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.error('Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET in .env');
  process.exit(1);
}

 
app.post('/token', async (req, res) => {
  try {
    const { identity, room, name, ttlSeconds } = req.body || {};

    if (!identity || !room) {
      return res.status(400).json({ error: 'identity and room are required' });
    }

    
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: identity,
      name: name || identity,
    });

    
    at.addGrant({
      roomJoin: true,
      room: room,
    });

    
    if (ttlSeconds && Number.isFinite(ttlSeconds)) {
      at.setValidFor(ttlSeconds);
    }

    const token = await at.toJwt();

 
    res.json({
      token,
      wsUrl: LIVEKIT_URL,
      ttlSeconds: ttlSeconds || 3600,
    });
  } catch (err) {
    console.error('token error', err);
    res.status(500).json({ error: 'failed to generate token' });
  }
});

 
app.post('/create-room', async (req, res) => {
  try {
    const { room } = req.body || {};
    if (!room) return res.status(400).json({ error: 'room is required' });

    
    return res.json({ ok: true, room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'create-room failed' });
  }
});


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    socket.userId = userId;
    console.log(`Registered user: ${userId}`);
  });

  socket.on('call_user', ({ from, to, room }) => {
    console.log(`${from} is calling ${to}`);
    for (let [id, s] of io.sockets.sockets) {
      if (s.userId === to) {
        s.emit('incoming_call', { from, room });
      }
    }
  });

  socket.on('accept_call', ({ from, to, room }) => {
    for (let [id, s] of io.sockets.sockets) {
      if (s.userId === from) {
        s.emit('call_accepted', { to, room });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

app.get('/', (req, res) => {
  res.send('LiveKit token server is running');
});

app.listen(PORT, () => {
  console.log(`LiveKit token server listening on http://localhost:${PORT}`);
});
