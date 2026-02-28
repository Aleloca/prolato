"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function DnsPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>1. DNS e Dominio</h1>
      <p>
        {replaceDomain(
          "In questo step configurerai il dominio tuodominio.dev e i record DNS su Cloudflare, in modo che il traffico venga indirizzato correttamente alla tua VPS."
        )}
      </p>

      <h2>Prerequisiti</h2>
      <ul>
        <li>Un dominio registrato (puoi acquistarne uno da qualsiasi registrar)</li>
        <li>L&apos;indirizzo IP della tua VPS</li>
      </ul>

      <h2>Step 1: Registra un account Cloudflare</h2>
      <p>
        Se non hai ancora un account Cloudflare, registrati gratuitamente su{" "}
        <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noopener noreferrer">
          dash.cloudflare.com/sign-up
        </a>
        . Il piano gratuito e' sufficiente per Prolato.
      </p>

      <h2>Step 2: Aggiungi il dominio a Cloudflare</h2>
      <p>
        {replaceDomain(
          "Dalla dashboard Cloudflare, clicca \"Add a site\" e inserisci tuodominio.dev. Seleziona il piano Free e prosegui."
        )}
      </p>
      <p>
        Cloudflare ti mostrera' i nameserver da configurare. Prendi nota dei due nameserver assegnati (ad esempio <code>ada.ns.cloudflare.com</code> e <code>bill.ns.cloudflare.com</code>).
      </p>

      <h2>Step 3: Aggiorna i nameserver sul registrar</h2>
      <p>
        Vai nel pannello del tuo registrar (dove hai acquistato il dominio) e sostituisci i nameserver esistenti con quelli forniti da Cloudflare. La propagazione puo' richiedere fino a 24 ore, ma di solito avviene in pochi minuti.
      </p>
      <blockquote>
        <p>
          Dopo questo step dovresti ricevere un&apos;email da Cloudflare che conferma che il dominio e' attivo.
        </p>
      </blockquote>

      <h2>Step 4: Crea i record DNS</h2>
      <p>
        {replaceDomain(
          "Nella sezione DNS di Cloudflare, crea i seguenti record A puntando all'IP della tua VPS (sostituisci 203.0.113.1 con il tuo IP reale):"
        )}
      </p>

      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Nome</th>
            <th>Contenuto</th>
            <th>Proxy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A</td>
            <td>{replaceDomain("tuodominio.dev")}</td>
            <td>203.0.113.1</td>
            <td>DNS only</td>
          </tr>
          <tr>
            <td>A</td>
            <td>{replaceDomain("*.tuodominio.dev")}</td>
            <td>203.0.113.1</td>
            <td>DNS only</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Importante:</strong> imposta il proxy su <strong>DNS only</strong> (icona grigia, non arancione). Caddy gestira' direttamente HTTPS e non serve il proxy Cloudflare.
      </p>

      <p>
        {replaceDomain(
          "Il record wildcard (*.tuodominio.dev) permette di creare automaticamente sottodomini per ogni progetto che deployi, senza dover aggiungere record DNS manualmente."
        )}
      </p>

      <blockquote>
        <p>
          {replaceDomain(
            "Dopo questo step dovresti vedere i record A nella dashboard DNS di Cloudflare per tuodominio.dev e *.tuodominio.dev."
          )}
        </p>
      </blockquote>

      <h2>Step 5: Crea un API Token Cloudflare</h2>
      <p>
        Caddy ha bisogno di un token API per generare certificati SSL tramite DNS challenge. Ecco come crearlo:
      </p>
      <ol>
        <li>Vai su <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer">Cloudflare → Profile → API Tokens</a></li>
        <li>Clicca <strong>Create Token</strong></li>
        <li>Seleziona il template <strong>Edit zone DNS</strong></li>
        <li>Nella sezione <strong>Permissions</strong>, verifica che ci sia: <code>Zone &gt; DNS &gt; Edit</code></li>
        <li>{replaceDomain("Nella sezione Zone Resources, seleziona: Include > Specific zone > tuodominio.dev")}</li>
        <li>Clicca <strong>Continue to summary</strong> e poi <strong>Create Token</strong></li>
        <li>Copia il token generato e salvalo in un posto sicuro &mdash; ti servira' durante la configurazione di Caddy</li>
      </ol>

      <blockquote>
        <p>
          Dopo questo step dovresti avere un token API Cloudflare che inizia con una stringa alfanumerica. Puoi verificarlo con:
        </p>
      </blockquote>
      <pre><code>{replaceDomain(`curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \\
  -H "Authorization: Bearer IL_TUO_TOKEN" \\
  -H "Content-Type: application/json"`)}</code></pre>
      <p>
        Dovresti ricevere una risposta con <code>&quot;status&quot;: &quot;active&quot;</code>.
      </p>

      <h2>Step 6: Verifica la propagazione DNS</h2>
      <p>
        {replaceDomain(
          "Verifica che i record DNS siano propagati correttamente usando il comando dig:"
        )}
      </p>
      <pre><code>{replaceDomain(`dig +short tuodominio.dev
dig +short git.tuodominio.dev
dig +short webhook.tuodominio.dev`)}</code></pre>
      <p>
        Tutti e tre i comandi devono restituire l&apos;IP della tua VPS. Se non vedi risultati, attendi qualche minuto e riprova.
      </p>

      <blockquote>
        <p>
          Dopo questo step dovresti vedere l&apos;IP della tua VPS come risposta a tutti i comandi <code>dig</code>.
        </p>
      </blockquote>

      <h2>Troubleshooting</h2>
      <h3>Il comando dig non restituisce risultati</h3>
      <p>
        La propagazione DNS puo' richiedere fino a 24 ore. Se dopo 30 minuti non vedi risultati, verifica di aver salvato i record nella dashboard Cloudflare e che i nameserver siano stati aggiornati sul registrar.
      </p>

      <h3>dig restituisce un IP diverso</h3>
      <p>
        Verifica che il proxy Cloudflare sia disattivato (icona grigia &quot;DNS only&quot;). Se e' attivo (icona arancione), <code>dig</code> restituira' gli IP di Cloudflare anziche' quello della tua VPS.
      </p>

      <h3>Il token API non funziona</h3>
      <p>
        {replaceDomain(
          "Verifica che il token abbia i permessi corretti (Zone > DNS > Edit) e che sia stato configurato per la zona corretta (tuodominio.dev)."
        )}
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/vps">Prossimo step: Server VPS →</Link>
      </p>
    </div>
  );
}
