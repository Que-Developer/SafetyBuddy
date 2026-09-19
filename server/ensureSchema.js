/**
 * Ensure SafetyBuddy domain + content tables exist and have seed rows.
 * Safe to run on every API start (idempotent).
 */
const sql = require("mssql/msnodesqlv8");

async function ensureSchema(pool) {
  await pool.request().query(`
IF OBJECT_ID('dbo.CampusZone', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CampusZone (
    ZoneId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name NVARCHAR(120) NOT NULL,
    Description NVARCHAR(400) NULL,
    RiskStatus NVARCHAR(20) NOT NULL DEFAULT N'Low',
    MapLat FLOAT NULL,
    MapLng FLOAT NULL,
    NearestHelpPoint NVARCHAR(160) NULL,
    MapReference NVARCHAR(40) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END

IF COL_LENGTH('dbo.CampusZone', 'NearestHelpPoint') IS NULL
  ALTER TABLE dbo.CampusZone ADD NearestHelpPoint NVARCHAR(160) NULL;
IF COL_LENGTH('dbo.CampusZone', 'MapReference') IS NULL
  ALTER TABLE dbo.CampusZone ADD MapReference NVARCHAR(40) NULL;

IF OBJECT_ID('dbo.HelpContact', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.HelpContact (
    ContactId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Label NVARCHAR(120) NOT NULL,
    PhoneNumber NVARCHAR(40) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
  );
END

IF OBJECT_ID('dbo.SupportService', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.SupportService (
    ServiceId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Title NVARCHAR(160) NOT NULL,
    Detail NVARCHAR(400) NOT NULL,
    ActionText NVARCHAR(200) NOT NULL,
    IconKey NVARCHAR(40) NULL,
    SortOrder INT NOT NULL DEFAULT 0
  );
END

IF OBJECT_ID('dbo.SafetyResource', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.SafetyResource (
    ResourceId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Title NVARCHAR(160) NOT NULL,
    Summary NVARCHAR(400) NOT NULL,
    Body NVARCHAR(2000) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0
  );
END

IF OBJECT_ID('dbo.PrivacySection', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PrivacySection (
    SectionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Title NVARCHAR(160) NOT NULL,
    Body NVARCHAR(2000) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0
  );
END

IF OBJECT_ID('dbo.ReportCategory', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ReportCategory (
    CategoryId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name NVARCHAR(80) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0
  );
END

IF OBJECT_ID('dbo.MapMarker', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MapMarker (
    MarkerId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name NVARCHAR(160) NOT NULL,
    MarkerType NVARCHAR(40) NOT NULL,
    Description NVARCHAR(400) NULL,
    MapLat FLOAT NOT NULL,
    MapLng FLOAT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
  );
END

IF OBJECT_ID('dbo.SafetyAlert', 'U') IS NOT NULL AND COL_LENGTH('dbo.SafetyAlert', 'IsActive') IS NULL
  ALTER TABLE dbo.SafetyAlert ADD IsActive BIT NOT NULL CONSTRAINT DF_SafetyAlert_IsActive DEFAULT (1);

IF OBJECT_ID('dbo.IncidentReport', 'U') IS NOT NULL AND COL_LENGTH('dbo.IncidentReport', 'FollowUpRequested') IS NULL
  ALTER TABLE dbo.IncidentReport ADD FollowUpRequested BIT NOT NULL CONSTRAINT DF_IR_FollowUp DEFAULT (0);
`);

  await seedIfEmpty(pool);
}

async function count(pool, table) {
  const r = await pool.request().query(`SELECT COUNT(*) AS c FROM dbo.${table}`);
  return Number(r.recordset[0].c);
}

async function seedIfEmpty(pool) {
  if ((await count(pool, "CampusZone")) === 0) {
    await pool.request().query(`
INSERT INTO dbo.CampusZone (Name, Description, RiskStatus, MapLat, MapLng, NearestHelpPoint, MapReference) VALUES
(N'Main Library', N'Central campus library and study halls', N'Low', -33.9608, 25.6162, N'Library help desk', N'LIB-1'),
(N'Science Block', N'Labs and lecture theatres', N'Medium', -33.9612, 25.6171, N'Science reception', N'SCI-1'),
(N'Residence Village', N'Student residences', N'High', -33.9596, 25.6174, N'North Residence security desk', N'RES-1'),
(N'Parking Lot C', N'Evening parking near sports fields', N'High', -33.9638, 25.6158, N'South gate guard house', N'PRK-C'),
(N'Student Centre', N'Food court and admin services', N'Low', -33.9621, 25.6148, N'Student Centre info desk', N'SC-1'),
(N'Main Gate', N'Primary campus entrance', N'Low', -33.9632, 25.6139, N'Main gate security', N'GATE-1');
`);
  } else {
    await pool.request().query(`
UPDATE dbo.CampusZone SET NearestHelpPoint = ISNULL(NearestHelpPoint, N'Campus Security'),
  MapReference = ISNULL(MapReference, N'ZONE')
WHERE NearestHelpPoint IS NULL OR MapReference IS NULL;
`);
  }

  if ((await count(pool, "HelpContact")) === 0) {
    await pool.request().query(`
INSERT INTO dbo.HelpContact (Label, PhoneNumber, SortOrder) VALUES
(N'Campus Security', N'+27 41 504 2000', 1),
(N'Campus Health Clinic', N'+27 41 504 2174', 2),
(N'Student Counselling', N'+27 41 504 2511', 3),
(N'SAP Emergency', N'10111', 4);
`);
  }

  if ((await count(pool, "SupportService")) === 0) {
    await pool.request().query(`
INSERT INTO dbo.SupportService (Title, Detail, ActionText, IconKey, SortOrder) VALUES
(N'Student Counselling', N'Free confidential sessions — Mon–Fri 08:00–16:30', N'Call +27 41 504 2511', N'chatbubbles', 1),
(N'Peer Support Network', N'Talk to trained student peers in a safe space', N'Visit Student Centre Room 12', N'people-circle', 2),
(N'Campus Health Clinic', N'Medical and wellness support on campus', N'Call +27 41 504 2174', N'medkit', 3),
(N'24/7 Crisis Line (SADAG)', N'If you need someone to talk to right now', N'Call 0800 567 567', N'call', 4);
`);
  }

  if ((await count(pool, "SafetyResource")) === 0) {
    await pool.request().query(`
INSERT INTO dbo.SafetyResource (Title, Summary, Body, SortOrder) VALUES
(N'What to do in an emergency', N'Clear steps when you need help right away.', N'Move to a lit, public area if you can. Press Help to alert campus security and your trusted contacts. Stay on the line if connected.', 1),
(N'How to contact campus security', N'One-tap numbers and what to expect.', N'Use Call for Help for Campus Security. Share your location if prompted. Security can dispatch a patrol without a long call.', 2),
(N'Safe walking tips', N'Practical guidance for moving around campus.', N'Prefer well-lit paths. Walk with someone when you can. Start Walk With Me so a trusted contact can watch your journey.', 3),
(N'Transport safety tips', N'Waiting for rides and shuttles.', N'Wait in designated pickup zones. Share your trip with a trusted contact. If a situation feels wrong, cancel and move to a busy area.', 4),
(N'Residence safety tips', N'Staying safer in and around residences.', N'Do not prop open access doors. Report broken lights or locks. If followed to your door, walk to a help point instead.', 5),
(N'Supporting a friend who feels unsafe', N'How to help without taking over.', N'Listen without judgement. Offer to walk with them or sit somewhere public. Help them contact security or counselling if they want.', 6),
(N'Counselling & wellness support', N'You are not alone after a difficult moment.', N'Student Counselling and Campus Health are available. SafetyBuddy offers a direct path to support services.', 7),
(N'After reporting an incident', N'What happens next, calmly explained.', N'Your report helps campus identify patterns. You can request follow-up. Support services remain available.', 8);
`);
  }

  if ((await count(pool, "PrivacySection")) === 0) {
    await pool.request().query(`
INSERT INTO dbo.PrivacySection (Title, Body, SortOrder) VALUES
(N'What data would be collected', N'In production: account identity, emergency alert details, location during an active alert or Walk With Me, trusted contact details you choose to save, and optional incident reports.', 1),
(N'Why it is needed', N'So campus security can find you quickly, trusted contacts can be notified, and the university can improve campus safety — never for marketing.', 2),
(N'Who would have access', N'Authorised campus security responders, designated student support staff when referrals are needed, and system administrators for configuration.', 3),
(N'How long it would be kept', N'Emergency records would be retained only as long as required by university policy and law, then securely deleted or anonymised.', 4),
(N'How it would be protected', N'Encrypted transport (TLS), encrypted storage, role-based access, audit logs, and university-approved authentication in a production deployment.', 5),
(N'POPIA considerations', N'Processing would follow purpose limitation, minimality, consent where required, security safeguards, and your rights through official university channels.', 6);
`);
  }

  if ((await count(pool, "ReportCategory")) === 0) {
    await pool.request().query(`
INSERT INTO dbo.ReportCategory (Name, IsActive, SortOrder) VALUES
(N'Suspicious Activity', 1, 1),
(N'Harassment', 1, 2),
(N'Theft', 1, 3),
(N'Infrastructure Hazard', 1, 4),
(N'Medical Concern', 1, 5),
(N'Other', 1, 6),
(N'Poor lighting', 1, 7);
`);
  }

  if ((await count(pool, "MapMarker")) === 0) {
    await pool.request().query(`
INSERT INTO dbo.MapMarker (Name, MarkerType, Description, MapLat, MapLng) VALUES
(N'Reported: poorly lit path', N'danger', N'Student report — low lighting behind Science Building', -33.9619, 25.6168),
(N'Security patrol point', N'security', N'Regular evening patrol checkpoint', -33.9605, 25.6158),
(N'Emergency phone', N'emergency', N'Blue-light emergency phone', -33.9615, 25.6165),
(N'First aid station', N'firstAid', N'Campus health first-aid point', -33.9620, 25.6152),
(N'Safe zone — Student Centre', N'safeZone', N'Busy public area with staff nearby', -33.9621, 25.6148);
`);
  }

  // Ensure core domain rows for dashboards
  if ((await safeCount(pool, "SafetyAlert")) === 0) {
    await pool.request().query(`
INSERT INTO dbo.SafetyAlert (Title, Message, AlertLevel, AffectedArea, RecommendedAction) VALUES
(N'Lighting outage — Parking Lot C', N'Several lights are offline near Parking Lot C. Extra patrols are active.', N'Caution', N'Parking Lot C', N'Use the lit walkway via Student Centre or request Walk With Me.'),
(N'Wellness check-in week', N'Counselling drop-in sessions available at Student Centre.', N'Information', N'Student Centre', N'Visit Student Support if you need someone to talk to.'),
(N'Increased patrols after dusk — Residence Village', N'Campus Protection is increasing visible patrols this evening following student reports.', N'Urgent', N'Residence Village', N'Walk with a buddy after dark and use well-lit paths.');
`);
  }

  if ((await safeCount(pool, "Student")) === 0) {
    await pool.request().query(`
DECLARE @zoneRes INT = (SELECT TOP 1 ZoneId FROM dbo.CampusZone WHERE Name LIKE N'%Residence%');
DECLARE @userStudent INT = (SELECT TOP 1 id FROM dbo.users WHERE role = N'student');
INSERT INTO dbo.Student (UserId, FullName, Email, Phone, HomeZoneId) VALUES
(@userStudent, N'Amahle Student', N'student@safetybuddy.campus', N'0820001111', @zoneRes),
(NULL, N'Thando Mokoena', N'thando@safetybuddy.campus', N'0820002222', @zoneRes),
(NULL, N'Jordan Naidoo', N'jordan@safetybuddy.campus', N'0820003333', NULL);
`);
  }

  if ((await safeCount(pool, "Responder")) === 0) {
    await pool.request().query(`
DECLARE @userSecurity INT = (SELECT TOP 1 id FROM dbo.users WHERE role = N'security_staff');
DECLARE @student2 INT = (SELECT TOP 1 StudentId FROM dbo.Student WHERE Email = N'thando@safetybuddy.campus');
INSERT INTO dbo.Responder (StudentId, UserId, FullName, RoleTitle, ContactPhone, Availability) VALUES
(NULL, @userSecurity, N'Officer N. Jacobs', N'Campus Security Patrol', N'+27 41 000 1101', N'Available'),
(NULL, NULL, N'Officer T. Smith', N'Residence Liaison', N'+27 41 000 1102', N'Available'),
(NULL, NULL, N'Nurse A. Patel', N'Campus Health', N'+27 41 000 1180', N'Available'),
(@student2, NULL, N'Thando Mokoena', N'Student Marshal', N'0820002222', N'Busy');
`);
  }

  if ((await safeCount(pool, "TrustedContact")) === 0) {
    await pool.request().query(`
INSERT INTO dbo.TrustedContact (Name, Phone, Email, Relationship, AlertMethod) VALUES
(N'Mama Dlamini', N'0831110001', N'mama@example.com', N'Parent', N'SMS'),
(N'Sipho Friend', N'0831110002', N'sipho@example.com', N'Friend', N'App'),
(N'Residence RA', N'0831110003', NULL, N'Residence Advisor', N'Call');
DECLARE @s1 INT = (SELECT TOP 1 StudentId FROM dbo.Student WHERE Email = N'student@safetybuddy.campus');
DECLARE @c1 INT = (SELECT TOP 1 ContactId FROM dbo.TrustedContact WHERE Name = N'Mama Dlamini');
DECLARE @c2 INT = (SELECT TOP 1 ContactId FROM dbo.TrustedContact WHERE Name = N'Sipho Friend');
IF @s1 IS NOT NULL
BEGIN
  INSERT INTO dbo.StudentTrustedContact (StudentId, ContactId) VALUES (@s1, @c1), (@s1, @c2);
END
`);
  }

  if ((await safeCount(pool, "EmergencyAlert")) === 0) {
    await pool.request().query(`
DECLARE @s1 INT = (SELECT TOP 1 StudentId FROM dbo.Student ORDER BY StudentId);
DECLARE @zone INT = (SELECT TOP 1 ZoneId FROM dbo.CampusZone WHERE Name LIKE N'%Parking%');
DECLARE @r1 INT = (SELECT TOP 1 ResponderId FROM dbo.Responder ORDER BY ResponderId);
INSERT INTO dbo.EmergencyAlert (StudentId, ZoneId, AlertType, LocationLabel, Status, AssignedResponderId, Notes, IsAnonymous) VALUES
(@s1, @zone, N'SOS — Security', N'Parking Lot C — row B', N'New', NULL, N'Caller reported feeling unsafe near the north lot.', 0),
(@s1, @zone, N'Medical', N'Main Library, Ground Floor', N'Responder Dispatched', @r1, N'Student felt dizzy and requested first aid.', 0);
`);
  }
}

async function OBJECT_EXISTS(pool, table) {
  const r = await pool
    .request()
    .input("t", sql.NVarChar, table)
    .query(`SELECT OBJECT_ID('dbo.' + @t, 'U') AS id`);
  return r.recordset[0].id != null;
}

async function safeCount(pool, table) {
  if (!(await OBJECT_EXISTS(pool, table))) return -1;
  return count(pool, table);
}

module.exports = { ensureSchema };
