"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          aria-describedby={state?.error ? "login-error" : undefined}
          className="w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-ink focus:border-cyan/60 focus:outline-none focus:ring-2 focus:ring-cyan/25"
        />
      </div>
      {state?.error && (
        <p id="login-error" role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-accent w-full rounded-full px-5 py-3 text-sm font-semibold text-bg disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
