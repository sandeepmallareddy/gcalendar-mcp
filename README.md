![CI](https://github.com/sandeepmallareddy/gcalendar-mcp/actions/workflows/ci.yml/badge.svg)
![GitHub stars](https://img.shields.io/github/stars/sandeepmallareddy/gcalendar-mcp)
![GitHub forks](https://img.shields.io/github/forks/sandeepmallareddy/gcalendar-mcp)
![GitHub issues](https://img.shields.io/github/issues/sandeepmallareddy/gcalendar-mcp)

# Google Calendar MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that gives Claude full access to your Google Calendar. Create events, check availability, manage calendars, and more - all through natural conversation.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Claude Code Setup](#claude-code-setup)
- [Usage Examples](#usage-examples)
- [Available Tools](#available-tools)
- [Security](#security)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **39 MCP Tools** for complete Google Calendar control
- **Events**: Create, read, update, delete, move, import, quick add
- **Calendars**: CRUD operations, clear calendar contents
- **CalendarList**: Subscribe/unsubscribe, manage visibility
- **ACL**: Share calendars with others
- **Settings**: Read user preferences
- **Free/Busy**: Query availability across calendars
- **Automatic Meet links** for video conferencing
- **Prompt-on-write security**: Starts read-only, escalates as needed

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18 or higher** installed:
   ```bash
   node --version   # Should show v18.x or higher
   npm --version    # Should show v9.x or higher
   ```

2. **A Google Account** with Google Calendar enabled

3. **Claude Code** installed and available in your PATH

## Installation

### Step 1: Get the Google Calendar MCP Server Code

Open your terminal and run:

```bash
# Navigate to where you keep your projects
cd ~/projects   # or any directory you prefer

# Clone the repository
git clone https://github.com/sandeepmallareddy/gcalendar-mcp.git

# Go into the project folder
cd gcalendar-mcp
```

### Step 2: Install Dependencies

In the terminal, inside the `gcalendar-mcp` folder:

```bash
npm install
```

This will download all required packages. Wait for it to complete (you'll see a list of packages installed).

### Step 3: Build the Server

Compile the TypeScript code to JavaScript:

```bash
npm run build
```

You should see a `build/` folder created with the compiled files.

### Step 4: Verify the Build

```bash
# Check that the built file exists
ls -la build/index.js
```

## Configuration

### Step 1: Set Up Google OAuth Credentials

Google requires authentication to access your calendar. Here's how to set it up:

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Create a new project** (or select existing):
   - Click "Select a project" at the top
   - Click "New Project"
   - Name: `Google Calendar MCP`
   - Click "Create"

3. **Enable the Google Calendar API**:
   - In the left menu, click "Library"
   - Search for "Google Calendar API"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 credentials**:
   - In the left menu, click "Credentials"
   - Click "Create Credentials"
   - Select "OAuth client ID"
   - Application type: "Desktop application"
   - Name: "Google Calendar MCP"
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need them soon)

5. **Add redirect URI**:
   - Under the OAuth 2.0 Client ID you just created
   - Add `http://localhost:3000/oauth2callback` to "Authorized redirect URIs"
   - Click "Save"

### Step 2: Create Environment File (Optional)

Create a file named `.env` in the `gcalendar-mcp` folder with your credentials:

```bash
# Create the file (or open with your editor)
nano .env
```

Add the following content (replace with your actual values):

```
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

**Important**: Replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with the values you copied from Google Cloud Console.

Save the file:
- Press `Ctrl + X` to exit
- Press `Y` to confirm
- Press `Enter` to save

### Step 3: Set Proper File Permissions (Optional but Recommended)

Secure your environment file:

```bash
# Restrict access to your user only
chmod 600 .env
```

## Claude Code Setup

### Add the MCP Server Using CLI

Claude Code provides a built-in command to add MCP servers. Run this in your terminal:

```bash
# Add the Google Calendar MCP server
claude mcp add gcalendar --transport stdio \
  --env GOOGLE_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com" \
  --env GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET" \
  --env GOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback" \
  -- node /PATH/TO/YOUR/gcalendar-mcp/build/index.js
```

**Important**: Replace the following:
- `YOUR_CLIENT_ID` - Your Google OAuth Client ID
- `YOUR_CLIENT_SECRET` - Your Google OAuth Client Secret
- `/PATH/TO/YOUR/gcalendar-mcp/` - The actual path to your gcalendar-mcp folder

**Example** (adjust paths for your system):
```bash
claude mcp add gcalendar --transport stdio \
  --env GOOGLE_CLIENT_ID="398036798396-xxx.apps.googleusercontent.com" \
  --env GOOGLE_CLIENT_SECRET="GOCSPX-xxx" \
  --env GOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback" \
  -- node /home/username/projects/gcalendar-mcp/build/index.js
```

### Verify Installation

```bash
# List all configured MCP servers
claude mcp list

# You should see gcalendar in the list
```

### Complete Authentication

The first time you use a calendar tool:

1. Claude will indicate authentication is needed
2. A URL will be displayed - open it in your browser
3. Sign in with your Google account
4. Review the permissions and click "Continue"
5. You'll be redirected to a localhost page
6. Copy the code from the URL and provide it when prompted

**Your tokens are stored securely at:**
- macOS/Linux: `~/.config/gcalendar-mcp/tokens.json`

### Managing the Server

```bash
# List all MCP servers
claude mcp list

# Get details about gcalendar server
claude mcp get gcalendar

# Remove the gcalendar server
claude mcp remove gcalendar

# Restart Claude Code to reload the server
```

### Configuration Storage

The MCP server configuration is stored in `~/.claude.json`. After adding the server, you can view it:

```bash
cat ~/.claude.json
```

The configuration will look like:
```json
{
  "mcpServers": {
    "gcalendar": {
      "command": "node",
      "args": ["/path/to/gcalendar-mcp/build/index.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "...",
        "GOOGLE_CLIENT_SECRET": "...",
        "GOOGLE_REDIRECT_URI": "..."
      }
    }
  }
}
```

## Usage Examples

Once connected, you can ask Claude to:

```plaintext
# Check your schedule
"What meetings do I have tomorrow?"

# Create events
"Schedule a team meeting with john@example.com next Tuesday at 2pm for 1 hour"

# Find free time
"When is everyone free next Friday afternoon?"

# Get availability
"Am I free at 3pm today?"

# Manage calendars
"Create a new calendar called 'Side Projects'"

# Share calendars
"Share my work calendar with sarah@example.com as writer"

# Natural language
"Remind me to call mom on Sunday at 10am"
```

## Available Tools

### Events

| Tool | Description |
|------|-------------|
| `create_event` | Create a new event with title, time, location, attendees |
| `get_event` | Get details of a specific event |
| `list_events` | List events with filters (date range, search, etc.) |
| `update_event` | Fully update an event |
| `patch_event` | Partially update an event (only changed fields) |
| `delete_event` | Delete an event |
| `move_event` | Move event to another calendar |
| `quick_add` | Create event from natural language |
| `import_event` | Import event by UID |
| `list_instances` | Get occurrences of a recurring event |
| `watch_events` | Set up push notifications for changes |

### Calendars

| Tool | Description |
|------|-------------|
| `get_calendar` | Get calendar metadata |
| `create_calendar` | Create a new calendar |
| `update_calendar` | Update calendar properties |
| `delete_calendar` | Delete a calendar |
| `clear_calendar` | Remove all events from a calendar |

### Calendar List

| Tool | Description |
|------|-------------|
| `list_calendar_list` | List all calendars you're subscribed to |
| `add_calendar_to_list` | Subscribe to a calendar |
| `remove_calendar_from_list` | Unsubscribe from a calendar |

### Access Control (ACL)

| Tool | Description |
|------|-------------|
| `list_acl` | List who has access to a calendar |
| `create_acl_rule` | Share a calendar with someone |
| `delete_acl_rule` | Remove someone's access |

### Other

| Tool | Description |
|------|-------------|
| `query_freebusy` | Check availability across calendars |
| `get_colors` | Get available calendar and event colors |
| `list_settings` | List your Google Calendar settings |

## Security

This server follows security best practices:

- **OAuth 2.0**: Industry-standard authentication
- **Token storage**: Credentials stored in `~/.config/gcalendar-mcp/`
- **Minimal scopes**: Starts with read-only, requests more only when needed
- **No logging**: Credentials are never written to logs

### Token File Permissions

After authentication, secure your token file:

```bash
chmod 700 ~/.config/gcalendar-mcp
chmod 600 ~/.config/gcalendar-mcp/tokens.json
```

## Development

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run built server
node build/index.js

# Run tests
npm test

# Type check
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format

# Full check
npm run check
```

## Troubleshooting

### "Command not found: claude"

Claude Code CLI is not installed or not in your PATH.

```bash
# Check if Claude is installed
which claude   # macOS/Linux)

# If not installed, download from https://claude.com/claude-code
```

### Authentication fails

1. Verify your Client ID and Client Secret are correct
2. Ensure redirect URI is exactly `http://localhost:3000/oauth2callback`
3. Check that Google Calendar API is enabled
4. Try deleting tokens and re-authenticating:
   ```bash
   rm ~/.config/gcalendar-mcp/tokens.json
   ```

### Tools not appearing in Claude

1. Restart Claude Code completely
2. Verify the server is listed:
   ```bash
   claude mcp list
   ```
3. Check the server details:
   ```bash
   claude mcp get gcalendar
   ```
4. Verify the server builds successfully:
   ```bash
   cd gcalendar-mcp
   npm run build
   ```

### "Server already running" error

The OAuth callback server might still be running. Kill it:
```bash
# Find the process
lsof -i :3000

# Kill it (replace PID with the number you see)
kill [PID]
```

### Token expired errors

Tokens refresh automatically. If you see persistent errors:
```bash
rm ~/.config/gcalendar-mcp/tokens.json
# Re-authenticate through Claude
```

### MCP server not starting

Check the server configuration:
```bash
# View full MCP configuration
cat ~/.claude.json

# Verify the path to your build file exists
ls -la /path/to/gcalendar-mcp/build/index.js
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support

- Report bugs via [GitHub Issues](https://github.com/sandeepmallareddy/gcalendar-mcp/issues)
- Security issues: see [SECURITY.md](SECURITY.md)
