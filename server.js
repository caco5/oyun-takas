const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let trades = [];

// İlanları çek
app.get('/api/trades', (req, res) => {
    res.json(trades);
});

// Yeni ilan ekle
app.post('/api/trades', (req, res) => {
    const { game, offer, want, contact } = req.body;
    const newTrade = { 
        id: Date.now().toString(), 
        game, 
        offer, 
        want, 
        contact: contact || 'Belirtilmedi' 
    };
    trades.push(newTrade);
    res.status(201).json(newTrade);
});

// Canlı Sohbet Odaları (Socket.io)
io.on('connection', (socket) => {
    // Kullanıcı ilanın sohbet odasına girer
    socket.on('join_room', (tradeId) => {
        socket.join(tradeId);
    });

    // Mesaj gönderildiğinde o odadaki herkese ilet
    socket.on('send_message', (data) => {
        // data: { tradeId, sender, message, time }
        io.to(data.tradeId).emit('receive_message', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
