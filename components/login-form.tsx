"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        id="email"
        name="email"
        label="Operator Email"
        type="email"
        autoComplete="username"
        defaultValue="dhruv@target.com"
        placeholder="you@target.com"
        icon={
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Passcode
          </label>
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 transition hover:text-[color:var(--accent)]"
          >
            {show ? "hide" : "show"}
          </button>
        </div>
        <div className="group relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500 transition group-focus-within:text-[color:var(--accent)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••"
            className="w-full rounded-lg border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[color:var(--accent)]/60 focus:ring-2 focus:ring-[color:var(--accent)]/30"
          />
        </div>
      </div>

      {state.error && (
        <p className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-[color:var(--accent)]/40 bg-gradient-to-r from-[color:var(--accent)]/20 via-[color:var(--accent-2)]/20 to-[color:var(--accent)]/20 px-4 py-3 text-sm font-medium text-white transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <span className="relative z-10">{pending ? "Authenticating…" : "Enter Console"}</span>
        <svg
          className="relative z-10 h-4 w-4 transition group-hover:translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        <a className="transition hover:text-zinc-300" href="#">
          Reset passcode
        </a>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 dot-pulse" />
          Edge link · stable
        </span>
      </div>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
  icon,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </label>
      <div className="group relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500 transition group-focus-within:text-[color:var(--accent)]">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-white/10 bg-black/40 py-3 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[color:var(--accent)]/60 focus:ring-2 focus:ring-[color:var(--accent)]/30 ${
            icon ? "pl-10" : "pl-4"
          }`}
        />
      </div>
    </div>
  );
}
