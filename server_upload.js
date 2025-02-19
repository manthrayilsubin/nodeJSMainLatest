const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs').promises;

const app = express();
const port = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public')); // Serve static files from 'public' directory

app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;

    const pythonProcess = spawn('python', ['summarize.py', filePath]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.log(`Python script exited with code ${code}`);
        return res.status(500).send('Error processing the document.');
      }
      await fs.unlink(filePath); // Clean up
      res.send(result);
    });
  } catch (error) {
    console.error(`Server Error: ${error}`);
    res.status(500).send('An error occurred while processing your request.');
  }
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index_Upload.html'));
});
app.listen(port, () => {
  console.log(`Server running on port  ${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server gracefully terminated');
    process.exit(0);
  });
});