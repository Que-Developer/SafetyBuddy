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
    alertType: row.AlertType,
    location: row.LocationLabel,
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

async function listEmergencyAlerts() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT ea.EmergencyAlertId, ea.AlertType, ea.LocationLabel, ea.TimeTriggered,
           ea.Status, ea.Notes, ea.IsAnonymous,
           s.FullName AS StudentName,
           r.FullName AS ResponderName
    FROM dbo.EmergencyAlert ea
    INNER JOIN dbo.Student s ON s.StudentId = ea.StudentId
    LEFT JOIN dbo.Responder r ON r.ResponderId = ea.AssignedResponderId
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

async function createEmergencyAlert({ studentId, zoneId, alertType, locationLabel, isAnonymous }) {
  const pool = await getPool();
  let sid = studentId;
  if (!sid) {
    const s = await pool.request().query(`SELECT TOP 1 StudentId FROM dbo.Student ORDER BY StudentId`);
    sid = s.recordset[0]?.StudentId;
  }
  if (!sid) throw new Error("No student records in database.");

  const r = await pool
    .request()
    .input("StudentId", sql.Int, sid)
    .input("ZoneId", sql.Int, zoneId || null)
    .input("AlertType", sql.NVarChar, alertType || "Panic / HELP")
    .input("LocationLabel", sql.NVarChar, locationLabel || "Campus")
    .input("IsAnonymous", sql.Bit, isAnonymous ? 1 : 0)
    .query(`
      INSERT INTO dbo.EmergencyAlert (StudentId, ZoneId, AlertType, LocationLabel, Status, IsAnonymous)
      OUTPUT INSERTED.EmergencyAlertId
      VALUES (@StudentId, @ZoneId, @AlertType, @LocationLabel, N'New', @IsAnonymous)
    `);
  return { emergencyAlertId: r.recordset[0].EmergencyAlertId };
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
  listSafetyResources,
  listPrivacySections,
  listReportCategories,
  setReportCategoryActive,
  listResponders,
  listEmergencyAlerts,
  updateEmergencyAlertStatus,
  createEmergencyAlert,
  listIncidentReports,
  createIncidentReport,
  listTrustedContactsForUser,
  addTrustedContactForUser,
  removeTrustedContactForUser,
  getStudentIdForUser,
  listMapMarkers,
  listMapDestinations,
};
