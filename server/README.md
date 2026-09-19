# SafetyBuddy API (SQL Server)

This API connects the Expo app to **Microsoft SQL Server** on your PC.

## Prerequisites
- SQL Server running (detected as `MSSQLSERVER`)
- Database `SafetyBuddy` with `dbo.users`
- Windows Authentication (Trusted Connection)

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
