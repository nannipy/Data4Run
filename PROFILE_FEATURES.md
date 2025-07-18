# Funzionalità Profilo e Impostazioni

## Panoramica

Sono state aggiunte nuove funzionalità per gestire il profilo utente e le impostazioni dell'applicazione.

## Funzionalità Implementate

### 1. Foto Profilo
- **Caricamento foto**: Gli utenti possono caricare una foto profilo personale
- **Validazione**: Supporto per file JPG, PNG fino a 5MB
- **Preview**: Anteprima dell'immagine prima del salvataggio
- **Fallback**: Mostra le iniziali dell'utente se non è presente una foto
- **Componente riutilizzabile**: `UserAvatar` per mostrare l'avatar in tutta l'app

### 2. Pagina Impostazioni
- **Profilo**: Visualizzazione e gestione informazioni utente
- **Notifiche**: Configurazione notifiche email, push, report settimanali
- **Privacy**: Controlli per visibilità profilo, statistiche e attività
- **Visualizzazione**: Tema, unità di misura, lingua
- **Sincronizzazione**: Configurazione sincronizzazione automatica con Strava

### 3. Integrazione UI
- **Header**: Mostra avatar utente e stato connessione
- **Sidebar**: Link alle impostazioni nella sezione Account
- **Responsive**: Design adattivo per dispositivi mobili

## Struttura Backend

### Nuovi Endpoint
- `POST /auth/user/{user_id}/profile-image`: Upload foto profilo
- `PUT /auth/user/{user_id}/settings`: Aggiorna impostazioni utente

### Modello Database
- Aggiunto campo `settings` (JSON) alla tabella `users`
- Supporto per file statici in `/uploads/profile_images/`

## Struttura Frontend

### Nuovi Componenti
- `UserAvatar`: Componente riutilizzabile per avatar utente
- `Settings`: Pagina completa delle impostazioni

### Aggiornamenti
- `AppSidebar`: Aggiunta sezione Account con link Impostazioni
- `Header`: Integrazione avatar utente e stato autenticazione
- `api.ts`: Nuovi metodi per gestione profilo e impostazioni

## Utilizzo

### Caricamento Foto Profilo
1. Vai su Impostazioni
2. Clicca "Scegli immagine" nella sezione Profilo
3. Seleziona un file immagine (max 5MB)
4. Clicca "Salva" per caricare

### Gestione Impostazioni
1. Vai su Impostazioni
2. Modifica le preferenze nelle varie sezioni
3. Clicca "Salva impostazioni" per applicare le modifiche

## Note Tecniche

### Sicurezza
- Validazione tipo e dimensione file
- Nomi file unici per evitare conflitti
- Controllo autenticazione utente

### Performance
- Lazy loading delle immagini
- Fallback alle iniziali per caricamento veloce
- Cache delle impostazioni utente

### Compatibilità
- Supporto per browser moderni
- Responsive design
- Accessibilità migliorata 