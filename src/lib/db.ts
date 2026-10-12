import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'oplast_asist.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initTables(dbInstance);
    seedInitialData(dbInstance);
    seedChatIfEmpty(dbInstance);
  }
  return dbInstance;
}

export function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'MAINTENANCE', 'OPERATOR')),
      department TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lines (
      id TEXT PRIMARY KEY,
      department_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'RUNNING' CHECK(status IN ('RUNNING', 'STOPPED', 'MAINTENANCE', 'WARNING')),
      description TEXT,
      manufacturer TEXT,
      year INTEGER,
      serial_number TEXT,
      qr_code TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cabinets (
      id TEXT PRIMARY KEY,
      line_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      location TEXT,
      voltage TEXT,
      ip_rating TEXT,
      notes TEXT,
      qr_code TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      cabinet_id TEXT NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      type TEXT NOT NULL,
      model TEXT,
      manufacturer TEXT,
      serial_number TEXT,
      ip_address TEXT,
      network_type TEXT,
      specs TEXT,
      status TEXT NOT NULL DEFAULT 'OPERATIONAL' CHECK(status IN ('OPERATIONAL', 'WARNING', 'FAULT', 'DISCONNECTED')),
      qr_code TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (cabinet_id) REFERENCES cabinets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL CHECK(target_type IN ('LINE', 'CABINET', 'DEVICE')),
      target_id TEXT NOT NULL,
      title TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT '1.0',
      file_url TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      mime_type TEXT,
      description TEXT,
      uploaded_by TEXT,
      uploaded_by_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL CHECK(target_type IN ('LINE', 'CABINET', 'DEVICE')),
      target_id TEXT NOT NULL,
      title TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK(event_type IN ('INCIDENT', 'MODIFICATION', 'INSPECTION', 'MAINTENANCE', 'NOTE')),
      priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED')),
      description TEXT NOT NULL,
      actions_taken TEXT,
      reported_by TEXT NOT NULL,
      reported_by_name TEXT,
      assigned_to TEXT,
      resolved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event_photos (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      photo_type TEXT NOT NULL DEFAULT 'GENERAL' CHECK(photo_type IN ('BEFORE', 'DURING', 'AFTER', 'SCHEMATIC', 'GENERAL')),
      caption TEXT,
      file_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_channels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'Hash',
      department_id TEXT,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      content TEXT NOT NULL,
      photo_url TEXT,
      related_event_id TEXT,
      related_event_title TEXT,
      related_target_id TEXT,
      related_target_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE
    );
  `);
}

export function seedInitialData(db: Database.Database, force: boolean = false) {
  const lineCount = db.prepare('SELECT COUNT(*) as count FROM lines').get() as { count: number };
  if (lineCount.count > 0 && !force) return;

  if (force) {
    db.exec(`
      DELETE FROM event_photos;
      DELETE FROM events;
      DELETE FROM documents;
      DELETE FROM devices;
      DELETE FROM cabinets;
      DELETE FROM lines;
      DELETE FROM departments;
      DELETE FROM users;
    `);
  }

  const adminPass = bcrypt.hashSync('admin123', 10);
  const maintPass = bcrypt.hashSync('auto123', 10);
  const operPass = bcrypt.hashSync('oper123', 10);

  // 1. Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, name, email, role, department)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('usr-admin', 'admin', adminPass, 'Jan Kowalski (Kierownik UR)', 'kierownik.ur@oplast.pl', 'ADMIN', 'Utrzymanie Ruchu');
  insertUser.run('usr-maint', 'automatyk', maintPass, 'Marek Nowak (Główny Automatyk)', 'automatyk@oplast.pl', 'MAINTENANCE', 'Automatyka i Robotyka');
  insertUser.run('usr-oper', 'operator', operPass, 'Tomasz Wiśniewski (Operator Produkcji)', 'operator@oplast.pl', 'OPERATOR', 'Wydział Produkcji');

  // 2. Departments (Hala 1 Mała, Hala Duża, Hala Wtryskarek, Infrastruktura)
  const insertDept = db.prepare(`
    INSERT INTO departments (id, name, code, description, order_index)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertDept.run('dep-h1', 'Hala 1 ("Mała")', 'HALA-1', 'Linia myjąca 3 oraz dwie linie granulacji (średnia i mała)', 1);
  insertDept.run('dep-h2', 'Hala Duża', 'HALA-DUZA', 'Dwie linie myjące (Linia 1, Linia 2) oraz linia dużej granulacji', 2);
  insertDept.run('dep-h3', 'Hala Wtryskarek', 'WTRYSKARKI', 'Park maszynowy wtryskarek (6 maszyn produkcyjnych)', 3);
  insertDept.run('dep-infra', 'Infrastruktura & Zasilanie', 'INFRA', 'Oczyszczalnia ścieków, Rozdzielnia Trafo (3 transformatory) i Fotowoltaika (PV)', 4);

  // 3. Lines
  const insertLine = db.prepare(`
    INSERT INTO lines (id, department_id, name, code, status, description, manufacturer, year, serial_number, qr_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // --- HALA 1 ("MAŁA") ---
  insertLine.run(
    'lin-h1-myj3',
    'dep-h1',
    'Linia Myjąca 3',
    'LIN-MYJ-03',
    'RUNNING',
    'Linia mycia i separacji tworzyw w Hali 1 (Małej) z wanną flotacyjną i suszarnią dynamiczną',
    'Sorema / HydroDyn',
    2021,
    'MYJ-03-2021-441',
    'OPL-LIN-MYJ-03'
  );

  insertLine.run(
    'lin-h1-gran-sred',
    'dep-h1',
    'Linia Granulacji "Średnia"',
    'LIN-GRAN-SRED',
    'RUNNING',
    'Średnia linia regranulacji z odgazowaniem dwustopniowym i głowicą tnącą w pierścieniu wodnym',
    'EREMA Technologies',
    2022,
    'EREMA-SR-2022-77',
    'OPL-LIN-GRAN-SRED'
  );

  insertLine.run(
    'lin-h1-gran-mala',
    'dep-h1',
    'Linia Granulacji "Mała"',
    'LIN-GRAN-MALA',
    'MAINTENANCE',
    'Kompaktowa linia granulacyjna do partii specjalnych i przemiałów technicznych',
    'NGR Recycling',
    2018,
    'NGR-S70-2018-12',
    'OPL-LIN-GRAN-MALA'
  );

  // --- HALA DUŻA ---
  insertLine.run(
    'lin-h2-myj1',
    'dep-h2',
    'Linia Myjąca 1',
    'LIN-MYJ-01',
    'RUNNING',
    'Główna wielkotonażowa linia mycia wstępnego i separacji gęstościowej w Hali Dużej',
    'Lindner Washtech',
    2023,
    'LW-MYJ1-2023-109',
    'OPL-LIN-MYJ-01'
  );

  insertLine.run(
    'lin-h2-myj2',
    'dep-h2',
    'Linia Myjąca 2',
    'LIN-MYJ-02',
    'RUNNING',
    'Druga linia myjąca w Hali Dużej: mycie gorące, flotacja i odwadnianie wirówkowe',
    'Lindner Washtech',
    2023,
    'LW-MYJ2-2023-110',
    'OPL-LIN-MYJ-02'
  );

  insertLine.run(
    'lin-h2-gran-duza',
    'dep-h2',
    'Linia Granulacji "Duża"',
    'LIN-GRAN-DUZA',
    'RUNNING',
    'Wysokowydajna duża linia granulacji tworzyw z filtrem laserowym i automatycznym pakowaniem',
    'EREMA INTAREMA 1714',
    2024,
    'EREMA-1714-TVE-901',
    'OPL-LIN-GRAN-DUZA'
  );

  // --- HALA WTRYSKAREK (6 maszyn) ---
  for (let i = 1; i <= 6; i++) {
    const code = `WTR-0${i}`;
    const id = `lin-wtr-0${i}`;
    const tonnages = [150, 250, 350, 450, 650, 800];
    const brands = ['KraussMaffei', 'Engel', 'Battenfeld', 'KraussMaffei', 'Engel Victory', 'KraussMaffei GX'];
    const ton = tonnages[i - 1];
    const brand = brands[i - 1];
    const status = i === 4 ? 'WARNING' : 'RUNNING';

    insertLine.run(
      id,
      'dep-h3',
      `Wtryskarka ${i} (${brand} ${ton}T)`,
      code,
      status,
      `Wtryskarka hydrauliczno-elektryczna o sile zwarcia ${ton} ton z robotem 3-osiowym`,
      brand,
      2020 + (i % 4),
      `${code}-SN-202${i}`,
      `OPL-${code}`
    );
  }

  // --- INFRASTRUKTURA & ZASILANIE ---
  insertLine.run(
    'lin-infra-ocz',
    'dep-infra',
    'Oczyszczalnia Ścieków & Wód Technologicznych',
    'INFRA-OCZYSZCZALNIA',
    'RUNNING',
    'Zakładowy układ oczyszczania wód popłucznych z flotacją ciśnieniową DAF i odwadnianiem osadu',
    'Krevox / Huber',
    2022,
    'OCZ-OPLAST-2022',
    'OPL-INFRA-OCZ'
  );

  insertLine.run(
    'lin-infra-trafo',
    'dep-infra',
    'Rozdzielnia Główna & Stacja Trafo (3 Transformatory)',
    'INFRA-TRAFO',
    'RUNNING',
    'Główny punkt zasilania zakładu SN/nN: Transformatory T1, T2, T3 oraz rozdzielnica główna 0.4 kV',
    'Schneider Electric / ZPUE',
    2021,
    'TRAFO-15kV-04kV-3T',
    'OPL-INFRA-TRAFO'
  );

  insertLine.run(
    'lin-infra-pv',
    'dep-infra',
    'Układ Fotowoltaiczny (PV)',
    'INFRA-PV',
    'RUNNING',
    'Dachowa instalacja fotowoltaiczna zakładu z inwerterami przemysłowymi i układem telemetrii',
    'Huawei Solar / SolarEdge',
    2023,
    'PV-OPLAST-500kWp',
    'OPL-INFRA-PV'
  );

  // 4. Cabinets
  const insertCabinet = db.prepare(`
    INSERT INTO cabinets (id, line_id, name, code, location, voltage, ip_rating, notes, qr_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Hala 1 Szafy
  insertCabinet.run('cab-h1-myj3-s1', 'lin-h1-myj3', 'Szafa Główna Pomp & Flotacji', '=H1+MYJ3-S01', 'Hala 1, przy wannie myjącej', '3x400V AC / 24V DC', 'IP54', 'Główne zasilanie linii myjącej 3, sterownik PLC, falowniki pomp', 'OPL-CAB-H1-MYJ3-S1');
  insertCabinet.run('cab-h1-myj3-op', 'lin-h1-myj3', 'Pulpit Operatorski HMI', '=H1+MYJ3-OP1', 'Pomost roboczy linii myjącej 3', '24V DC', 'IP65', 'Panel operatorski, przyciski start/stop, grzybek awaryjny', 'OPL-CAB-H1-MYJ3-OP');
  insertCabinet.run('cab-h1-grs-s1', 'lin-h1-gran-sred', 'Szafa Główna Wytłaczarki Średniej', '=H1+GRS-S01', 'Hala 1, obok leja zasypowego', '3x400V AC / 24V DC', 'IP54', 'Główny sterownik B&R, zasilanie stref grzejnych', 'OPL-CAB-H1-GRS-S1');
  insertCabinet.run('cab-h1-grs-s2', 'lin-h1-gran-sred', 'Szafa Napędu Głównego 55kW', '=H1+GRS-S02', 'Hala 1, podest za ekstruderem', '3x400V AC', 'IP54', 'Falownik napędu ślimaka Danfoss VLT 55kW z dławikiem sieciowym', 'OPL-CAB-H1-GRS-S2');
  insertCabinet.run('cab-h1-grm-s1', 'lin-h1-gran-mala', 'Szafa Sterownicza Granulacji Małej', '=H1+GRM-S01', 'Hala 1, sekcja małej granulacji', '3x400V AC / 24V DC', 'IP54', 'Kompaktowa szafa zasilająco-sterownicza NGR', 'OPL-CAB-H1-GRM-S1');

  // Hala Duża Szafy
  insertCabinet.run('cab-h2-myj1-s1', 'lin-h2-myj1', 'Szafa Zasilająco-Sterownicza Linii Myjącej 1', '=H2+MYJ1-S01', 'Hala Duża, filar B3', '3x400V AC / 24V DC', 'IP54', 'Szafa wielopolowa Lindner, sterowanie wirówkami', 'OPL-CAB-H2-MYJ1-S1');
  insertCabinet.run('cab-h2-myj2-s1', 'lin-h2-myj2', 'Szafa Zasilająco-Sterownicza Linii Myjącej 2', '=H2+MYJ2-S01', 'Hala Duża, filar C4', '3x400V AC / 24V DC', 'IP54', 'Automatyka mycia gorącego i dozowania chemii', 'OPL-CAB-H2-MYJ2-S1');
  insertCabinet.run('cab-h2-grd-s1', 'lin-h2-gran-duza', 'Szafa Główna Dużej Granulacji +PLC', '=H2+GRD-S01', 'Hala Duża, centralny podest', '3x400V AC / 24V DC', 'IP54', 'Główny sterownik Siemens S7-1500, moduły we/wy ET200SP', 'OPL-CAB-H2-GRD-S1');
  insertCabinet.run('cab-h2-grd-s2', 'lin-h2-gran-duza', 'Szafa Napędu Wytłaczarki 160kW', '=H2+GRD-S02', 'Hala Duża, sekcja napędowa', '3x400V AC', 'IP54', 'Przemiennik częstotliwości 160kW ABB ACS880 chłodzony wymuszenie', 'OPL-CAB-H2-GRD-S2');
  insertCabinet.run('cab-h2-grd-op', 'lin-h2-gran-duza', 'Pulpit Sterowniczy Dotykowy HMI 15"', '=H2+GRD-OP1', 'Strona operatora przy głowicy', '24V DC', 'IP65', 'Panel Siemens Comfort TP1500, diagnostyka linii', 'OPL-CAB-H2-GRD-OP');

  // Hala Wtryskarek Szafy (dla każdej z 6 wtryskarek)
  for (let i = 1; i <= 6; i++) {
    insertCabinet.run(
      `cab-wtr0${i}-s1`,
      `lin-wtr-0${i}`,
      `Szafa Główna Wtryskarki WTR-0${i}`,
      `=WTR+0${i}-S01`,
      `Hala Wtryskarek, stanowisko ${i}`,
      '3x400V AC / 24V DC',
      'IP54',
      `Sterownik hydrauliki/serwa, grzanie stref cylindra, moduł Safety wtryskarki WTR-0${i}`,
      `OPL-CAB-WTR0${i}-S1`
    );
  }

  // Infrastruktura Szafy
  insertCabinet.run('cab-inf-ocz-s1', 'lin-infra-ocz', 'Szafa Sterownicza Flotacji i Pomp DAF', '=INF+OCZ-S01', 'Budynek oczyszczalni, sterownia', '3x400V AC / 24V DC', 'IP54', 'Sterowanie pompami szlamowymi, napowietrzaniem i koagulacją', 'OPL-CAB-INF-OCZ-S1');
  insertCabinet.run('cab-inf-ocz-s2', 'lin-infra-ocz', 'Szafa Odwadniania Osadu & Prasy', '=INF+OCZ-S02', 'Hala pras osadowych', '3x400V AC / 24V DC', 'IP54', 'Automatyka prasy taśmowej i stacji polielektrolitu', 'OPL-CAB-INF-OCZ-S2');

  // Trafo Szafy (3 Transformatory + Rozdzielnica Główna)
  insertCabinet.run('cab-trafo-t1', 'lin-infra-trafo', 'Pole Transformatora T1 (1000 kVA)', '=TRAFO+T1', 'Stacja Transformatorowa, Komora T1', '15kV / 0.4kV AC', 'IP31', 'Transformator żywiczny T1 1000kVA zasilający Halę 1 i część socjalną', 'OPL-CAB-TRAFO-T1');
  insertCabinet.run('cab-trafo-t2', 'lin-infra-trafo', 'Pole Transformatora T2 (1250 kVA)', '=TRAFO+T2', 'Stacja Transformatorowa, Komora T2', '15kV / 0.4kV AC', 'IP31', 'Transformator T2 1250kVA dedykowany do Hali Dużej (mycie i granulacja)', 'OPL-CAB-TRAFO-T2');
  insertCabinet.run('cab-trafo-t3', 'lin-infra-trafo', 'Pole Transformatora T3 (1600 kVA)', '=TRAFO+T3', 'Stacja Transformatorowa, Komora T3', '15kV / 0.4kV AC', 'IP31', 'Transformator T3 1600kVA zasilający Halę Wtryskarek (6 maszyn) i Oczyszczalnię', 'OPL-CAB-TRAFO-T3');
  insertCabinet.run('cab-trafo-rg', 'lin-infra-trafo', 'Rozdzielnica Główna nN 0.4kV + BKMB', '=RG+0.4kV', 'Rozdzielnia Główna nN', '3x400V AC', 'IP43', 'Główna rozdzielnica nN z wyłącznikami powietrznymi ACB i automatyczną kompensacją mocy biernej', 'OPL-CAB-TRAFO-RG');

  // Fotowoltaika Szafy
  insertCabinet.run('cab-pv-ac', 'lin-infra-pv', 'Rozdzielnica Główna AC Fotowoltaiki', '=PV+AC-01', 'Ściana zewnętrzna przy stacji Trafo', '3x400V AC', 'IP65', 'Punkt wpięcia inwerterów PV do sieci zakładowej z zabezpieczeniem nadprądowym i RCD', 'OPL-CAB-PV-AC');
  insertCabinet.run('cab-pv-dc', 'lin-infra-pv', 'Rozdzielnice Stringowe DC Dachowe', '=PV+DC-BOX', 'Konstrukcja dachowa Hali Dużej', '1000V DC', 'IP66', 'Skrzynki łączeniowe DC z odgromnikami SPD Typ 1+2 i rozłącznikami DC', 'OPL-CAB-PV-DC');

  // 5. Devices (Przykłady kluczowych urządzeń)
  const insertDevice = db.prepare(`
    INSERT INTO devices (id, cabinet_id, name, code, type, model, manufacturer, serial_number, ip_address, network_type, specs, status, qr_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Hala 1 Devices
  insertDevice.run('dev-h1-plc', 'cab-h1-myj3-s1', 'Sterownik PLC Linii Myjącej 3', '-1K1-PLC', 'PLC', 'SIMATIC S7-1215C DC/DC/DC', 'Siemens', '6ES7215-1AG40-0XB0', '192.168.20.10', 'PROFINET', 'CPU 1215C, 125KB robocza, 2 porty RJ45', 'OPERATIONAL', 'OPL-DEV-H1-PLC');
  insertDevice.run('dev-h1-drv55', 'cab-h1-grs-s2', 'Falownik Napędu Głównego 55kW', '-2U1-INV', 'INVERTER', 'VLT AutomationDrive FC-302 55kW', 'Danfoss', '131B0155-FC302-55K', '192.168.20.35', 'PROFINET', 'Moc 55kW, prąd 106A, wejście 3x400V', 'OPERATIONAL', 'OPL-DEV-H1-DRV55');

  // Hala Duża Devices
  insertDevice.run('dev-h2-drv160', 'cab-h2-grd-s2', 'Falownik Napędu Głównego Wytłaczarki 160kW', '-1U1-DRV160', 'INVERTER', 'ACS880-01-293A-3', 'ABB', '3AUA00000880-160K', '192.168.30.20', 'PROFINET / FENA-21', 'Moc 160 kW, prąd znamionowy 293A, chłodzenie wentylatorowe', 'OPERATIONAL', 'OPL-DEV-H2-DRV160');
  insertDevice.run('dev-h2-plc1500', 'cab-h2-grd-s1', 'Główny Sterownik Dużej Granulacji', '-1K1-PLC', 'PLC', 'SIMATIC S7-1515F-2 PN', 'Siemens', '6ES7515-2FM02-0AB0', '192.168.30.10', 'PROFINET Industrial', 'Safety Integrated SIL 3 / PL e, 3MB pamięci', 'OPERATIONAL', 'OPL-DEV-H2-PLC1500');

  // Hala Wtryskarek Devices (np. WTR-04 KraussMaffei)
  insertDevice.run('dev-wtr4-keba', 'cab-wtr04-s1', 'Komputer Sterujący Wtryskarki Keba KeStudio', '-1A1-KEBA', 'PLC', 'KeControl C5', 'KEBA', 'KC-C5-2023-88', '192.168.40.14', 'EtherCAT', 'Cykl sterowania hydrauliki 1ms, magistrala EtherCAT', 'OPERATIONAL', 'OPL-DEV-WTR4-KEBA');
  insertDevice.run('dev-wtr4-servo', 'cab-wtr04-s1', 'Serwowzmacniacz Pompy Głównej Wtrysku', '-2U1-SERVO', 'SERVO', 'KeDrive D3', 'KEBA', 'KD-D3-2023-14', '192.168.40.15', 'EtherCAT', 'Napęd serwo pompy zębatej układu zamykania formy', 'OPERATIONAL', 'OPL-DEV-WTR4-SERVO');

  // Trafo Devices
  insertDevice.run('dev-trafo-acb1', 'cab-trafo-rg', 'Wyłącznik Główny Powietrzny T1 (1600A)', '-1Q1-ACB', 'POWER_SUPPLY', 'Masterpact MTZ2 16 H1', 'Schneider Electric', 'MTZ2-16H1-2021', '192.168.1.51', 'Modbus TCP', 'Prąd znamionowy 1600A, wyzwalacz Micrologic 6.0X z pomiarem energii', 'OPERATIONAL', 'OPL-DEV-ACB1');
  insertDevice.run('dev-trafo-acb2', 'cab-trafo-rg', 'Wyłącznik Główny Powietrzny T2 (2000A)', '-1Q2-ACB', 'POWER_SUPPLY', 'Masterpact MTZ2 20 H1', 'Schneider Electric', 'MTZ2-20H1-2021', '192.168.1.52', 'Modbus TCP', 'Prąd znamionowy 2000A, wyzwalacz Micrologic 6.0X z pomiarem energii', 'OPERATIONAL', 'OPL-DEV-ACB2');
  insertDevice.run('dev-trafo-acb3', 'cab-trafo-rg', 'Wyłącznik Główny Powietrzny T3 (2500A)', '-1Q3-ACB', 'POWER_SUPPLY', 'Masterpact MTZ2 25 H1', 'Schneider Electric', 'MTZ2-25H1-2021', '192.168.1.53', 'Modbus TCP', 'Prąd znamionowy 2500A, wyzwalacz Micrologic 6.0X z pomiarem energii', 'OPERATIONAL', 'OPL-DEV-ACB3');
  insertDevice.run('dev-trafo-bkmb', 'cab-trafo-rg', 'Automatyczna Bateria Kondensatorów 300 kVar', '-1G1-BKMB', 'OTHER', 'VarSet Dławiona 7%', 'Schneider Electric', 'BKMB-300KVAR-2021', '', 'Styk bezpotencjałowy', 'Moc 300 kVar, stopnie 25+50+75+75+75, dławiki 189 Hz', 'OPERATIONAL', 'OPL-DEV-BKMB');

  // PV Devices
  insertDevice.run('dev-pv-inv1', 'cab-pv-ac', 'Inwerter Fotowoltaiczny 100 kW (Hala Duża)', '-1U1-PV', 'INVERTER', 'SUN2000-100KTL-M1', 'Huawei', 'HU-PV100-2023-01', '192.168.1.71', 'Modbus TCP / RS485', 'Moc 100kW, sprawność 98.8%, 10 trackerów MPPT', 'OPERATIONAL', 'OPL-DEV-PV-INV1');
  insertDevice.run('dev-pv-logger', 'cab-pv-ac', 'SmartLogger Monitoringu PV i Eksportu Mocy', '-1A1-LOG', 'NETWORK_SWITCH', 'SmartLogger 3000A', 'Huawei', 'SL3000A-2023', '192.168.1.70', 'Ethernet / 4G', 'Zarządzanie wypływem mocy do sieci i monitoring stringów', 'OPERATIONAL', 'OPL-DEV-PV-LOGGER');

  // 6. Documents
  const insertDoc = db.prepare(`
    INSERT INTO documents (id, target_type, target_id, title, doc_type, version, file_url, file_name, file_size, mime_type, description, uploaded_by, uploaded_by_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDoc.run(
    'doc-trafo-sch',
    'CABINET',
    'cab-trafo-rg',
    'Schemat Jednokreskowy Rozdzielnicy Głównej nN i Pól Trafo T1-T3',
    'ELECTRICAL_SCHEMATIC',
    'Rev 4.0 (2024)',
    '/uploads/docs/Schemat_Jednokreskowy_RG_Trafo_T1_T3.pdf',
    'Schemat_Jednokreskowy_RG_Trafo_T1_T3.pdf',
    11500000,
    'application/pdf',
    'Kompletny schemat jednokreskowy stacji transformatorowej 15/0.4kV z nastawami wyzwalaczy Micrologic',
    'usr-admin',
    'Jan Kowalski (Kierownik UR)'
  );

  insertDoc.run(
    'doc-grd-eplan',
    'LINE',
    'lin-h2-gran-duza',
    'DTR & Schemat EPLAN Dużej Granulacji EREMA 1714',
    'DTR',
    'Rev 2.2 (2024)',
    '/uploads/docs/DTR_EREMA_1714_HalaDuza.pdf',
    'DTR_EREMA_1714_HalaDuza.pdf',
    18200000,
    'application/pdf',
    'Dokumentacja Techniczno-Ruchowa linii dużej granulacji w Hali Dużej z instrukcją filtra laserowego',
    'usr-maint',
    'Marek Nowak (Główny Automatyk)'
  );

  insertDoc.run(
    'doc-pv-cert',
    'LINE',
    'lin-infra-pv',
    'Dokumentacja Powykonawcza i Pomiary Instalacji PV 500kWp',
    'CERTIFICATE',
    'Wydanie 1 (2023)',
    '/uploads/docs/Dokumentacja_PV_Oplast_500kWp.pdf',
    'Dokumentacja_PV_Oplast_500kWp.pdf',
    7600000,
    'application/pdf',
    'Protokoły pomiarów rezystancji izolacji DC/AC, próby napięciowe i zgłoszenie do OSD',
    'usr-admin',
    'Jan Kowalski (Kierownik UR)'
  );

  // 7. Events with Photos
  const insertEvent = db.prepare(`
    INSERT INTO events (id, target_type, target_id, title, event_type, priority, status, description, actions_taken, reported_by, reported_by_name, assigned_to, resolved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEvent.run(
    'evt-mod-trafo',
    'CABINET',
    'cab-trafo-rg',
    'Modyfikacja połączeń: Dołożenie analizatora parametrów sieci i przekładników prądowych pod inwertery PV',
    'MODIFICATION',
    'HIGH',
    'RESOLVED',
    'W szafie rozdzielnicy głównej nN zabudowano dodatkowy analizator sieci Janitza UMG z trzema przekładnikami prądowymi z rdzeniem dzielonym 400/5A na zasilaniu sekcji PV.',
    'Zamontowano przekładniki na szynach Cu faz L1, L2, L3. Podpięto obwody prądowe przewodem 2.5 mm2 do listwy zaciskowej -X_PV oraz wpięto skrętkę komunikacyjną RS485 do portu SmartLoggera.',
    'usr-maint',
    'Marek Nowak (Główny Automatyk)',
    'Marek Nowak',
    '2026-10-05 16:00:00'
  );

  insertEvent.run(
    'evt-inc-wtr4',
    'LINE',
    'lin-wtr-04',
    'Zgłoszenie: Wahania temperatury strefy 3 cylindra wtryskarki WTR-04',
    'INCIDENT',
    'MEDIUM',
    'OPEN',
    'Operator zgłasza błąd grzania strefy 3 (alarm temp. max/min na pulpicie Keba). Sprawdzić stan termopary Typ J oraz przekaźnika półprzewodnikowego w szafie.',
    '',
    'usr-oper',
    'Tomasz Wiśniewski (Operator Produkcji)',
    'Utrzymanie Ruchu',
    null
  );

  const insertPhoto = db.prepare(`
    INSERT INTO event_photos (id, event_id, photo_type, caption, file_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertPhoto.run(
    'pho-tr-01',
    'evt-mod-trafo',
    'BEFORE',
    'Widok szynoprzewodu rozdzielnicy głównej przed montażem przekładników pomiarowych PV',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&auto=format&fit=crop&q=80'
  );

  insertPhoto.run(
    'pho-tr-02',
    'evt-mod-trafo',
    'AFTER',
    'Zainstalowane przekładniki 400/5A na szynach L1-L3 i podpięte okablowanie pomiarowe',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1000&auto=format&fit=crop&q=80'
  );
}

export function seedChatIfEmpty(db: Database.Database) {
  const channelCount = db.prepare('SELECT COUNT(*) as count FROM chat_channels').get() as { count: number };
  if (channelCount.count > 0) return;

  const insertChannel = db.prepare(`
    INSERT INTO chat_channels (id, name, slug, description, icon, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertChannel.run('chan-awarie', 'Awarie Krytyczne (STOP LINII)', 'awarie-krytyczne', 'Alerty postojowe i natychmiastowa koordynacja napraw', 'AlertOctagon', 1);
  insertChannel.run('chan-ogolny', 'Główny UR & Produkcja', 'ogolny-ur', 'Bieżąca koordynacja zmian, sprawy organizacyjne i szybki kontakt', 'Hash', 2);
  insertChannel.run('chan-hala1', 'Hala 1 (Mała)', 'hala-1-mala', 'Linia myjąca 3, mała i średnia linia granulacji', 'Layers', 3);
  insertChannel.run('chan-hala-duza', 'Hala Duża', 'hala-duza', 'Linie myjące 1 i 2, duża linia granulacji', 'Layers', 4);
  insertChannel.run('chan-wtryskarki', 'Hala Wtryskarek', 'hala-wtryskarek', 'Wtryskarki WTR-01 do WTR-06, formy i peryferia', 'Layers', 5);
  insertChannel.run('chan-infrastruktura', 'Infrastruktura & Trafo & PV', 'infrastruktura', 'Rozdzielnia Trafo (T1-T3), Oczyszczalnia ścieków, Fotowoltaika', 'Zap', 6);
  insertChannel.run('chan-przeglady', 'Harmonogram Przeglądów DTR', 'przeglady-dtr', 'Planowane inspekcje DTR, wymiany filtrów, oleje i certyfikacje', 'Wrench', 7);

  const insertMsg = db.prepare(`
    INSERT INTO chat_messages (id, channel_id, user_id, user_name, user_role, content, photo_url, related_target_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMsg.run(
    'msg-01',
    'chan-awarie',
    'usr-oper',
    'Tomasz Wiśniewski (Operator Produkcji)',
    'OPERATOR',
    '⚠️ UWAGA: Linia Myjąca 3 zatrzymana! Silnik rozdrabniacza wybił zabezpieczenie termiczne Q1 w szafie S1. Proszę o natychmiastowe podejście automatyka.',
    null,
    'Linia myjąca 3 (LM-03)',
    datetimeOffset(-45)
  );

  insertMsg.run(
    'msg-02',
    'chan-awarie',
    'usr-maint',
    'Marek Nowak (Główny Automatyk)',
    'MAINTENANCE',
    'Przyjąłem zgłoszenie. Jestem przy szafie OPL-CAB-LM03-S1. Badam styki stycznika 3RT2035 oraz cewkę sterującą.',
    null,
    'Szafa Główna LM-03-S1',
    datetimeOffset(-35)
  );

  insertMsg.run(
    'msg-03',
    'chan-awarie',
    'usr-maint',
    'Marek Nowak (Główny Automatyk)',
    'MAINTENANCE',
    '✅ Wymieniono uszkodzony stycznik główny na nowy ze stanu magazynowego UR. Sprawdzono prądy fazowe rozdrabniacza (L1: 37.2A, L2: 37.8A, L3: 36.9A - w normie). Linia przekazana operatorowi do pracy.',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    'Linia myjąca 3 (LM-03)',
    datetimeOffset(-15)
  );

  insertMsg.run(
    'msg-04',
    'chan-ogolny',
    'usr-admin',
    'Jan Kowalski (Kierownik UR)',
    'ADMIN',
    'Dzień dobry wszystkim na zmianie! Dzisiaj o 14:00 zaplanowana kontrola poziomu oleju i temperatury transformatorów T1, T2, T3 w rozdzielni trafo. Proszę o wpisanie protokołu do DTR.',
    null,
    'Rozdzielnia Trafo (T1-T3)',
    datetimeOffset(-120)
  );

  insertMsg.run(
    'msg-05',
    'chan-ogolny',
    'usr-oper',
    'Tomasz Wiśniewski (Operator Produkcji)',
    'OPERATOR',
    'Potwierdzam. Wszystkie 6 wtryskarek w Hali Wtryskarek pracuje stabilnie na bieżących formach. Czekamy na przegląd strefy grzania WTR-03.',
    null,
    'Wtryskarka 03 (WTR-03)',
    datetimeOffset(-60)
  );
}

function datetimeOffset(minutesAgo: number): string {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

