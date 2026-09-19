/*
==============================================================================
  SafetyBuddy — Microsoft SQL Server schema
  Database: SafetyBuddy

  ENTITIES
    Student, EmergencyAlert, TrustedContact, CampusZone,
    SafetyAlert, IncidentReport (= Incident Alert), Responder

  RELATIONSHIPS
    Student           1:M  EmergencyAlert
    Student           M:M  TrustedContact     (StudentTrustedContact)
    Student           M:1  CampusZone         (Student.HomeZoneId)
    SafetyAlert       M:M  CampusZone         (SafetyAlertZone)
    Student           1:M  IncidentReport
    Student           1:1  Responder          (Responder.StudentId UNIQUE)
    EmergencyAlert    1:1  CampusZone         (EmergencyAlert.ZoneId — one zone per alert)
    EmergencyAlert    M:M  IncidentReport     (EmergencyAlertIncident)
    Responder         1:1  EmergencyAlert     (EmergencyAlert.AssignedResponderId UNIQUE)
    SafetyAlert       1:M  IncidentReport     (IncidentReport.SafetyAlertId)
==============================================================================
*/

USE SafetyBuddy;
GO

/* ---- Drop in FK-safe order (keep dbo.users) ---- */
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

/* -------------------------------------------------------------------------- */
/* CampusZone                                                                 */
/* -------------------------------------------------------------------------- */
CREATE TABLE dbo.CampusZone (
  ZoneId        INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_CampusZone PRIMARY KEY,
  Name          NVARCHAR(120) NOT NULL,
  Description   NVARCHAR(400) NULL,
  RiskStatus    NVARCHAR(20)  NOT NULL
                  CONSTRAINT DF_CampusZone_Risk DEFAULT (N'Low')
                  CONSTRAINT CK_CampusZone_Risk CHECK (RiskStatus IN (N'Low', N'Medium', N'High')),
  MapLat        FLOAT NULL,
  MapLng        FLOAT NULL,
  CreatedAt     DATETIME2 NOT NULL CONSTRAINT DF_CampusZone_Created DEFAULT (SYSUTCDATETIME())
);
GO

/* -------------------------------------------------------------------------- */
/* Student  (M:1 CampusZone via HomeZoneId)                                   */
/* -------------------------------------------------------------------------- */
CREATE TABLE dbo.Student (
  StudentId     INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Student PRIMARY KEY,
  UserId        INT NULL
                  CONSTRAINT FK_Student_Users REFERENCES dbo.users(id),
  FullName      NVARCHAR(120) NOT NULL,
  Email         NVARCHAR(160) NOT NULL
                  CONSTRAINT UQ_Student_Email UNIQUE,
  Phone         NVARCHAR(40)  NULL,
  HomeZoneId    INT NULL
                  CONSTRAINT FK_Student_CampusZone REFERENCES dbo.CampusZone(ZoneId),
  CreatedAt     DATETIME2 NOT NULL CONSTRAINT DF_Student_Created DEFAULT (SYSUTCDATETIME())
);
GO

CREATE INDEX IX_Student_HomeZoneId ON dbo.Student(HomeZoneId);
GO

/* -------------------------------------------------------------------------- */
/* TrustedContact + Student M:M junction                                      */
/* -------------------------------------------------------------------------- */
CREATE TABLE dbo.TrustedContact (
  ContactId     INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TrustedContact PRIMARY KEY,
  Name          NVARCHAR(120) NOT NULL,
  Phone         NVARCHAR(40)  NOT NULL,
  Email         NVARCHAR(160) NULL,
  Relationship  NVARCHAR(80)  NULL,
  AlertMethod   NVARCHAR(20)  NOT NULL
                  CONSTRAINT DF_TrustedContact_Method DEFAULT (N'SMS')
                  CONSTRAINT CK_TrustedContact_Method CHECK (AlertMethod IN (N'SMS', N'Call', N'Email', N'App'))
);
GO

CREATE TABLE dbo.StudentTrustedContact (
  StudentId     INT NOT NULL
                  CONSTRAINT FK_STC_Student REFERENCES dbo.Student(StudentId) ON DELETE CASCADE,
  ContactId     INT NOT NULL
                  CONSTRAINT FK_STC_Contact REFERENCES dbo.TrustedContact(ContactId) ON DELETE CASCADE,
  LinkedAt      DATETIME2 NOT NULL CONSTRAINT DF_STC_Linked DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT PK_StudentTrustedContact PRIMARY KEY (StudentId, ContactId)
);
GO

/* -------------------------------------------------------------------------- */
/* Responder  (1:1 Student via StudentId UNIQUE)                              */
/* -------------------------------------------------------------------------- */
CREATE TABLE dbo.Responder (
  ResponderId   INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Responder PRIMARY KEY,
  StudentId     INT NULL
                  CONSTRAINT UQ_Responder_Student UNIQUE
                  CONSTRAINT FK_Responder_Student REFERENCES dbo.Student(StudentId),
  UserId        INT NULL
                  CONSTRAINT FK_Responder_Users REFERENCES dbo.users(id),
  FullName      NVARCHAR(120) NOT NULL,
  RoleTitle     NVARCHAR(80)  NOT NULL,
  ContactPhone  NVARCHAR(40)  NULL,
  Availability  NVARCHAR(20)  NOT NULL
                  CONSTRAINT DF_Responder_Avail DEFAULT (N'Available')
                  CONSTRAINT CK_Responder_Avail CHECK (Availability IN (N'Available', N'Busy', N'OffDuty'))
);
GO

/* -------------------------------------------------------------------------- */
/* SafetyAlert  + M:M CampusZone                                              */
/* -------------------------------------------------------------------------- */
CREATE TABLE dbo.SafetyAlert (
  SafetyAlertId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_SafetyAlert PRIMARY KEY,
  Title         NVARCHAR(160) NOT NULL,
  Message       NVARCHAR(800) NOT NULL,
  AlertLevel    NVARCHAR(20)  NOT NULL
                  CONSTRAINT CK_SafetyAlert_Level CHECK (AlertLevel IN (N'Information', N'Caution', N'Urgent')),
  AffectedArea  NVARCHAR(160) NULL,
  RecommendedAction NVARCHAR(400) NULL,
  PostedAt      DATETIME2 NOT NULL CONSTRAINT DF_SafetyAlert_Posted DEFAULT (SYSUTCDATETIME()),
  IsActive      BIT NOT NULL CONSTRAINT DF_SafetyAlert_Active DEFAULT (1)
);
GO

CREATE TABLE dbo.SafetyAlertZone (
  SafetyAlertId INT NOT NULL
                  CONSTRAINT FK_SAZ_SafetyAlert REFERENCES dbo.SafetyAlert(SafetyAlertId) ON DELETE CASCADE,
  ZoneId        INT NOT NULL
                  CONSTRAINT FK_SAZ_CampusZone REFERENCES dbo.CampusZone(ZoneId) ON DELETE CASCADE,
  CONSTRAINT PK_SafetyAlertZone PRIMARY KEY (SafetyAlertId, ZoneId)
);
GO

/* -------------------------------------------------------------------------- */
/* EmergencyAlert                                                             */
/*   Student 1:M EmergencyAlert                                               */
/*   EmergencyAlert → CampusZone (one zone per alert)                         */
/*   Responder 1:1 EmergencyAlert (AssignedResponderId UNIQUE)                */
/* -------------------------------------------------------------------------- */
CREATE TABLE dbo.EmergencyAlert (
  EmergencyAlertId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_EmergencyAlert PRIMARY KEY,
  StudentId     INT NOT NULL
                  CONSTRAINT FK_EmergencyAlert_Student REFERENCES dbo.Student(StudentId),
  ZoneId        INT NULL
                  CONSTRAINT FK_EmergencyAlert_CampusZone REFERENCES dbo.CampusZone(ZoneId),
  AlertType     NVARCHAR(80)  NOT NULL,
  LocationLabel NVARCHAR(200) NOT NULL,
  TimeTriggered DATETIME2 NOT NULL CONSTRAINT DF_EmergencyAlert_Time DEFAULT (SYSUTCDATETIME()),
  Status        NVARCHAR(40)  NOT NULL
                  CONSTRAINT DF_EmergencyAlert_Status DEFAULT (N'New')
                  CONSTRAINT CK_EmergencyAlert_Status CHECK (Status IN (
                    N'New', N'Acknowledged', N'Responder Dispatched', N'Resolved', N'False Alarm', N'Cancelled'
                  )),
  AssignedResponderId INT NULL
                  CONSTRAINT UQ_EmergencyAlert_Responder UNIQUE
                  CONSTRAINT FK_EmergencyAlert_Responder REFERENCES dbo.Responder(ResponderId),
  Notes         NVARCHAR(800) NULL,
  IsAnonymous   BIT NOT NULL CONSTRAINT DF_EmergencyAlert_Anon DEFAULT (0)
);
GO

CREATE INDEX IX_EmergencyAlert_StudentId ON dbo.EmergencyAlert(StudentId);
CREATE INDEX IX_EmergencyAlert_ZoneId ON dbo.EmergencyAlert(ZoneId);
CREATE INDEX IX_EmergencyAlert_Status ON dbo.EmergencyAlert(Status);
GO

/* -------------------------------------------------------------------------- */
/* IncidentReport  (= Incident Alert in the ER design)                        */
/*   Student 1:M IncidentReport                                               */
/*   SafetyAlert 1:M IncidentReport                                           */
/* -------------------------------------------------------------------------- */
CREATE TABLE dbo.IncidentReport (
  ReportId      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_IncidentReport PRIMARY KEY,
  StudentId     INT NOT NULL
                  CONSTRAINT FK_IncidentReport_Student REFERENCES dbo.Student(StudentId),
  SafetyAlertId INT NULL
                  CONSTRAINT FK_IncidentReport_SafetyAlert REFERENCES dbo.SafetyAlert(SafetyAlertId),
  ReportType    NVARCHAR(80)  NOT NULL,
  LocationLabel NVARCHAR(200) NOT NULL,
  Description   NVARCHAR(1200) NOT NULL,
  PhotoUri      NVARCHAR(400) NULL,
  IsAnonymous   BIT NOT NULL CONSTRAINT DF_IncidentReport_Anon DEFAULT (1),
  FollowUpRequested BIT NOT NULL CONSTRAINT DF_IncidentReport_FollowUp DEFAULT (0),
  Status        NVARCHAR(40)  NOT NULL
                  CONSTRAINT DF_IncidentReport_Status DEFAULT (N'Submitted')
                  CONSTRAINT CK_IncidentReport_Status CHECK (Status IN (
                    N'Draft', N'Submitted', N'Under Review', N'Resolved', N'Closed'
                  )),
  CreatedAt     DATETIME2 NOT NULL CONSTRAINT DF_IncidentReport_Created DEFAULT (SYSUTCDATETIME())
);
GO

CREATE INDEX IX_IncidentReport_StudentId ON dbo.IncidentReport(StudentId);
CREATE INDEX IX_IncidentReport_SafetyAlertId ON dbo.IncidentReport(SafetyAlertId);
GO

/* -------------------------------------------------------------------------- */
/* EmergencyAlert M:M IncidentReport                                          */
/* -------------------------------------------------------------------------- */
CREATE TABLE dbo.EmergencyAlertIncident (
  EmergencyAlertId INT NOT NULL
                  CONSTRAINT FK_EAI_EmergencyAlert REFERENCES dbo.EmergencyAlert(EmergencyAlertId) ON DELETE CASCADE,
  ReportId         INT NOT NULL
                  CONSTRAINT FK_EAI_IncidentReport REFERENCES dbo.IncidentReport(ReportId) ON DELETE CASCADE,
  LinkedAt         DATETIME2 NOT NULL CONSTRAINT DF_EAI_Linked DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT PK_EmergencyAlertIncident PRIMARY KEY (EmergencyAlertId, ReportId)
);
GO

/* ========================================================================== */
/* Seed sample data (safe to re-run after DROP/CREATE above)                  */
/* ========================================================================== */

INSERT INTO dbo.CampusZone (Name, Description, RiskStatus, MapLat, MapLng) VALUES
  (N'Main Library', N'Central campus library and study halls', N'Low', -33.9617, 25.6186),
  (N'Science Block', N'Labs and lecture theatres', N'Medium', -33.9622, 25.6195),
  (N'Residence Village', N'Student residences', N'Low', -33.9605, 25.6170),
  (N'Parking Lot C', N'Evening parking near sports fields', N'High', -33.9630, 25.6202),
  (N'Student Centre', N'Food court and admin services', N'Low', -33.9612, 25.6180);
GO

DECLARE @zoneLib INT = (SELECT ZoneId FROM dbo.CampusZone WHERE Name = N'Main Library');
DECLARE @zonePark INT = (SELECT ZoneId FROM dbo.CampusZone WHERE Name = N'Parking Lot C');
DECLARE @zoneRes INT = (SELECT ZoneId FROM dbo.CampusZone WHERE Name = N'Residence Village');
DECLARE @zoneSci INT = (SELECT ZoneId FROM dbo.CampusZone WHERE Name = N'Science Block');

DECLARE @userStudent INT = (SELECT TOP 1 id FROM dbo.users WHERE role = N'student');
DECLARE @userSecurity INT = (SELECT TOP 1 id FROM dbo.users WHERE role = N'security_staff');

INSERT INTO dbo.Student (UserId, FullName, Email, Phone, HomeZoneId)
VALUES
  (@userStudent, N'Amahle Student', N'student@safetybuddy.campus', N'0820001111', @zoneRes),
  (NULL, N'Thando Mokoena', N'thando@safetybuddy.campus', N'0820002222', @zoneLib),
  (NULL, N'Jordan Naidoo', N'jordan@safetybuddy.campus', N'0820003333', @zoneSci);

DECLARE @student1 INT = (SELECT StudentId FROM dbo.Student WHERE Email = N'student@safetybuddy.campus');
DECLARE @student2 INT = (SELECT StudentId FROM dbo.Student WHERE Email = N'thando@safetybuddy.campus');

INSERT INTO dbo.TrustedContact (Name, Phone, Email, Relationship, AlertMethod) VALUES
  (N'Mama Dlamini', N'0831110001', N'mama@example.com', N'Parent', N'SMS'),
  (N'Sipho Friend', N'0831110002', N'sipho@example.com', N'Friend', N'App'),
  (N'Residence RA', N'0831110003', NULL, N'Residence Advisor', N'Call');

DECLARE @c1 INT = (SELECT ContactId FROM dbo.TrustedContact WHERE Name = N'Mama Dlamini');
DECLARE @c2 INT = (SELECT ContactId FROM dbo.TrustedContact WHERE Name = N'Sipho Friend');
DECLARE @c3 INT = (SELECT ContactId FROM dbo.TrustedContact WHERE Name = N'Residence RA');

INSERT INTO dbo.StudentTrustedContact (StudentId, ContactId) VALUES
  (@student1, @c1),
  (@student1, @c2),
  (@student2, @c2),
  (@student2, @c3);

INSERT INTO dbo.Responder (StudentId, UserId, FullName, RoleTitle, ContactPhone, Availability)
VALUES
  (NULL, @userSecurity, N'Officer N. Jacobs', N'Campus Security', N'0415041234', N'Available'),
  (@student2, NULL, N'Thando Mokoena', N'Student Marshal', N'0820002222', N'Available');

DECLARE @responder1 INT = (SELECT ResponderId FROM dbo.Responder WHERE FullName = N'Officer N. Jacobs');

INSERT INTO dbo.SafetyAlert (Title, Message, AlertLevel, AffectedArea, RecommendedAction) VALUES
  (N'Lighting outage — Parking Lot C',
   N'Several lights are offline near Parking Lot C. Extra patrols are active.',
   N'Caution', N'Parking Lot C', N'Use the lit walkway via Student Centre or request Walk With Me.'),
  (N'Wellness check-in week',
   N'Counselling drop-in sessions available at Student Centre.',
   N'Information', N'Student Centre', N'Visit Student Support if you need someone to talk to.');

DECLARE @sa1 INT = (SELECT SafetyAlertId FROM dbo.SafetyAlert WHERE Title LIKE N'Lighting%');
DECLARE @sa2 INT = (SELECT SafetyAlertId FROM dbo.SafetyAlert WHERE Title LIKE N'Wellness%');
DECLARE @zoneCentre INT = (SELECT ZoneId FROM dbo.CampusZone WHERE Name = N'Student Centre');

INSERT INTO dbo.SafetyAlertZone (SafetyAlertId, ZoneId) VALUES
  (@sa1, @zonePark),
  (@sa1, @zoneSci),
  (@sa2, @zoneCentre),
  (@sa2, @zoneLib);

INSERT INTO dbo.EmergencyAlert (StudentId, ZoneId, AlertType, LocationLabel, Status, AssignedResponderId, IsAnonymous)
VALUES
  (@student1, @zonePark, N'Panic / HELP', N'Parking Lot C — row B', N'Responder Dispatched', @responder1, 0);

DECLARE @ea1 INT = (SELECT TOP 1 EmergencyAlertId FROM dbo.EmergencyAlert ORDER BY EmergencyAlertId);

INSERT INTO dbo.IncidentReport (StudentId, SafetyAlertId, ReportType, LocationLabel, Description, IsAnonymous, FollowUpRequested, Status)
VALUES
  (@student1, @sa1, N'Poor lighting', N'Parking Lot C', N'Path lights near row B are dark after 19:00.', 1, 1, N'Submitted'),
  (@student2, NULL, N'Suspicious activity', N'Science Block entrance', N'Person loitering near lab doors after hours.', 1, 0, N'Under Review');

DECLARE @rep1 INT = (SELECT TOP 1 ReportId FROM dbo.IncidentReport WHERE ReportType = N'Poor lighting');

INSERT INTO dbo.EmergencyAlertIncident (EmergencyAlertId, ReportId)
VALUES (@ea1, @rep1);
GO

PRINT N'SafetyBuddy schema created with entities, relationships, and sample data.';
GO
