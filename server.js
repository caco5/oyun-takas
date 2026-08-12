const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let trades = [
  { id: 1, game: "CS2", offer: "AK-47 Redline", want: "Knife" },
  { id: 2, game: "Roblox", offer: "Frigid Horns", want: "Dominus" }
];

// Anasayfa açıldığında index.html dosyasını gönder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/trades', (req, res) => {
  res.json(trades);
});

app.post('/api/trades', (req, res) => {
  const { game, offer, want } = req.body;
  if (!game || !offer || !want) {
    return res.status(400).json({ error: "Lütfen tüm alanları doldurun." });
  }
  const newTrade = { id: Date.now(), game, offer, want };
  trades.push(newTrade);
  res.status(201).json(newTrade);
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor`);
});

module.exports = app;
