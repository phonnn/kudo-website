"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useApi } from "@/providers/app-providers";
import { BrandLink } from "@/components/brand-link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import type { AuthView } from "@/features/auth/types";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const api = useApi();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const isRegistering = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const command = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email")),
      password: String(data.get("password")),
    };

    try {
      let session: AuthView;

      if (isRegistering) {
        session = await api.register(command);
      } else {
        session = await api.login(command);
      }

      localStorage.setItem("goodjob.accessToken", session.accessToken);
      localStorage.setItem("goodjob.refreshToken", session.refreshToken);
      localStorage.setItem("goodjob.user", JSON.stringify(session.user));
      router.replace("/");
    } catch (reason) {
      if (reason instanceof Error) {
        setError(reason.message);
      } else {
        setError("Could not continue.");
      }
    } finally {
      setPending(false);
    }
  }

  let eyebrow = "Welcome back";
  let title = "Sign in to Good Job";
  let description = "Your team’s recognition space is waiting.";
  let passwordMinLength: number | undefined;
  let passwordAutoComplete = "current-password";
  let submitLabel = "Sign in";
  let accountPrompt = "New to Good Job?";
  let accountHref = "/register";
  let accountAction = "Create an account";

  if (isRegistering) {
    eyebrow = "Join your team";
    title = "Create your account";
    description = "Start celebrating great work with your teammates.";
    passwordMinLength = 8;
    passwordAutoComplete = "new-password";
    submitLabel = "Create account";
    accountPrompt = "Already have an account?";
    accountHref = "/login";
    accountAction = "Sign in";
  }

  if (pending) {
    submitLabel = "Please wait…";
  }

  return (
    <main className="auth-page">
      <BrandLink />

      <Surface as="section" className="auth-card">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h1">{title}</Heading>
        <Text>{description}</Text>

        <form onSubmit={submit}>
          {isRegistering && (
            <Field label="Full name">
              <Input
                name="name"
                required
                maxLength={200}
                autoComplete="name"
                placeholder="Alex Morgan"
              />
            </Field>
          )}

          <Field label="Email">
            <Input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
            />
          </Field>

          <Field label="Password">
            <Input
              name="password"
              type="password"
              required
              minLength={passwordMinLength}
              autoComplete={passwordAutoComplete}
              placeholder="At least 8 characters"
            />
          </Field>

          {error && <FormError>{error}</FormError>}

          <Button type="submit" disabled={pending}>
            {submitLabel}
          </Button>
        </form>

        <Text as="small">
          {accountPrompt} <Link href={accountHref}>{accountAction}</Link>
        </Text>
      </Surface>
    </main>
  );
}
