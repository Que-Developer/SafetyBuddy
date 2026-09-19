# SafetyBuddy API (SQL Server)

This API connects the Expo app to **Microsoft SQL Server** on your PC.

## Prerequisites
- SQL Server running (detected as `MSSQLSERVER`)
- Database `SafetyBuddy` with `dbo.users`
- Windows Authentication (Trusted Connection)

## Schema (entities & relationships)
On API start, `ensureSchema` creates/extends domain + content tables and seeds if empty.

You can also apply the full script manually:

```bash
sqlcmd -S localhost -E -i server/schema.sql
```

Then start the API (`npm run api`) so content tables (`HelpContact`, `SupportService`, etc.) are ensured.

Creates / uses:

| Entity | Table |
|--------|--------|
| Student | `dbo.Student` |
| Emergency Alert | `dbo.EmergencyAlert` |
| Trusted Contact | `dbo.TrustedContact` |
| Campus Zone | `dbo.CampusZone` |
| Safety Alert | `dbo.SafetyAlert` |
| Incident Report | `dbo.IncidentReport` |
| Responder | `dbo.Responder` |
| Help contacts / resources / support / privacy / map markers | content tables seeded at API start |

App screens load live data from these tables via `/safety-alerts`, `/campus-zones`, `/emergency-alerts`, `/trusted-contacts`, etc.

## Start
From the repo root:

```bash
npm run api
```

Or:

```bash
cd server
npm start
```

API: http://localhost:3001  
Health: http://localhost:3001/health

## Connection
Configured in `server/.env`:

- `SQLSERVER=localhost`
- `SQLDATABASE=SafetyBuddy`
- ODBC Driver 17 + Trusted Connection

## Demo users
| Role | Email | Password |
|------|--------|----------|
| Student | student@safetybuddy.campus | Student123! |
| Security staff | security@safetybuddy.campus | Security123! |
| Security admin | admin@safetybuddy.campus | Admin123! |
