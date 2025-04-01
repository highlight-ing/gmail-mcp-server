# Google Gmail MCP Server

A Model Context Protocol (MCP) server that provides tools for interacting with Gmail API. This server enables you to manage your emails programmatically through the MCP interface.

## Features

### Gmail Tools
- `list_emails`: List recent emails from your inbox with optional filtering
- `search_emails`: Advanced email search with Gmail query syntax
- `send_email`: Send new emails with support for CC and BCC
- `modify_email`: Modify email labels (archive, trash, mark read/unread)

## Prerequisites

1. **Node.js**: Install Node.js version 14 or higher
2. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Gmail API:
     1. Go to "APIs & Services" > "Library"
     2. Search for and enable "Gmail API"
   - Set up OAuth 2.0 credentials:
     1. Go to "APIs & Services" > "Credentials"
     2. Click "Create Credentials" > "OAuth client ID"
     3. Choose "Web application"
     4. Set "Authorized redirect URIs" to include: `http://localhost:3001/code`
     5. Note down the Client ID and Client Secret

## Setup Instructions

1. **Clone and Install**:
   ```bash
   git clone https://github.com/yourusername/google-gmail-mcp-server.git
   cd google-gmail-mcp-server
   npm install
   ```

2. **Create OAuth Credentials**:
   Create a `credentials.json` file in the root directory:
   ```json
   {
       "web": {
           "client_id": "YOUR_CLIENT_ID",
           "client_secret": "YOUR_CLIENT_SECRET",
           "redirect_uris": ["http://localhost:3001/code"],
           "auth_uri": "https://accounts.google.com/o/oauth2/auth",
           "token_uri": "https://oauth2.googleapis.com/token"
       }
   }
   ```

3. **Get Refresh Token**:
   ```bash
   node get-refresh-token.js
   ```
   This will:
   - Open your browser for Google OAuth authentication
   - Request the following permissions:
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/gmail.send`
   - Save the credentials to `token.json`
   - Display the refresh token in the console

4. **Configure MCP Settings**:
   Add the server configuration to your MCP settings file:
   - For VSCode Claude extension: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - For Claude desktop app: `~/Library/Application Support/Claude/claude_desktop_config.json`

   Add this to the `mcpServers` object:
   ```json
   {
     "mcpServers": {
       "google-gmail": {
         "command": "node",
         "args": ["/path/to/google-gmail-server/build/index.js"],
         "env": {
           "GOOGLE_ACCESS_TOKEN": "your_access_token",
         }
       }
     }
   }
   ```

5. **Build and Run**:
   ```bash
   npm run build
   ```

## Usage Examples

### Gmail Operations

1. **List Recent Emails**:
   ```json
   {
     "maxResults": 5,
     "query": "is:unread"
   }
   ```

2. **Search Emails**:
   ```json
   {
     "query": "from:example@gmail.com has:attachment",
     "maxResults": 10
   }
   ```

3. **Send Email**:
   ```json
   {
     "to": "recipient@example.com",
     "subject": "Hello",
     "body": "Message content",
     "cc": "cc@example.com",
     "bcc": "bcc@example.com"
   }
   ```

4. **Modify Email**:
   ```json
   {
     "id": "message_id",
     "addLabels": ["UNREAD"],
     "removeLabels": ["INBOX"]
   }
   ```

## License

MIT 