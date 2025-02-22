const express = require('express');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Encryption settings
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 characters for AES-256
const IV_LENGTH = 16; // For AES


//console.log(decrypt(encrypt('hello world')))

// Encryption functions
function encrypt(text) {
    if (!ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY not set in environment variables');
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY not set in environment variables');
    }
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Google OAuth2 setup using environment variables
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://20e600a8-a4ff-405a-b622-ca805689c34d-00-1nusdwsb1ve6x.worf.replit.dev/oauth2callback',   
);

// Token file path
const TOKEN_PATH = path.join(__dirname, 'token.json');

// File names from environment variables
const SOURCE_FILE_NAME = "bnkLovs.csv";
const TARGET_FILE_NAME = "bnkpasInp.csv";
const PARENT_FOLDER_ID = "1KvAsUtU-kUaWj42S-J5AlN28MFHaPzSx";// Required
// Load tokens from file if exists
async function loadTokens() {
    try {
        const encryptedData = await fs.readFile(TOKEN_PATH, 'utf8');
        const decryptedData = decrypt(encryptedData);
        const tokens = JSON.parse(decryptedData);
        oauth2Client.setCredentials(tokens);
    } catch (error) {
        console.log('No existing tokens found');
    }
}

// Save tokens to file
async function saveTokens(tokens) {
    const tokenData = JSON.stringify(tokens);
    const encryptedData = encrypt(tokenData);
    await fs.writeFile(TOKEN_PATH, encryptedData);
    oauth2Client.setCredentials(tokens);
}

// Configure token refresh
oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
        await saveTokens({
            refresh_token: tokens.refresh_token,
            access_token: tokens.access_token,
            expiry_date: tokens.expiry_date
        });
    } else {
        const currentCredentials = oauth2Client.credentials;
        await saveTokens({
            ...currentCredentials,
            access_token: tokens.access_token,
            expiry_date: tokens.expiry_date
        });
    }
});

const scopes = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.metadata'];
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Load tokens on startup
loadTokens();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Function to get or create file ID by name
async function getFileId(fileName, createIfNotExists = false) {
    try {
        const response = await drive.files.list({
            q: `name contains '${fileName}'`,
            fields: 'files(id)',
            spaces: 'drive'
        });

        if (response.data.files.length > 0) {
            return response.data.files[0].id;
        }

        if (createIfNotExists) {
            const fileMetadata = {
                name: fileName,
                mimeType: 'text/csv'
            };
            const createResponse = await drive.files.create({
                resource: fileMetadata,
                fields: 'id'
            });
            return createResponse.data.id;
        }

        throw new Error(`File ${fileName} not found`);
    } catch (error) {
        throw error;
    }
}

// HTML UI
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Save to Drive</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; }
        select, input, button { margin: 10px 0; padding: 5px; width: 100%; }
    </style>
</head>
<body>
    <div class="container">
        <div id="auth-section">
            <a href="/auth">Login with Google</a>
        </div>
        <div id="main-section" style="display: none;">
            <select id="dropdown">
                <option value="">Loading options...</option>
            </select>
            <input type="text" id="textInput" placeholder="Enter text to save">
            <button onclick="submitData()">Submit</button>
        </div>
    </div>

    <script>
        fetch('/check-auth')
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    document.getElementById('auth-section').style.display = 'none';
                    document.getElementById('main-section').style.display = 'block';
                    loadOptions();
                }
            });

        function loadOptions() {
            fetch('/get-options')
                .then(response => response.json())
                .then(options => {
                    const dropdown = document.getElementById('dropdown');
                    dropdown.innerHTML = '';
                    options.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option;
                        opt.textContent = option;
                        dropdown.appendChild(opt);
                    });
                });
        }

        function submitData() {
            const text = document.getElementById('textInput').value;
            const selectedOption = document.getElementById('dropdown').value;
            const final= selectedOption + "," + text+",piNo,i5No";
            fetch('/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'text=' + encodeURIComponent(final)
            })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                document.getElementById('textInput').value = '';
            });
        }
    </script>
</body>
</html>
`;

// Routes
app.get('/', (req, res) => {
    res.send(html);
});


app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        scope: scopes,
        redirect_uri: 'https://bnkpassupdater.onrender.com/oauth2callback',
        access_type: 'offline',  // Ensures refresh token is returned
        prompt: 'consent'        // Forces consent screen to get refresh token
    });
    res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        await saveTokens(tokens);
        res.redirect('/');
    } catch (error) {
        console.error('Error during OAuth callback:', error);
        res.status(500).send('Authentication failed');
    }
});

app.get('/check-auth', (req, res) => {
    const authenticated = !!oauth2Client.credentials.access_token;
    res.json({ authenticated });
});

app.get('/get-options', async (req, res) => {
    if (!oauth2Client.credentials.access_token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const sourceFileId = await getFileId(SOURCE_FILE_NAME);
        const response = await drive.files.get({
            fileId: sourceFileId,
            alt: 'media'
        });

        const csvContent = response.data;
        const options = csvContent.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        res.json(options);
    } catch (error) {
        console.error('Error fetching options:', error);
        res.status(500).json({ error: 'Failed to fetch options' });
    }
});

app.post('/submit', async (req, res) => {
    if (!oauth2Client.credentials.access_token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const text = req.body.text;
        const encodedText = Buffer.from(text).toString('base64');

        const targetFileId = await getFileId(TARGET_FILE_NAME, true);
        let existingContent = '';
        try {
            const response = await drive.files.get({
                fileId: targetFileId,
                alt: 'media'
            });
            existingContent = response.data;
        } catch (error) {
            // File might be empty or just created
        }

        const newContent = existingContent ? 
            `${existingContent}\n${encodedText}` : 
            encodedText;

        await drive.files.update({
            fileId: targetFileId,
            media: {
                mimeType: 'text/csv',
                body: newContent
            }
        });

        res.json({ message: 'Text encoded and saved successfully' });
    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).json({ error: 'Failed to process submission' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
