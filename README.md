# OplastAsist • Cyfrowa DTR & Ewidencja Zmian Maszyn

Kompleksowy system klasy **Cyfrowa DTR (Dokumentacja Techniczno-Ruchowa)** dla zakładu produkcyjnego **Oplast**, dedykowany dla działu **Utrzymania Ruchu (UR)**, automatyków, mechaników oraz operatorów linii produkcyjnych. Aplikacja posiada pełne wsparcie **PWA (Progressive Web App)** z możliwością instalacji na smartfonach i tabletach.

---

## 🌟 Główne Funkcjonalności

1. **Park Maszynowy w 4 Halach Produkcyjnych:**
   - **Hala 1 ("Mała"):** Linia myjąca 3 (LM-03), Linia granulacji "Średnia" (LG-SREDNIA), Linia granulacji "Mała" (LG-MALA).
   - **Hala Duża:** Linia myjąca 1 (LM-01), Linia myjąca 2 (LM-02), Linia granulacji "Duża" (LG-DUZA).
   - **Hala Wtryskarek:** 6 wtryskarek (WTR-01 do WTR-06).
   - **Infrastruktura & Zasilanie:** Rozdzielnia Trafo z 3 transformatorami: T1 (800 kVA), T2 (1000 kVA), T3 (1250 kVA) + rozdzielnica nN, Oczyszczalnia ścieków, Układ Fotowoltaiczny (PV 500 kWp).

2. **Zestawienie Bieżących Awarii i Postojów (`/faults`):**
   - Centralny pulpit dyspozytorski Utrzymania Ruchu.
   - Wskaźniki na żywo: 🚨 **STOP LINII (Postój krytyczny)**, 🔧 **W trakcie naprawy**, ⏱️ **Oczekujące**, 📋 **Harmonogram Przeglądów DTR**.
   - Podejmowanie naprawy, zamykanie z opisem wykonanych czynności i przywrócenia maszyny do ruchu.
   - Szybkie przejście do wątku na czacie zakładowym.

3. **Czat UR & Slack Zakładowy (`/chat`):**
   - Kanały tematyczne: `#awarie-krytyczne`, `#ogolny-ur`, `#hala-1-mala`, `#hala-duza`, `#hala-wtryskarek`, `#infrastruktura-trafo-pv`, `#przeglady-dtr`.
   - **Automatyczny alert na czacie** po zgłoszeniu awarii krytycznej (STOP LINII) przez operatora.
   - Przypinanie kontekstu maszyny do wiadomości (`Dotyczy: WTR-03`).
   - Wysyłanie zdjęć usterki i podzespołów bezpośrednio z aparatu telefonu lub dysku.

4. **Dedykowany Profil Operatora (`/operator`):**
   - Błyskawiczne zgłaszanie awarii w 3 krokach.
   - Skanowanie kodu QR maszyny aparatem telefonu.
   - Przełącznik **STOP LINII (Krytyczne)** vs **Pracuje z usterką**.
   - Dołączanie zdjęć usterki aparatem w smartfonie.

5. **Centrum Technika UR (`/technician`):**
   - Przegląd zadań serwisowych z priorytetyzacją awarii krytycznych na samej górze.
   - Przypisywanie i zamykanie zgłoszeń.

6. **Cyfrowa DTR & Baza Schematów (`/dtr`):**
   - Przechowywanie DTR, wielokreskowych schematów EPLAN, schematów hydrauliki/pneumatyki i backupów PLC.

7. **System Etykiet QR (`/qr-scanner`, `/print-labels`):**
   - Skaner kodów QR przez aparat w przeglądarce.
   - Wbudowane narzędzie do generowania i drukowania etykiet przemysłowych.

---

## 🔑 Domyślne Konta Testowe (Demo)

Aplikacja posiada szybkie przełączanie ról jednym kliknięciem w prawym górnym rogu nagłówka:

| Użytkownik | Hasło | Rola | Imię i Nazwisko / Funkcja |
|------------|-------|------|---------------------------|
| `admin` | `admin123` | **ADMIN** | Jan Kowalski (Kierownik Działu UR) |
| `automatyk` | `auto123` | **MAINTENANCE** | Marek Nowak (Główny Automatyk UR) |
| `operator` | `oper123` | **OPERATOR** | Tomasz Wiśniewski (Operator Produkcji) |

---

## 🚀 Szybki Start Lokalnie

```bash
cd oplast-asist
npm install
npm run build
npm run start # lub npm run dev dla trybu developerskiego
```

Aplikacja dostępna lokalnie pod adresem: `http://localhost:3000`

---

## 🌐 Wdrożenie na Subdomenie w Hostinger (Krok po Kroku)

Aplikacja jest oparta o **Next.js 15** i lokalną, bezobsługową bazę danych **SQLite (better-sqlite3)**, dzięki czemu nie wymaga zewnętrznych serwerów bazodanowych (MySQL/PostgreSQL) i idealnie nadaje się na **Hostinger VPS** lub **Hostinger Cloud/Node.js**.

### Opcja A: Hostinger VPS (Rekomendowane z PM2 & Nginx)

#### 1. Połącz się przez SSH ze swoim serwerem Hostinger:
```bash
ssh root@twoje-ip-vps
```

#### 2. Upewnij się, że masz zainstalowany Node.js (wersja 18 lub 20) i Git:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pm2
```

#### 3. Sklonuj repozytorium GitHub:
```bash
cd /var/www
git clone https://github.com/TWOJA_NAZWA_UZYTKOWNIKA/oplast-asist.git
cd oplast-asist
```

#### 4. Zainstaluj zależności i zbuduj aplikację produkcyjną:
```bash
npm install
npm run build
```
*(Baza danych SQLite oraz foldery na uploady utworzą się automatycznie przy pierwszym uruchomieniu)*.

#### 5. Uruchom aplikację jako usługę w tle za pomocą PM2:
```bash
pm2 start npm --name "oplast-asist" -- start -- -p 3000
pm2 save
pm2 startup
```

#### 6. Skonfiguruj Nginx jako Reverse Proxy dla Twojej subdomeny (np. `asist.oplast.pl` lub `ur.twojadomena.pl`):
Utwórz plik konfiguracyjny w `/etc/nginx/sites-available/oplast-asist`:
```nginx
server {
    server_name ur.twojadomena.pl;

    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Włącz stronę i przeładuj Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/oplast-asist /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. Dodaj darmowy certyfikat SSL (HTTPS) przez Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ur.twojadomena.pl
```

---

### Opcja B: Hostinger Panel (Cloud Web Application / Node.js)
1. W panelu Hostinger przejdź do sekcji **Websites** ➔ **Create Subdomain** (np. `asist`).
2. W ustawieniach aplikacji wybierz środowisko **Node.js 20**.
3. Jako **Application root** podaj katalog aplikacji (np. `public_html/asist` lub `/app`).
4. Jako **Application startup file** podaj: `node_modules/next/dist/bin/next` lub skrypt startowy z argumentem `start`.
5. Wklej repozytorium GitHub do Git Deployment w panelu Hostinger i uruchom `npm install && npm run build`.

---

## 📱 Instalacja PWA na Telefonie
Po uruchomieniu aplikacji na subdomenie z certyfikatem SSL:
- **Android (Chrome):** Kliknij baner na dole ekranu *"Zainstaluj OplastAsist"* lub menu `⋮` ➔ *Zainstaluj aplikację*.
- **iOS / iPhone (Safari):** Kliknij przycisk Udostępnij ➔ *Do ekranu początkowego*.
