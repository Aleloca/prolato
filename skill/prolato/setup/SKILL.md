---
name: prolato-setup
description: Setup iniziale per un nuovo utente Prolato
---

# Setup Utente Prolato

Questa sub-skill viene eseguita solo la prima volta che un utente usa Prolato. Configura tutto automaticamente.

## Prerequisiti

L'admin del sistema deve fornirti:
- L'URL del server Gitea (es. `https://git.tuodominio.dev`)
- L'URL del webhook (es. `https://webhook.tuodominio.dev`)
- Il deploy token del webhook
- Il token admin di Gitea (solo per il primo setup — serve a creare il tuo account)
- Il dominio (es. `tuodominio.dev`)

## Passo 1: Raccogli informazioni

Chiedi all'utente SOLO queste informazioni:
- **Nome completo** (per i commit Git, es. "Mario Rossi")
- **Email** (per i commit Git, es. "mario@azienda.it")
- **Dominio** del server Prolato (es. "prolato.dev")
- **Deploy token** del webhook
- **Token admin Gitea** (se l'utente e' l'admin che configura il sistema per la prima volta)

## Passo 2: Genera chiave SSH

Controlla se esiste gia' una chiave dedicata. Se no, generala.

```bash
if [ ! -f ~/.ssh/deploy_key ]; then
    ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N "" -C "deploy-$(whoami)"
    echo "Chiave SSH generata: ~/.ssh/deploy_key"
else
    echo "Chiave SSH gia' presente: ~/.ssh/deploy_key"
fi
```

Tipo `ed25519` (piu' sicuro e compatto di RSA). Nessuna passphrase per permettere deploy automatici.

## Passo 3: Configura SSH per Gitea

Aggiungi o aggiorna il blocco per Gitea in `~/.ssh/config`:

```
Host git.{DOMINIO}
    HostName git.{DOMINIO}
    Port 2222
    User git
    IdentityFile ~/.ssh/deploy_key
    IdentitiesOnly yes
    StrictHostKeyChecking no
```

- Porta `2222`: la porta SSH di Gitea (configurata nel server).
- `StrictHostKeyChecking no`: evita la richiesta di conferma al primo collegamento.
- Controlla se il blocco esiste gia' prima di aggiungerlo. Se esiste, aggiornalo.

## Passo 4: Crea account Gitea

Genera username e password, poi crea l'account via API admin.

```bash
# Genera username dal nome (es. "Mario Rossi" → "mario.rossi")
# Usa solo lettere minuscole, punti per separare
# Se esiste gia', aggiungi suffisso numerico (mario.rossi.2)

# Genera password random
GITEA_PASSWORD=$(openssl rand -hex 16)

# Crea utente via API admin
curl -s -X POST "https://git.{DOMINIO}/api/v1/admin/users" \
    -H "Authorization: token {ADMIN_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "{USERNAME}",
        "email": "{EMAIL}",
        "password": "'$GITEA_PASSWORD'",
        "must_change_password": false,
        "visibility": "private"
    }'
```

Verifica la risposta. Se restituisce errore "user already exists", l'account esiste gia' — procedi al passo successivo usando le credenziali esistenti o chiedendo all'utente.

## Passo 5: Genera token utente e aggiungi chiave SSH

```bash
# Genera token utente Gitea
USER_TOKEN=$(curl -s -X POST "https://git.{DOMINIO}/api/v1/users/{USERNAME}/tokens" \
    -u "{USERNAME}:$GITEA_PASSWORD" \
    -H "Content-Type: application/json" \
    -d '{"name": "deploy-token", "scopes": ["write:repository", "write:user"]}' | grep -o '"sha1":"[^"]*"' | cut -d'"' -f4)

# Leggi la chiave pubblica
SSH_PUBLIC_KEY=$(cat ~/.ssh/deploy_key.pub)

# Aggiungi la chiave SSH all'account Gitea
curl -s -X POST "https://git.{DOMINIO}/api/v1/user/keys" \
    -H "Authorization: token $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"deploy-key-$(hostname)\", \"key\": \"$SSH_PUBLIC_KEY\"}"
```

Se la chiave esiste gia' (errore "key already exists"), e' ok — prosegui.

## Passo 6: Configura Git locale

```bash
# Controlla se esiste gia' una configurazione Git globale
EXISTING_NAME=$(git config --global user.name 2>/dev/null)

if [ -z "$EXISTING_NAME" ]; then
    # Nessuna config globale — imposta
    git config --global user.name "{NOME}"
    git config --global user.email "{EMAIL}"
else
    # Config globale esistente — NON sovrascrivere
    # La skill usera' config locale per ogni progetto
    echo "Git gia' configurato come: $EXISTING_NAME"
    echo "La skill usera' configurazione locale per ogni progetto deployato."
fi
```

## Passo 7: Salva configurazione

Scrivi il file `~/.deploy-config.json`:

```json
{
    "gitea_url": "https://git.{DOMINIO}",
    "gitea_username": "{USERNAME}",
    "gitea_token": "{USER_TOKEN}",
    "gitea_admin_token": "{ADMIN_TOKEN}",
    "webhook_url": "https://webhook.{DOMINIO}",
    "deploy_token": "{DEPLOY_TOKEN}",
    "domain": "{DOMINIO}",
    "ssh_key_path": "~/.ssh/deploy_key"
}
```

Imposta permessi restrittivi: `chmod 600 ~/.deploy-config.json`

## Passo 8: Test di connessione

Esegui tutti e tre i test. Tutti devono passare.

```bash
# 1. Test SSH verso Gitea
ssh -T git@git.{DOMINIO} -p 2222 -o ConnectTimeout=5 2>&1

# 2. Test API Gitea
curl -s -H "Authorization: token {USER_TOKEN}" \
    "https://git.{DOMINIO}/api/v1/user" | grep -q '"login"'

# 3. Test Webhook
curl -s -H "Authorization: Bearer {DEPLOY_TOKEN}" \
    "https://webhook.{DOMINIO}/health" | grep -q '"ok"'
```

### Se tutti passano

Mostra:
```
Setup completato!
- Account Gitea: {USERNAME}
- Dominio: {DOMINIO}
- Ora puoi deployare i tuoi progetti con "deploya questo progetto"
```

### Se uno fallisce

Mostra l'errore specifico e suggerisci correzioni:
- SSH fallisce → "Verifica che il server Gitea sia raggiungibile e che la porta 2222 sia aperta"
- API Gitea fallisce → "Verifica che l'URL Gitea sia corretto e che il token sia valido"
- Webhook fallisce → "Verifica che il webhook sia attivo e che il deploy token sia corretto"
