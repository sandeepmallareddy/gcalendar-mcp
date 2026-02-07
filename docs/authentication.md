# Authentication Guide

## Overview

The Google Calendar MCP Server uses OAuth 2.0 for authentication. By default, it starts with read-only access and requests additional permissions when write operations are needed.

## Initial Setup

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID:
   - Application type: Desktop application
   - Name: Google Calendar MCP
3. Note your Client ID and Client Secret
4. Add redirect URI: `http://localhost:3000/oauth2callback`

### 2. Enable Calendar API

In Google Cloud Console:
1. Navigate to "APIs & Services > Library"
2. Search for "Google Calendar API"
3. Click "Enable"

### 3. Configure the Server

Create a `.env` file:
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

## Authentication Flow

### First Run

1. Start the server
2. The server checks for stored tokens
3. If no tokens, it generates an auth URL
4. Open the URL in your browser
5. Grant permissions
6. You'll be redirected to `http://localhost:3000/oauth2callback`
7. If using Claude Desktop, auth completes automatically
8. Otherwise, copy the code from the URL and enter it

### Token Storage

Tokens are stored at:
- Linux/macOS: `~/.config/gcalendar-mcp/tokens.json`
- Custom path: Set `GCALENDAR_MCP_TOKEN_PATH` env var

### Scope Levels

The server uses three scope levels:

1. **Read-only** (`calendar.readonly`): List/view calendars and events
2. **Events** (`calendar.events`): Create, edit, delete events
3. **Full** (`calendar`): Manage calendars and sharing

When you first authenticate, you get read-only access. When you try a write operation:
1. Server checks your current scope
2. If insufficient, it requests re-authentication
3. You grant additional permissions
4. Token is updated with new scope

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | Yes |
| `GOOGLE_REDIRECT_URI` | OAuth Redirect URI | Yes |
| `GCALENDAR_MCP_TOKEN_PATH` | Token storage directory | No |
| `GCALENDAR_MCP_LOG_LEVEL` | Log level (debug/info/warn/error) | No |

## Troubleshooting

### "No refresh token received"
- OAuth requires `prompt=consent` to return refresh token
- This is already configured in the server
- Try authenticating again

### "Token expired"
- Server automatically refreshes tokens
- If refresh fails, re-authenticate

### "Insufficient permissions"
- Write operations require Events or Full scope
- Server will guide you through re-authentication

### Token file errors
- Check file permissions
- Ensure directory exists
- Verify token file is valid JSON
