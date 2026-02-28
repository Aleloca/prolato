"use client";

import Link from "next/link";
import { useDomain } from "@/lib/useDomain";

export default function OverviewPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1>Introduzione a Prolato</h1>
      <p>
        {replaceDomain(
          "Prolato e' una piattaforma self-hosted per il deploy automatico di progetti web. Con Prolato puoi configurare il tuo server su tuodominio.dev e deployare applicazioni con un singolo comando, direttamente dal tuo editor."
        )}
      </p>

      <h2>Cos&apos;e' Prolato</h2>
      <p>
        Prolato automatizza l&apos;intero ciclo di vita del deploy: dalla creazione del repository Git, alla build Docker, fino alla configurazione automatica di HTTPS tramite reverse proxy. Tutto sul tuo server, sotto il tuo controllo.
      </p>
      <p>Le caratteristiche principali sono:</p>
      <ul>
        <li><strong>Deploy automatico</strong> &mdash; push sul repository e il deploy parte in automatico</li>
        <li><strong>HTTPS automatico</strong> &mdash; certificati SSL gestiti da Caddy con Let&apos;s Encrypt</li>
        <li><strong>Self-hosted</strong> &mdash; i tuoi dati restano sul tuo server</li>
        <li><strong>Integrazione Claude Code</strong> &mdash; una skill dedicata per gestire i deploy dall&apos;editor</li>
      </ul>

      <h2>Architettura</h2>
      <p>
        {replaceDomain(
          "L'infrastruttura Prolato si compone di 4 componenti principali, tutti installati sulla stessa VPS con tuodominio.dev:"
        )}
      </p>
      <ol>
        <li>
          {replaceDomain(
            "<strong>Caddy</strong> — reverse proxy e server web che gestisce HTTPS automatico per tuodominio.dev e tutti i sottodomini. Genera e rinnova i certificati SSL tramite Cloudflare DNS challenge."
          )}
        </li>
        <li>
          {replaceDomain(
            "<strong>Gitea</strong> — server Git leggero accessibile su git.tuodominio.dev. Ospita i repository dei tuoi progetti e notifica il webhook ad ogni push."
          )}
        </li>
        <li>
          <strong>Docker</strong> &mdash; runtime per i container. Ogni progetto viene buildato come immagine Docker e avviato come container isolato.
        </li>
        <li>
          {replaceDomain(
            "<strong>Webhook Server</strong> — servizio Node.js su webhook.tuodominio.dev che riceve le notifiche da Gitea, esegue la build Docker e configura Caddy per servire il nuovo progetto."
          )}
        </li>
      </ol>

      <h2>Cosa ti serve</h2>
      <p>Prima di iniziare, assicurati di avere:</p>
      <ul>
        <li><strong>Una VPS</strong> con Ubuntu 22.04 o superiore (minimo 1 GB RAM, 20 GB disco)</li>
        <li><strong>Un dominio</strong> registrato (puoi acquistarne uno da qualsiasi registrar)</li>
        <li><strong>Un account Cloudflare</strong> (piano gratuito) per la gestione DNS e i certificati SSL</li>
        <li><strong>Accesso SSH</strong> al server come utente root</li>
      </ul>

      <h2>Come e' organizzata la guida</h2>
      <p>
        La configurazione e' suddivisa in <strong>7 step</strong>, pensati per essere seguiti in ordine:
      </p>
      <ol>
        <li><Link href="/docs/setup/dns">DNS e Dominio</Link> &mdash; configura il dominio e Cloudflare</li>
        <li><Link href="/docs/setup/vps">Server VPS</Link> &mdash; prepara il server con utente e pacchetti base</li>
        <li><Link href="/docs/setup/caddy">Caddy</Link> &mdash; installa il reverse proxy con supporto Cloudflare</li>
        <li><Link href="/docs/setup/gitea">Gitea</Link> &mdash; installa il server Git</li>
        <li><Link href="/docs/setup/docker">Docker</Link> &mdash; installa Docker e Node.js</li>
        <li><Link href="/docs/setup/webhook">Webhook</Link> &mdash; installa il server webhook per il deploy automatico</li>
        <li><Link href="/docs/setup/verify">Verifica</Link> &mdash; controlla che tutto funzioni correttamente</li>
      </ol>

      <h2>Tempo stimato</h2>
      <p>
        L&apos;intera configurazione richiede circa <strong>30 minuti</strong> se hai gia' la VPS e il dominio pronti. Se parti da zero (acquisto dominio + VPS), prevedi circa 1 ora.
      </p>

      <hr />
      <p>
        <Link href="/docs/setup/dns">Inizia dal primo step: DNS e Dominio →</Link>
      </p>
    </div>
  );
}
