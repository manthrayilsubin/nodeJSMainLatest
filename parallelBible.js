const express = require('express');
const path = require('path');

const app = express();

// Serve all static files from "public" folder
app.use(express.static('public'));
// or with absolute path (more reliable):
// app.use(express.static(path.join(__dirname, 'public')));

// Optional: serve index.html as default when accessing root "/"

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'parallelBibTemplt.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});