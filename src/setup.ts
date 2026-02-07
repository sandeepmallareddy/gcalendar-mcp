/**
 * Google Calendar MCP Server - OAuth Setup Tool
 *
 * This script handles the OAuth authentication flow:
 * 1. Checks for required environment variables
 * 2. Starts a local HTTP server
 * 3. Opens browser to OAuth consent URL
 * 4. Captures callback and exchanges for tokens
 * 5. Saves tokens to .tokens.json
 */
import { OAuth2Client } from 'google-auth-library';
import * as http from 'http';
import * as fs from 'fs/promises';
import * as path from 'path';
import open from 'open';
import { config } from 'dotenv';

// Load .env file
config();

// Configuration
const TOKEN_PATH = path.join(process.cwd(), '.tokens.json');

const OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback',
};

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

/**
 * Print colored message (simple implementation)
 */
function log(message: string, color: 'green' | 'red' | 'yellow' | 'blue' = 'blue') {
  const colors: Record<string, string> = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(message, 'green');
}

function logError(message: string) {
  log(message, 'red');
}

function logWarn(message: string) {
  log(message, 'yellow');
}

function logInfo(message: string) {
  log(message, 'blue');
}

/**
 * Check required environment variables
 */
function checkEnvVars(): boolean {
  logInfo('Checking environment variables...\n');

  let hasErrors = false;

  if (!OAUTH_CONFIG.clientId) {
    logError('Missing: GOOGLE_CLIENT_ID');
    hasErrors = true;
  } else {
    logSuccess(`GOOGLE_CLIENT_ID: Set`);
  }

  if (!OAUTH_CONFIG.clientSecret) {
    logError('Missing: GOOGLE_CLIENT_SECRET');
    hasErrors = true;
  } else {
    logSuccess(`GOOGLE_CLIENT_SECRET: Set`);
  }

  logInfo(`Redirect URI: ${OAUTH_CONFIG.redirectUri}\n`);

  return !hasErrors;
}

/**
 * Create OAuth2 client
 */
function createOAuthClient(): OAuth2Client {
  return new OAuth2Client(
    OAUTH_CONFIG.clientId,
    OAUTH_CONFIG.clientSecret,
    OAUTH_CONFIG.redirectUri
  );
}

/**
 * Generate auth URL
 */
async function getAuthUrl(oauth2Client: OAuth2Client): Promise<string> {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

/**
 * Exchange code for tokens and save
 */
async function exchangeCodeForTokens(oauth2Client: OAuth2Client, code: string): Promise<void> {
  const { tokens } = await oauth2Client.getToken(code);
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  logSuccess(`\nTokens saved to: ${TOKEN_PATH}`);
}

/**
 * Create HTTP server to handle OAuth callback
 */
function createServer(_oauth2Client: OAuth2Client): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);

      if (url.pathname === '/oauth2callback') {
        const code = url.searchParams.get('code');

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Authentication Successful</title>
                <style>
                  body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; }
                  .success { color: #10b981; font-size: 24px; }
                </style>
              </head>
              <body>
                <p class="success">Authentication Successful!</p>
                <p>You can close this window and return to the terminal.</p>
                <script>setTimeout(() => window.close(), 3000)</script>
              </body>
            </html>
          `);

          server.close();
          resolve(code);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Authorization code not received');
          reject(new Error('No authorization code in callback'));
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });

    server.on('error', reject);

    // Extract port from redirect URI
    const port = new URL(OAUTH_CONFIG.redirectUri).port || '3000';
    server.listen(parseInt(port), () => {
      logInfo(`Server running at http://localhost:${port}`);
    });
  });
}

/**
 * Main setup function
 */
export async function runSetup(): Promise<void> {
  console.log('\n===========================================');
  console.log('  Google Calendar MCP - OAuth Setup');
  console.log('===========================================\n');

  // Check environment variables
  if (!checkEnvVars()) {
    console.log('\n');
    logWarn('Please configure your .env file with:');
    console.log('  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com');
    console.log('  GOOGLE_CLIENT_SECRET=your-client-secret\n');
    console.log('Then run this setup again.\n');
    process.exit(1);
  }

  logSuccess('Environment variables verified!\n');

  const oauth2Client = createOAuthClient();

  try {
    // Generate auth URL
    const authUrl = await getAuthUrl(oauth2Client);
    logInfo('Opening browser for authentication...\n');

    // Open browser
    await open(authUrl);

    // Start server and wait for callback
    logInfo('Waiting for OAuth callback...\n');
    const code = await createServer(oauth2Client);

    // Exchange code for tokens
    logInfo('Exchanging authorization code for tokens...');
    await exchangeCodeForTokens(oauth2Client, code);

    console.log('\n===========================================');
    logSuccess('  Setup Complete!');
    console.log('===========================================\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run build');
    console.log('  2. Configure in Claude Desktop\n');

  } catch (error) {
    logError(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run setup only when executed directly
const isMainModule = process.argv[1]?.endsWith('setup.ts') || process.argv[1]?.endsWith('setup.js');
if (isMainModule) {
  runSetup();
}
