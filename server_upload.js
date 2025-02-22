//gdrive upload from nodejs used for book summary or any other file input flows
//get clientid and token file before proceed
const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
/*const util = require('util'),
  request = util.promisify(require('request')),
  fs = require('fs'),
  fsp = fs.promises;*/
const fs = require('fs').promises;
const createReadStream = require('fs').createReadStream;
//const fs = require('fs').promises;
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Google Drive API credentials (get these from Google Cloud Console)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://20e600a8-a4ff-405a-b622-ca805689c34d-00-1nusdwsb1ve6x.worf.replit.dev/callback';
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.metadata'];

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Serve static files
app.use(express.static('public'));

// Handle token refresh
oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
        // Store the refresh token when we get a new one
        const currentTokens = JSON.parse(await fs.readFile('token.json', 'utf8'));
        currentTokens.refresh_token = tokens.refresh_token;
        await fs.writeFile('token.json', JSON.stringify(currentTokens));
    }
});


// Check for existing token
async function loadToken() {
    try {
        const token = await fs.readFile('token.json', 'utf8');
        const credentials = JSON.parse(token);
        oauth2Client.setCredentials(JSON.parse(token));
        if (credentials.refresh_token) {
            oauth2Client.setCredentials({
                refresh_token: credentials.refresh_token,
                access_token: credentials.access_token
            });}
        return true;
    } catch (error) {
        return false;
    }
}

// OAuth2 route
app.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      prompt: 'consent'
    });
    res.redirect(authUrl);
});

// OAuth2 callback
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        console.log(JSON.stringify(tokens))
        await fs.writeFile('token.json', JSON.stringify(tokens));
        res.send('Authentication successful! You can close this window and return to the app.');
    } catch (error) {
        res.status(500).send('Error during authentication: ' + error.message);
    }
});

// Upload route
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        // Check if we have a token
        const hasToken = await loadToken();
        if (!hasToken) {
            return res.status(401).json({ 
                error: 'Please authenticate first by visiting /auth' 
            });
        }
        // Refresh token if expired
        try {
            await oauth2Client.getAccessToken();
        } catch (refreshError) {
            return res.status(401).json({ 
                error: 'Token refresh failed, please re-authenticate at /auth' 
            });
        }
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });

        const fileMetadata = {
            name: req.file.originalname,
            // Optional: specify folder ID if you want to upload to a specific folder
             parents: ['1R4bz5rjnz5lw0ujEogDBT9DvmTLKJ4MJ']
        };

        const fileName = req.file.originalname;
        // Check if file already exists
        const existingFiles = await drive.files.list({
            q: `name='${fileName}'`,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        const media = {
            mimeType: 'application/pdf',
            body: createReadStream(req.file.path)
        };

        let response;
        
        if (existingFiles.data.files.length > 0) {
            // Update existing file
            const fileId = existingFiles.data.files[0].id;
            response = await drive.files.update({
                fileId: fileId,
                media: media,
                fields: 'id'
            });
        } else {
            // Create new file
            response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id'
            });
        }

        // Clean up temp file
        await fs.unlink(req.file.path);

        res.json({ fileId: response.data.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/mainpage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index_Upload.html'));
});


// Start server
const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Check token on startup
    const hasToken = await loadToken();
    if (!hasToken) {
        console.log('Please authenticate by visiting:');
        console.log(`http://localhost:${PORT}/auth`);
    } else {
        console.log('Token loaded successfully');

    }
});
