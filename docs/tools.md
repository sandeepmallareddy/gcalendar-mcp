# Tool Reference

## Events

### create_event

Create a new event on a calendar.

**Parameters:**
- `calendarId` (string): Calendar ID (default: "primary")
- `summary` (string): Event title
- `description` (string): Event description
- `location` (string): Event location
- `start.dateTime` (string): Start time ISO datetime
- `start.timeZone` (string): Start time zone
- `end.dateTime` (string): End time ISO datetime
- `end.timeZone` (string): End time zone
- `attendees` (array): [{ email, displayName? }]
- `recurrence` (array): RRULE strings
- `reminders` (object): { useDefault?, overrides? }
- `colorId` (string): Color ID (1-11)

**Example:**
```json
{
  "summary": "Team Meeting",
  "description": "Weekly sync",
  "start": { "dateTime": "2024-01-15T10:00:00-08:00" },
  "end": { "dateTime": "2024-01-15T11:00:00-08:00" },
  "attendees": [{ "email": "team@example.com" }]
}
```

### get_event

Get a single event by ID.

**Parameters:**
- `calendarId` (string): Calendar ID
- `eventId` (string): Event ID (required)
- `timeZone` (string): Response time zone

### list_events

List events on a calendar.

**Parameters:**
- `calendarId` (string): Calendar ID
- `timeMin` (string): Start of range (ISO)
- `timeMax` (string): End of range (ISO)
- `maxResults` (number): 1-2500 (default: 250)
- `q` (string): Full-text search
- `orderBy` (string): "startTime" or "updated"
- `showDeleted` (boolean): Include deleted
- `singleEvents` (boolean): Expand recurring

### update_event

Full event update (replaces all fields).

**Parameters:**
- `calendarId` (string): Calendar ID
- `eventId` (string): Event ID
- All event fields (same as create)

### delete_event

Delete an event permanently.

**Parameters:**
- `calendarId` (string): Calendar ID
- `eventId` (string): Event ID

### patch_event

Partial event update (only provided fields).

**Parameters:**
- `calendarId` (string): Calendar ID
- `eventId` (string): Event ID
- Any subset of event fields

### move_event

Move event to another calendar.

**Parameters:**
- `calendarId` (string): Source calendar
- `eventId` (string): Event ID
- `destinationCalendarId` (string): Target calendar
- `sendUpdates` (string): "all", "externalOnly", "none"

### quick_add

Create event from natural language.

**Parameters:**
- `calendarId` (string): Calendar ID
- `text` (string): Natural language (e.g., "Lunch tomorrow at 1pm")
- `sendUpdates` (string): "all", "externalOnly", "none"

### import_event

Import event by UID.

**Parameters:**
- `calendarId` (string): Calendar ID
- `id` (string): Event ID to use
- `summary`, `description`, `location`, `start`, `end`, `attendees`, `colorId`

### list_instances

Get occurrences of recurring event.

**Parameters:**
- `calendarId` (string): Calendar ID
- `eventId` (string): Recurring event ID
- `timeMin`, `timeMax`: Range
- `maxResults` (number): Max instances
- `showDeleted` (boolean): Include deleted

### watch_events

Set up push notifications.

**Parameters:**
- `calendarId` (string): Calendar ID
- `webhookUrl` (string): Your webhook URL
- `webhookToken` (string): Verification token
- `expiration` (number): Channel expiration timestamp

---

## Calendars

### get_calendar

Get calendar metadata.

**Parameters:**
- `calendarId` (string): Calendar ID

### create_calendar

Create a new calendar.

**Parameters:**
- `summary` (string): Calendar name
- `description` (string): Description
- `location` (string): Location
- `timeZone` (string): Time zone (default: UTC)

### update_calendar

Update calendar metadata.

**Parameters:**
- `calendarId` (string): Calendar ID
- `summary`, `description`, `location`, `timeZone`

### delete_calendar

Delete a calendar.

**Parameters:**
- `calendarId` (string): Calendar ID

### clear_calendar

Delete all events from calendar.

**Parameters:**
- `calendarId` (string): Calendar ID

---

## CalendarList

### list_calendar_list

List all subscribed calendars.

**Parameters:**
- `minAccessRole` (string): "none", "freeBusyReader", "reader", "writer", "owner"
- `showDeleted` (boolean)
- `maxResults` (number): 1-250 (default: 100)

### get_calendar_list_entry

Get calendar list entry.

**Parameters:**
- `calendarId` (string): Calendar ID

### add_calendar_to_list

Subscribe to a calendar.

**Parameters:**
- `calendarId` (string): Calendar ID
- `colorId` (string): Color ID
- `hidden` (boolean): Hide from list
- `selected` (boolean): Auto-select

### update_calendar_list_entry

Update list entry properties.

**Parameters:**
- `calendarId` (string): Calendar ID
- `colorId`, `hidden`, `selected`

### remove_calendar_from_list

Unsubscribe from calendar.

**Parameters:**
- `calendarId` (string): Calendar ID

### watch_calendar_list

Set up notifications.

**Parameters:**
- `webhookUrl` (string): Webhook URL
- `webhookToken` (string): Token
- `expiration` (number): Timestamp

---

## ACL

### list_acl

List access control rules.

**Parameters:**
- `calendarId` (string): Calendar ID
- `maxResults` (number)

### get_acl_rule

Get ACL rule.

**Parameters:**
- `calendarId` (string): Calendar ID
- `ruleId` (string): Rule ID

### create_acl_rule

Share calendar.

**Parameters:**
- `calendarId` (string): Calendar ID
- `role` (string): "none", "freeBusyReader", "reader", "writer", "owner"
- `scope` (object): { type: "user"|"group"|"domain"|"default", value?: string }

### update_acl_rule

Update ACL rule.

**Parameters:**
- `calendarId` (string): Calendar ID
- `ruleId` (string): Rule ID
- `role`, `scope`

### delete_acl_rule

Delete ACL rule.

**Parameters:**
- `calendarId` (string): Calendar ID
- `ruleId` (string): Rule ID

### watch_acl

Set up notifications.

**Parameters:**
- `calendarId` (string): Calendar ID
- `webhookUrl` (string): Webhook URL

---

## Settings

### list_settings

List all user settings.

**Parameters:** (none)

### get_setting

Get specific setting.

**Parameters:**
- `setting` (string): Setting name

### watch_settings

Set up notifications.

**Parameters:**
- `webhookUrl` (string): Webhook URL

---

## Colors

### get_colors

Get available calendar and event colors.

**Parameters:** (none)

---

## Freebusy

### query_freebusy

Query free/busy for calendars.

**Parameters:**
- `timeMin` (string): Start time (ISO)
- `timeMax` (string): End time (ISO)
- `timeZone` (string): Time zone
- `calendars` (object): { calendarId: "" }
