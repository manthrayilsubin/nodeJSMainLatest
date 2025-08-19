//require('dotenv').config();
const express = require('express');
const axios = require('axios');
const open = require('open');

// Initialize Express app
const app = express();
const port = 3000;

// Configuration from environment variables
const clientId = ""
  //process.env.STRAVA_CLIENT_ID;
const clientSecret = ""
  //process.env.STRAVA_CLIENT_SECRET;
const redirectUri = 'https://localhost/callback'; // Must match the redirect URI in your Strava app settings

// Step 1: Generate and open the authorization URL
const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=activity:write,activity:read`;

// Route to start the OAuth flow
app.get('/auth', (req, res) => {
  console.log('Opening Strava authorization page...');
  open(authUrl); // Automatically opens the authorization URL in the default browser
  res.send('Redirecting to Strava for authorization... Check your browser.');
});

// Route to handle the callback from Strava
app.get('/callback', async (req, res) => {
  const authCode = req.query.code;
  if (!authCode) {
    console.error('No authorization code received');
    return res.status(400).send('Error: No authorization code received');
  }

  try {
    // Step 2: Exchange authorization code for access and refresh tokens
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code: authCode,
      grant_type: 'authorization_code'
    });

    const { access_token, refresh_token, expires_at } = response.data;
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('Token Expires At:', new Date(expires_at * 1000));

    // Instruct the user to update their .env file
    console.log('\nPlease update your .env file with the following refresh token:');
    console.log(`STRAVA_REFRESH_TOKEN=${refresh_token}`);

    res.send(`
      <h1>Authorization Successful</h1>
      <p>Refresh Token: ${refresh_token}</p>
      <p>Please copy the refresh token above and add it to your .env file as STRAVA_REFRESH_TOKEN.</p>
    `);

    // Optionally, shut down the server after successful token exchange
    process.exit(0);
  } catch (error) {
    console.error('Error exchanging authorization code:', error.response ? error.response.data : error.message);
    res.status(500).send('Error exchanging authorization code');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Visit http://localhost:3000/auth to start the OAuth flow');
});