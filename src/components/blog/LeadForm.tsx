"use client";

import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import {
  blogLeadSchema,
  type BlogLeadInput,
} from "@app/lib/validations/blog-lead";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Status = "idle" | "submitting" | "success" | "error" | "rate_limited";

const blank = (value: string | undefined) => (value && value.trim() ? value.trim() : undefined);

/**
 * Counselling request form. Posts to /api/blog-leads. The hidden "website"
 * field catches bots: real visitors never see or fill it.
 */
export function LeadForm({
  sourceSlug,
  variant = "card",
}: {
  sourceSlug: string;
  variant?: "card" | "plain";
}) {
  const uid = useId();
  const honeypot = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlogLeadInput>({
    resolver: zodResolver(blogLeadSchema),
    defaultValues: { email: "", name: "", phone: "", message: "" },
  });

  async function onSubmit(values: BlogLeadInput) {
    setStatus("submitting");
    const params = new URLSearchParams(window.location.search);

    const response = await fetch("/api/blog-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        name: blank(values.name),
        phone: blank(values.phone),
        message: blank(values.message),
        sourceSlug,
        sourceUrl: `${window.location.origin}${window.location.pathname}`,
        utmSource: params.get("utm_source") ?? undefined,
        utmMedium: params.get("utm_medium") ?? undefined,
        utmCampaign: params.get("utm_campaign") ?? undefined,
        website: honeypot.current?.value ?? "",
      }),
    });

    if (response.status === 429) {
      setStatus("rate_limited");
      return;
    }
    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    window.gtag?.("event", "generate_lead", { source_slug: sourceSlug });
  }

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3 py-6 text-center"
      >
        <CheckCircle2 aria-hidden="true" className="size-10 text-emerald-600" />
        <p className="font-semibold text-gray-900">
          Thanks! A counsellor will be in touch soon.
        </p>
      </div>
    );
  }

  const wrapper =
    variant === "card" ? "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" : "";
  const emailError = errors.email?.message;
  const emailErrorId = `${uid}-email-error`;

  return (
    <div className={wrapper}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <GraduationCap aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Get free counselling</h3>
          <p className="text-sm text-gray-600">
            Talk to an expert about universities, costs and visas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-email`}>
            Email <span aria-hidden="true" className="text-red-600">*</span>
          </Label>
          <Input
            id={`${uid}-email`}
            type="email"
            autoComplete="email"
            aria-invalid={emailError ? "true" : undefined}
            aria-describedby={emailError ? emailErrorId : undefined}
            className="h-10 rounded-lg"
            {...register("email")}
          />
          {emailError && (
            <p id={emailErrorId} className="text-sm text-red-600">
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-name`}>Name</Label>
          <Input
            id={`${uid}-name`}
            autoComplete="name"
            className="h-10 rounded-lg"
            {...register("name")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-phone`}>Phone</Label>
          <Input
            id={`${uid}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="h-10 rounded-lg"
            {...register("phone")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-message`}>Message</Label>
          <Textarea
            id={`${uid}-message`}
            rows={3}
            className="rounded-lg"
            {...register("message")}
          />
        </div>

        {/* Honeypot: off-screen and skipped by keyboard. Bots fill it; people do not. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input
              ref={honeypot}
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>

        {status === "error" && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Something went wrong. Please try again.
          </p>
        )}
        {status === "rate_limited" && (
          <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Too many attempts — please try again in a few minutes.
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || status === "submitting"}
          className="h-11 w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {status === "submitting" ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Request a callback"
          )}
        </Button>

        <p className="text-center text-xs text-gray-500">We&apos;ll never share your details.</p>
      </form>
    </div>
  );
}
