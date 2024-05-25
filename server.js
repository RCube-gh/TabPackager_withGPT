const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const port = 3000;

const dataFilePath = path.join(__dirname, 'data', 'groups.json');

// Ensure data directory and file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ groups: [] }, null, 2));
}

app.use(bodyParser.json());
app.use(express.static('public'));

// Endpoint to get groups
app.get('/groups', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data');
            return;
        }
        res.send(data);
    });
});

// Endpoint to save groups
app.post('/groups', (req, res) => {
    const jsonData = JSON.stringify(req.body, null, 2);
    fs.writeFile(dataFilePath, jsonData, (err) => {
        if (err) {
            res.status(500).send('Error saving data');
            return;
        }
        res.send('Data saved');
    });
});

// New endpoint to fetch website title
app.post('/fetch-title', async (req, res) => {
    const { url } = req.body;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const title = $('title').text();
        res.json({ title });
    } catch (error) {
        res.status(500).send('Error fetching website title');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
