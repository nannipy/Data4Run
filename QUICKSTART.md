# Quick Start - Strava Run Analyzer

## 🚀 Avvio Rapido

### 1. Prerequisiti
- Node.js 18+ e npm
- Python 3.11+
- Docker e Docker Compose (opzionale)

### 2. Setup Strava Developer (Solo per produzione)
1. Vai su [Strava API Settings](https://www.strava.com/settings/api)
2. Crea una nuova applicazione
3. Imposta l'URL di redirect a `http://localhost:3000/auth/callback`
4. Prendi nota di `Client ID` e `Client Secret`

### 3. Avvio con Docker Compose (Raccomandato)

```bash
# Clona il repository
git clone <repository-url>
cd run-insights-unleashed

# Avvia l'applicazione
docker-compose up --build
```

L'applicazione sarà disponibile su:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 4. Avvio Locale

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
npm install
npm run dev
```

## 🧪 Modalità Test

L'applicazione include dati mock per il testing:

1. **Dati Mock**: Sono già generati nel file `backend/app/utils/mock_data.json`
2. **Endpoint Mock**: Disponibili su `/mock/*` per testare il frontend
3. **Utilizzo**: I dati mock vengono utilizzati automaticamente se non ci sono credenziali Strava

## 📱 Utilizzo

1. **Accesso**: Vai su http://localhost:3000
2. **Modalità Test**: I dati mock vengono caricati automaticamente
3. **Navigazione**: Esplora Dashboard, Attività e altre sezioni
4. **Produzione**: Configura le credenziali Strava per dati reali

## 🔧 Configurazione Produzione

Per utilizzare dati reali di Strava:

1. Crea un file `.env` nella root:
```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
VITE_API_URL=http://localhost:8000
```

2. Riavvia l'applicazione
3. Clicca "Connetti con Strava" per l'autenticazione

## 🐛 Troubleshooting

### Backend non si avvia
```bash
# Verifica Python
python3 --version

# Installa dipendenze
cd backend
pip install -r requirements.txt

# Avvia con debug
uvicorn app.main:app --reload --log-level debug
```

### Frontend non si connette al backend
```bash
# Verifica che il backend sia in esecuzione
curl http://localhost:8000/health

# Controlla i log CORS
# Verifica che VITE_API_URL sia corretto
```

### Dati mock non si caricano
```bash
# Rigenera i dati mock
cd backend
python3 -m app.utils.mock_data

# Verifica l'endpoint mock
curl http://localhost:8000/mock/stats
```

## 📊 Funzionalità Disponibili

### ✅ Implementate
- Dashboard con metriche aggregate
- Elenco attività con filtri
- Grafici di tendenza
- Autenticazione Strava (configurabile)
- Dati mock per testing

### 🔄 In Sviluppo
- Dettaglio attività con mappa
- Analisi avanzate
- Record personali

## 🆘 Supporto

- **Documentazione API**: http://localhost:8000/docs
- **Log Backend**: Controlla la console del backend
- **Log Frontend**: Controlla la console del browser
- **Issues**: Apri una issue su GitHub

## 🎯 Prossimi Passi

1. **Testa l'applicazione** con i dati mock
2. **Configura Strava** per dati reali
3. **Esplora le funzionalità** esistenti
4. **Contribuisci** al progetto 