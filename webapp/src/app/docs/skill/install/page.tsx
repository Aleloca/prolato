"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function SkillInstallPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Installazione della Skill</h1>
      <p>
        {replaceDomain(
          "In questa guida installerai la skill Prolato per Claude Code. La skill permette a Claude di deployare i tuoi progetti direttamente su tuodominio.dev con un semplice comando."
        )}
      </p>

      <h2>Prerequisiti</h2>
      <ul>
        <li>
          {replaceDomain(
            "VPS configurata con tutti i componenti installati (setup completato su tuodominio.dev)"
          )}
        </li>
        <li>
          Claude Code installato e funzionante sul tuo computer locale
        </li>
      </ul>

      <h2>Passo 1: Clona il repository Prolato</h2>
      <p>
        Apri il terminale sul tuo computer locale e clona il repository:
      </p>
      <pre><code>git clone https://github.com/user/prolato.git</code></pre>
      <p>
        Questo scarica tutto il codice di Prolato, inclusa la skill per Claude Code.
      </p>

      <h2>Passo 2: Copia i file della skill</h2>
      <p>
        Copia la directory della skill nella cartella skills di Claude Code:
      </p>
      <pre><code>cp -r prolato/skill/prolato ~/.claude/skills/prolato</code></pre>
      <p>
        In alternativa, puoi creare un link simbolico. Questo e' utile se vuoi ricevere aggiornamenti con un semplice <code>git pull</code>:
      </p>
      <pre><code>ln -s /path/to/prolato/skill/prolato ~/.claude/skills/prolato</code></pre>
      <p>
        Sostituisci <code>/path/to/prolato</code> con il percorso assoluto dove hai clonato il repository.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti vedere la directory <code>~/.claude/skills/prolato</code> con i file della skill.
        </p>
      </blockquote>

      <h2>Passo 3: Copia e configura il file di configurazione</h2>
      <p>
        Copia il file di configurazione di esempio nella tua home directory:
      </p>
      <pre><code>cp prolato/skill/prolato/config.example.json ~/.deploy-config.json</code></pre>
      <p>
        Apri il file <code>~/.deploy-config.json</code> con il tuo editor preferito e compila tutti i campi:
      </p>
      <pre><code>{replaceDomain(`{
  "gitea_url": "https://git.tuodominio.dev",
  "gitea_username": "il-tuo-username",
  "gitea_token": "token-api-gitea",
  "gitea_admin_token": "token-admin-gitea",
  "webhook_url": "https://webhook.tuodominio.dev",
  "deploy_token": "token-deploy-dal-file-env",
  "domain": "tuodominio.dev",
  "ssh_key_path": "~/.ssh/deploy_key"
}`)}</code></pre>

      <p>Ecco cosa significa ogni campo:</p>
      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Descrizione</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>gitea_url</code></td>
            <td>{replaceDomain("URL del server Gitea (es. https://git.tuodominio.dev)")}</td>
          </tr>
          <tr>
            <td><code>gitea_username</code></td>
            <td>Il tuo username Gitea (creato durante il setup)</td>
          </tr>
          <tr>
            <td><code>gitea_token</code></td>
            <td>Token API Gitea (generato nel setup, in Impostazioni &rarr; Applicazioni)</td>
          </tr>
          <tr>
            <td><code>gitea_admin_token</code></td>
            <td>Token admin Gitea (necessario per creare account di nuovi utenti)</td>
          </tr>
          <tr>
            <td><code>webhook_url</code></td>
            <td>{replaceDomain("URL del webhook (es. https://webhook.tuodominio.dev)")}</td>
          </tr>
          <tr>
            <td><code>deploy_token</code></td>
            <td>Token di deploy (si trova nel file <code>/opt/webhook/.env</code> sul VPS)</td>
          </tr>
          <tr>
            <td><code>domain</code></td>
            <td>{replaceDomain("Il tuo dominio (es. tuodominio.dev)")}</td>
          </tr>
          <tr>
            <td><code>ssh_key_path</code></td>
            <td>Percorso della chiave SSH (es. <code>~/.ssh/deploy_key</code>)</td>
          </tr>
        </tbody>
      </table>

      <h2>Passo 4: Primo avvio</h2>
      <p>
        Apri Claude Code e invoca la skill per la prima volta:
      </p>
      <pre><code>/prolato</code></pre>
      <p>
        La skill verifichera' la configurazione e ti guidera' nel setup iniziale. Segui le istruzioni a schermo per completare la configurazione.
      </p>

      <h2>Verifica</h2>
      <p>
        Per verificare che la skill sia installata correttamente, invoca il comando <code>/prolato</code> in Claude Code. La skill dovrebbe rispondere senza errori e mostrare le opzioni disponibili.
      </p>
      <p>
        Se ricevi errori, controlla che:
      </p>
      <ul>
        <li>Il file <code>~/.deploy-config.json</code> esista e contenga tutti i campi</li>
        <li>I token siano validi e non scaduti</li>
        <li>{replaceDomain("Il VPS sia raggiungibile (prova con curl https://webhook.tuodominio.dev/health)")}</li>
        <li>La chiave SSH sia configurata correttamente</li>
      </ul>

      <hr />
      <p>
        <Link href="/docs/skill/usage">Prossimo step: Utilizzo della skill &rarr;</Link>
      </p>
    </div>
  );
}
