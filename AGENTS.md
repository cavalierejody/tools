# AGENTS.md

## Scopo del repository

Questo repository contiene una raccolta di strumenti web statici pubblicati tramite GitHub Pages.

Esistono due tipi principali di progetto:

- utility autonome in un singolo file HTML nella root;
- Progressive Web App in cartelle con suffisso `-app`.

Le PWA sono già distribuite e possono essere già installate sui dispositivi degli utenti. Ogni modifica deve quindi essere trattata come una modifica a software in esercizio, non come una nuova installazione.

Le istruzioni di questo file si applicano all'intero repository, salvo la presenza di un `AGENTS.md` più specifico in una sottocartella.

## Dashboard principale

Il file `index.html` nella root è la dashboard/mappa del repository e costituisce il punto di accesso alle singole app.

Deve essere mantenuto aggiornato insieme all'evoluzione delle applicazioni:

- aggiungere una voce quando viene introdotta una nuova app destinata agli utenti;
- aggiornare nome, descrizione, icona e destinazione quando un'app viene rinominata o cambia percorso;
- rimuovere o correggere collegamenti obsoleti quando un'app viene eliminata, sostituita o spostata;
- verificare che ogni collegamento punti a una risorsa realmente pubblicata su GitHub Pages;
- mantenere la dashboard coerente con lo stato effettivo del repository, senza lasciare app raggiungibili solo conoscendone manualmente l'URL.

Ogni PR che aggiunge, rinomina, sposta, sostituisce o rimuove un'app deve includere anche l'eventuale aggiornamento del file `index.html` della root.

## Principi fondamentali

1. **Ogni app è indipendente.**
   Non creare moduli runtime, script, fogli di stile o componenti condivisi tra app diverse, salvo richiesta esplicita. Duplicare poche righe di logica locale è preferibile a introdurre accoppiamento tra applicazioni autonome.

2. **Preservare compatibilità e dati.**
   Non cambiare senza necessità URL, scope del Service Worker, `start_url`, nomi delle cache, chiavi `localStorage`, database IndexedDB o formati dei dati persistenti. Gli utenti non devono dover disinstallare o reinstallare una PWA per ricevere una modifica ordinaria.

3. **Modifiche minime e mirate.**
   Non effettuare refactoring, formattazioni globali, rinominazioni o redesign non richiesti. Evitare di modificare altre app soltanto per uniformarle.

4. **Verificare il codice reale prima di applicare patch.**
   Non presumere che due app abbiano la stessa struttura. Leggere sempre i file interessati e individuare gli hook esistenti prima di modificare HTML, CSS, JavaScript, manifest o Service Worker.

## Struttura delle PWA

Per una cartella `*-app`, considerare insieme almeno:

- `index.html`;
- `manifest.json`;
- `sw.js`, quando presente;
- icone e altri asset elencati nel manifest o nella precache.

Prima di concludere una modifica, verificare che:

- tutti i percorsi usati da HTML, manifest e Service Worker esistano davvero;
- i percorsi siano relativi alla cartella dell'app e compatibili con GitHub Pages;
- il manifest sia JSON valido;
- il Service Worker abbia lo scope previsto;
- `cache.addAll()` non contenga asset mancanti, perché un solo file inesistente può far fallire l'installazione del Service Worker.

## Service Worker e distribuzione degli aggiornamenti

### Regola obbligatoria: incrementare la versione della cache

Quando si modifica qualsiasi file servito dalla cache di una PWA già dotata di Service Worker, aggiornare nella stessa modifica anche la cache key o la versione in `sw.js`.

Esempi di modifiche che richiedono il bump:

- `index.html`;
- CSS o JavaScript locali;
- manifest;
- icone o asset inclusi nell'app shell;
- comportamento di installazione o aggiornamento;
- correzioni al blocco dello zoom.

Non dichiarare completa una modifica a una PWA in produzione se l'HTML è cambiato ma la versione della cache è rimasta invariata.

### Aggiunta di un Service Worker prima assente

Se una PWA già installabile registra `sw.js` ma il file non esiste, creare un Service Worker locale alla singola app e verificare il percorso di registrazione.

La nuova presenza del Service Worker non richiede normalmente la reinstallazione della PWA: alla prima apertura online il nuovo HTML può registrarlo. Verificare comunque il flusso di prima registrazione e la successiva apertura sotto controllo del Service Worker.

### Flusso di aggiornamento consigliato

Per le app che espongono aggiornamenti all'utente, mantenere il flusso locale all'app:

1. registrare il Service Worker;
2. chiamare `registration.update()` dopo la registrazione;
3. osservare `updatefound` e lo stato del worker installato;
4. mostrare un banner o toast “Aggiornamento disponibile” quando esiste un worker in attesa;
5. al comando dell'utente, inviare un messaggio `SKIP_WAITING` al worker;
6. nel Service Worker, gestire il messaggio chiamando `self.skipWaiting()`;
7. ricaricare una sola volta dopo `controllerchange`.

Per giochi, timer o sessioni attive, non forzare un reload automatico mentre l'utente sta operando. Preferire un pulsante esplicito “Aggiorna”.

### Cache e navigazione

Esaminare la strategia già usata dall'app prima di cambiarla. Qualunque strategia deve garantire:

- prima apertura online funzionante;
- apertura offline dopo il popolamento della cache;
- sostituzione della vecchia cache dopo un bump;
- disponibilità del nuovo `index.html` agli utenti già installati;
- assenza di loop di reload o worker permanentemente in attesa.

## Installazione PWA

`beforeinstallprompt` non è disponibile su tutti i browser e non deve essere l'unico percorso di installazione.

Quando si interviene sul banner di installazione:

- mantenere il banner autonomo dentro la singola app;
- nasconderlo quando l'app è già in modalità standalone;
- usare `beforeinstallprompt` sui browser che lo supportano;
- offrire su iPhone/iPad istruzioni manuali per Safari: Condividi → Aggiungi alla schermata Home;
- non mostrare contemporaneamente banner di installazione e aggiornamento in modo confuso;
- non introdurre dipendenze condivise tra app.

## Blocco del pinch-to-zoom

Applicare il blocco dello zoom soltanto alle app per cui è esplicitamente richiesto. Non estenderlo automaticamente alle normali pagine web della root.

Il solo meta viewport può non essere sufficiente, specialmente nelle PWA Android. Inoltre `touch-action: manipulation` consente ancora il pinch-to-zoom.

Per un blocco robusto fin dal primo frame:

1. usare un meta viewport con `maximum-scale=1.0` e `user-scalable=no`;
2. impostare `touch-action: none` sul contenitore appropriato, normalmente `html`/`body` o la superficie dell'app;
3. inserire nell'`<head>`, subito dopo il viewport e prima di font, CDN o script esterni, gli handler non passivi per:
   - `gesturestart`;
   - `gesturechange`;
   - `gestureend`;
   - `touchmove` quando sono presenti più tocchi;
4. usare `{ passive: false, capture: true }` e `preventDefault()`;
5. verificare il comportamento immediatamente all'apertura, non soltanto dopo il caricamento completo.

Non affidarsi a uno script in fondo al `body`: risorse esterne lente possono lasciare per alcuni secondi una finestra in cui il pinch è ancora attivo.

## Risorse esterne

Alcune app caricano font, Tailwind o altre risorse da CDN.

- Non introdurre nuove dipendenze esterne senza necessità.
- Non fare dipendere funzioni critiche iniziali, come il blocco delle gesture, dal completamento di risorse esterne.
- Se una PWA dichiara di funzionare offline, verificare quale comportamento mantiene quando le CDN non sono raggiungibili.

## Workflow Git e GitHub

- Lavorare su una branch `agent/<descrizione-breve>`.
- Usare modifiche dirette ai file e commit normali.
- **Non creare workflow GitHub Actions temporanei per modificare il repository.** Gli workflow monouso aumentano il rumore, possono fallire per ancore fragili e generano deploy intermedi inutili.
- Prima del commit, controllare l'elenco esatto dei file modificati e assicurarsi che non ci siano cambiamenti estranei.
- Usare una PR con titolo e descrizione che spieghino causa, modifica e impatto sugli utenti già installati.
- Dopo il merge, verificare il deploy GitHub Pages.
- Eliminare workflow o file temporanei eventualmente creati durante il lavoro.

## Validazione minima

Per una utility HTML singola:

- aprire la pagina tramite un server HTTP locale, non soltanto con `file://`;
- controllare console JavaScript e comportamento responsive;
- verificare che i link dalla pagina indice restino corretti.

Per una PWA, verificare almeno:

- caricamento online pulito;
- registrazione del Service Worker senza errori;
- seconda apertura offline;
- manifest e icone risolti correttamente;
- aggiornamento da una versione precedente della cache;
- comparsa e funzionamento dell'eventuale banner di aggiornamento;
- nessuna perdita di dati persistenti;
- modalità standalone;
- installazione o istruzioni alternative su Android, desktop e iOS quando pertinenti;
- pinch-to-zoom dal primo istante, se deve essere disabilitato;
- funzionalità principale dell'app dopo il reload di aggiornamento.

Quando non è possibile eseguire un test reale sul dispositivo, dichiarare esplicitamente cosa è stato verificato staticamente e cosa richiede una prova manuale.

## Checklist prima di chiudere una modifica PWA

- [ ] Ho letto `index.html`, `manifest.json` e `sw.js` dell'app interessata.
- [ ] Ho mantenuto l'app indipendente dalle altre.
- [ ] Ho verificato tutti i percorsi degli asset.
- [ ] Ho incrementato la cache key se è cambiato un asset cacheato.
- [ ] Ho verificato il percorso di aggiornamento per installazioni esistenti.
- [ ] Non ho richiesto una reinstallazione senza una ragione tecnica concreta.
- [ ] Non ho introdotto reload distruttivi durante sessioni attive.
- [ ] Ho testato installazione, aggiornamento e offline per quanto possibile.
- [ ] Ho controllato pinch e gesture dall'avvio quando pertinenti.
- [ ] Ho aggiornato `index.html` della root se l'app è stata aggiunta, rinominata, spostata, sostituita o rimossa.
- [ ] La PR contiene solo i file previsti.
- [ ] Il deploy GitHub Pages è terminato correttamente.

## Definition of Done

Una modifica è conclusa solo quando il codice è presente su `main`, il deploy GitHub Pages è riuscito e il percorso per gli utenti che hanno già installato l'app è stato verificato o documentato con precisione.
