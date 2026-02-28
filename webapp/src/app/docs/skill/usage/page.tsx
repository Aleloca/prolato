"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function SkillUsagePage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Utilizzo della Skill</h1>
      <p>
        {replaceDomain(
          "La skill Prolato ti permette di gestire i tuoi progetti su tuodominio.dev direttamente da Claude Code. Ecco tutti i comandi disponibili."
        )}
      </p>

      <h2>Deploy di un progetto</h2>
      <p>
        Per deployare un nuovo progetto, naviga nella cartella del progetto e chiedi a Claude:
      </p>
      <pre><code>{`"deploya questo progetto"`}</code></pre>
      <p>
        Oppure invoca il comando diretto:
      </p>
      <pre><code>/prolato deploy</code></pre>

      <h3>Cosa succede dietro le quinte</h3>
      <ol>
        <li>Claude analizza il progetto per determinare il tipo (statico, Node.js, Docker, ecc.)</li>
        <li>Ti chiede un nome per il progetto (che diventa il sottodominio)</li>
        <li>Crea un repository su Gitea e pusha il codice</li>
        <li>Invia una richiesta al webhook per avviare il deploy</li>
        <li>Il webhook esegue la build e configura Caddy</li>
      </ol>

      <h3>Risultato atteso</h3>
      <p>
        {replaceDomain(
          "Al termine del deploy, Claude ti mostra l'URL del progetto (es. https://nome-progetto.tuodominio.dev) e conferma che il sito e' online."
        )}
      </p>

      <h2>Lista progetti</h2>
      <p>Per vedere tutti i progetti deployati, chiedi a Claude:</p>
      <pre><code>{`"lista i miei progetti"`}</code></pre>

      <h3>Cosa succede dietro le quinte</h3>
      <p>
        Claude interroga il webhook per ottenere l&apos;elenco dei progetti registrati con i relativi URL e stato.
      </p>

      <h3>Risultato atteso</h3>
      <p>
        {replaceDomain(
          "Una lista di tutti i progetti con nome, URL (es. https://nome.tuodominio.dev), tipo di deploy e stato (running/stopped)."
        )}
      </p>

      <h2>Aggiorna un progetto</h2>
      <p>Per ri-deployare un progetto con il codice aggiornato:</p>
      <pre><code>{`"aggiorna progetto nome-progetto"`}</code></pre>

      <h3>Cosa succede dietro le quinte</h3>
      <p>
        Claude pusha le modifiche al repository Gitea e invia una nuova richiesta di deploy al webhook. Il webhook esegue una nuova build con il codice aggiornato.
      </p>

      <h3>Risultato atteso</h3>
      <p>
        Il progetto viene aggiornato con il codice piu' recente. Claude conferma il completamento del deploy e verifica che il sito risponda correttamente.
      </p>

      <h2>Elimina un progetto</h2>
      <p>Per eliminare un progetto deployato:</p>
      <pre><code>{`"elimina progetto nome-progetto"`}</code></pre>

      <h3>Cosa succede dietro le quinte</h3>
      <p>
        Claude chiede conferma prima di procedere. Dopo la conferma, rimuove il container Docker (se presente), la configurazione Caddy e il repository Gitea.
      </p>

      <h3>Risultato atteso</h3>
      <p>
        {replaceDomain(
          "Il progetto viene rimosso completamente. L'URL (es. https://nome.tuodominio.dev) non sara' piu' raggiungibile."
        )}
      </p>

      <blockquote>
        <p>
          <strong>Attenzione:</strong> L&apos;eliminazione di un progetto Docker rimuove anche i volumi associati. Se il progetto ha un database, <strong>tutti i dati verranno persi</strong>. Esegui un backup prima di eliminare un progetto con database.
        </p>
      </blockquote>

      <h2>Rollback</h2>
      <p>Per tornare alla versione precedente di un progetto:</p>
      <pre><code>{`"rollback progetto nome-progetto"`}</code></pre>

      <h3>Cosa succede dietro le quinte</h3>
      <p>
        Claude ripristina la versione precedente del progetto. Il webhook esegue un nuovo deploy utilizzando il codice della versione salvata.
      </p>

      <h3>Risultato atteso</h3>
      <p>
        Il progetto torna alla versione precedente al deploy piu' recente.
      </p>

      <blockquote>
        <p>
          <strong>Nota:</strong> E&apos; disponibile un solo livello di rollback. Il rollback ripristina la versione immediatamente precedente all&apos;ultimo deploy.
        </p>
      </blockquote>

      <h2>Logs</h2>
      <p>Per visualizzare i log di un progetto Docker:</p>
      <pre><code>{`"mostra i log di nome-progetto"`}</code></pre>

      <h3>Cosa succede dietro le quinte</h3>
      <p>
        Claude recupera i log dal container Docker del progetto tramite il webhook.
      </p>

      <h3>Risultato atteso</h3>
      <p>
        Gli ultimi log del container Docker vengono mostrati direttamente nella chat. Utile per il debug e il monitoraggio.
      </p>

      <blockquote>
        <p>
          <strong>Nota:</strong> Questo comando funziona solo per i progetti Docker. I progetti statici non hanno log container.
        </p>
      </blockquote>

      <h2>Stato di un progetto</h2>
      <p>Per controllare lo stato di un progetto:</p>
      <pre><code>{`"stato di nome-progetto"`}</code></pre>

      <h3>Cosa succede dietro le quinte</h3>
      <p>
        Claude interroga il webhook per ottenere lo stato corrente del progetto, incluso lo stato del container Docker (se applicabile).
      </p>

      <h3>Risultato atteso</h3>
      <p>
        Claude mostra se il progetto e' in esecuzione, il tipo di deploy, l&apos;URL e altre informazioni utili come l&apos;uptime.
      </p>

      <hr />
      <p>
        <Link href="/docs/maintenance/backup">Prossimo step: Backup Database &rarr;</Link>
      </p>
    </div>
  );
}
