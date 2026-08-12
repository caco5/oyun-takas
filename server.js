const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let trades = [];
let users = {}; // { username: password }

// Kayıt / Giriş Sistemi
app.post('/api/auth', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli!' });
    }

    if (users[username]) {
        // Kullanıcı var, şifre kontrolü yap
        if (users[username] === password) {
            return res.json({ success: true, username });
        } else {
            return res.status(400).json({ error: 'Hatalı şifre! Bu kullanıcı adı alınmış.' });
        }
    } else {
        // Yeni kullanıcı kaydı
        users[username] = password;
        return res.json({ success: true, username });
    }
});

// İlanları çek
app.get('/api/trades', (req, res) => {
    res.json(trades);
});

// İlan Ekle
app.post('/api/trades', (req, res) => {
    const { game, offer, want, contact, owner } = req.body;
    const newTrade = { 
        id: Date.now().toString(), 
        game, 
        offer, 
        want, 
        contact: contact || 'Belirtilmedi',
        owner
    };
    trades.push(newTrade);
    res.status(201).json(newTrade);
});

// İlan Sil
app.delete('/api/trades/:id', (req, res) => {
    const { id } = req.params;
    trades = trades.filter(t => t.id !== id);
    res.json({ success: true });
});

// Canlı Sohbet
io.on('connection', (socket) => {
    socket.on('join_room', (tradeId) => {
        socket.join(tradeId);
    });

    socket.on('send_message', (data) => {
        // data: { tradeId, sender, message }
        io.to(data.tradeId).emit('receive_message', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
