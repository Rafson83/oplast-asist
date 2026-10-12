export type UserRole = 'ADMIN' | 'MAINTENANCE' | 'OPERATOR';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

export type LineStatus = 'RUNNING' | 'STOPPED' | 'MAINTENANCE' | 'WARNING';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  linesCount?: number;
}

export interface ProductionLine {
  id: string;
  departmentId: string;
  departmentName?: string;
  name: string;
  code: string;
  status: LineStatus;
  description?: string;
  manufacturer?: string;
  year?: number;
  serialNumber?: string;
  qrCode: string;
  cabinetsCount?: number;
  devicesCount?: number;
  activeEventsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ControlCabinet {
  id: string;
  lineId: string;
  lineName?: string;
  name: string;
  code: string;
  location?: string;
  voltage?: string;
  ipRating?: string;
  notes?: string;
  qrCode: string;
  devicesCount?: number;
  activeEventsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type DeviceType = 
  | 'PLC' 
  | 'HMI' 
  | 'INVERTER' 
  | 'SERVO' 
  | 'MOTOR' 
  | 'SENSOR' 
  | 'SAFETY' 
  | 'POWER_SUPPLY' 
  | 'NETWORK_SWITCH' 
  | 'PNEUMATICS' 
  | 'OTHER';

export interface Device {
  id: string;
  cabinetId: string;
  cabinetName?: string;
  lineId?: string;
  lineName?: string;
  name: string;
  code: string;
  type: DeviceType;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  ipAddress?: string;
  networkType?: string;
  specs?: string;
  status: 'OPERATIONAL' | 'WARNING' | 'FAULT' | 'DISCONNECTED';
  qrCode: string;
  documentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 
  | 'DTR' 
  | 'ELECTRICAL_SCHEMATIC' 
  | 'PNEUMATIC_SCHEMATIC' 
  | 'USER_MANUAL' 
  | 'PLC_BACKUP' 
  | 'INSPECTION_REPORT'
  | 'CERTIFICATE' 
  | 'OTHER';

export type TargetType = 'LINE' | 'CABINET' | 'DEVICE';

export interface TechnicalDocument {
  id: string;
  targetType: TargetType;
  targetId: string;
  targetName?: string;
  title: string;
  docType: DocumentType;
  version: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  createdAt: string;
}

export type EventType = 
  | 'INCIDENT' 
  | 'MODIFICATION' 
  | 'INSPECTION' 
  | 'MAINTENANCE' 
  | 'NOTE';

export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EventStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

export type PhotoType = 'BEFORE' | 'DURING' | 'AFTER' | 'SCHEMATIC' | 'GENERAL';

export interface EventPhoto {
  id: string;
  eventId: string;
  photoType: PhotoType;
  caption?: string;
  fileUrl: string;
  createdAt: string;
}

export interface EventLog {
  id: string;
  targetType: TargetType;
  targetId: string;
  targetName?: string;
  title: string;
  eventType: EventType;
  priority: EventPriority;
  status: EventStatus;
  description: string;
  actionsTaken?: string;
  reportedBy: string;
  reportedByName?: string;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  photos?: EventPhoto[];
}

export interface ChatChannel {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  departmentId?: string;
  orderIndex?: number;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  photoUrl?: string;
  relatedEventId?: string;
  relatedEventTitle?: string;
  relatedTargetId?: string;
  relatedTargetName?: string;
  createdAt: string;
}

