import { getDb } from './db';
import { 
  Department, 
  ProductionLine, 
  ControlCabinet, 
  Device, 
  TechnicalDocument, 
  EventLog, 
  EventPhoto,
  TargetType,
  User,
  ChatChannel,
  ChatMessage
} from '@/types';

export function getGlobalStats() {
  const db = getDb();
  const linesCount = (db.prepare('SELECT COUNT(*) as c FROM lines').get() as { c: number }).c;
  const cabinetsCount = (db.prepare('SELECT COUNT(*) as c FROM cabinets').get() as { c: number }).c;
  const devicesCount = (db.prepare('SELECT COUNT(*) as c FROM devices').get() as { c: number }).c;
  const docsCount = (db.prepare('SELECT COUNT(*) as c FROM documents').get() as { c: number }).c;
  const openEventsCount = (db.prepare("SELECT COUNT(*) as c FROM events WHERE status IN ('OPEN', 'IN_PROGRESS')").get() as { c: number }).c;
  const criticalEventsCount = (db.prepare("SELECT COUNT(*) as c FROM events WHERE priority = 'CRITICAL' AND status != 'RESOLVED'").get() as { c: number }).c;

  return {
    linesCount,
    cabinetsCount,
    devicesCount,
    docsCount,
    openEventsCount,
    criticalEventsCount,
  };
}

export function getDepartments(): Department[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT d.id, d.name, d.code, d.description, d.order_index,
           COUNT(l.id) as linesCount
    FROM departments d
    LEFT JOIN lines l ON l.department_id = d.id
    GROUP BY d.id
    ORDER BY d.order_index ASC
  `).all() as (Department & { linesCount: number })[];

  return rows;
}

export function getLines(departmentId?: string): ProductionLine[] {
  const db = getDb();
  let query = `
    SELECT l.*, d.name as departmentName,
           (SELECT COUNT(*) FROM cabinets c WHERE c.line_id = l.id) as cabinetsCount,
           (SELECT COUNT(*) FROM devices dev JOIN cabinets c ON dev.cabinet_id = c.id WHERE c.line_id = l.id) as devicesCount,
           (SELECT COUNT(*) FROM events e WHERE e.target_type = 'LINE' AND e.target_id = l.id AND e.status IN ('OPEN', 'IN_PROGRESS')) as activeEventsCount
    FROM lines l
    LEFT JOIN departments d ON l.department_id = d.id
  `;
  const params: unknown[] = [];
  if (departmentId) {
    query += ` WHERE l.department_id = ?`;
    params.push(departmentId);
  }
  query += ` ORDER BY l.name ASC`;

  const rows = db.prepare(query).all(...params) as Array<{
    id: string;
    department_id: string;
    departmentName?: string;
    name: string;
    code: string;
    status: ProductionLine['status'];
    description?: string;
    manufacturer?: string;
    year?: number;
    serial_number?: string;
    qr_code: string;
    cabinetsCount: number;
    devicesCount: number;
    activeEventsCount: number;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map(r => ({
    id: r.id,
    departmentId: r.department_id,
    departmentName: r.departmentName,
    name: r.name,
    code: r.code,
    status: r.status,
    description: r.description,
    manufacturer: r.manufacturer,
    year: r.year,
    serialNumber: r.serial_number,
    qrCode: r.qr_code,
    cabinetsCount: r.cabinetsCount,
    devicesCount: r.devicesCount,
    activeEventsCount: r.activeEventsCount,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getLineById(id: string): (ProductionLine & { cabinets: ControlCabinet[]; documents: TechnicalDocument[]; events: EventLog[] }) | null {
  const db = getDb();
  const r = db.prepare(`
    SELECT l.*, d.name as departmentName
    FROM lines l
    LEFT JOIN departments d ON l.department_id = d.id
    WHERE l.id = ?
  `).get(id) as {
    id: string;
    department_id: string;
    departmentName?: string;
    name: string;
    code: string;
    status: ProductionLine['status'];
    description?: string;
    manufacturer?: string;
    year?: number;
    serial_number?: string;
    qr_code: string;
    created_at: string;
    updated_at: string;
  } | undefined;

  if (!r) return null;

  const cabinets = getCabinetsByLine(r.id);
  const documents = getDocuments('LINE', r.id);
  const events = getEvents({ targetType: 'LINE', targetId: r.id });

  return {
    id: r.id,
    departmentId: r.department_id,
    departmentName: r.departmentName,
    name: r.name,
    code: r.code,
    status: r.status,
    description: r.description,
    manufacturer: r.manufacturer,
    year: r.year,
    serialNumber: r.serial_number,
    qrCode: r.qr_code,
    cabinetsCount: cabinets.length,
    devicesCount: cabinets.reduce((acc, c) => acc + (c.devicesCount || 0), 0),
    activeEventsCount: events.filter(e => e.status !== 'RESOLVED').length,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    cabinets,
    documents,
    events,
  };
}

export function getCabinetsByLine(lineId: string): ControlCabinet[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.*, l.name as lineName,
           (SELECT COUNT(*) FROM devices d WHERE d.cabinet_id = c.id) as devicesCount,
           (SELECT COUNT(*) FROM events e WHERE e.target_type = 'CABINET' AND e.target_id = c.id AND e.status IN ('OPEN', 'IN_PROGRESS')) as activeEventsCount
    FROM cabinets c
    LEFT JOIN lines l ON c.line_id = l.id
    WHERE c.line_id = ?
    ORDER BY c.name ASC
  `).all(lineId) as Array<{
    id: string;
    line_id: string;
    lineName?: string;
    name: string;
    code: string;
    location?: string;
    voltage?: string;
    ip_rating?: string;
    notes?: string;
    qr_code: string;
    devicesCount: number;
    activeEventsCount: number;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map(r => ({
    id: r.id,
    lineId: r.line_id,
    lineName: r.lineName,
    name: r.name,
    code: r.code,
    location: r.location,
    voltage: r.voltage,
    ipRating: r.ip_rating,
    notes: r.notes,
    qrCode: r.qr_code,
    devicesCount: r.devicesCount,
    activeEventsCount: r.activeEventsCount,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getCabinetById(id: string): (ControlCabinet & { devices: Device[]; documents: TechnicalDocument[]; events: EventLog[] }) | null {
  const db = getDb();
  const r = db.prepare(`
    SELECT c.*, l.name as lineName
    FROM cabinets c
    LEFT JOIN lines l ON c.line_id = l.id
    WHERE c.id = ?
  `).get(id) as {
    id: string;
    line_id: string;
    lineName?: string;
    name: string;
    code: string;
    location?: string;
    voltage?: string;
    ip_rating?: string;
    notes?: string;
    qr_code: string;
    created_at: string;
    updated_at: string;
  } | undefined;

  if (!r) return null;

  const devices = getDevicesByCabinet(r.id);
  const documents = getDocuments('CABINET', r.id);
  const events = getEvents({ targetType: 'CABINET', targetId: r.id });

  return {
    id: r.id,
    lineId: r.line_id,
    lineName: r.lineName,
    name: r.name,
    code: r.code,
    location: r.location,
    voltage: r.voltage,
    ipRating: r.ip_rating,
    notes: r.notes,
    qrCode: r.qr_code,
    devicesCount: devices.length,
    activeEventsCount: events.filter(e => e.status !== 'RESOLVED').length,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    devices,
    documents,
    events,
  };
}

export function getDevicesByCabinet(cabinetId: string): Device[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT d.*, c.name as cabinetName, c.line_id as lineId, l.name as lineName,
           (SELECT COUNT(*) FROM documents doc WHERE doc.target_type = 'DEVICE' AND doc.target_id = d.id) as documentsCount
    FROM devices d
    LEFT JOIN cabinets c ON d.cabinet_id = c.id
    LEFT JOIN lines l ON c.line_id = l.id
    WHERE d.cabinet_id = ?
    ORDER BY d.code ASC
  `).all(cabinetId) as Array<{
    id: string;
    cabinet_id: string;
    cabinetName?: string;
    lineId?: string;
    lineName?: string;
    name: string;
    code: string;
    type: Device['type'];
    model?: string;
    manufacturer?: string;
    serial_number?: string;
    ip_address?: string;
    network_type?: string;
    specs?: string;
    status: Device['status'];
    qr_code: string;
    documentsCount: number;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map(r => ({
    id: r.id,
    cabinetId: r.cabinet_id,
    cabinetName: r.cabinetName,
    lineId: r.lineId,
    lineName: r.lineName,
    name: r.name,
    code: r.code,
    type: r.type,
    model: r.model,
    manufacturer: r.manufacturer,
    serialNumber: r.serial_number,
    ipAddress: r.ip_address,
    networkType: r.network_type,
    specs: r.specs,
    status: r.status,
    qrCode: r.qr_code,
    documentsCount: r.documentsCount,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getDeviceById(id: string): (Device & { documents: TechnicalDocument[]; events: EventLog[] }) | null {
  const db = getDb();
  const r = db.prepare(`
    SELECT d.*, c.name as cabinetName, c.line_id as lineId, l.name as lineName
    FROM devices d
    LEFT JOIN cabinets c ON d.cabinet_id = c.id
    LEFT JOIN lines l ON c.line_id = l.id
    WHERE d.id = ?
  `).get(id) as {
    id: string;
    cabinet_id: string;
    cabinetName?: string;
    lineId?: string;
    lineName?: string;
    name: string;
    code: string;
    type: Device['type'];
    model?: string;
    manufacturer?: string;
    serial_number?: string;
    ip_address?: string;
    network_type?: string;
    specs?: string;
    status: Device['status'];
    qr_code: string;
    created_at: string;
    updated_at: string;
  } | undefined;

  if (!r) return null;

  const documents = getDocuments('DEVICE', r.id);
  const events = getEvents({ targetType: 'DEVICE', targetId: r.id });

  return {
    id: r.id,
    cabinetId: r.cabinet_id,
    cabinetName: r.cabinetName,
    lineId: r.lineId,
    lineName: r.lineName,
    name: r.name,
    code: r.code,
    type: r.type,
    model: r.model,
    manufacturer: r.manufacturer,
    serialNumber: r.serial_number,
    ipAddress: r.ip_address,
    networkType: r.network_type,
    specs: r.specs,
    status: r.status,
    qrCode: r.qr_code,
    documentsCount: documents.length,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    documents,
    events,
  };
}

export function getDocuments(targetType?: string, targetId?: string, search?: string): TechnicalDocument[] {
  const db = getDb();
  let query = `SELECT doc.* FROM documents doc WHERE 1=1`;
  const params: unknown[] = [];

  if (targetType) {
    query += ` AND doc.target_type = ?`;
    params.push(targetType);
  }
  if (targetId) {
    query += ` AND doc.target_id = ?`;
    params.push(targetId);
  }
  if (search) {
    query += ` AND (doc.title LIKE ? OR doc.file_name LIKE ? OR doc.description LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  query += ` ORDER BY doc.created_at DESC`;

  const rows = db.prepare(query).all(...params) as Array<{
    id: string;
    target_type: TargetType;
    target_id: string;
    title: string;
    doc_type: TechnicalDocument['docType'];
    version: string;
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type?: string;
    description?: string;
    uploaded_by?: string;
    uploaded_by_name?: string;
    created_at: string;
  }>;

  return rows.map(r => ({
    id: r.id,
    targetType: r.target_type,
    targetId: r.target_id,
    title: r.title,
    docType: r.doc_type,
    version: r.version,
    fileUrl: r.file_url,
    fileName: r.file_name,
    fileSize: r.file_size,
    mimeType: r.mime_type,
    description: r.description,
    uploadedBy: r.uploaded_by,
    uploadedByName: r.uploaded_by_name,
    createdAt: r.created_at,
  }));
}

export function getEvents(filters?: {
  targetType?: string;
  targetId?: string;
  status?: string;
  type?: string;
  search?: string;
}): EventLog[] {
  const db = getDb();
  let query = `
    SELECT e.*
    FROM events e
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (filters?.targetType) {
    query += ` AND e.target_type = ?`;
    params.push(filters.targetType);
  }
  if (filters?.targetId) {
    query += ` AND e.target_id = ?`;
    params.push(filters.targetId);
  }
  if (filters?.status) {
    query += ` AND e.status = ?`;
    params.push(filters.status);
  }
  if (filters?.type) {
    query += ` AND e.event_type = ?`;
    params.push(filters.type);
  }
  if (filters?.search) {
    query += ` AND (e.title LIKE ? OR e.description LIKE ? OR e.actions_taken LIKE ?)`;
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }

  query += ` ORDER BY e.created_at DESC`;

  const rows = db.prepare(query).all(...params) as Array<{
    id: string;
    target_type: TargetType;
    target_id: string;
    title: string;
    event_type: EventLog['eventType'];
    priority: EventLog['priority'];
    status: EventLog['status'];
    description: string;
    actions_taken?: string;
    reported_by: string;
    reported_by_name?: string;
    assigned_to?: string;
    resolved_at?: string;
    created_at: string;
    updated_at: string;
  }>;

  const photoStmt = db.prepare(`SELECT * FROM event_photos WHERE event_id = ? ORDER BY created_at ASC`);

  return rows.map(r => {
    const rawPhotos = photoStmt.all(r.id) as Array<{
      id: string;
      event_id: string;
      photo_type: EventPhoto['photoType'];
      caption?: string;
      file_url: string;
      created_at: string;
    }>;

    const photos: EventPhoto[] = rawPhotos.map(p => ({
      id: p.id,
      eventId: p.event_id,
      photoType: p.photo_type,
      caption: p.caption,
      fileUrl: p.file_url,
      createdAt: p.created_at,
    }));

    // Find readable target name
    let targetName = '';
    if (r.target_type === 'LINE') {
      const line = db.prepare('SELECT name, code FROM lines WHERE id = ?').get(r.target_id) as { name: string; code: string } | undefined;
      targetName = line ? `${line.name} (${line.code})` : r.target_id;
    } else if (r.target_type === 'CABINET') {
      const cab = db.prepare('SELECT name, code FROM cabinets WHERE id = ?').get(r.target_id) as { name: string; code: string } | undefined;
      targetName = cab ? `${cab.name} (${cab.code})` : r.target_id;
    } else if (r.target_type === 'DEVICE') {
      const dev = db.prepare('SELECT name, code FROM devices WHERE id = ?').get(r.target_id) as { name: string; code: string } | undefined;
      targetName = dev ? `${dev.name} (${dev.code})` : r.target_id;
    }

    return {
      id: r.id,
      targetType: r.target_type,
      targetId: r.target_id,
      targetName,
      title: r.title,
      eventType: r.event_type,
      priority: r.priority,
      status: r.status,
      description: r.description,
      actionsTaken: r.actions_taken,
      reportedBy: r.reported_by,
      reportedByName: r.reported_by_name,
      assignedTo: r.assigned_to,
      resolvedAt: r.resolved_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      photos,
    };
  });
}

export function findTargetByQr(codeOrQr: string): { type: TargetType; id: string; name: string; url: string } | null {
  const db = getDb();
  const cleanCode = codeOrQr.trim();

  // 1. Check lines
  const line = db.prepare('SELECT id, name, code, qr_code FROM lines WHERE qr_code = ? OR code = ? OR id = ?').get(cleanCode, cleanCode, cleanCode) as { id: string; name: string } | undefined;
  if (line) return { type: 'LINE', id: line.id, name: line.name, url: `/lines/${line.id}` };

  // 2. Check cabinets
  const cab = db.prepare('SELECT id, name, code, qr_code FROM cabinets WHERE qr_code = ? OR code = ? OR id = ?').get(cleanCode, cleanCode, cleanCode) as { id: string; name: string } | undefined;
  if (cab) return { type: 'CABINET', id: cab.id, name: cab.name, url: `/cabinets/${cab.id}` };

  // 3. Check devices
  const dev = db.prepare('SELECT id, name, code, qr_code FROM devices WHERE qr_code = ? OR code = ? OR id = ?').get(cleanCode, cleanCode, cleanCode) as { id: string; name: string } | undefined;
  if (dev) return { type: 'DEVICE', id: dev.id, name: dev.name, url: `/devices/${dev.id}` };

  return null;
}

export function getAllPrintableQrs(): Array<{
  type: TargetType;
  id: string;
  name: string;
  code: string;
  qrCode: string;
  locationDetails?: string;
}> {
  const db = getDb();
  const list: Array<{
    type: TargetType;
    id: string;
    name: string;
    code: string;
    qrCode: string;
    locationDetails?: string;
  }> = [];

  const lines = db.prepare('SELECT id, name, code, qr_code FROM lines ORDER BY name').all() as Array<{ id: string; name: string; code: string; qr_code: string }>;
  for (const l of lines) {
    list.push({ type: 'LINE', id: l.id, name: l.name, code: l.code, qrCode: l.qr_code, locationDetails: 'Linia Produkcyjna' });
  }

  const cabinets = db.prepare('SELECT c.id, c.name, c.code, c.qr_code, l.name as line_name FROM cabinets c JOIN lines l ON c.line_id = l.id ORDER BY c.name').all() as Array<{ id: string; name: string; code: string; qr_code: string; line_name: string }>;
  for (const c of cabinets) {
    list.push({ type: 'CABINET', id: c.id, name: c.name, code: c.code, qrCode: c.qr_code, locationDetails: `Szafa w linii: ${c.line_name}` });
  }

  const devices = db.prepare('SELECT d.id, d.name, d.code, d.qr_code, c.name as cab_name, l.name as line_name FROM devices d JOIN cabinets c ON d.cabinet_id = c.id JOIN lines l ON c.line_id = l.id ORDER BY d.code').all() as Array<{ id: string; name: string; code: string; qr_code: string; cab_name: string; line_name: string }>;
  for (const d of devices) {
    list.push({ type: 'DEVICE', id: d.id, name: d.name, code: d.code, qrCode: d.qr_code, locationDetails: `${d.cab_name} (${d.line_name})` });
  }

  return list;
}

export function getUsers(): User[] {
  const db = getDb();
  const rows = db.prepare('SELECT id, username, name, email, role, department, created_at FROM users ORDER BY name ASC').all() as Array<{
    id: string;
    username: string;
    name: string;
    email: string;
    role: User['role'];
    department?: string;
    created_at: string;
  }>;

  return rows.map(r => ({
    id: r.id,
    username: r.username,
    name: r.name,
    email: r.email,
    role: r.role,
    department: r.department,
    createdAt: r.created_at,
  }));
}

export function getChatChannels(): ChatChannel[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.*,
           (SELECT content FROM chat_messages m WHERE m.channel_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
           (SELECT created_at FROM chat_messages m WHERE m.channel_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_time,
           (SELECT COUNT(*) FROM chat_messages m WHERE m.channel_id = c.id) as messages_count
    FROM chat_channels c
    ORDER BY c.order_index ASC
  `).all() as Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    department_id?: string;
    order_index: number;
    last_message?: string;
    last_message_time?: string;
    messages_count: number;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    icon: r.icon,
    departmentId: r.department_id,
    orderIndex: r.order_index,
    lastMessage: r.last_message,
    lastMessageTime: r.last_message_time,
  }));
}

export function getChatMessages(channelId?: string, limit: number = 50): ChatMessage[] {
  const db = getDb();
  let query = `
    SELECT m.*
    FROM chat_messages m
  `;
  const params: unknown[] = [];

  if (channelId) {
    query += ` WHERE m.channel_id = ?`;
    params.push(channelId);
  }

  query += ` ORDER BY m.created_at ASC LIMIT ?`;
  params.push(limit);

  const rows = db.prepare(query).all(...params) as Array<{
    id: string;
    channel_id: string;
    user_id: string;
    user_name: string;
    user_role: ChatMessage['userRole'];
    content: string;
    photo_url?: string;
    related_event_id?: string;
    related_event_title?: string;
    related_target_id?: string;
    related_target_name?: string;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    channelId: r.channel_id,
    userId: r.user_id,
    userName: r.user_name,
    userRole: r.user_role,
    content: r.content,
    photoUrl: r.photo_url,
    relatedEventId: r.related_event_id,
    relatedEventTitle: r.related_event_title,
    relatedTargetId: r.related_target_id,
    relatedTargetName: r.related_target_name,
    createdAt: r.created_at,
  }));
}

export function createChatMessage(data: {
  channelId: string;
  userId: string;
  userName: string;
  userRole: ChatMessage['userRole'];
  content: string;
  photoUrl?: string;
  relatedEventId?: string;
  relatedEventTitle?: string;
  relatedTargetId?: string;
  relatedTargetName?: string;
}): ChatMessage {
  const db = getDb();
  const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  db.prepare(`
    INSERT INTO chat_messages (id, channel_id, user_id, user_name, user_role, content, photo_url, related_event_id, related_event_title, related_target_id, related_target_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.channelId,
    data.userId,
    data.userName,
    data.userRole,
    data.content,
    data.photoUrl || null,
    data.relatedEventId || null,
    data.relatedEventTitle || null,
    data.relatedTargetId || null,
    data.relatedTargetName || null,
    now
  );

  return {
    id,
    channelId: data.channelId,
    userId: data.userId,
    userName: data.userName,
    userRole: data.userRole,
    content: data.content,
    photoUrl: data.photoUrl,
    relatedEventId: data.relatedEventId,
    relatedEventTitle: data.relatedEventTitle,
    relatedTargetId: data.relatedTargetId,
    relatedTargetName: data.relatedTargetName,
    createdAt: now,
  };
}

