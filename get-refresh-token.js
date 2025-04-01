import { google } from 'googleapis';
import fs from 'fs';
import open from 'open';
import http from 'http';
import url from 'url';

// Read client secrets from file
const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const clientId = credentials.web.client_id;
const clientSecret = credentials.web.client_secret;
const redirectUri = 'http://localhost:3001'; // Using a different port for Gmail

// Create OAuth client
const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

// Generate auth URL - we MUST use these parameters to get a refresh token
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // This is crucial
  prompt: 'consent',      // Force consent screen to ensure refresh token
  scope: [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send'
  ]
});

// Create a simple HTTP server to handle the callback
const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    const code = parsedUrl.query.code;
    
    if (code) {
      console.log("Authorization code received.");
      
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      console.log("Tokens received:", Object.keys(tokens));
      
      if (tokens.refresh_token) {
        console.log("Refresh token successfully received!");
      } else {
        console.log("WARNING: No refresh token received!");
      }
      
      // Save tokens to file
      fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
      console.log("Tokens saved to token.json");
      
      res.end('Authentication successful! You can close this window.');
      
      // Close server
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 1000);
    }
  } catch (error) {
    console.error('Error:', error);
    res.end('Authentication error: ' + error.message);
  }
});

// Start the server
server.listen(3001, () => {
  console.log("Server running on port 3001");
  console.log("Opening browser for authentication...");
  console.log(authUrl);
  
  // Open the authorization URL in the default browser
  open(authUrl);
}); 