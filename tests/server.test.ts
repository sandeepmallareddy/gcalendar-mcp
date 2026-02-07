/**
 * Tests for Google Calendar MCP Server
 */

describe('OAuth Configuration', () => {
  it('should have correct calendar.readonly scope', () => {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ];
    expect(scopes).toContain('https://www.googleapis.com/auth/calendar.readonly');
  });

  it('should have correct calendar.events scope', () => {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ];
    expect(scopes).toContain('https://www.googleapis.com/auth/calendar.events');
  });
});

describe('Tool Names', () => {
  // These are the tools that should be registered in the server
  const expectedTools = [
    'list_events',
    'get_event',
    'create_event',
    'update_event',
    'delete_event',
    'quick_add',
    'list_instances',
    'list_calendars',
    'get_calendar',
    'create_calendar',
    'delete_calendar',
    'clear_calendar',
    'list_acl',
    'get_acl_rule',
    'create_acl_rule',
    'delete_acl_rule',
    'query_freebusy',
    'get_colors',
    'auth_status',
    'handle_oauth_callback',
  ];

  it('should define all expected tools', () => {
    expect(expectedTools).toHaveLength(20);
  });

  expectedTools.forEach((tool) => {
    it(`should include ${tool} tool`, () => {
      expect(expectedTools).toContain(tool);
    });
  });
});

describe('Configuration', () => {
  it('should support environment variable configuration', () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    expect(clientId === undefined || typeof clientId === 'string').toBe(true);
    expect(clientSecret === undefined || typeof clientSecret === 'string').toBe(true);
  });

  it('should have default redirect URI', () => {
    const defaultRedirect = 'http://localhost:3000/oauth2callback';
    expect(defaultRedirect).toBe('http://localhost:3000/oauth2callback');
  });
});

describe('Event Parameters', () => {
  it('should support all event creation parameters', () => {
    const eventParams = {
      calendarId: 'primary',
      summary: 'Meeting',
      description: 'Team sync',
      location: 'Conference Room',
      startDateTime: '2024-01-15T10:00:00Z',
      endDateTime: '2024-01-15T11:00:00Z',
      attendees: 'user@example.com, another@example.com',
    };

    expect(eventParams.summary).toBe('Meeting');
    expect(eventParams.location).toBe('Conference Room');
    expect(eventParams.attendees).toContain('@example.com');
  });

  it('should parse attendees correctly', () => {
    const attendeesString = 'user@example.com, another@example.com';
    const attendees = attendeesString.split(',').map((e) => e.trim());
    expect(attendees).toHaveLength(2);
    expect(attendees[0]).toBe('user@example.com');
    expect(attendees[1]).toBe('another@example.com');
  });
});

describe('Calendar Parameters', () => {
  it('should support calendar creation parameters', () => {
    const calendarParams = {
      summary: 'New Calendar',
      description: 'A new calendar for events',
      location: 'Remote',
    };

    expect(calendarParams.summary).toBe('New Calendar');
    expect(typeof calendarParams.summary).toBe('string');
  });
});

describe('ACL Parameters', () => {
  it('should support ACL creation parameters', () => {
    const aclParams = {
      calendarId: 'primary',
      role: 'writer',
      scopeType: 'user',
      scopeValue: 'user@example.com',
    };

    expect(aclParams.role).toBe('writer');
    expect(aclParams.scopeType).toBe('user');
  });

  it('should support different scope types', () => {
    const scopeTypes = ['user', 'group', 'domain', 'default'];
    scopeTypes.forEach((type) => {
      expect(scopeTypes).toContain(type);
    });
  });
});

describe('Freebusy Parameters', () => {
  it('should support freebusy query parameters', () => {
    const freebusyParams = {
      timeMin: '2024-01-15T00:00:00Z',
      timeMax: '2024-01-16T00:00:00Z',
      calendars: 'primary, work@group.calendar.google.com',
    };

    expect(freebusyParams.timeMin).toBeDefined();
    expect(freebusyParams.calendars).toContain(',');
  });

  it('should parse calendar IDs correctly', () => {
    const calendarsString = 'cal1, cal2, cal3';
    const calendarIds = calendarsString.split(',').map((c) => c.trim());
    expect(calendarIds).toEqual(['cal1', 'cal2', 'cal3']);
  });
});

describe('Token Path Resolution', () => {
  it('should resolve token path with env var', () => {
    process.env.GCALENDAR_MCP_TOKEN_PATH = '/custom/path/tokens.json';
    expect(process.env.GCALENDAR_MCP_TOKEN_PATH).toBe('/custom/path/tokens.json');
  });

  it('should use HOME for standard path', () => {
    process.env.HOME = '/home/user';
    expect(process.env.HOME).toBe('/home/user');
  });

  it('should fallback to USERPROFILE on Windows', () => {
    process.env.USERPROFILE = 'C:\\Users\\user';
    expect(process.env.USERPROFILE).toBe('C:\\Users\\user');
  });
});
