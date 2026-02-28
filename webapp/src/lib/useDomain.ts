"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const DEFAULT_DOMAIN = "yourdomain.dev";
const STORAGE_KEY = "prolato-domain";

interface DomainContextValue {
  domain: string;
  setDomain: (domain: string) => void;
  resetDomain: () => void;
  replaceDomain: (text: string) => string;
}

export const DomainContext = createContext<DomainContextValue>({
  domain: DEFAULT_DOMAIN,
  setDomain: () => {},
  resetDomain: () => {},
  replaceDomain: (text: string) => text,
});

export function useDomainState() {
  const [domain, setDomainState] = useState(DEFAULT_DOMAIN);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDomainState(stored);
    }
    setHydrated(true);
  }, []);

  const setDomain = useCallback(
    (newDomain: string) => {
      const value = newDomain.trim() || DEFAULT_DOMAIN;
      setDomainState(value);
      if (value === DEFAULT_DOMAIN) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, value);
      }
    },
    []
  );

  const resetDomain = useCallback(() => {
    setDomainState(DEFAULT_DOMAIN);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const replaceDomain = useCallback(
    (text: string): string => {
      if (!hydrated || domain === DEFAULT_DOMAIN) return text;
      return text.replaceAll(DEFAULT_DOMAIN, domain);
    },
    [domain, hydrated]
  );

  return { domain, setDomain, resetDomain, replaceDomain };
}

export function useDomain() {
  return useContext(DomainContext);
}
