"use client";

import { useDomain } from "@/lib/useDomain";

export default function OverviewPage() {
  const { replaceDomain } = useDomain();

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
        Introduzione
      </h1>
      <p className="mb-6 text-lg leading-relaxed text-slate-300">
        {replaceDomain(
          "Prolato è una piattaforma self-hosted per il deploy automatico di progetti web. Configura il tuo server su tuodominio.dev e inizia a deployare con un singolo comando."
        )}
      </p>
      <p className="text-slate-400">
        {replaceDomain(
          "Questa guida ti accompagnerà nella configurazione completa del server, dall'acquisto del dominio tuodominio.dev fino al primo deploy."
        )}
      </p>
    </div>
  );
}
