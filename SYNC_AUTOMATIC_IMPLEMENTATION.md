# Implementazione Sincronizzazione Automatica

## Panoramica

È stata implementata la sincronizzazione automatica delle attività di Strava che viene eseguita automaticamente in due scenari:

1. **Dopo il login**: Quando un utente effettua il login per la prima volta
2. **All'avvio dell'applicazione**: Quando un utente già autenticato avvia l'applicazione (se è passata più di 1 ora dall'ultima sincronizzazione)

## Modifiche Implementate

### 1. Hook `useAuth` (`src/hooks/useAuth.ts`)

#### Aggiunte:
- **Stato `isAutoSyncing`**: Per tracciare quando la sincronizzazione automatica è in corso
- **Sincronizzazione post-login**: Chiamata automatica a `syncActivities` 2 secondi dopo il login riuscito
- **Sincronizzazione per utenti esistenti**: Controllo automatico ogni volta che l'utente torna sull'app
- **Invalidazione query**: Aggiornamento automatico dei dati nell'interfaccia dopo la sincronizzazione

#### Logica implementata:
```typescript
// Sincronizzazione automatica dopo il login
setTimeout(async () => {
  try {
    setIsAutoSyncing(true);
    await apiService.syncActivities(data.user_id);
    // Invalida le query per aggiornare i dati
  } catch (error) {
    console.error('Errore durante la sincronizzazione automatica:', error);
  } finally {
    setIsAutoSyncing(false);
  }
}, 2000);

// Sincronizzazione all'avvio per utenti esistenti (se passata più di 1 ora)
const shouldSync = !lastSync || 
  (new Date().getTime() - new Date(lastSync).getTime()) > 60 * 60 * 1000;
```

### 2. Dashboard (`src/pages/Dashboard.tsx`)

#### Aggiunte:
- **Indicatore visivo**: Mostra "Sincronizzazione automatica in corso..." quando `isAutoSyncing` è true
- **Disabilitazione pulsante**: Il pulsante di sincronizzazione manuale viene disabilitato durante la sincronizzazione automatica
- **Feedback utente**: Indicatore con spinner per informare l'utente dell'operazione in corso

## Comportamento

### Scenario 1: Nuovo Login
1. Utente clicca "Connetti con Strava"
2. Autenticazione OAuth2 con Strava
3. Callback di successo
4. **2 secondi dopo**: Sincronizzazione automatica delle attività
5. Aggiornamento automatico dei dati nell'interfaccia

### Scenario 2: Utente Esistente
1. Utente avvia l'applicazione
2. Controllo del timestamp dell'ultima sincronizzazione
3. **Se passata più di 1 ora**: Sincronizzazione automatica (3 secondi di delay)
4. Aggiornamento automatico dei dati nell'interfaccia

## Vantaggi

1. **Esperienza utente migliorata**: I dati sono sempre aggiornati senza intervento manuale
2. **Performance**: Sincronizzazione intelligente solo all'avvio quando necessario
3. **Feedback visivo**: L'utente sa quando la sincronizzazione è in corso
4. **Non invasivo**: Non interferisce con l'uso normale dell'applicazione

## Configurazione

- **Delay post-login**: 2 secondi
- **Delay per utenti esistenti**: 3 secondi
- **Intervallo minimo tra sincronizzazioni**: 1 ora
- **Timeout di sicurezza**: Gestito dal backend

## Note Tecniche

- Utilizza `setTimeout` per evitare conflitti con il caricamento iniziale
- Gestione degli errori con try/catch
- Invalidazione automatica delle query React Query
- Stato di loading per feedback visivo
- Logging per debugging

## Testing

Per testare la funzionalità:

1. **Nuovo login**: Effettua logout e poi login - dovresti vedere la sincronizzazione automatica
2. **Utente esistente**: Ricarica l'applicazione dopo più di 1 ora - dovresti vedere la sincronizzazione automatica
3. **Indicatore visivo**: Verifica che l'indicatore "Sincronizzazione automatica in corso..." appaia correttamente
4. **Disabilitazione pulsante**: Verifica che il pulsante manuale sia disabilitato durante la sincronizzazione automatica 