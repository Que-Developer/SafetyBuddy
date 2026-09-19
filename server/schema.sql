/**
 * SafetyBuddy SQL Server schema — entities & relationships
 *
 * Student 1:M EmergencyAlert
 * Student M:M TrustedContact (via StudentTrustedContact)
 * Student M:1 CampusZone
 * SafetyAlert M:M CampusZone (via SafetyAlertZone)
 * Student 1:M IncidentReport
 * Student 1:1 Responder (optional staff link)
 * EmergencyAlert 1:1 CampusZone
 * EmergencyAlert M:M IncidentReport (via EmergencyAlertIncident)
 * Responder 1:1 EmergencyAlert (active assignment)
 * SafetyAlert 1:M IncidentReport
 */

IF OBJECT_ID('dbo.EmergencyAlertIncident', 'U') IS NOT NULL DROP TABLE dbo.EmergencyAlertIncident;
IF OBJECT_ID('dbo.SafetyAlertZone', 'U') IS NOT NULL DROP TABLE dbo.SafetyAlertZone;
IF OBJECT_ID('dbo.StudentTrustedContact', 'U') IS NOT NULL DROP TABLE dbo.StudentTrustedContact;
IF OBJECT_ID('dbo.IncidentReport', 'U') IS NOT NULL DROP TABLE dbo.IncidentReport;
IF OBJECT_ID('dbo.EmergencyAlert', 'U') IS NOT NULL DROP TABLE dbo.EmergencyAlert;
IF OBJECT_ID('dbo.SafetyAlert', 'U') IS NOT NULL DROP TABLE dbo.SafetyAlert;
IF OBJECT_ID('dbo.TrustedContact', 'U') IS NOT NULL DROP TABLE dbo.TrustedContact;
IF OBJECT_ID('dbo.Responder', 'U') IS NOT NULL DROP TABLE dbo.Responder;
IF OBJECT_ID('dbo.Student', 'U') IS NOT NULL DROP TABLE dbo.Student;
IF OBJECT_ID('dbo.CampusZone', 'U') IS NOT NULL DROP TABLE dbo.CampusZone;
GO

CREATE TABLE dbo.CampusZone (
  ZoneId        INT IDENTITY(1,1) PRIMARY KEY,
  Name          NVARCHAR(120) NOT NULL,
  Description   NVARCHAR(400) NULL,
  RiskStatus    NVARCHAR(20)  NOT NULL DEFAULT 'Low',
  MapLat        FLOAT NULL,
  MapLng        FLOAT NULL
);
GO

CREATE TABLE dbo.Student (
  StudentId     INT IDENTITY(1,1) PRIMARY KEY,
  UserId        INT NULL, -- links to dbo.users when present
  FullName      NVARCHAR(120) NOT NULL,
  Email         NVARCHAR(160) NOT NULL UNIQUE,
  Phone         NVARCHAR(40)  NULL,
  HomeZoneId    INT NULL REFERENCES dbo.CampusZone(ZoneId),
  CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.TrustedContact (
  ContactId     INT IDENTITY(1,1) PRIMARY KEY,
  Name          NVARCHAR(120) NOT NULL,
  Phone         NVARCHAR(40)  NOT NULL,
  Email         NVARCHAR(160) NULL,
  Relationship  NVARCHAR(80)  NULL,
  AlertMethod   NVARCHAR(20)  NOT NULL DEFAULT 'SMS'
);
GO

CREATE TABLE dbo.StudentTrustedContact (
  StudentId     INT NOT NULL REFERENCES dbo.Student(StudentId),
  ContactId     INT NOT NULL REFERENCES dbo.TrustedContact(ContactId),
  PRIMARY KEY (StudentId, ContactId)
);
GO

CREATE TABLE dbo.Responder (
  ResponderId   INT IDENTITY(1,1) PRIMARY KEY,
  StudentId     INT NULL UNIQUE REFERENCES dbo.Student(StudentId), -- 1:1 optional
  UserId        INT NULL,
  FullName      NVARCHAR(120) NOT NULL,
  RoleTitle     NVARCHAR(80)  NOT NULL,
  ContactPhone  NVARCHAR(40)  NULL,
  Availability  NVARCHAR(20)  NOT NULL DEFAULT 'Available'
);
GO

CREATE TABLE dbo.SafetyAlert (
  SafetyAlertId INT IDENTITY(1,1) PRIMARY KEY,
  Title         NVARCHAR(160) NOT NULL,
  Message       NVARCHAR(800) NOT NULL,
  AlertLevel    NVARCHAR(20)  NOT NULL, -- Information | Caution | Urgent
  AffectedArea  NVARCHAR(160) NULL,
  RecommendedAction NVARCHAR(400) NULL,
  PostedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.SafetyAlertZone (
  SafetyAlertId INT NOT NULL REFERENCES dbo.SafetyAlert(SafetyAlertId),
  ZoneId        INT NOT NULL REFERENCES dbo.CampusZone(ZoneId),
  PRIMARY KEY (SafetyAlertId, ZoneId)
);
GO

CREATE TABLE dbo.EmergencyAlert (
  EmergencyAlertId INT IDENTITY(1,1) PRIMARY KEY,
  StudentId     INT NOT NULL REFERENCES dbo.Student(StudentId),
  ZoneId        INT NULL REFERENCES dbo.CampusZone(ZoneId), -- 1:1 zone at trigger
  AlertType     NVARCHAR(80)  NOT NULL,
  LocationLabel NVARCHAR(200) NOT NULL,
  TimeTriggered DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  Status        NVARCHAR(40)  NOT NULL DEFAULT 'New',
  -- New | Acknowledged | Responder Dispatched | Resolved | False Alarm
  AssignedResponderId INT NULL UNIQUE REFERENCES dbo.Responder(ResponderId), -- 1:1
  Notes         NVARCHAR(800) NULL,
  IsAnonymous   BIT NOT NULL DEFAULT 0
);
GO

CREATE TABLE dbo.IncidentReport (
  ReportId      INT IDENTITY(1,1) PRIMARY KEY,
  StudentId     INT NOT NULL REFERENCES dbo.Student(StudentId),
  SafetyAlertId INT NULL REFERENCES dbo.SafetyAlert(SafetyAlertId), -- 1:M from SafetyAlert
  ReportType    NVARCHAR(80)  NOT NULL,
  LocationLabel NVARCHAR(200) NOT NULL,
  Description   NVARCHAR(1200) NOT NULL,
  PhotoUri      NVARCHAR(400) NULL,
  IsAnonymous   BIT NOT NULL DEFAULT 1,
  Status        NVARCHAR(40)  NOT NULL DEFAULT 'Submitted',
  CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.EmergencyAlertIncident (
  EmergencyAlertId INT NOT NULL REFERENCES dbo.EmergencyAlert(EmergencyAlertId),
  ReportId         INT NOT NULL REFERENCES dbo.IncidentReport(ReportId),
  PRIMARY KEY (EmergencyAlertId, ReportId)
);
GO
