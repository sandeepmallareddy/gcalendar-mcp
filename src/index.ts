/**
 * Google Calendar MCP Server
 *
 * A Model Context Protocol server for Google Calendar API v3
 */
import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs/promises';
import * as path from 'path';

// Token path resolution - checks multiple locations
async function getTokenPath(): Promise<string> {
  // 1. Explicit env var pointing to file
  if (process.env.GCALENDAR_MCP_TOKEN_PATH) {
    return process.env.GCALENDAR_MCP_TOKEN_PATH;
  }
  // 2. Standard location (~/.config/gcalendar-mcp/tokens.json)
  const standardPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.config', 'gcalendar-mcp', 'tokens.json');
  try {
    await fs.access(standardPath);
    return standardPath;
  } catch {
    // 3. Project directory (.tokens.json)
    const projectPath = path.join(process.cwd(), '.tokens.json');
    try {
      await fs.access(projectPath);
      return projectPath;
    } catch {
      return standardPath; // Default to standard path
    }
  }
}

const OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback',
};

// Scopes
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

// Create OAuth client
const oauth2Client = new OAuth2Client(
  OAUTH_CONFIG.clientId,
  OAUTH_CONFIG.clientSecret,
  OAUTH_CONFIG.redirectUri
);

// Listen for token refresh events and save new tokens automatically
oauth2Client.on('tokens', async (tokens) => {
  if (tokens.refresh_token) {
    // Preserve the refresh token in credentials
    oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });
  }
  const tokenPath = await getTokenPath();
  const credentials = oauth2Client.credentials;
  await fs.writeFile(tokenPath, JSON.stringify(credentials, null, 2));
  console.error('Tokens refreshed and saved to', tokenPath);
});

// Create MCP server
const server = new Server(
  {
    name: 'gcalendar-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Check if we have valid authenticated credentials
 */
async function isAuthenticated(): Promise<boolean> {
  try {
    const tokenPath = await getTokenPath();
    const tokens = JSON.parse(await fs.readFile(tokenPath, 'utf-8'));
    return !!(tokens && tokens.refresh_token);
  } catch {
    return false;
  }
}

/**
 * Get or create authenticated calendar client
 */
async function getCalendar() {
  const tokenPath = await getTokenPath();
  try {
    const tokens = JSON.parse(await fs.readFile(tokenPath, 'utf-8'));
    oauth2Client.setCredentials(tokens);
  } catch {
    // No cached tokens - will fail on API call
  }
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Generate auth URL for user consent
 */
async function getAuthUrl(): Promise<string> {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

/**
 * Handle OAuth callback
 */
async function handleAuthCallback(code: string): Promise<void> {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const tokenPath = await getTokenPath();
  // Ensure directory exists for the token file
  const tokenDir = path.dirname(tokenPath);
  await fs.mkdir(tokenDir, { recursive: true });
  await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
}

// Define tools
const tools = [
  {
    name: 'list_events',
    description: 'List events on a calendar. Supports filtering by time range and search queries.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', default: 'primary', description: 'Calendar ID' },
        timeMin: { type: 'string', description: 'Start time (ISO)' },
        timeMax: { type: 'string', description: 'End time (ISO)' },
        maxResults: { type: 'integer', default: 100, description: 'Max events' },
        q: { type: 'string', description: 'Search query' },
      },
    },
  },
  {
    name: 'get_event',
    description: 'Get a single event by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', default: 'primary' },
        eventId: { type: 'string' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'create_event',
    description: 'Create a new event.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', default: 'primary' },
        summary: { type: 'string', description: 'Event title' },
        description: { type: 'string' },
        location: { type: 'string' },
        startDateTime: { type: 'string', description: 'Start (ISO)' },
        endDateTime: { type: 'string', description: 'End (ISO)' },
        attendees: { type: 'string', description: 'Comma-separated emails' },
      },
    },
  },
  {
    name: 'update_event',
    description: 'Update an event.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', default: 'primary' },
        eventId: { type: 'string' },
        summary: { type: 'string' },
        description: { type: 'string' },
        startDateTime: { type: 'string' },
        endDateTime: { type: 'string' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'delete_event',
    description: 'Delete an event.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', default: 'primary' },
        eventId: { type: 'string' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'quick_add',
    description: 'Create event from natural language.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', default: 'primary' },
        text: { type: 'string', description: 'Natural language (e.g., "Meeting tomorrow at 3pm")' },
      },
      required: ['text'],
    },
  },
  {
    name: 'list_instances',
    description: 'Get instances of a recurring event.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string', default: 'primary' },
        eventId: { type: 'string' },
        timeMin: { type: 'string' },
        timeMax: { type: 'string' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'list_calendars',
    description: 'List all accessible calendars.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_calendar',
    description: 'Get calendar metadata.',
    inputSchema: {
      type: 'object',
      properties: { calendarId: { type: 'string' } },
      required: ['calendarId'],
    },
  },
  {
    name: 'create_calendar',
    description: 'Create a new calendar.',
    inputSchema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        description: { type: 'string' },
        location: { type: 'string' },
      },
      required: ['summary'],
    },
  },
  {
    name: 'delete_calendar',
    description: 'Delete a calendar.',
    inputSchema: {
      type: 'object',
      properties: { calendarId: { type: 'string' } },
      required: ['calendarId'],
    },
  },
  {
    name: 'clear_calendar',
    description: 'Delete all events from a calendar.',
    inputSchema: {
      type: 'object',
      properties: { calendarId: { type: 'string' } },
      required: ['calendarId'],
    },
  },
  {
    name: 'list_acl',
    description: 'List access control rules.',
    inputSchema: {
      type: 'object',
      properties: { calendarId: { type: 'string' } },
      required: ['calendarId'],
    },
  },
  {
    name: 'get_acl_rule',
    description: 'Get an ACL rule.',
    inputSchema: {
      type: 'object',
      properties: { calendarId: { type: 'string' }, ruleId: { type: 'string' } },
      required: ['calendarId', 'ruleId'],
    },
  },
  {
    name: 'create_acl_rule',
    description: 'Share a calendar with someone.',
    inputSchema: {
      type: 'object',
      properties: {
        calendarId: { type: 'string' },
        role: { type: 'string', enum: ['reader', 'writer', 'owner'] },
        scopeType: { type: 'string', enum: ['user', 'group'] },
        scopeValue: { type: 'string', description: 'Email or domain' },
      },
      required: ['calendarId', 'role', 'scopeType', 'scopeValue'],
    },
  },
  {
    name: 'delete_acl_rule',
    description: 'Remove calendar sharing.',
    inputSchema: {
      type: 'object',
      properties: { calendarId: { type: 'string' }, ruleId: { type: 'string' } },
      required: ['calendarId', 'ruleId'],
    },
  },
  {
    name: 'query_freebusy',
    description: 'Query free/busy information.',
    inputSchema: {
      type: 'object',
      properties: {
        timeMin: { type: 'string' },
        timeMax: { type: 'string' },
        calendars: { type: 'string', description: 'Comma-separated IDs' },
      },
      required: ['timeMin', 'timeMax', 'calendars'],
    },
  },
  {
    name: 'get_colors',
    description: 'Get available colors.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'auth_status',
    description: 'Check authentication status and get auth URL if needed.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reauth',
    description: 'Delete stored tokens and generate new auth URL for re-authentication.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'revoke_auth',
    description: 'Revoke tokens with Google and delete local tokens, then get new auth URL.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'handle_oauth_callback',
    description: 'Complete OAuth with authorization code.',
    inputSchema: {
      type: 'object',
      properties: { code: { type: 'string' } },
      required: ['code'],
    },
  },
];

// Handle tools/list request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tools/call request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const calendar = await getCalendar();
    const calendarId = (args?.calendarId as string) || 'primary';

    switch (name) {
      case 'list_events': {
        const response = await calendar.events.list({
          calendarId,
          timeMin: args?.timeMin as string,
          timeMax: args?.timeMax as string,
          maxResults: args?.maxResults as number,
          q: args?.q as string,
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data.items || [], null, 2) }] };
      }
      case 'get_event': {
        const response = await calendar.events.get({ calendarId, eventId: args?.eventId as string });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }
      case 'create_event': {
        const event: any = {};
        if (args?.summary) event.summary = args.summary;
        if (args?.description) event.description = args.description;
        if (args?.location) event.location = args.location;
        if (args?.startDateTime) event.start = { dateTime: args.startDateTime };
        if (args?.endDateTime) event.end = { dateTime: args.endDateTime };
        if (args?.attendees) {
          event.attendees = (args.attendees as string).split(',').map((e: string) => ({ email: e.trim() }));
        }
        // Always add Google Meet link
        event.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
        const response = await calendar.events.insert({ calendarId, requestBody: event, conferenceDataVersion: 1 });
        return { content: [{ type: 'text', text: `Created: ${JSON.stringify(response.data, null, 2)}` }] };
      }
      case 'update_event': {
        const event: any = {};
        if (args?.summary) event.summary = args.summary;
        if (args?.description) event.description = args.description;
        if (args?.startDateTime) event.start = { dateTime: args.startDateTime };
        if (args?.endDateTime) event.end = { dateTime: args.endDateTime };
        const response = await calendar.events.update({ calendarId, eventId: args?.eventId as string, requestBody: event });
        return { content: [{ type: 'text', text: `Updated: ${JSON.stringify(response.data, null, 2)}` }] };
      }
      case 'delete_event': {
        await calendar.events.delete({ calendarId, eventId: args?.eventId as string });
        return { content: [{ type: 'text', text: 'Event deleted' }] };
      }
      case 'quick_add': {
        const response = await calendar.events.quickAdd({ calendarId, text: args?.text as string });
        return { content: [{ type: 'text', text: `Created: ${JSON.stringify(response.data, null, 2)}` }] };
      }
      case 'list_instances': {
        const response = await calendar.events.instances({
          calendarId,
          eventId: args?.eventId as string,
          timeMin: args?.timeMin as string,
          timeMax: args?.timeMax as string,
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data.items || [], null, 2) }] };
      }
      case 'list_calendars': {
        const response = await calendar.calendarList.list();
        return { content: [{ type: 'text', text: JSON.stringify(response.data.items || [], null, 2) }] };
      }
      case 'get_calendar': {
        const response = await calendar.calendars.get({ calendarId: args?.calendarId as string });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }
      case 'create_calendar': {
        const response = await calendar.calendars.insert({
          requestBody: { summary: args?.summary as string, description: args?.description as string, location: args?.location as string },
        });
        return { content: [{ type: 'text', text: `Created: ${JSON.stringify(response.data, null, 2)}` }] };
      }
      case 'delete_calendar': {
        await calendar.calendars.delete({ calendarId: args?.calendarId as string });
        return { content: [{ type: 'text', text: 'Calendar deleted' }] };
      }
      case 'clear_calendar': {
        await calendar.calendars.clear({ calendarId: args?.calendarId as string });
        return { content: [{ type: 'text', text: 'Calendar cleared' }] };
      }
      case 'list_acl': {
        const response = await calendar.acl.list({ calendarId: args?.calendarId as string });
        return { content: [{ type: 'text', text: JSON.stringify(response.data.items || [], null, 2) }] };
      }
      case 'get_acl_rule': {
        const response = await calendar.acl.get({ calendarId: args?.calendarId as string, ruleId: args?.ruleId as string });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }
      case 'create_acl_rule': {
        const response = await calendar.acl.insert({
          calendarId: args?.calendarId as string,
          requestBody: { role: args?.role as string, scope: { type: args?.scopeType as string, value: args?.scopeValue as string } },
        });
        return { content: [{ type: 'text', text: `Created: ${JSON.stringify(response.data, null, 2)}` }] };
      }
      case 'delete_acl_rule': {
        await calendar.acl.delete({ calendarId: args?.calendarId as string, ruleId: args?.ruleId as string });
        return { content: [{ type: 'text', text: 'ACL rule deleted' }] };
      }
      case 'query_freebusy': {
        const calendarIds = (args?.calendars as string)?.split(',').map((c) => c.trim());
        const response = await calendar.freebusy.query({
          requestBody: { timeMin: args?.timeMin as string, timeMax: args?.timeMax as string, items: calendarIds.map((id) => ({ id })) },
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data.calendars || {}, null, 2) }] };
      }
      case 'get_colors': {
        const response = await calendar.colors.get();
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }
      case 'auth_status': {
        if (await isAuthenticated()) {
          const tokenPath = await getTokenPath();
          const tokens = JSON.parse(await fs.readFile(tokenPath, 'utf-8'));
          const expiry = tokens.expiry_date ? new Date(Number(tokens.expiry_date)).toLocaleString() : 'unknown';
          return { content: [{ type: 'text', text: `Authenticated. Token expires: ${expiry}` }] };
        }
        const url = await getAuthUrl();
        return { content: [{ type: 'text', text: `Not authenticated. Visit:\n${url}` }] };
      }
      case 'reauth': {
        const tokenPath = await getTokenPath();
        try {
          await fs.unlink(tokenPath);
        } catch {
          // Ignore if file doesn't exist
        }
        const url = await getAuthUrl();
        return { content: [{ type: 'text', text: `Tokens deleted. Visit to re-authenticate:\n${url}` }] };
      }
      case 'revoke_auth': {
        const tokenPath = await getTokenPath();
        try {
          const tokens = JSON.parse(await fs.readFile(tokenPath, 'utf-8'));
          if (tokens.refresh_token) {
            await oauth2Client.revokeToken(tokens.refresh_token);
          } else if (tokens.access_token) {
            await oauth2Client.revokeToken(tokens.access_token);
          }
        } catch {
          // Ignore errors from revoke
        }
        try {
          await fs.unlink(tokenPath);
        } catch {
          // Ignore if file doesn't exist
        }
        const url = await getAuthUrl();
        return { content: [{ type: 'text', text: `Tokens revoked and deleted. Visit to re-authenticate:\n${url}` }] };
      }
      case 'handle_oauth_callback': {
        await handleAuthCallback(args?.code as string);
        return { content: [{ type: 'text', text: 'Authentication complete!' }] };
      }
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
    }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }] };
  }
});

// Setup mode - run OAuth setup
async function runSetup(): Promise<void> {
  // Dynamic import to avoid loading setup code in MCP mode
  const setupModule = await import('./setup.js');
  await setupModule.runSetup();
}

// Start server
async function main() {
  // Check for --setup flag
  if (process.argv.includes('--setup')) {
    await runSetup();
    return;
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Calendar MCP Server running');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
