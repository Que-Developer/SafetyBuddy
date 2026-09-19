const sql = require("mssql/msnodesqlv8");
const { getPool } = require("./db");

function mapSafetyAlert(row) {
  return {
    id: String(row.SafetyAlertId),
    title: row.Title,
    message: row.Message,
    affectedArea: row.AffectedArea || "",
    dateTime: row.PostedAt
      ? new Date(row.PostedAt).toISOString().slice(0, 16).replace("T", " ")
      : "",
    recommendedAction: row.RecommendedAction || "",
    alertLevel: row.AlertLevel,
  };
}

function mapZone(row) {
  const risk = row.RiskStatus === "Medium" ? "Moderate" : row.RiskStatus === "High" ? "Elevated" : "Low";
  return {
    id: String(row.ZoneId),
    name: row.Name,
    description: row.Description || "",
    riskStatus: risk,
    nearestHelpPoint: row.NearestHelpPoint || "Campus Security",
    mapReference: row.MapReference || `Z-${row.ZoneId}`,
    lat: row.MapLat,
    lng: row.MapLng,
  };
}

function mapEmergency(row) {
  const anon = !!row.IsAnonymous;
  return {
    id: `A-${row.EmergencyAlertId}`,
    emergencyAlertId: row.EmergencyAlertId,
    studentName: anon
      ? `Anonymous #A-${row.EmergencyAlertId}`
      : row.StudentName || "Student",
    studentId: row.StudentId,
    alertType: row.AlertType,
    location: row.LocationLabel,
    latitude: row.Latitude != null ? Number(row.Latitude) : null,
    longitude: row.Longitude != null ? Number(row.Longitude) : null,
    locationAccuracy: row.LocationAccuracy != null ? Number(row.LocationAccuracy) : null,
    locationCapturedAt: row.LocationCapturedAt || null,
    timeTriggered: relativeTime(row.TimeTriggered),
    timeTriggeredRaw: row.TimeTriggered,
    assignedResponder: row.ResponderName || "Unassigned",
    notes: row.Notes || "",
    status: row.Status,
  };
}

function relativeTime(dt) {
  if (!dt) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(dt).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr ago`;
}

function mapResponder(row) {
  return {
    id: String(row.ResponderId),
    name: row.FullName,
    role: row.RoleTitle,
    contact: row.ContactPhone || "",
    availability: row.Availability === "OffDuty" ? "Off Duty" : row.Availability,
  };
}

function mapTrusted(row) {
  const method = row.AlertMethod === "App" ? "App push" : row.AlertMethod;
  return {
    id: String(row.ContactId),
    name: row.Name,
    phone: row.Phone,
    email: row.Email || "",
    relationship: row.Relationship || "Trusted",
    preferredAlertMethod: method,
  };
}

function mapHelpContact(row) {
  return {
    id: String(row.ContactId),
    label: row.Label,
    number: row.PhoneNumber,
  };
}

function mapReport(row) {
  return {
    id: `RPT-${row.ReportId}`,
    reportId: row.ReportId,
    reportType: row.ReportType,
    location: row.LocationLabel,
    dateTime: row.CreatedAt
      ? new Date(row.CreatedAt).toISOString().slice(0, 16).replace("T", " ")
      : "",
    description: row.Description,
    photoAttached: !!row.PhotoUri,
    followUpRequested: !!row.FollowUpRequested,
    submitAnonymously: !!row.IsAnonymous,
    status: row.Status,
  };
}

async function listSafetyAlerts() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT SafetyAlertId, Title, Message, AlertLevel, AffectedArea, RecommendedAction, PostedAt
    FROM dbo.SafetyAlert
    WHERE IsActive = 1 OR IsActive IS NULL
    ORDER BY PostedAt DESC
  `);
  return r.recordset.map(mapSafetyAlert);
}

async function createSafetyAlert({ title, message, alertLevel, affectedArea, recommendedAction }) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("Title", sql.NVarChar, title)
    .input("Message", sql.NVarChar, message || title)
    .input("AlertLevel", sql.NVarChar, alertLevel || "Information")
    .input("AffectedArea", sql.NVarChar, affectedArea || "Campus-wide")
    .input("RecommendedAction", sql.NVarChar, recommendedAction || "Follow campus guidance.")
    .query(`
      INSERT INTO dbo.SafetyAlert (Title, Message, AlertLevel, AffectedArea, RecommendedAction)
      OUTPUT INSERTED.*
      VALUES (@Title, @Message, @AlertLevel, @AffectedArea, @RecommendedAction)
    `);
  return mapSafetyAlert(r.recordset[0]);
}

async function listCampusZones() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT ZoneId, Name, Description, RiskStatus, MapLat, MapLng, NearestHelpPoint, MapReference
    FROM dbo.CampusZone ORDER BY Name
  `);
  return r.recordset.map(mapZone);
}

async function listHelpContacts() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT ContactId, Label, PhoneNumber FROM dbo.HelpContact
    WHERE IsActive = 1 ORDER BY SortOrder, ContactId
  `);
  return r.recordset.map(mapHelpContact);
}

async function createHelpContact({ label, number }) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("Label", sql.NVarChar, label)
    .input("PhoneNumber", sql.NVarChar, number)
    .query(`
      INSERT INTO dbo.HelpContact (Label, PhoneNumber, SortOrder)
      OUTPUT INSERTED.*
      VALUES (@Label, @PhoneNumber, 99)
    `);
  return mapHelpContact(r.recordset[0]);
}

async function listSupportServices() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT ServiceId, Title, Detail, ActionText, IconKey
    FROM dbo.SupportService ORDER BY SortOrder, ServiceId
  `);
  return r.recordset.map((row) => ({
    id: String(row.ServiceId),
    title: row.Title,
    detail: row.Detail,
    action: row.ActionText,
    iconKey: row.IconKey,
  }));
}

async function createSupportService({ title, detail, actionText, iconKey }) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("Title", sql.NVarChar, title)
    .input("Detail", sql.NVarChar, detail)
    .input("ActionText", sql.NVarChar, actionText)
    .input("IconKey", sql.NVarChar, iconKey || "heart")
    .query(`
      INSERT INTO dbo.SupportService (Title, Detail, ActionText, IconKey, SortOrder)
      OUTPUT INSERTED.*
      VALUES (@Title, @Detail, @ActionText, @IconKey, 99)
    `);
  const row = r.recordset[0];
  return {
    id: String(row.ServiceId),
    title: row.Title,
    detail: row.Detail,
    action: row.ActionText,
    iconKey: row.IconKey,
  };
}

async function listSafetyResources() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT ResourceId, Title, Summary, Body FROM dbo.SafetyResource
    ORDER BY SortOrder, ResourceId
  `);
  return r.recordset.map((row) => ({
    id: String(row.ResourceId),
    title: row.Title,
    summary: row.Summary,
    body: row.Body,
  }));
}

async function createSafetyResource({ title, summary, body }) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("Title", sql.NVarChar, title)
    .input("Summary", sql.NVarChar, summary)
    .input("Body", sql.NVarChar, body)
    .query(`
      INSERT INTO dbo.SafetyResource (Title, Summary, Body, SortOrder)
      OUTPUT INSERTED.*
      VALUES (@Title, @Summary, @Body, 99)
    `);
  const row = r.recordset[0];
  return {
    id: String(row.ResourceId),
    title: row.Title,
    summary: row.Summary,
    body: row.Body,
  };
}

async function listPrivacySections() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT SectionId, Title, Body FROM dbo.PrivacySection
    ORDER BY SortOrder, SectionId
  `);
  return r.recordset.map((row) => ({
    id: String(row.SectionId),
    title: row.Title,
    body: row.Body,
  }));
}

async function listReportCategories() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT CategoryId, Name, IsActive FROM dbo.ReportCategory
    ORDER BY SortOrder, CategoryId
  `);
  return r.recordset.map((row) => ({
    id: String(row.CategoryId),
    name: row.Name,
    active: !!row.IsActive,
  }));
}

async function setReportCategoryActive(categoryId, active) {
  const pool = await getPool();
  await pool
    .request()
    .input("id", sql.Int, Number(categoryId))
    .input("active", sql.Bit, active ? 1 : 0)
    .query(`UPDATE dbo.ReportCategory SET IsActive = @active WHERE CategoryId = @id`);
  return listReportCategories();
}

async function listResponders() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT ResponderId, FullName, RoleTitle, ContactPhone, Availability
    FROM dbo.Responder ORDER BY FullName
  `);
  return r.recordset.map(mapResponder);
}

async function listEmergencyAlerts({ role, userId, studentOnly } = {}) {
  const pool = await getPool();
  const studentId =
    studentOnly || role === "student"
      ? await getStudentIdForUser(userId)
      : null;

  const req = pool.request();
  let where = "";
  if (studentId) {
    req.input("sid", sql.Int, studentId);
    where = "WHERE ea.StudentId = @sid";
  }

  const r = await req.query(`
    SELECT ea.EmergencyAlertId, ea.StudentId, ea.AlertType, ea.LocationLabel,
           ea.Latitude, ea.Longitude, ea.LocationAccuracy, ea.LocationCapturedAt,
           ea.TimeTriggered, ea.Status, ea.Notes, ea.IsAnonymous,
           s.FullName AS StudentName,
           r.FullName AS ResponderName
    FROM dbo.EmergencyAlert ea
    INNER JOIN dbo.Student s ON s.StudentId = ea.StudentId
    LEFT JOIN dbo.Responder r ON r.ResponderId = ea.AssignedResponderId
    ${where}
    ORDER BY ea.TimeTriggered DESC
  `);
  return r.recordset.map(mapEmergency);
}

async function updateEmergencyAlertStatus(id, status, assignResponderName) {
  const pool = await getPool();
  let responderId = null;
  if (assignResponderName && assignResponderName !== "Unassigned") {
    const found = await pool
      .request()
      .input("name", sql.NVarChar, assignResponderName)
      .query(`SELECT TOP 1 ResponderId FROM dbo.Responder WHERE FullName = @name`);
    responderId = found.recordset[0]?.ResponderId ?? null;
  }
  if (status === "Responder Dispatched" && !responderId) {
    const any = await pool.request().query(`
      SELECT TOP 1 ResponderId FROM dbo.Responder
      WHERE Availability = N'Available' ORDER BY ResponderId
    `);
    responderId = any.recordset[0]?.ResponderId ?? null;
  }

  // Clear unique assignment conflict: unassign this responder from other alerts first
  if (responderId) {
    await pool
      .request()
      .input("rid", sql.Int, responderId)
      .input("id", sql.Int, Number(id))
      .query(`
        UPDATE dbo.EmergencyAlert SET AssignedResponderId = NULL
        WHERE AssignedResponderId = @rid AND EmergencyAlertId <> @id
      `);
  }

  await pool
    .request()
    .input("id", sql.Int, Number(id))
    .input("status", sql.NVarChar, status)
    .input("rid", sql.Int, responderId)
    .query(`
      UPDATE dbo.EmergencyAlert
      SET Status = @status,
          AssignedResponderId = CASE WHEN @rid IS NULL THEN AssignedResponderId ELSE @rid END
      WHERE EmergencyAlertId = @id
    `);

  const list = await listEmergencyAlerts();
  return list.find((a) => a.emergencyAlertId === Number(id)) || null;
}

async function createEmergencyAlert({
  studentId,
  zoneId,
  alertType,
  locationLabel,
  isAnonymous,
  latitude,
  longitude,
  locationAccuracy,
  notifyTrustedContacts = true,
}) {
  const pool = await getPool();
  let sid = studentId;
  if (!sid) {
    const s = await pool.request().query(`SELECT TOP 1 StudentId FROM dbo.Student ORDER BY StudentId`);
    sid = s.recordset[0]?.StudentId;
  }
  if (!sid) throw new Error("No student records in database.");

  const lat = latitude != null ? Number(latitude) : null;
  const lng = longitude != null ? Number(longitude) : null;
  const acc = locationAccuracy != null ? Number(locationAccuracy) : null;
  const hasGps = Number.isFinite(lat) && Number.isFinite(lng);

  const r = await pool
    .request()
    .input("StudentId", sql.Int, sid)
    .input("ZoneId", sql.Int, zoneId || null)
    .input("AlertType", sql.NVarChar, alertType || "Panic / HELP")
    .input("LocationLabel", sql.NVarChar, locationLabel || "Campus")
    .input("IsAnonymous", sql.Bit, isAnonymous ? 1 : 0)
    .input("Latitude", sql.Float, hasGps ? lat : null)
    .input("Longitude", sql.Float, hasGps ? lng : null)
    .input("LocationAccuracy", sql.Float, hasGps && Number.isFinite(acc) ? acc : null)
    .query(`
      INSERT INTO dbo.EmergencyAlert (
        StudentId, ZoneId, AlertType, LocationLabel, Status, IsAnonymous,
        Latitude, Longitude, LocationAccuracy, LocationCapturedAt
      )
      OUTPUT INSERTED.EmergencyAlertId
      VALUES (
        @StudentId, @ZoneId, @AlertType, @LocationLabel, N'New', @IsAnonymous,
        @Latitude, @Longitude, @LocationAccuracy,
        CASE WHEN @Latitude IS NULL THEN NULL ELSE SYSUTCDATETIME() END
      )
    `);

  const emergencyAlertId = r.recordset[0].EmergencyAlertId;

  if (hasGps && (await tableExists("AlertLocationPing"))) {
    await pool
      .request()
      .input("EmergencyAlertId", sql.Int, emergencyAlertId)
      .input("Latitude", sql.Float, lat)
      .input("Longitude", sql.Float, lng)
      .input("AccuracyMeters", sql.Float, Number.isFinite(acc) ? acc : null)
      .query(`
        INSERT INTO dbo.AlertLocationPing (EmergencyAlertId, Latitude, Longitude, AccuracyMeters)
        VALUES (@EmergencyAlertId, @Latitude, @Longitude, @AccuracyMeters)
      `);
  }

  let notifications = [];
  if (notifyTrustedContacts && (await tableExists("AlertNotification"))) {
    notifications = await queueTrustedContactNotifications({
      emergencyAlertId,
      studentId: sid,
      locationLabel: locationLabel || "Campus",
    });
  }

  // Auto support referral after panic (story 11)
  if (await tableExists("SupportReferral")) {
    await createSupportReferral({
      studentId: sid,
      emergencyAlertId,
      reason: "Post-panic support check-in",
    });
  }

  return { emergencyAlertId, notificationsQueued: notifications.length, notifications };
}

async function tableExists(name) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("t", sql.NVarChar, name)
    .query(`SELECT OBJECT_ID('dbo.' + @t, 'U') AS id`);
  return r.recordset[0].id != null;
}

async function queueTrustedContactNotifications({
  emergencyAlertId,
  studentId,
  locationLabel,
}) {
  const pool = await getPool();
  const contacts = await pool
    .request()
    .input("sid", sql.Int, studentId)
    .query(`
      SELECT tc.ContactId, tc.Name, tc.AlertMethod
      FROM dbo.TrustedContact tc
      INNER JOIN dbo.StudentTrustedContact stc ON stc.ContactId = tc.ContactId
      WHERE stc.StudentId = @sid
    `);

  const preview = `SafetyBuddy panic alert near ${locationLabel}. Please check on your contact.`;
  const queued = [];
  for (const c of contacts.recordset) {
    const channel = ["SMS", "Call", "Email", "App"].includes(c.AlertMethod)
      ? c.AlertMethod
      : "SMS";
    const ins = await pool
      .request()
      .input("EmergencyAlertId", sql.Int, emergencyAlertId)
      .input("ContactId", sql.Int, c.ContactId)
      .input("Channel", sql.NVarChar, channel)
      .input("MessagePreview", sql.NVarChar, preview)
      .query(`
        INSERT INTO dbo.AlertNotification
          (EmergencyAlertId, ContactId, Channel, Status, MessagePreview)
        OUTPUT INSERTED.NotificationId, INSERTED.ContactId, INSERTED.Channel, INSERTED.Status
        VALUES (@EmergencyAlertId, @ContactId, @Channel, N'Queued', @MessagePreview)
      `);
    queued.push({
      notificationId: ins.recordset[0].NotificationId,
      contactId: ins.recordset[0].ContactId,
      contactName: c.Name,
      channel: ins.recordset[0].Channel,
      status: ins.recordset[0].Status,
    });
  }
  return queued;
}

async function addAlertLocationPing(emergencyAlertId, { latitude, longitude, accuracy }) {
  const pool = await getPool();
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Valid latitude and longitude are required.");
  }
  const acc = accuracy != null ? Number(accuracy) : null;

  await pool
    .request()
    .input("id", sql.Int, Number(emergencyAlertId))
    .input("Latitude", sql.Float, lat)
    .input("Longitude", sql.Float, lng)
    .input("LocationAccuracy", sql.Float, Number.isFinite(acc) ? acc : null)
    .query(`
      UPDATE dbo.EmergencyAlert
      SET Latitude = @Latitude,
          Longitude = @Longitude,
          LocationAccuracy = @LocationAccuracy,
          LocationCapturedAt = SYSUTCDATETIME()
      WHERE EmergencyAlertId = @id
    `);

  if (await tableExists("AlertLocationPing")) {
    await pool
      .request()
      .input("EmergencyAlertId", sql.Int, Number(emergencyAlertId))
      .input("Latitude", sql.Float, lat)
      .input("Longitude", sql.Float, lng)
      .input("AccuracyMeters", sql.Float, Number.isFinite(acc) ? acc : null)
      .query(`
        INSERT INTO dbo.AlertLocationPing (EmergencyAlertId, Latitude, Longitude, AccuracyMeters)
        VALUES (@EmergencyAlertId, @Latitude, @Longitude, @AccuracyMeters)
      `);
  }

  return { ok: true, latitude: lat, longitude: lng };
}

async function createWalkSession(userId, body = {}) {
  const pool = await getPool();
  const studentId = await getStudentIdForUser(userId);
  if (!studentId) throw new Error("No student profile linked to this account.");
  if (!(await tableExists("WalkSession"))) {
    throw new Error("WalkSession table is not available yet.");
  }

  const r = await pool
    .request()
    .input("StudentId", sql.Int, studentId)
    .input("TrustedContactId", sql.Int, body.trustedContactId || null)
    .input("StartZoneId", sql.Int, body.startZoneId || null)
    .input("EndZoneId", sql.Int, body.endZoneId || null)
    .input("StartLabel", sql.NVarChar, body.startLabel || null)
    .input("EndLabel", sql.NVarChar, body.endLabel || null)
    .input("StartLat", sql.Float, body.startLat != null ? Number(body.startLat) : null)
    .input("StartLng", sql.Float, body.startLng != null ? Number(body.startLng) : null)
    .input("EndLat", sql.Float, body.endLat != null ? Number(body.endLat) : null)
    .input("EndLng", sql.Float, body.endLng != null ? Number(body.endLng) : null)
    .input("TravelMode", sql.NVarChar, body.travelMode === "car" ? "car" : "foot")
    .input("ShareWithSecurity", sql.Bit, body.shareWithSecurity ? 1 : 0)
    .input("LastLat", sql.Float, body.startLat != null ? Number(body.startLat) : null)
    .input("LastLng", sql.Float, body.startLng != null ? Number(body.startLng) : null)
    .query(`
      INSERT INTO dbo.WalkSession (
        StudentId, TrustedContactId, StartZoneId, EndZoneId,
        StartLabel, EndLabel, StartLat, StartLng, EndLat, EndLng,
        TravelMode, Status, ShareWithSecurity, LastLat, LastLng, LastPingAt
      )
      OUTPUT INSERTED.SessionId, INSERTED.Status, INSERTED.StartedAt
      VALUES (
        @StudentId, @TrustedContactId, @StartZoneId, @EndZoneId,
        @StartLabel, @EndLabel, @StartLat, @StartLng, @EndLat, @EndLng,
        @TravelMode, N'Active', @ShareWithSecurity, @LastLat, @LastLng, SYSUTCDATETIME()
      )
    `);

  return {
    sessionId: r.recordset[0].SessionId,
    status: r.recordset[0].Status,
    startedAt: r.recordset[0].StartedAt,
  };
}

async function listWalkSessions({ role, userId } = {}) {
  if (!(await tableExists("WalkSession"))) return [];
  const pool = await getPool();
  const req = pool.request();
  let where = "";

  if (role === "student") {
    const sid = await getStudentIdForUser(userId);
    req.input("sid", sql.Int, sid || -1);
    where = "WHERE ws.StudentId = @sid";
  } else if (role === "security_staff") {
    where = "WHERE ws.ShareWithSecurity = 1 OR ws.Status = N'Distress'";
  }

  const r = await req.query(`
    SELECT ws.SessionId, ws.StudentId, s.FullName AS StudentName,
           ws.StartLabel, ws.EndLabel, ws.TravelMode, ws.Status,
           ws.ShareWithSecurity, ws.StartedAt, ws.EndedAt,
           ws.LastLat, ws.LastLng, ws.LastPingAt,
           tc.Name AS TrustedContactName
    FROM dbo.WalkSession ws
    INNER JOIN dbo.Student s ON s.StudentId = ws.StudentId
    LEFT JOIN dbo.TrustedContact tc ON tc.ContactId = ws.TrustedContactId
    ${where}
    ORDER BY ws.StartedAt DESC
  `);

  return r.recordset.map((row) => ({
    sessionId: row.SessionId,
    studentId: row.StudentId,
    studentName: row.StudentName,
    startLabel: row.StartLabel,
    endLabel: row.EndLabel,
    travelMode: row.TravelMode,
    status: row.Status,
    shareWithSecurity: !!row.ShareWithSecurity,
    startedAt: row.StartedAt,
    endedAt: row.EndedAt,
    lastLat: row.LastLat,
    lastLng: row.LastLng,
    lastPingAt: row.LastPingAt,
    trustedContactName: row.TrustedContactName || null,
  }));
}

async function pingWalkSession(sessionId, userId, { latitude, longitude, accuracy }) {
  const pool = await getPool();
  const studentId = await getStudentIdForUser(userId);
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Valid latitude and longitude are required.");
  }

  const owned = await pool
    .request()
    .input("id", sql.Int, Number(sessionId))
    .input("sid", sql.Int, studentId || -1)
    .query(`
      SELECT SessionId FROM dbo.WalkSession
      WHERE SessionId = @id AND StudentId = @sid AND Status = N'Active'
    `);
  if (!owned.recordset[0]) throw new Error("Active walk session not found.");

  await pool
    .request()
    .input("id", sql.Int, Number(sessionId))
    .input("Latitude", sql.Float, lat)
    .input("Longitude", sql.Float, lng)
    .query(`
      UPDATE dbo.WalkSession
      SET LastLat = @Latitude, LastLng = @Longitude, LastPingAt = SYSUTCDATETIME()
      WHERE SessionId = @id
    `);

  if (await tableExists("WalkLocationPing")) {
    await pool
      .request()
      .input("SessionId", sql.Int, Number(sessionId))
      .input("Latitude", sql.Float, lat)
      .input("Longitude", sql.Float, lng)
      .input("AccuracyMeters", sql.Float, accuracy != null ? Number(accuracy) : null)
      .query(`
        INSERT INTO dbo.WalkLocationPing (SessionId, Latitude, Longitude, AccuracyMeters)
        VALUES (@SessionId, @Latitude, @Longitude, @AccuracyMeters)
      `);
  }

  return { ok: true, sessionId: Number(sessionId), latitude: lat, longitude: lng };
}

async function endWalkSession(sessionId, userId, status = "Completed") {
  const pool = await getPool();
  const studentId = await getStudentIdForUser(userId);
  const next = ["Completed", "Cancelled", "Distress", "Overdue"].includes(status)
    ? status
    : "Completed";

  const r = await pool
    .request()
    .input("id", sql.Int, Number(sessionId))
    .input("sid", sql.Int, studentId || -1)
    .input("status", sql.NVarChar, next)
    .query(`
      UPDATE dbo.WalkSession
      SET Status = @status, EndedAt = SYSUTCDATETIME()
      WHERE SessionId = @id AND StudentId = @sid
      SELECT @@ROWCOUNT AS n
    `);
  if (!r.recordset[0]?.n) throw new Error("Walk session not found.");
  return { ok: true, sessionId: Number(sessionId), status: next };
}

async function createSupportReferral({
  studentId,
  emergencyAlertId,
  reportId,
  serviceId,
  reason,
}) {
  if (!(await tableExists("SupportReferral"))) return null;
  const pool = await getPool();
  let sid = studentId;
  if (!sid) return null;

  // Prefer counselling service when available
  let svc = serviceId || null;
  if (!svc && (await tableExists("SupportService"))) {
    const found = await pool.request().query(`
      SELECT TOP 1 ServiceId FROM dbo.SupportService
      WHERE Title LIKE N'%Counselling%' ORDER BY SortOrder
    `);
    svc = found.recordset[0]?.ServiceId ?? null;
  }

  const r = await pool
    .request()
    .input("StudentId", sql.Int, sid)
    .input("EmergencyAlertId", sql.Int, emergencyAlertId || null)
    .input("ReportId", sql.Int, reportId || null)
    .input("ServiceId", sql.Int, svc)
    .input("Reason", sql.NVarChar, reason || "Support follow-up")
    .query(`
      INSERT INTO dbo.SupportReferral
        (StudentId, EmergencyAlertId, ReportId, ServiceId, Reason)
      OUTPUT INSERTED.ReferralId
      VALUES (@StudentId, @EmergencyAlertId, @ReportId, @ServiceId, @Reason)
    `);
  return { referralId: r.recordset[0].ReferralId };
}

async function listSupportReferralsForUser(userId) {
  if (!(await tableExists("SupportReferral"))) return [];
  const pool = await getPool();
  const sid = await getStudentIdForUser(userId);
  if (!sid) return [];

  const r = await pool
    .request()
    .input("sid", sql.Int, sid)
    .query(`
      SELECT sr.ReferralId, sr.Reason, sr.ShownAt, sr.AcknowledgedAt,
             sr.EmergencyAlertId, sr.ReportId, sr.ServiceId,
             ss.Title AS ServiceTitle, ss.Detail AS ServiceDetail,
             ss.ActionText AS ServiceAction
      FROM dbo.SupportReferral sr
      LEFT JOIN dbo.SupportService ss ON ss.ServiceId = sr.ServiceId
      WHERE sr.StudentId = @sid
      ORDER BY sr.ShownAt DESC
    `);

  return r.recordset.map((row) => ({
    referralId: row.ReferralId,
    reason: row.Reason,
    shownAt: row.ShownAt,
    acknowledgedAt: row.AcknowledgedAt,
    emergencyAlertId: row.EmergencyAlertId,
    reportId: row.ReportId,
    service: row.ServiceId
      ? {
          id: row.ServiceId,
          title: row.ServiceTitle,
          detail: row.ServiceDetail,
          actionText: row.ServiceAction,
        }
      : null,
  }));
}

async function acknowledgeSupportReferral(userId, referralId) {
  const pool = await getPool();
  const sid = await getStudentIdForUser(userId);
  const r = await pool
    .request()
    .input("sid", sql.Int, sid || -1)
    .input("id", sql.Int, Number(referralId))
    .query(`
      UPDATE dbo.SupportReferral
      SET AcknowledgedAt = SYSUTCDATETIME()
      WHERE ReferralId = @id AND StudentId = @sid AND AcknowledgedAt IS NULL;
      SELECT @@ROWCOUNT AS n;
    `);
  if (!r.recordset[0]?.n) throw new Error("Referral not found.");
  return { ok: true };
}

async function markSafetyAlertRead(userId, safetyAlertId) {
  if (!(await tableExists("SafetyAlertReceipt"))) return { ok: true };
  const pool = await getPool();
  const sid = await getStudentIdForUser(userId);
  if (!sid) return { ok: true };
  await pool
    .request()
    .input("aid", sql.Int, Number(safetyAlertId))
    .input("sid", sql.Int, sid)
    .query(`
      IF NOT EXISTS (
        SELECT 1 FROM dbo.SafetyAlertReceipt
        WHERE SafetyAlertId = @aid AND StudentId = @sid
      )
      INSERT INTO dbo.SafetyAlertReceipt (SafetyAlertId, StudentId)
      VALUES (@aid, @sid);
    `);
  return { ok: true };
}

async function listRolePrivileges(role) {
  if (!(await tableExists("RolePrivilege"))) return [];
  const pool = await getPool();
  const req = pool.request();
  let where = "";
  if (role) {
    req.input("role", sql.NVarChar, role);
    where = "WHERE RoleKey = @role";
  }
  const r = await req.query(`
    SELECT RoleKey, ResourceKey, CanCreate, CanRead, CanUpdate, CanDelete, ScopeNote
    FROM dbo.RolePrivilege
    ${where}
    ORDER BY RoleKey, ResourceKey
  `);
  return r.recordset.map((row) => ({
    role: row.RoleKey,
    resource: row.ResourceKey,
    create: !!row.CanCreate,
    read: !!row.CanRead,
    update: !!row.CanUpdate,
    delete: !!row.CanDelete,
    scope: row.ScopeNote || "",
  }));
}

async function listIncidentReports() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT ReportId, StudentId, SafetyAlertId, ReportType, LocationLabel, Description,
           PhotoUri, IsAnonymous, FollowUpRequested, Status, CreatedAt
    FROM dbo.IncidentReport ORDER BY CreatedAt DESC
  `);
  return r.recordset.map(mapReport);
}

async function createIncidentReport(input) {
  const pool = await getPool();
  let studentId = input.studentId;
  if (!studentId) {
    const s = await pool.request().query(`SELECT TOP 1 StudentId FROM dbo.Student ORDER BY StudentId`);
    studentId = s.recordset[0]?.StudentId;
  }
  if (!studentId) throw new Error("No student records in database.");

  const r = await pool
    .request()
    .input("StudentId", sql.Int, studentId)
    .input("SafetyAlertId", sql.Int, input.safetyAlertId || null)
    .input("ReportType", sql.NVarChar, input.reportType)
    .input("LocationLabel", sql.NVarChar, input.location)
    .input("Description", sql.NVarChar, input.description || "")
    .input("PhotoUri", sql.NVarChar, input.photoUri || null)
    .input("IsAnonymous", sql.Bit, input.isAnonymous !== false ? 1 : 0)
    .input("FollowUp", sql.Bit, input.followUpRequested ? 1 : 0)
    .query(`
      INSERT INTO dbo.IncidentReport
        (StudentId, SafetyAlertId, ReportType, LocationLabel, Description, PhotoUri, IsAnonymous, FollowUpRequested, Status)
      OUTPUT INSERTED.*
      VALUES (@StudentId, @SafetyAlertId, @ReportType, @LocationLabel, @Description, @PhotoUri, @IsAnonymous, @FollowUp, N'Submitted')
    `);
  return mapReport(r.recordset[0]);
}

async function getStudentIdForUser(userId) {
  const pool = await getPool();
  const r = await pool
    .request()
    .input("uid", sql.Int, Number(userId))
    .query(`SELECT TOP 1 StudentId FROM dbo.Student WHERE UserId = @uid`);
  if (r.recordset[0]) return r.recordset[0].StudentId;

  // Link or create student row for this user
  const user = await pool
    .request()
    .input("uid", sql.Int, Number(userId))
    .query(`SELECT id, email, full_name FROM dbo.users WHERE id = @uid`);
  const u = user.recordset[0];
  if (!u) return null;

  const byEmail = await pool
    .request()
    .input("email", sql.NVarChar, u.email)
    .query(`SELECT TOP 1 StudentId FROM dbo.Student WHERE Email = @email`);
  if (byEmail.recordset[0]) {
    await pool
      .request()
      .input("sid", sql.Int, byEmail.recordset[0].StudentId)
      .input("uid", sql.Int, u.id)
      .query(`UPDATE dbo.Student SET UserId = @uid WHERE StudentId = @sid`);
    return byEmail.recordset[0].StudentId;
  }

  const created = await pool
    .request()
    .input("uid", sql.Int, u.id)
    .input("name", sql.NVarChar, u.full_name)
    .input("email", sql.NVarChar, u.email)
    .query(`
      INSERT INTO dbo.Student (UserId, FullName, Email)
      OUTPUT INSERTED.StudentId
      VALUES (@uid, @name, @email)
    `);
  return created.recordset[0].StudentId;
}

async function listTrustedContactsForUser(userId) {
  const studentId = await getStudentIdForUser(userId);
  if (!studentId) return [];
  const pool = await getPool();
  const r = await pool
    .request()
    .input("sid", sql.Int, studentId)
    .query(`
      SELECT tc.ContactId, tc.Name, tc.Phone, tc.Email, tc.Relationship, tc.AlertMethod
      FROM dbo.TrustedContact tc
      INNER JOIN dbo.StudentTrustedContact stc ON stc.ContactId = tc.ContactId
      WHERE stc.StudentId = @sid
      ORDER BY tc.Name
    `);
  return r.recordset.map(mapTrusted);
}

async function addTrustedContactForUser(userId, contact) {
  const studentId = await getStudentIdForUser(userId);
  if (!studentId) throw new Error("Student profile not found.");
  const pool = await getPool();
  const method =
    contact.preferredAlertMethod === "App push"
      ? "App"
      : contact.preferredAlertMethod || "SMS";

  const inserted = await pool
    .request()
    .input("Name", sql.NVarChar, contact.name)
    .input("Phone", sql.NVarChar, contact.phone)
    .input("Email", sql.NVarChar, contact.email || null)
    .input("Relationship", sql.NVarChar, contact.relationship || "Trusted")
    .input("AlertMethod", sql.NVarChar, method)
    .query(`
      INSERT INTO dbo.TrustedContact (Name, Phone, Email, Relationship, AlertMethod)
      OUTPUT INSERTED.ContactId
      VALUES (@Name, @Phone, @Email, @Relationship, @AlertMethod)
    `);
  const contactId = inserted.recordset[0].ContactId;
  await pool
    .request()
    .input("sid", sql.Int, studentId)
    .input("cid", sql.Int, contactId)
    .query(`
      INSERT INTO dbo.StudentTrustedContact (StudentId, ContactId)
      VALUES (@sid, @cid)
    `);
  return listTrustedContactsForUser(userId);
}

async function removeTrustedContactForUser(userId, contactId) {
  const studentId = await getStudentIdForUser(userId);
  if (!studentId) throw new Error("Student profile not found.");
  const pool = await getPool();
  await pool
    .request()
    .input("sid", sql.Int, studentId)
    .input("cid", sql.Int, Number(contactId))
    .query(`
      DELETE FROM dbo.StudentTrustedContact WHERE StudentId = @sid AND ContactId = @cid;
      DELETE FROM dbo.TrustedContact WHERE ContactId = @cid
        AND NOT EXISTS (SELECT 1 FROM dbo.StudentTrustedContact WHERE ContactId = @cid);
    `);
  return listTrustedContactsForUser(userId);
}

async function listMapMarkers() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT MarkerId, Name, MarkerType, Description, MapLat, MapLng
    FROM dbo.MapMarker WHERE IsActive = 1
  `);
  return r.recordset.map((row) => ({
    id: `m-${row.MarkerId}`,
    name: row.Name,
    type: row.MarkerType,
    description: row.Description || "",
    lat: row.MapLat,
    lng: row.MapLng,
  }));
}

async function listMapDestinations() {
  const zones = await listCampusZones();
  return zones
    .filter((z) => z.lat != null && z.lng != null)
    .map((z) => ({
      id: `zone-${z.id}`,
      name: z.name,
      lat: z.lat,
      lng: z.lng,
      type: "destination",
      description: z.description,
    }));
}

module.exports = {
  listSafetyAlerts,
  createSafetyAlert,
  listCampusZones,
  listHelpContacts,
  createHelpContact,
  listSupportServices,
  createSupportService,
  listSafetyResources,
  createSafetyResource,
  listPrivacySections,
  listReportCategories,
  setReportCategoryActive,
  listResponders,
  listEmergencyAlerts,
  updateEmergencyAlertStatus,
  createEmergencyAlert,
  addAlertLocationPing,
  listIncidentReports,
  createIncidentReport,
  listTrustedContactsForUser,
  addTrustedContactForUser,
  removeTrustedContactForUser,
  getStudentIdForUser,
  listMapMarkers,
  listMapDestinations,
  createWalkSession,
  listWalkSessions,
  pingWalkSession,
  endWalkSession,
  createSupportReferral,
  listSupportReferralsForUser,
  acknowledgeSupportReferral,
  markSafetyAlertRead,
  listRolePrivileges,
};
