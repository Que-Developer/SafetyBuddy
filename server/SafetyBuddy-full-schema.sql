/*
  SafetyBuddy — full schema with relationships
  Exported from live SQL Server on 2026-09-24 08:18:24
  Database: SafetyBuddy

  How to use on another PC:
  1. Install SQL Server (or Express) + ODBC Driver 17
  2. CREATE DATABASE SafetyBuddy;
  3. Run this script against SafetyBuddy
  4. (Optional) run sync-dummy-data.sql for shared seed data
  5. Copy server/.env and point SQLSERVER at localhost
*/
USE [SafetyBuddy];
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/*
  FOREIGN KEY RELATIONSHIPS
  dbo.AlertLocationPing(EmergencyAlertId) -> dbo.EmergencyAlert(EmergencyAlertId)  [FK__AlertLoca__Emerg__625A9A57] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.AlertNotification(ContactId) -> dbo.TrustedContact(ContactId)  [FK__AlertNoti__Conta__671F4F74] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.AlertNotification(EmergencyAlertId) -> dbo.EmergencyAlert(EmergencyAlertId)  [FK__AlertNoti__Emerg__662B2B3B] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.EmergencyAlert(ZoneId) -> dbo.CampusZone(ZoneId)  [FK_EmergencyAlert_CampusZone] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.EmergencyAlert(AssignedResponderId) -> dbo.Responder(ResponderId)  [FK_EmergencyAlert_Responder] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.EmergencyAlert(StudentId) -> dbo.Student(StudentId)  [FK_EmergencyAlert_Student] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.EmergencyAlertIncident(EmergencyAlertId) -> dbo.EmergencyAlert(EmergencyAlertId)  [FK_EAI_EmergencyAlert] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.EmergencyAlertIncident(ReportId) -> dbo.IncidentReport(ReportId)  [FK_EAI_IncidentReport] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.IncidentReport(SafetyAlertId) -> dbo.SafetyAlert(SafetyAlertId)  [FK_IncidentReport_SafetyAlert] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.IncidentReport(StudentId) -> dbo.Student(StudentId)  [FK_IncidentReport_Student] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.Responder(StudentId) -> dbo.Student(StudentId)  [FK_Responder_Student] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.Responder(UserId) -> dbo.users(id)  [FK_Responder_Users] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.SafetyAlertReceipt(SafetyAlertId) -> dbo.SafetyAlert(SafetyAlertId)  [FK__SafetyAle__Safet__7FEAFD3E] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.SafetyAlertReceipt(StudentId) -> dbo.Student(StudentId)  [FK__SafetyAle__Stude__00DF2177] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.SafetyAlertZone(ZoneId) -> dbo.CampusZone(ZoneId)  [FK_SAZ_CampusZone] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.SafetyAlertZone(SafetyAlertId) -> dbo.SafetyAlert(SafetyAlertId)  [FK_SAZ_SafetyAlert] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.Student(HomeZoneId) -> dbo.CampusZone(ZoneId)  [FK_Student_CampusZone] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.Student(UserId) -> dbo.users(id)  [FK_Student_Users] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.StudentTrustedContact(ContactId) -> dbo.TrustedContact(ContactId)  [FK_STC_Contact] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.StudentTrustedContact(StudentId) -> dbo.Student(StudentId)  [FK_STC_Student] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.SupportReferral(EmergencyAlertId) -> dbo.EmergencyAlert(EmergencyAlertId)  [FK__SupportRe__Emerg__7A3223E8] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.SupportReferral(ReportId) -> dbo.IncidentReport(ReportId)  [FK__SupportRe__Repor__7B264821] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.SupportReferral(StudentId) -> dbo.Student(StudentId)  [FK__SupportRe__Stude__793DFFAF] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.SupportReferral(ServiceId) -> dbo.SupportService(ServiceId)  [FK_SR_SupportService] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.WalkLocationPing(SessionId) -> dbo.WalkSession(SessionId)  [FK__WalkLocat__Sessi__756D6ECB] ON DELETE CASCADE ON UPDATE NO_ACTION
  dbo.WalkSession(EndZoneId) -> dbo.CampusZone(ZoneId)  [FK__WalkSessi__EndZo__6EC0713C] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.WalkSession(StartZoneId) -> dbo.CampusZone(ZoneId)  [FK__WalkSessi__Start__6DCC4D03] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.WalkSession(StudentId) -> dbo.Student(StudentId)  [FK__WalkSessi__Stude__6BE40491] ON DELETE NO_ACTION ON UPDATE NO_ACTION
  dbo.WalkSession(TrustedContactId) -> dbo.TrustedContact(ContactId)  [FK__WalkSessi__Trust__6CD828CA] ON DELETE NO_ACTION ON UPDATE NO_ACTION
*/

/* ===== DROP existing objects (safe re-run) ===== */
IF OBJECT_ID(N'dbo.FK__AlertLoca__Emerg__625A9A57', N'F') IS NOT NULL ALTER TABLE [dbo].[AlertLocationPing] DROP CONSTRAINT [FK__AlertLoca__Emerg__625A9A57];
IF OBJECT_ID(N'dbo.FK__AlertNoti__Conta__671F4F74', N'F') IS NOT NULL ALTER TABLE [dbo].[AlertNotification] DROP CONSTRAINT [FK__AlertNoti__Conta__671F4F74];
IF OBJECT_ID(N'dbo.FK__AlertNoti__Emerg__662B2B3B', N'F') IS NOT NULL ALTER TABLE [dbo].[AlertNotification] DROP CONSTRAINT [FK__AlertNoti__Emerg__662B2B3B];
IF OBJECT_ID(N'dbo.FK_EmergencyAlert_CampusZone', N'F') IS NOT NULL ALTER TABLE [dbo].[EmergencyAlert] DROP CONSTRAINT [FK_EmergencyAlert_CampusZone];
IF OBJECT_ID(N'dbo.FK_EmergencyAlert_Responder', N'F') IS NOT NULL ALTER TABLE [dbo].[EmergencyAlert] DROP CONSTRAINT [FK_EmergencyAlert_Responder];
IF OBJECT_ID(N'dbo.FK_EmergencyAlert_Student', N'F') IS NOT NULL ALTER TABLE [dbo].[EmergencyAlert] DROP CONSTRAINT [FK_EmergencyAlert_Student];
IF OBJECT_ID(N'dbo.FK_EAI_EmergencyAlert', N'F') IS NOT NULL ALTER TABLE [dbo].[EmergencyAlertIncident] DROP CONSTRAINT [FK_EAI_EmergencyAlert];
IF OBJECT_ID(N'dbo.FK_EAI_IncidentReport', N'F') IS NOT NULL ALTER TABLE [dbo].[EmergencyAlertIncident] DROP CONSTRAINT [FK_EAI_IncidentReport];
IF OBJECT_ID(N'dbo.FK_IncidentReport_SafetyAlert', N'F') IS NOT NULL ALTER TABLE [dbo].[IncidentReport] DROP CONSTRAINT [FK_IncidentReport_SafetyAlert];
IF OBJECT_ID(N'dbo.FK_IncidentReport_Student', N'F') IS NOT NULL ALTER TABLE [dbo].[IncidentReport] DROP CONSTRAINT [FK_IncidentReport_Student];
IF OBJECT_ID(N'dbo.FK_Responder_Student', N'F') IS NOT NULL ALTER TABLE [dbo].[Responder] DROP CONSTRAINT [FK_Responder_Student];
IF OBJECT_ID(N'dbo.FK_Responder_Users', N'F') IS NOT NULL ALTER TABLE [dbo].[Responder] DROP CONSTRAINT [FK_Responder_Users];
IF OBJECT_ID(N'dbo.FK__SafetyAle__Safet__7FEAFD3E', N'F') IS NOT NULL ALTER TABLE [dbo].[SafetyAlertReceipt] DROP CONSTRAINT [FK__SafetyAle__Safet__7FEAFD3E];
IF OBJECT_ID(N'dbo.FK__SafetyAle__Stude__00DF2177', N'F') IS NOT NULL ALTER TABLE [dbo].[SafetyAlertReceipt] DROP CONSTRAINT [FK__SafetyAle__Stude__00DF2177];
IF OBJECT_ID(N'dbo.FK_SAZ_CampusZone', N'F') IS NOT NULL ALTER TABLE [dbo].[SafetyAlertZone] DROP CONSTRAINT [FK_SAZ_CampusZone];
IF OBJECT_ID(N'dbo.FK_SAZ_SafetyAlert', N'F') IS NOT NULL ALTER TABLE [dbo].[SafetyAlertZone] DROP CONSTRAINT [FK_SAZ_SafetyAlert];
IF OBJECT_ID(N'dbo.FK_Student_CampusZone', N'F') IS NOT NULL ALTER TABLE [dbo].[Student] DROP CONSTRAINT [FK_Student_CampusZone];
IF OBJECT_ID(N'dbo.FK_Student_Users', N'F') IS NOT NULL ALTER TABLE [dbo].[Student] DROP CONSTRAINT [FK_Student_Users];
IF OBJECT_ID(N'dbo.FK_STC_Contact', N'F') IS NOT NULL ALTER TABLE [dbo].[StudentTrustedContact] DROP CONSTRAINT [FK_STC_Contact];
IF OBJECT_ID(N'dbo.FK_STC_Student', N'F') IS NOT NULL ALTER TABLE [dbo].[StudentTrustedContact] DROP CONSTRAINT [FK_STC_Student];
IF OBJECT_ID(N'dbo.FK__SupportRe__Emerg__7A3223E8', N'F') IS NOT NULL ALTER TABLE [dbo].[SupportReferral] DROP CONSTRAINT [FK__SupportRe__Emerg__7A3223E8];
IF OBJECT_ID(N'dbo.FK__SupportRe__Repor__7B264821', N'F') IS NOT NULL ALTER TABLE [dbo].[SupportReferral] DROP CONSTRAINT [FK__SupportRe__Repor__7B264821];
IF OBJECT_ID(N'dbo.FK__SupportRe__Stude__793DFFAF', N'F') IS NOT NULL ALTER TABLE [dbo].[SupportReferral] DROP CONSTRAINT [FK__SupportRe__Stude__793DFFAF];
IF OBJECT_ID(N'dbo.FK_SR_SupportService', N'F') IS NOT NULL ALTER TABLE [dbo].[SupportReferral] DROP CONSTRAINT [FK_SR_SupportService];
IF OBJECT_ID(N'dbo.FK__WalkLocat__Sessi__756D6ECB', N'F') IS NOT NULL ALTER TABLE [dbo].[WalkLocationPing] DROP CONSTRAINT [FK__WalkLocat__Sessi__756D6ECB];
IF OBJECT_ID(N'dbo.FK__WalkSessi__EndZo__6EC0713C', N'F') IS NOT NULL ALTER TABLE [dbo].[WalkSession] DROP CONSTRAINT [FK__WalkSessi__EndZo__6EC0713C];
IF OBJECT_ID(N'dbo.FK__WalkSessi__Start__6DCC4D03', N'F') IS NOT NULL ALTER TABLE [dbo].[WalkSession] DROP CONSTRAINT [FK__WalkSessi__Start__6DCC4D03];
IF OBJECT_ID(N'dbo.FK__WalkSessi__Stude__6BE40491', N'F') IS NOT NULL ALTER TABLE [dbo].[WalkSession] DROP CONSTRAINT [FK__WalkSessi__Stude__6BE40491];
IF OBJECT_ID(N'dbo.FK__WalkSessi__Trust__6CD828CA', N'F') IS NOT NULL ALTER TABLE [dbo].[WalkSession] DROP CONSTRAINT [FK__WalkSessi__Trust__6CD828CA];
GO

IF OBJECT_ID(N'dbo.WalkSession', N'U') IS NOT NULL DROP TABLE [dbo].[WalkSession];
IF OBJECT_ID(N'dbo.WalkLocationPing', N'U') IS NOT NULL DROP TABLE [dbo].[WalkLocationPing];
IF OBJECT_ID(N'dbo.users', N'U') IS NOT NULL DROP TABLE [dbo].[users];
IF OBJECT_ID(N'dbo.TrustedContact', N'U') IS NOT NULL DROP TABLE [dbo].[TrustedContact];
IF OBJECT_ID(N'dbo.SupportService', N'U') IS NOT NULL DROP TABLE [dbo].[SupportService];
IF OBJECT_ID(N'dbo.SupportReferral', N'U') IS NOT NULL DROP TABLE [dbo].[SupportReferral];
IF OBJECT_ID(N'dbo.StudentTrustedContact', N'U') IS NOT NULL DROP TABLE [dbo].[StudentTrustedContact];
IF OBJECT_ID(N'dbo.Student', N'U') IS NOT NULL DROP TABLE [dbo].[Student];
IF OBJECT_ID(N'dbo.SafetyResource', N'U') IS NOT NULL DROP TABLE [dbo].[SafetyResource];
IF OBJECT_ID(N'dbo.SafetyAlertZone', N'U') IS NOT NULL DROP TABLE [dbo].[SafetyAlertZone];
IF OBJECT_ID(N'dbo.SafetyAlertReceipt', N'U') IS NOT NULL DROP TABLE [dbo].[SafetyAlertReceipt];
IF OBJECT_ID(N'dbo.SafetyAlert', N'U') IS NOT NULL DROP TABLE [dbo].[SafetyAlert];
IF OBJECT_ID(N'dbo.RolePrivilege', N'U') IS NOT NULL DROP TABLE [dbo].[RolePrivilege];
IF OBJECT_ID(N'dbo.Responder', N'U') IS NOT NULL DROP TABLE [dbo].[Responder];
IF OBJECT_ID(N'dbo.ReportCategory', N'U') IS NOT NULL DROP TABLE [dbo].[ReportCategory];
IF OBJECT_ID(N'dbo.PrivacySection', N'U') IS NOT NULL DROP TABLE [dbo].[PrivacySection];
IF OBJECT_ID(N'dbo.panic_alerts', N'U') IS NOT NULL DROP TABLE [dbo].[panic_alerts];
IF OBJECT_ID(N'dbo.MapMarker', N'U') IS NOT NULL DROP TABLE [dbo].[MapMarker];
IF OBJECT_ID(N'dbo.IncidentReport', N'U') IS NOT NULL DROP TABLE [dbo].[IncidentReport];
IF OBJECT_ID(N'dbo.HelpContact', N'U') IS NOT NULL DROP TABLE [dbo].[HelpContact];
IF OBJECT_ID(N'dbo.EmergencyAlertIncident', N'U') IS NOT NULL DROP TABLE [dbo].[EmergencyAlertIncident];
IF OBJECT_ID(N'dbo.EmergencyAlert', N'U') IS NOT NULL DROP TABLE [dbo].[EmergencyAlert];
IF OBJECT_ID(N'dbo.CampusZone', N'U') IS NOT NULL DROP TABLE [dbo].[CampusZone];
IF OBJECT_ID(N'dbo.AlertNotification', N'U') IS NOT NULL DROP TABLE [dbo].[AlertNotification];
IF OBJECT_ID(N'dbo.AlertLocationPing', N'U') IS NOT NULL DROP TABLE [dbo].[AlertLocationPing];
GO

/* ===== CREATE TABLES ===== */
CREATE TABLE [dbo].[AlertLocationPing] (
  [PingId] int IDENTITY(1,1) NOT NULL,
  [EmergencyAlertId] int NOT NULL,
  [Latitude] float(53) NOT NULL,
  [Longitude] float(53) NOT NULL,
  [AccuracyMeters] float(53) NULL,
  [CapturedAt] datetime2(7) NOT NULL CONSTRAINT [DF__AlertLoca__Captu__634EBE90] DEFAULT (sysutcdatetime()),
  CONSTRAINT [PK__AlertLoc__57B05678C29CCFBB] PRIMARY KEY ([PingId])
);
GO

CREATE TABLE [dbo].[AlertNotification] (
  [NotificationId] int IDENTITY(1,1) NOT NULL,
  [EmergencyAlertId] int NOT NULL,
  [ContactId] int NOT NULL,
  [Channel] nvarchar(20) NOT NULL,
  [Status] nvarchar(20) NOT NULL CONSTRAINT [DF__AlertNoti__Statu__681373AD] DEFAULT (N'Queued'),
  [MessagePreview] nvarchar(400) NULL,
  [SentAt] datetime2(7) NULL,
  [ErrorMessage] nvarchar(400) NULL,
  [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF__AlertNoti__Creat__690797E6] DEFAULT (sysutcdatetime()),
  CONSTRAINT [PK__AlertNot__20CF2E1242FEE307] PRIMARY KEY ([NotificationId])
);
GO

CREATE TABLE [dbo].[CampusZone] (
  [ZoneId] int IDENTITY(1,1) NOT NULL,
  [Name] nvarchar(120) NOT NULL,
  [Description] nvarchar(400) NULL,
  [RiskStatus] nvarchar(20) NOT NULL CONSTRAINT [DF_CampusZone_Risk] DEFAULT (N'Low'),
  [MapLat] float(53) NULL,
  [MapLng] float(53) NULL,
  [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_CampusZone_Created] DEFAULT (sysutcdatetime()),
  [NearestHelpPoint] nvarchar(160) NULL,
  [MapReference] nvarchar(40) NULL,
  CONSTRAINT [PK_CampusZone] PRIMARY KEY ([ZoneId])
);
GO

CREATE TABLE [dbo].[EmergencyAlert] (
  [EmergencyAlertId] int IDENTITY(1,1) NOT NULL,
  [StudentId] int NOT NULL,
  [ZoneId] int NULL,
  [AlertType] nvarchar(80) NOT NULL,
  [LocationLabel] nvarchar(200) NOT NULL,
  [TimeTriggered] datetime2(7) NOT NULL CONSTRAINT [DF_EmergencyAlert_Time] DEFAULT (sysutcdatetime()),
  [Status] nvarchar(40) NOT NULL CONSTRAINT [DF_EmergencyAlert_Status] DEFAULT (N'New'),
  [AssignedResponderId] int NULL,
  [Notes] nvarchar(800) NULL,
  [IsAnonymous] bit NOT NULL CONSTRAINT [DF_EmergencyAlert_Anon] DEFAULT ((0)),
  [Latitude] float(53) NULL,
  [Longitude] float(53) NULL,
  [LocationAccuracy] float(53) NULL,
  [LocationCapturedAt] datetime2(7) NULL,
  CONSTRAINT [PK_EmergencyAlert] PRIMARY KEY ([EmergencyAlertId])
);
GO

CREATE TABLE [dbo].[EmergencyAlertIncident] (
  [EmergencyAlertId] int NOT NULL,
  [ReportId] int NOT NULL,
  [LinkedAt] datetime2(7) NOT NULL CONSTRAINT [DF_EAI_Linked] DEFAULT (sysutcdatetime()),
  CONSTRAINT [PK_EmergencyAlertIncident] PRIMARY KEY ([EmergencyAlertId], [ReportId])
);
GO

CREATE TABLE [dbo].[HelpContact] (
  [ContactId] int IDENTITY(1,1) NOT NULL,
  [Label] nvarchar(120) NOT NULL,
  [PhoneNumber] nvarchar(40) NOT NULL,
  [SortOrder] int NOT NULL CONSTRAINT [DF__HelpConta__SortO__46B27FE2] DEFAULT ((0)),
  [IsActive] bit NOT NULL CONSTRAINT [DF__HelpConta__IsAct__47A6A41B] DEFAULT ((1)),
  CONSTRAINT [PK__HelpCont__5C66259B442F948D] PRIMARY KEY ([ContactId])
);
GO

CREATE TABLE [dbo].[IncidentReport] (
  [ReportId] int IDENTITY(1,1) NOT NULL,
  [StudentId] int NOT NULL,
  [SafetyAlertId] int NULL,
  [ReportType] nvarchar(80) NOT NULL,
  [LocationLabel] nvarchar(200) NOT NULL,
  [Description] nvarchar(1200) NOT NULL,
  [PhotoUri] nvarchar(400) NULL,
  [IsAnonymous] bit NOT NULL CONSTRAINT [DF_IncidentReport_Anon] DEFAULT ((1)),
  [FollowUpRequested] bit NOT NULL CONSTRAINT [DF_IncidentReport_FollowUp] DEFAULT ((0)),
  [Status] nvarchar(40) NOT NULL CONSTRAINT [DF_IncidentReport_Status] DEFAULT (N'Submitted'),
  [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_IncidentReport_Created] DEFAULT (sysutcdatetime()),
  [CategoryId] int NULL,
  CONSTRAINT [PK_IncidentReport] PRIMARY KEY ([ReportId])
);
GO

CREATE TABLE [dbo].[MapMarker] (
  [MarkerId] int IDENTITY(1,1) NOT NULL,
  [Name] nvarchar(160) NOT NULL,
  [MarkerType] nvarchar(40) NOT NULL,
  [Description] nvarchar(400) NULL,
  [MapLat] float(53) NOT NULL,
  [MapLng] float(53) NOT NULL,
  [IsActive] bit NOT NULL CONSTRAINT [DF__MapMarker__IsAct__57DD0BE4] DEFAULT ((1)),
  CONSTRAINT [PK__MapMarke__743D929D4786EA62] PRIMARY KEY ([MarkerId])
);
GO

CREATE TABLE [dbo].[panic_alerts] (
  [id] int IDENTITY(1,1) NOT NULL,
  [student_user_id] int NOT NULL,
  [student_name] nvarchar(120) NOT NULL,
  [student_email] nvarchar(160) NOT NULL,
  [alert_type] nvarchar(80) NOT NULL CONSTRAINT [DF__panic_ale__alert__1B9317B3] DEFAULT (N'SOS — Security'),
  [location_label] nvarchar(200) NOT NULL,
  [lat] float(53) NULL,
  [lng] float(53) NULL,
  [status] nvarchar(40) NOT NULL CONSTRAINT [DF__panic_ale__statu__1C873BEC] DEFAULT (N'New'),
  [assigned_responder_id] int NULL,
  [assigned_responder_name] nvarchar(120) NULL,
  [notes] nvarchar(800) NULL,
  [created_at] datetime2(7) NOT NULL CONSTRAINT [DF__panic_ale__creat__1D7B6025] DEFAULT (sysutcdatetime()),
  [updated_at] datetime2(7) NOT NULL CONSTRAINT [DF__panic_ale__updat__1E6F845E] DEFAULT (sysutcdatetime()),
  CONSTRAINT [PK__panic_al__3213E83F35838724] PRIMARY KEY ([id])
);
GO

CREATE TABLE [dbo].[PrivacySection] (
  [SectionId] int IDENTITY(1,1) NOT NULL,
  [Title] nvarchar(160) NOT NULL,
  [Body] nvarchar(2000) NOT NULL,
  [SortOrder] int NOT NULL CONSTRAINT [DF__PrivacySe__SortO__503BEA1C] DEFAULT ((0)),
  CONSTRAINT [PK__PrivacyS__80EF0872BA437989] PRIMARY KEY ([SectionId])
);
GO

CREATE TABLE [dbo].[ReportCategory] (
  [CategoryId] int IDENTITY(1,1) NOT NULL,
  [Name] nvarchar(80) NOT NULL,
  [IsActive] bit NOT NULL CONSTRAINT [DF__ReportCat__IsAct__540C7B00] DEFAULT ((1)),
  [SortOrder] int NOT NULL CONSTRAINT [DF__ReportCat__SortO__55009F39] DEFAULT ((0)),
  CONSTRAINT [PK__ReportCa__19093A0B452A5038] PRIMARY KEY ([CategoryId])
);
GO

CREATE TABLE [dbo].[Responder] (
  [ResponderId] int IDENTITY(1,1) NOT NULL,
  [StudentId] int NULL,
  [UserId] int NULL,
  [FullName] nvarchar(120) NOT NULL,
  [RoleTitle] nvarchar(80) NOT NULL,
  [ContactPhone] nvarchar(40) NULL,
  [Availability] nvarchar(20) NOT NULL CONSTRAINT [DF_Responder_Avail] DEFAULT (N'Available'),
  CONSTRAINT [PK_Responder] PRIMARY KEY ([ResponderId])
);
GO

CREATE TABLE [dbo].[RolePrivilege] (
  [PrivilegeId] int IDENTITY(1,1) NOT NULL,
  [RoleKey] nvarchar(40) NOT NULL,
  [ResourceKey] nvarchar(80) NOT NULL,
  [CanCreate] bit NOT NULL CONSTRAINT [DF__RolePrivi__CanCr__05A3D694] DEFAULT ((0)),
  [CanRead] bit NOT NULL CONSTRAINT [DF__RolePrivi__CanRe__0697FACD] DEFAULT ((0)),
  [CanUpdate] bit NOT NULL CONSTRAINT [DF__RolePrivi__CanUp__078C1F06] DEFAULT ((0)),
  [CanDelete] bit NOT NULL CONSTRAINT [DF__RolePrivi__CanDe__0880433F] DEFAULT ((0)),
  [ScopeNote] nvarchar(200) NULL,
  CONSTRAINT [PK__RolePriv__B3E77E5CB4163BAA] PRIMARY KEY ([PrivilegeId])
);
GO

CREATE TABLE [dbo].[SafetyAlert] (
  [SafetyAlertId] int IDENTITY(1,1) NOT NULL,
  [Title] nvarchar(160) NOT NULL,
  [Message] nvarchar(800) NOT NULL,
  [AlertLevel] nvarchar(20) NOT NULL,
  [AffectedArea] nvarchar(160) NULL,
  [RecommendedAction] nvarchar(400) NULL,
  [PostedAt] datetime2(7) NOT NULL CONSTRAINT [DF_SafetyAlert_Posted] DEFAULT (sysutcdatetime()),
  [IsActive] bit NOT NULL CONSTRAINT [DF_SafetyAlert_Active] DEFAULT ((1)),
  CONSTRAINT [PK_SafetyAlert] PRIMARY KEY ([SafetyAlertId])
);
GO

CREATE TABLE [dbo].[SafetyAlertReceipt] (
  [SafetyAlertId] int NOT NULL,
  [StudentId] int NOT NULL,
  [ReadAt] datetime2(7) NOT NULL CONSTRAINT [DF__SafetyAle__ReadA__01D345B0] DEFAULT (sysutcdatetime()),
  CONSTRAINT [PK_SafetyAlertReceipt] PRIMARY KEY ([SafetyAlertId], [StudentId])
);
GO

CREATE TABLE [dbo].[SafetyAlertZone] (
  [SafetyAlertId] int NOT NULL,
  [ZoneId] int NOT NULL,
  CONSTRAINT [PK_SafetyAlertZone] PRIMARY KEY ([SafetyAlertId], [ZoneId])
);
GO

CREATE TABLE [dbo].[SafetyResource] (
  [ResourceId] int IDENTITY(1,1) NOT NULL,
  [Title] nvarchar(160) NOT NULL,
  [Summary] nvarchar(400) NOT NULL,
  [Body] nvarchar(2000) NOT NULL,
  [SortOrder] int NOT NULL CONSTRAINT [DF__SafetyRes__SortO__4D5F7D71] DEFAULT ((0)),
  CONSTRAINT [PK__SafetyRe__4ED1816FBDACD58E] PRIMARY KEY ([ResourceId])
);
GO

CREATE TABLE [dbo].[Student] (
  [StudentId] int IDENTITY(1,1) NOT NULL,
  [UserId] int NULL,
  [FullName] nvarchar(120) NOT NULL,
  [Email] nvarchar(160) NOT NULL,
  [Phone] nvarchar(40) NULL,
  [HomeZoneId] int NULL,
  [CreatedAt] datetime2(7) NOT NULL CONSTRAINT [DF_Student_Created] DEFAULT (sysutcdatetime()),
  CONSTRAINT [PK_Student] PRIMARY KEY ([StudentId])
);
GO

CREATE TABLE [dbo].[StudentTrustedContact] (
  [StudentId] int NOT NULL,
  [ContactId] int NOT NULL,
  [LinkedAt] datetime2(7) NOT NULL CONSTRAINT [DF_STC_Linked] DEFAULT (sysutcdatetime()),
  CONSTRAINT [PK_StudentTrustedContact] PRIMARY KEY ([StudentId], [ContactId])
);
GO

CREATE TABLE [dbo].[SupportReferral] (
  [ReferralId] int IDENTITY(1,1) NOT NULL,
  [StudentId] int NOT NULL,
  [EmergencyAlertId] int NULL,
  [ReportId] int NULL,
  [ServiceId] int NULL,
  [Reason] nvarchar(200) NULL,
  [ShownAt] datetime2(7) NOT NULL CONSTRAINT [DF__SupportRe__Shown__7C1A6C5A] DEFAULT (sysutcdatetime()),
  [AcknowledgedAt] datetime2(7) NULL,
  CONSTRAINT [PK__SupportR__A2C4A966AD73DCFF] PRIMARY KEY ([ReferralId])
);
GO

CREATE TABLE [dbo].[SupportService] (
  [ServiceId] int IDENTITY(1,1) NOT NULL,
  [Title] nvarchar(160) NOT NULL,
  [Detail] nvarchar(400) NOT NULL,
  [ActionText] nvarchar(200) NOT NULL,
  [IconKey] nvarchar(40) NULL,
  [SortOrder] int NOT NULL CONSTRAINT [DF__SupportSe__SortO__4A8310C6] DEFAULT ((0)),
  CONSTRAINT [PK__SupportS__C51BB00AC417D8A4] PRIMARY KEY ([ServiceId])
);
GO

CREATE TABLE [dbo].[TrustedContact] (
  [ContactId] int IDENTITY(1,1) NOT NULL,
  [Name] nvarchar(120) NOT NULL,
  [Phone] nvarchar(40) NOT NULL,
  [Email] nvarchar(160) NULL,
  [Relationship] nvarchar(80) NULL,
  [AlertMethod] nvarchar(20) NOT NULL CONSTRAINT [DF_TrustedContact_Method] DEFAULT (N'SMS'),
  CONSTRAINT [PK_TrustedContact] PRIMARY KEY ([ContactId])
);
GO

CREATE TABLE [dbo].[users] (
  [id] int IDENTITY(1,1) NOT NULL,
  [email] nvarchar(255) NOT NULL,
  [full_name] nvarchar(200) NOT NULL,
  [role] nvarchar(40) NOT NULL,
  [password_hash] nvarchar(128) NOT NULL,
  [created_at] datetime2(7) NOT NULL CONSTRAINT [DF_users_created] DEFAULT (sysutcdatetime()),
  CONSTRAINT [PK__users__3213E83F2044592F] PRIMARY KEY ([id])
);
GO

CREATE TABLE [dbo].[WalkLocationPing] (
  [PingId] int IDENTITY(1,1) NOT NULL,
  [SessionId] int NOT NULL,
  [Latitude] float(53) NOT NULL,
  [Longitude] float(53) NOT NULL,
  [AccuracyMeters] float(53) NULL,
  [CapturedAt] datetime2(7) NOT NULL CONSTRAINT [DF__WalkLocat__Captu__76619304] DEFAULT (sysutcdatetime()),
  CONSTRAINT [PK__WalkLoca__57B05678F4071062] PRIMARY KEY ([PingId])
);
GO

CREATE TABLE [dbo].[WalkSession] (
  [SessionId] int IDENTITY(1,1) NOT NULL,
  [StudentId] int NOT NULL,
  [TrustedContactId] int NULL,
  [StartZoneId] int NULL,
  [EndZoneId] int NULL,
  [StartLabel] nvarchar(200) NULL,
  [EndLabel] nvarchar(200) NULL,
  [StartLat] float(53) NULL,
  [StartLng] float(53) NULL,
  [EndLat] float(53) NULL,
  [EndLng] float(53) NULL,
  [TravelMode] nvarchar(20) NOT NULL CONSTRAINT [DF__WalkSessi__Trave__6FB49575] DEFAULT (N'foot'),
  [Status] nvarchar(20) NOT NULL CONSTRAINT [DF__WalkSessi__Statu__70A8B9AE] DEFAULT (N'Active'),
  [ShareWithSecurity] bit NOT NULL CONSTRAINT [DF__WalkSessi__Share__719CDDE7] DEFAULT ((0)),
  [ExpectedArrivalAt] datetime2(7) NULL,
  [StartedAt] datetime2(7) NOT NULL CONSTRAINT [DF__WalkSessi__Start__72910220] DEFAULT (sysutcdatetime()),
  [EndedAt] datetime2(7) NULL,
  [LastLat] float(53) NULL,
  [LastLng] float(53) NULL,
  [LastPingAt] datetime2(7) NULL,
  CONSTRAINT [PK__WalkSess__C9F4929088564B36] PRIMARY KEY ([SessionId])
);
GO

/* ===== UNIQUE CONSTRAINTS / UNIQUE INDEXES ===== */
ALTER TABLE [dbo].[EmergencyAlert] ADD CONSTRAINT [UQ_EmergencyAlert_Responder] UNIQUE ([AssignedResponderId]);
ALTER TABLE [dbo].[ReportCategory] ADD CONSTRAINT [UQ__ReportCa__737584F689BCC6F8] UNIQUE ([Name]);
ALTER TABLE [dbo].[Responder] ADD CONSTRAINT [UQ_Responder_Student] UNIQUE ([StudentId]);
ALTER TABLE [dbo].[RolePrivilege] ADD CONSTRAINT [UQ_RolePrivilege] UNIQUE ([RoleKey], [ResourceKey]);
ALTER TABLE [dbo].[Student] ADD CONSTRAINT [UQ_Student_Email] UNIQUE ([Email]);
ALTER TABLE [dbo].[users] ADD CONSTRAINT [UQ__users__AB6E6164A31DB7E6] UNIQUE ([email]);
GO

/* ===== INDEXES ===== */
CREATE INDEX [IX_ALP_Alert] ON [dbo].[AlertLocationPing] ([EmergencyAlertId], [CapturedAt] DESC);
CREATE INDEX [IX_AN_Alert] ON [dbo].[AlertNotification] ([EmergencyAlertId]);
CREATE INDEX [IX_EmergencyAlert_Status] ON [dbo].[EmergencyAlert] ([Status]);
CREATE INDEX [IX_EmergencyAlert_StudentId] ON [dbo].[EmergencyAlert] ([StudentId]);
CREATE INDEX [IX_EmergencyAlert_ZoneId] ON [dbo].[EmergencyAlert] ([ZoneId]);
CREATE INDEX [IX_IncidentReport_SafetyAlertId] ON [dbo].[IncidentReport] ([SafetyAlertId]);
CREATE INDEX [IX_IncidentReport_StudentId] ON [dbo].[IncidentReport] ([StudentId]);
CREATE INDEX [IX_panic_alerts_created] ON [dbo].[panic_alerts] ([created_at] DESC);
CREATE INDEX [IX_panic_alerts_status] ON [dbo].[panic_alerts] ([status]);
CREATE INDEX [IX_Student_HomeZoneId] ON [dbo].[Student] ([HomeZoneId]);
CREATE INDEX [IX_SR_Student] ON [dbo].[SupportReferral] ([StudentId]);
CREATE INDEX [IX_WLP_Session] ON [dbo].[WalkLocationPing] ([SessionId], [CapturedAt] DESC);
CREATE INDEX [IX_WS_Student] ON [dbo].[WalkSession] ([StudentId], [Status]);
GO

/* ===== FOREIGN KEY RELATIONSHIPS ===== */
ALTER TABLE [dbo].[AlertLocationPing] ADD CONSTRAINT [FK__AlertLoca__Emerg__625A9A57] FOREIGN KEY ([EmergencyAlertId]) REFERENCES [dbo].[EmergencyAlert] ([EmergencyAlertId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[AlertNotification] ADD CONSTRAINT [FK__AlertNoti__Conta__671F4F74] FOREIGN KEY ([ContactId]) REFERENCES [dbo].[TrustedContact] ([ContactId]);
ALTER TABLE [dbo].[AlertNotification] ADD CONSTRAINT [FK__AlertNoti__Emerg__662B2B3B] FOREIGN KEY ([EmergencyAlertId]) REFERENCES [dbo].[EmergencyAlert] ([EmergencyAlertId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[EmergencyAlert] ADD CONSTRAINT [FK_EmergencyAlert_CampusZone] FOREIGN KEY ([ZoneId]) REFERENCES [dbo].[CampusZone] ([ZoneId]);
ALTER TABLE [dbo].[EmergencyAlert] ADD CONSTRAINT [FK_EmergencyAlert_Responder] FOREIGN KEY ([AssignedResponderId]) REFERENCES [dbo].[Responder] ([ResponderId]);
ALTER TABLE [dbo].[EmergencyAlert] ADD CONSTRAINT [FK_EmergencyAlert_Student] FOREIGN KEY ([StudentId]) REFERENCES [dbo].[Student] ([StudentId]);
ALTER TABLE [dbo].[EmergencyAlertIncident] ADD CONSTRAINT [FK_EAI_EmergencyAlert] FOREIGN KEY ([EmergencyAlertId]) REFERENCES [dbo].[EmergencyAlert] ([EmergencyAlertId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[EmergencyAlertIncident] ADD CONSTRAINT [FK_EAI_IncidentReport] FOREIGN KEY ([ReportId]) REFERENCES [dbo].[IncidentReport] ([ReportId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[IncidentReport] ADD CONSTRAINT [FK_IncidentReport_SafetyAlert] FOREIGN KEY ([SafetyAlertId]) REFERENCES [dbo].[SafetyAlert] ([SafetyAlertId]);
ALTER TABLE [dbo].[IncidentReport] ADD CONSTRAINT [FK_IncidentReport_Student] FOREIGN KEY ([StudentId]) REFERENCES [dbo].[Student] ([StudentId]);
ALTER TABLE [dbo].[Responder] ADD CONSTRAINT [FK_Responder_Student] FOREIGN KEY ([StudentId]) REFERENCES [dbo].[Student] ([StudentId]);
ALTER TABLE [dbo].[Responder] ADD CONSTRAINT [FK_Responder_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[users] ([id]);
ALTER TABLE [dbo].[SafetyAlertReceipt] ADD CONSTRAINT [FK__SafetyAle__Safet__7FEAFD3E] FOREIGN KEY ([SafetyAlertId]) REFERENCES [dbo].[SafetyAlert] ([SafetyAlertId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[SafetyAlertReceipt] ADD CONSTRAINT [FK__SafetyAle__Stude__00DF2177] FOREIGN KEY ([StudentId]) REFERENCES [dbo].[Student] ([StudentId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[SafetyAlertZone] ADD CONSTRAINT [FK_SAZ_CampusZone] FOREIGN KEY ([ZoneId]) REFERENCES [dbo].[CampusZone] ([ZoneId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[SafetyAlertZone] ADD CONSTRAINT [FK_SAZ_SafetyAlert] FOREIGN KEY ([SafetyAlertId]) REFERENCES [dbo].[SafetyAlert] ([SafetyAlertId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[Student] ADD CONSTRAINT [FK_Student_CampusZone] FOREIGN KEY ([HomeZoneId]) REFERENCES [dbo].[CampusZone] ([ZoneId]);
ALTER TABLE [dbo].[Student] ADD CONSTRAINT [FK_Student_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[users] ([id]);
ALTER TABLE [dbo].[StudentTrustedContact] ADD CONSTRAINT [FK_STC_Contact] FOREIGN KEY ([ContactId]) REFERENCES [dbo].[TrustedContact] ([ContactId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[StudentTrustedContact] ADD CONSTRAINT [FK_STC_Student] FOREIGN KEY ([StudentId]) REFERENCES [dbo].[Student] ([StudentId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[SupportReferral] ADD CONSTRAINT [FK__SupportRe__Emerg__7A3223E8] FOREIGN KEY ([EmergencyAlertId]) REFERENCES [dbo].[EmergencyAlert] ([EmergencyAlertId]);
ALTER TABLE [dbo].[SupportReferral] ADD CONSTRAINT [FK__SupportRe__Repor__7B264821] FOREIGN KEY ([ReportId]) REFERENCES [dbo].[IncidentReport] ([ReportId]);
ALTER TABLE [dbo].[SupportReferral] ADD CONSTRAINT [FK__SupportRe__Stude__793DFFAF] FOREIGN KEY ([StudentId]) REFERENCES [dbo].[Student] ([StudentId]);
ALTER TABLE [dbo].[SupportReferral] ADD CONSTRAINT [FK_SR_SupportService] FOREIGN KEY ([ServiceId]) REFERENCES [dbo].[SupportService] ([ServiceId]);
ALTER TABLE [dbo].[WalkLocationPing] ADD CONSTRAINT [FK__WalkLocat__Sessi__756D6ECB] FOREIGN KEY ([SessionId]) REFERENCES [dbo].[WalkSession] ([SessionId]) ON DELETE CASCADE;
ALTER TABLE [dbo].[WalkSession] ADD CONSTRAINT [FK__WalkSessi__EndZo__6EC0713C] FOREIGN KEY ([EndZoneId]) REFERENCES [dbo].[CampusZone] ([ZoneId]);
ALTER TABLE [dbo].[WalkSession] ADD CONSTRAINT [FK__WalkSessi__Start__6DCC4D03] FOREIGN KEY ([StartZoneId]) REFERENCES [dbo].[CampusZone] ([ZoneId]);
ALTER TABLE [dbo].[WalkSession] ADD CONSTRAINT [FK__WalkSessi__Stude__6BE40491] FOREIGN KEY ([StudentId]) REFERENCES [dbo].[Student] ([StudentId]);
ALTER TABLE [dbo].[WalkSession] ADD CONSTRAINT [FK__WalkSessi__Trust__6CD828CA] FOREIGN KEY ([TrustedContactId]) REFERENCES [dbo].[TrustedContact] ([ContactId]);
GO

PRINT N'SafetyBuddy schema created successfully.';
GO