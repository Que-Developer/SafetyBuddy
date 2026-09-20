/*
==============================================================================
  SafetyBuddy — sync dummy data from Safety-Alerts branch database
  Exported: 2026-09-19T23:37:42.289Z
  Source: localhost / SafetyBuddy

  HOW TO USE (on the other machine with the same schema):
    1. Ensure the SafetyBuddy database + tables already exist
       (run server/schema.sql, then start the API once so ensureSchema runs).
    2. sqlcmd -S localhost -E -d SafetyBuddy -i server/sync-dummy-data.sql

  WARNING: Deletes existing rows in these tables, then reloads this dump
  so primary keys and foreign keys match the source database.
==============================================================================
*/

USE SafetyBuddy;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

/* ---- Clear in FK-safe order ---- */
DELETE FROM dbo.[WalkLocationPing];
DELETE FROM dbo.[WalkSession];
DELETE FROM dbo.[AlertLocationPing];
DELETE FROM dbo.[AlertNotification];
DELETE FROM dbo.[SupportReferral];
DELETE FROM dbo.[SafetyAlertReceipt];
DELETE FROM dbo.[RolePrivilege];
DELETE FROM dbo.[EmergencyAlertIncident];
DELETE FROM dbo.[SafetyAlertZone];
DELETE FROM dbo.[StudentTrustedContact];
DELETE FROM dbo.[IncidentReport];
DELETE FROM dbo.[EmergencyAlert];
DELETE FROM dbo.[SafetyAlert];
DELETE FROM dbo.[TrustedContact];
DELETE FROM dbo.[Responder];
DELETE FROM dbo.[Student];
DELETE FROM dbo.[MapMarker];
DELETE FROM dbo.[ReportCategory];
DELETE FROM dbo.[PrivacySection];
DELETE FROM dbo.[SafetyResource];
DELETE FROM dbo.[SupportService];
DELETE FROM dbo.[HelpContact];
DELETE FROM dbo.[CampusZone];
DELETE FROM dbo.[users];

/* ---- dbo.users (3 rows) ---- */
SET IDENTITY_INSERT dbo.[users] ON;
INSERT INTO dbo.[users] ([id], [email], [full_name], [role], [password_hash], [created_at]) VALUES (1, N'student@safetybuddy.campus', N'Amahle Student', N'student', N'87b74d0646a0ed3e4e4a7dcd7a8e6f3fb874f3a11d12b04a94316f2ac01e67b0', N'2026-09-18 16:10:12.835');
INSERT INTO dbo.[users] ([id], [email], [full_name], [role], [password_hash], [created_at]) VALUES (2, N'security@safetybuddy.campus', N'Officer N. Jacobs', N'security_staff', N'b9ea7c6a946ac65a013b6df8edca1bc04607b06edf9e2dcf2de58ef92a24050d', N'2026-09-18 16:10:12.847');
INSERT INTO dbo.[users] ([id], [email], [full_name], [role], [password_hash], [created_at]) VALUES (3, N'admin@safetybuddy.campus', N'Admin Support Staff', N'security_admin', N'dc413e18f96c09b5882f155f1716d143ade8f8502d4156f1e8fd1f116260b3a7', N'2026-09-18 16:10:12.854');
SET IDENTITY_INSERT dbo.[users] OFF;

/* ---- dbo.CampusZone (5 rows) ---- */
SET IDENTITY_INSERT dbo.[CampusZone] ON;
INSERT INTO dbo.[CampusZone] ([ZoneId], [Name], [Description], [RiskStatus], [MapLat], [MapLng], [CreatedAt], [NearestHelpPoint], [MapReference]) VALUES (1, N'Main Library', N'Central campus library and study halls', N'Low', -33.9617, 25.6186, N'2026-09-19 00:24:18.400', N'Campus Security', N'ZONE');
INSERT INTO dbo.[CampusZone] ([ZoneId], [Name], [Description], [RiskStatus], [MapLat], [MapLng], [CreatedAt], [NearestHelpPoint], [MapReference]) VALUES (2, N'Science Block', N'Labs and lecture theatres', N'Medium', -33.9622, 25.6195, N'2026-09-19 00:24:18.400', N'Campus Security', N'ZONE');
INSERT INTO dbo.[CampusZone] ([ZoneId], [Name], [Description], [RiskStatus], [MapLat], [MapLng], [CreatedAt], [NearestHelpPoint], [MapReference]) VALUES (3, N'Residence Village', N'Student residences', N'Low', -33.9605, 25.617, N'2026-09-19 00:24:18.400', N'Campus Security', N'ZONE');
INSERT INTO dbo.[CampusZone] ([ZoneId], [Name], [Description], [RiskStatus], [MapLat], [MapLng], [CreatedAt], [NearestHelpPoint], [MapReference]) VALUES (4, N'Parking Lot C', N'Evening parking near sports fields', N'High', -33.963, 25.6202, N'2026-09-19 00:24:18.400', N'Campus Security', N'ZONE');
INSERT INTO dbo.[CampusZone] ([ZoneId], [Name], [Description], [RiskStatus], [MapLat], [MapLng], [CreatedAt], [NearestHelpPoint], [MapReference]) VALUES (5, N'Student Centre', N'Food court and admin services', N'Low', -33.9612, 25.618, N'2026-09-19 00:24:18.400', N'Campus Security', N'ZONE');
SET IDENTITY_INSERT dbo.[CampusZone] OFF;

/* ---- dbo.HelpContact (4 rows) ---- */
SET IDENTITY_INSERT dbo.[HelpContact] ON;
INSERT INTO dbo.[HelpContact] ([ContactId], [Label], [PhoneNumber], [SortOrder], [IsActive]) VALUES (1, N'Campus Security', N'+27 41 504 2000', 1, 1);
INSERT INTO dbo.[HelpContact] ([ContactId], [Label], [PhoneNumber], [SortOrder], [IsActive]) VALUES (2, N'Campus Health Clinic', N'+27 41 504 2174', 2, 1);
INSERT INTO dbo.[HelpContact] ([ContactId], [Label], [PhoneNumber], [SortOrder], [IsActive]) VALUES (3, N'Student Counselling', N'+27 41 504 2511', 3, 1);
INSERT INTO dbo.[HelpContact] ([ContactId], [Label], [PhoneNumber], [SortOrder], [IsActive]) VALUES (4, N'SAP Emergency', N'10111', 4, 1);
SET IDENTITY_INSERT dbo.[HelpContact] OFF;

/* ---- dbo.SupportService (4 rows) ---- */
SET IDENTITY_INSERT dbo.[SupportService] ON;
INSERT INTO dbo.[SupportService] ([ServiceId], [Title], [Detail], [ActionText], [IconKey], [SortOrder]) VALUES (1, N'Student Counselling', N'Free confidential sessions — Mon–Fri 08:00–16:30', N'Call +27 41 504 2511', N'chatbubbles', 1);
INSERT INTO dbo.[SupportService] ([ServiceId], [Title], [Detail], [ActionText], [IconKey], [SortOrder]) VALUES (2, N'Peer Support Network', N'Talk to trained student peers in a safe space', N'Visit Student Centre Room 12', N'people-circle', 2);
INSERT INTO dbo.[SupportService] ([ServiceId], [Title], [Detail], [ActionText], [IconKey], [SortOrder]) VALUES (3, N'Campus Health Clinic', N'Medical and wellness support on campus', N'Call +27 41 504 2174', N'medkit', 3);
INSERT INTO dbo.[SupportService] ([ServiceId], [Title], [Detail], [ActionText], [IconKey], [SortOrder]) VALUES (4, N'24/7 Crisis Line (SADAG)', N'If you need someone to talk to right now', N'Call 0800 567 567', N'call', 4);
SET IDENTITY_INSERT dbo.[SupportService] OFF;

/* ---- dbo.SafetyResource (8 rows) ---- */
SET IDENTITY_INSERT dbo.[SafetyResource] ON;
INSERT INTO dbo.[SafetyResource] ([ResourceId], [Title], [Summary], [Body], [SortOrder]) VALUES (1, N'What to do in an emergency', N'Clear steps when you need help right away.', N'Move to a lit, public area if you can. Press Help to alert campus security and your trusted contacts. Stay on the line if connected.', 1);
INSERT INTO dbo.[SafetyResource] ([ResourceId], [Title], [Summary], [Body], [SortOrder]) VALUES (2, N'How to contact campus security', N'One-tap numbers and what to expect.', N'Use Call for Help for Campus Security. Share your location if prompted. Security can dispatch a patrol without a long call.', 2);
INSERT INTO dbo.[SafetyResource] ([ResourceId], [Title], [Summary], [Body], [SortOrder]) VALUES (3, N'Safe walking tips', N'Practical guidance for moving around campus.', N'Prefer well-lit paths. Walk with someone when you can. Start Walk With Me so a trusted contact can watch your journey.', 3);
INSERT INTO dbo.[SafetyResource] ([ResourceId], [Title], [Summary], [Body], [SortOrder]) VALUES (4, N'Transport safety tips', N'Waiting for rides and shuttles.', N'Wait in designated pickup zones. Share your trip with a trusted contact. If a situation feels wrong, cancel and move to a busy area.', 4);
INSERT INTO dbo.[SafetyResource] ([ResourceId], [Title], [Summary], [Body], [SortOrder]) VALUES (5, N'Residence safety tips', N'Staying safer in and around residences.', N'Do not prop open access doors. Report broken lights or locks. If followed to your door, walk to a help point instead.', 5);
INSERT INTO dbo.[SafetyResource] ([ResourceId], [Title], [Summary], [Body], [SortOrder]) VALUES (6, N'Supporting a friend who feels unsafe', N'How to help without taking over.', N'Listen without judgement. Offer to walk with them or sit somewhere public. Help them contact security or counselling if they want.', 6);
INSERT INTO dbo.[SafetyResource] ([ResourceId], [Title], [Summary], [Body], [SortOrder]) VALUES (7, N'Counselling & wellness support', N'You are not alone after a difficult moment.', N'Student Counselling and Campus Health are available. SafetyBuddy offers a direct path to support services.', 7);
INSERT INTO dbo.[SafetyResource] ([ResourceId], [Title], [Summary], [Body], [SortOrder]) VALUES (8, N'After reporting an incident', N'What happens next, calmly explained.', N'Your report helps campus identify patterns. You can request follow-up. Support services remain available.', 8);
SET IDENTITY_INSERT dbo.[SafetyResource] OFF;

/* ---- dbo.PrivacySection (6 rows) ---- */
SET IDENTITY_INSERT dbo.[PrivacySection] ON;
INSERT INTO dbo.[PrivacySection] ([SectionId], [Title], [Body], [SortOrder]) VALUES (1, N'What data would be collected', N'In production: account identity, emergency alert details, location during an active alert or Walk With Me, trusted contact details you choose to save, and optional incident reports.', 1);
INSERT INTO dbo.[PrivacySection] ([SectionId], [Title], [Body], [SortOrder]) VALUES (2, N'Why it is needed', N'So campus security can find you quickly, trusted contacts can be notified, and the university can improve campus safety — never for marketing.', 2);
INSERT INTO dbo.[PrivacySection] ([SectionId], [Title], [Body], [SortOrder]) VALUES (3, N'Who would have access', N'Authorised campus security responders, designated student support staff when referrals are needed, and system administrators for configuration.', 3);
INSERT INTO dbo.[PrivacySection] ([SectionId], [Title], [Body], [SortOrder]) VALUES (4, N'How long it would be kept', N'Emergency records would be retained only as long as required by university policy and law, then securely deleted or anonymised.', 4);
INSERT INTO dbo.[PrivacySection] ([SectionId], [Title], [Body], [SortOrder]) VALUES (5, N'How it would be protected', N'Encrypted transport (TLS), encrypted storage, role-based access, audit logs, and university-approved authentication in a production deployment.', 5);
INSERT INTO dbo.[PrivacySection] ([SectionId], [Title], [Body], [SortOrder]) VALUES (6, N'POPIA considerations', N'Processing would follow purpose limitation, minimality, consent where required, security safeguards, and your rights through official university channels.', 6);
SET IDENTITY_INSERT dbo.[PrivacySection] OFF;

/* ---- dbo.ReportCategory (7 rows) ---- */
SET IDENTITY_INSERT dbo.[ReportCategory] ON;
INSERT INTO dbo.[ReportCategory] ([CategoryId], [Name], [IsActive], [SortOrder]) VALUES (1, N'Suspicious Activity', 1, 1);
INSERT INTO dbo.[ReportCategory] ([CategoryId], [Name], [IsActive], [SortOrder]) VALUES (2, N'Harassment', 1, 2);
INSERT INTO dbo.[ReportCategory] ([CategoryId], [Name], [IsActive], [SortOrder]) VALUES (3, N'Theft', 1, 3);
INSERT INTO dbo.[ReportCategory] ([CategoryId], [Name], [IsActive], [SortOrder]) VALUES (4, N'Infrastructure Hazard', 1, 4);
INSERT INTO dbo.[ReportCategory] ([CategoryId], [Name], [IsActive], [SortOrder]) VALUES (5, N'Medical Concern', 1, 5);
INSERT INTO dbo.[ReportCategory] ([CategoryId], [Name], [IsActive], [SortOrder]) VALUES (6, N'Other', 1, 6);
INSERT INTO dbo.[ReportCategory] ([CategoryId], [Name], [IsActive], [SortOrder]) VALUES (7, N'Poor lighting', 1, 7);
SET IDENTITY_INSERT dbo.[ReportCategory] OFF;

/* ---- dbo.MapMarker (5 rows) ---- */
SET IDENTITY_INSERT dbo.[MapMarker] ON;
INSERT INTO dbo.[MapMarker] ([MarkerId], [Name], [MarkerType], [Description], [MapLat], [MapLng], [IsActive]) VALUES (1, N'Reported: poorly lit path', N'danger', N'Student report — low lighting behind Science Building', -33.9619, 25.6168, 1);
INSERT INTO dbo.[MapMarker] ([MarkerId], [Name], [MarkerType], [Description], [MapLat], [MapLng], [IsActive]) VALUES (2, N'Security patrol point', N'security', N'Regular evening patrol checkpoint', -33.9605, 25.6158, 1);
INSERT INTO dbo.[MapMarker] ([MarkerId], [Name], [MarkerType], [Description], [MapLat], [MapLng], [IsActive]) VALUES (3, N'Emergency phone', N'emergency', N'Blue-light emergency phone', -33.9615, 25.6165, 1);
INSERT INTO dbo.[MapMarker] ([MarkerId], [Name], [MarkerType], [Description], [MapLat], [MapLng], [IsActive]) VALUES (4, N'First aid station', N'firstAid', N'Campus health first-aid point', -33.962, 25.6152, 1);
INSERT INTO dbo.[MapMarker] ([MarkerId], [Name], [MarkerType], [Description], [MapLat], [MapLng], [IsActive]) VALUES (5, N'Safe zone — Student Centre', N'safeZone', N'Busy public area with staff nearby', -33.9621, 25.6148, 1);
SET IDENTITY_INSERT dbo.[MapMarker] OFF;

/* ---- dbo.Student (3 rows) ---- */
SET IDENTITY_INSERT dbo.[Student] ON;
INSERT INTO dbo.[Student] ([StudentId], [UserId], [FullName], [Email], [Phone], [HomeZoneId], [CreatedAt]) VALUES (1, 1, N'Amahle Student', N'student@safetybuddy.campus', N'0820001111', 3, N'2026-09-19 00:24:18.437');
INSERT INTO dbo.[Student] ([StudentId], [UserId], [FullName], [Email], [Phone], [HomeZoneId], [CreatedAt]) VALUES (2, NULL, N'Thando Mokoena', N'thando@safetybuddy.campus', N'0820002222', 1, N'2026-09-19 00:24:18.437');
INSERT INTO dbo.[Student] ([StudentId], [UserId], [FullName], [Email], [Phone], [HomeZoneId], [CreatedAt]) VALUES (3, NULL, N'Jordan Naidoo', N'jordan@safetybuddy.campus', N'0820003333', 2, N'2026-09-19 00:24:18.437');
SET IDENTITY_INSERT dbo.[Student] OFF;

/* ---- dbo.TrustedContact (3 rows) ---- */
SET IDENTITY_INSERT dbo.[TrustedContact] ON;
INSERT INTO dbo.[TrustedContact] ([ContactId], [Name], [Phone], [Email], [Relationship], [AlertMethod]) VALUES (2, N'Sipho Friend', N'0831110002', N'sipho@example.com', N'Friend', N'App');
INSERT INTO dbo.[TrustedContact] ([ContactId], [Name], [Phone], [Email], [Relationship], [AlertMethod]) VALUES (3, N'Residence RA', N'0831110003', NULL, N'Residence Advisor', N'Call');
INSERT INTO dbo.[TrustedContact] ([ContactId], [Name], [Phone], [Email], [Relationship], [AlertMethod]) VALUES (4, N'Karabo', N'0680780641', N'karabomasimong2@gmail.com', N'Me', N'SMS');
SET IDENTITY_INSERT dbo.[TrustedContact] OFF;

/* ---- dbo.StudentTrustedContact (3 rows) ---- */
INSERT INTO dbo.[StudentTrustedContact] ([StudentId], [ContactId], [LinkedAt]) VALUES (1, 4, N'2026-09-19 10:08:10.363');
INSERT INTO dbo.[StudentTrustedContact] ([StudentId], [ContactId], [LinkedAt]) VALUES (2, 2, N'2026-09-19 00:24:18.451');
INSERT INTO dbo.[StudentTrustedContact] ([StudentId], [ContactId], [LinkedAt]) VALUES (2, 3, N'2026-09-19 00:24:18.451');

/* ---- dbo.Responder (2 rows) ---- */
SET IDENTITY_INSERT dbo.[Responder] ON;
INSERT INTO dbo.[Responder] ([ResponderId], [StudentId], [UserId], [FullName], [RoleTitle], [ContactPhone], [Availability]) VALUES (1, NULL, 2, N'Officer N. Jacobs', N'Campus Security', N'0415041234', N'Available');
INSERT INTO dbo.[Responder] ([ResponderId], [StudentId], [UserId], [FullName], [RoleTitle], [ContactPhone], [Availability]) VALUES (2, 2, NULL, N'Thando Mokoena', N'Student Marshal', N'0820002222', N'Available');
SET IDENTITY_INSERT dbo.[Responder] OFF;

/* ---- dbo.SafetyAlert (2 rows) ---- */
SET IDENTITY_INSERT dbo.[SafetyAlert] ON;
INSERT INTO dbo.[SafetyAlert] ([SafetyAlertId], [Title], [Message], [AlertLevel], [AffectedArea], [RecommendedAction], [PostedAt], [IsActive]) VALUES (1, N'Lighting outage â€” Parking Lot C', N'Several lights are offline near Parking Lot C. Extra patrols are active.', N'Caution', N'Parking Lot C', N'Use the lit walkway via Student Centre or request Walk With Me.', N'2026-09-19 00:24:18.457', 1);
INSERT INTO dbo.[SafetyAlert] ([SafetyAlertId], [Title], [Message], [AlertLevel], [AffectedArea], [RecommendedAction], [PostedAt], [IsActive]) VALUES (2, N'Wellness check-in week', N'Counselling drop-in sessions available at Student Centre.', N'Information', N'Student Centre', N'Visit Student Support if you need someone to talk to.', N'2026-09-19 00:24:18.457', 1);
SET IDENTITY_INSERT dbo.[SafetyAlert] OFF;

/* ---- dbo.SafetyAlertZone (4 rows) ---- */
INSERT INTO dbo.[SafetyAlertZone] ([SafetyAlertId], [ZoneId]) VALUES (1, 2);
INSERT INTO dbo.[SafetyAlertZone] ([SafetyAlertId], [ZoneId]) VALUES (1, 4);
INSERT INTO dbo.[SafetyAlertZone] ([SafetyAlertId], [ZoneId]) VALUES (2, 1);
INSERT INTO dbo.[SafetyAlertZone] ([SafetyAlertId], [ZoneId]) VALUES (2, 5);

/* ---- dbo.EmergencyAlert (2 rows) ---- */
SET IDENTITY_INSERT dbo.[EmergencyAlert] ON;
INSERT INTO dbo.[EmergencyAlert] ([EmergencyAlertId], [StudentId], [ZoneId], [AlertType], [LocationLabel], [TimeTriggered], [Status], [AssignedResponderId], [Notes], [IsAnonymous], [Latitude], [Longitude], [LocationAccuracy], [LocationCapturedAt]) VALUES (1, 1, 4, N'Panic / HELP', N'Parking Lot C â€” row B', N'2026-09-19 00:24:18.462', N'Resolved', 1, NULL, 0, NULL, NULL, NULL, NULL);
INSERT INTO dbo.[EmergencyAlert] ([EmergencyAlertId], [StudentId], [ZoneId], [AlertType], [LocationLabel], [TimeTriggered], [Status], [AssignedResponderId], [Notes], [IsAnonymous], [Latitude], [Longitude], [LocationAccuracy], [LocationCapturedAt]) VALUES (2, 1, NULL, N'Panic', N'Live GPS -34.00109, 25.67048', N'2026-09-19 00:52:21.366', N'False Alarm', NULL, NULL, 0, NULL, NULL, NULL, NULL);
SET IDENTITY_INSERT dbo.[EmergencyAlert] OFF;

/* ---- dbo.IncidentReport (3 rows) ---- */
SET IDENTITY_INSERT dbo.[IncidentReport] ON;
INSERT INTO dbo.[IncidentReport] ([ReportId], [StudentId], [SafetyAlertId], [ReportType], [LocationLabel], [Description], [PhotoUri], [IsAnonymous], [FollowUpRequested], [Status], [CreatedAt], [CategoryId]) VALUES (1, 1, 1, N'Poor lighting', N'Parking Lot C', N'Path lights near row B are dark after 19:00.', NULL, 1, 1, N'Submitted', N'2026-09-19 00:24:18.464', NULL);
INSERT INTO dbo.[IncidentReport] ([ReportId], [StudentId], [SafetyAlertId], [ReportType], [LocationLabel], [Description], [PhotoUri], [IsAnonymous], [FollowUpRequested], [Status], [CreatedAt], [CategoryId]) VALUES (2, 2, NULL, N'Suspicious activity', N'Science Block entrance', N'Person loitering near lab doors after hours.', NULL, 1, 0, N'Under Review', N'2026-09-19 00:24:18.464', NULL);
INSERT INTO dbo.[IncidentReport] ([ReportId], [StudentId], [SafetyAlertId], [ReportType], [LocationLabel], [Description], [PhotoUri], [IsAnonymous], [FollowUpRequested], [Status], [CreatedAt], [CategoryId]) VALUES (3, 1, NULL, N'Infrastructure Hazard', N'Main Library', N'Its hard to explain', N'file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FSafetyBuddy-232ede9f-7ece-4192-9d20-639009689c9e/ImagePicker/a640d630-8711-4619-9956-610136c5eeb3.jpeg', 1, 1, N'Submitted', N'2026-09-19 10:31:05.748', NULL);
SET IDENTITY_INSERT dbo.[IncidentReport] OFF;

/* ---- dbo.EmergencyAlertIncident (1 rows) ---- */
INSERT INTO dbo.[EmergencyAlertIncident] ([EmergencyAlertId], [ReportId], [LinkedAt]) VALUES (1, 1, N'2026-09-19 00:24:18.468');

/* ---- dbo.AlertLocationPing (0 rows) ---- */
-- (empty)

/* ---- dbo.AlertNotification (0 rows) ---- */
-- (empty)

/* ---- dbo.WalkSession (2 rows) ---- */
SET IDENTITY_INSERT dbo.[WalkSession] ON;
INSERT INTO dbo.[WalkSession] ([SessionId], [StudentId], [TrustedContactId], [StartZoneId], [EndZoneId], [StartLabel], [EndLabel], [StartLat], [StartLng], [EndLat], [EndLng], [TravelMode], [Status], [ShareWithSecurity], [ExpectedArrivalAt], [StartedAt], [EndedAt], [LastLat], [LastLng], [LastPingAt]) VALUES (1, 1, NULL, NULL, NULL, N'Current location', N'Main Library', -34.001095, 25.670482, -33.9617, 25.6186, N'foot', N'Completed', 1, NULL, N'2026-09-19 20:33:00.683', N'2026-09-19 20:33:53.430', -34.001092, 25.670483, N'2026-09-19 20:33:39.751');
INSERT INTO dbo.[WalkSession] ([SessionId], [StudentId], [TrustedContactId], [StartZoneId], [EndZoneId], [StartLabel], [EndLabel], [StartLat], [StartLng], [EndLat], [EndLng], [TravelMode], [Status], [ShareWithSecurity], [ExpectedArrivalAt], [StartedAt], [EndedAt], [LastLat], [LastLng], [LastPingAt]) VALUES (2, 1, NULL, NULL, NULL, N'Current location', N'Residence Village', -34.001095, 25.670478, -33.9605, 25.617, N'foot', N'Cancelled', 1, NULL, N'2026-09-19 20:43:48.779', N'2026-09-19 20:44:09.787', -34.001092, 25.670483, N'2026-09-19 20:44:05.403');
SET IDENTITY_INSERT dbo.[WalkSession] OFF;

/* ---- dbo.WalkLocationPing (3 rows) ---- */
SET IDENTITY_INSERT dbo.[WalkLocationPing] ON;
INSERT INTO dbo.[WalkLocationPing] ([PingId], [SessionId], [Latitude], [Longitude], [AccuracyMeters], [CapturedAt]) VALUES (1, 1, -34.001091, 25.670478, 4.262, N'2026-09-19 20:33:16.236');
INSERT INTO dbo.[WalkLocationPing] ([PingId], [SessionId], [Latitude], [Longitude], [AccuracyMeters], [CapturedAt]) VALUES (2, 1, -34.001092, 25.670483, 13.504, N'2026-09-19 20:33:39.756');
INSERT INTO dbo.[WalkLocationPing] ([PingId], [SessionId], [Latitude], [Longitude], [AccuracyMeters], [CapturedAt]) VALUES (3, 2, -34.001092, 25.670483, 5.157, N'2026-09-19 20:44:05.407');
SET IDENTITY_INSERT dbo.[WalkLocationPing] OFF;

/* ---- dbo.SupportReferral (0 rows) ---- */
-- (empty)

/* ---- dbo.SafetyAlertReceipt (0 rows) ---- */
-- (empty)

/* ---- dbo.RolePrivilege (30 rows) ---- */
SET IDENTITY_INSERT dbo.[RolePrivilege] ON;
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (1, N'student', N'emergency_alert', 1, 1, 0, 0, N'Create own panic; read own');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (2, N'student', N'alert_location', 1, 1, 0, 0, N'Share GPS on own active alert');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (3, N'student', N'trusted_contact', 1, 1, 1, 1, N'Own contacts only');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (4, N'student', N'alert_notification', 0, 1, 0, 0, N'See notify status for own alerts');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (5, N'student', N'help_contact', 0, 1, 0, 0, N'Read campus emergency numbers');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (6, N'student', N'walk_session', 1, 1, 1, 0, N'Own Walk With Me sessions');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (7, N'student', N'incident_report', 1, 1, 0, 0, N'Create/read own reports');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (8, N'student', N'safety_alert', 0, 1, 0, 0, N'Receive campus broadcasts');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (9, N'student', N'support_referral', 0, 1, 1, 0, N'View/ack post-incident support');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (10, N'student', N'safety_resource', 0, 1, 0, 0, N'Read resources');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (11, N'security_staff', N'emergency_alert', 0, 1, 1, 0, N'View all; update status/assign');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (12, N'security_staff', N'alert_location', 0, 1, 0, 0, N'Last-known GPS for response');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (13, N'security_staff', N'walk_session', 0, 1, 0, 0, N'Read sessions shared with security');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (14, N'security_staff', N'incident_report', 0, 1, 1, 0, N'Review campus reports');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (15, N'security_staff', N'safety_alert', 1, 1, 1, 0, N'Post/update campus alerts');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (16, N'security_staff', N'help_contact', 0, 1, 0, 0, N'Read emergency numbers');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (17, N'security_staff', N'support_referral', 1, 1, 0, 0, N'Refer students to support');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (18, N'security_admin', N'emergency_alert', 0, 1, 1, 0, N'Full operational access');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (19, N'security_admin', N'alert_location', 0, 1, 0, 0, N'Full operational access');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (20, N'security_admin', N'trusted_contact', 0, 1, 0, 0, N'Audit only');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (21, N'security_admin', N'help_contact', 1, 1, 1, 1, N'Manage emergency numbers');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (22, N'security_admin', N'safety_resource', 1, 1, 1, 1, N'Manage safety resources');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (23, N'security_admin', N'support_service', 1, 1, 1, 1, N'Manage support services');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (24, N'security_admin', N'safety_alert', 1, 1, 1, 1, N'Manage campus alerts');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (25, N'security_admin', N'campus_zone', 1, 1, 1, 1, N'Manage zones / map risk');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (26, N'security_admin', N'map_marker', 1, 1, 1, 1, N'Manage map markers');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (27, N'security_admin', N'users', 0, 1, 1, 0, N'List/manage accounts');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (28, N'security_admin', N'walk_session', 0, 1, 0, 0, N'Read all sessions');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (29, N'security_admin', N'incident_report', 0, 1, 1, 0, N'Review all reports');
INSERT INTO dbo.[RolePrivilege] ([PrivilegeId], [RoleKey], [ResourceKey], [CanCreate], [CanRead], [CanUpdate], [CanDelete], [ScopeNote]) VALUES (30, N'security_admin', N'support_referral', 1, 1, 1, 0, N'Manage referrals');
SET IDENTITY_INSERT dbo.[RolePrivilege] OFF;

COMMIT TRANSACTION;
GO

PRINT N'SafetyBuddy dummy data synced from Safety-Alerts export.';
GO
