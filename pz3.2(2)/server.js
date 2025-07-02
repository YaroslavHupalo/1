const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const testFile = path.join(__dirname, 'test.json');
const resultsFile = path.join(__dirname, 'results.json');

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/start', (req, res) => {
    const { name, lastname } = req.body;
    const testData = JSON.parse(fs.readFileSync(testFile));
    res.render('test', { name, lastname, testData });
});

app.post('/submit', (req, res) => {
    const { name, lastname, ...answers } = req.body;
    const testData = JSON.parse(fs.readFileSync(testFile));

    let total = Object.keys(testData).length;
    let correct = 0;
    let results = [];

    for (let key in testData) {
        const q = testData[key];
        const userAnswer = answers[key];
        const isCorrect = userAnswer === q.correct;
        if (isCorrect) correct++;
        results.push({
            text: q.text,
            userAnswer,
            correctAnswer: q.correct,
            isCorrect,
            options: q
        });
    }

    let allResults = [];
    if (fs.existsSync(resultsFile)) {
        allResults = JSON.parse(fs.readFileSync(resultsFile));
    }
    allResults.push({ name, lastname, total, correct });
    fs.writeFileSync(resultsFile, JSON.stringify(allResults, null, 2));

    res.render('result', { name, lastname, total, correct, results });
});

app.listen(PORT, () => {
    console.log(`Сервер запущено: http://localhost:${PORT}`);
});