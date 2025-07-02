const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <form action="/log" method="post">
            <button type="submit">Надіслати</button>
        </form>
    `);
});

app.post('/log', (req, res) => {
    const ip = req.ip;
    const port = req.connection.remotePort;
    const date = new Date().toLocaleString('uk-UA');
    const filePath = path.join(__dirname, 'client.json');

    let data = {};
    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath));
    }
    const id = Object.keys(data).length + 1;
    data[id] = {
        IpAddrClient: ip,
        port: port,
        Time: date
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    res.send('Інформацію збережено.');
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});