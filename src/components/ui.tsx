import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "dark";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  className,
  onClick,
  disabled,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-[color:var(--accent)] text-white shadow-[0_12px_30px_rgba(13,120,148,0.28)] hover:bg-[color:var(--accent-strong)]",
    secondary:
      "border border-[color:var(--border-strong)] bg-white text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]",
    ghost:
      "border border-transparent bg-transparent text-[color:var(--foreground)] hover:bg-[color:var(--surface-muted)]",
    dark:
      "bg-[color:var(--foreground)] text-white hover:bg-slate-800 shadow-[0_16px_40px_rgba(15,39,66,0.28)]",
  } as const;

  const classes = cn(base, variants[variant], className);

  if (href) {
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[24px] border border-[color:var(--border)] bg-white shadow-[0_18px_40px_rgba(15,39,66,0.06)]", className)}>
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-md border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] placeholder:text-slate-400 shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-md border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--foreground)] placeholder:text-slate-400 shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]",
        props.className,
      )}
    />
  );
}

export function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", className)}>
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  align = "left",
}: {
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <h2 className="serif-heading text-3xl font-normal leading-tight text-[color:var(--foreground)] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-3 text-base leading-7 text-[color:var(--muted)]", align === "center" && "mx-auto max-w-2xl")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
}) {
  const tones = {
    neutral: "bg-[color:var(--surface-muted)] text-slate-700 border-[color:var(--border)]",
    success: "bg-emerald-50 text-emerald-900 border-emerald-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    danger: "bg-rose-50 text-rose-900 border-rose-200",
    accent: "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)] border-transparent",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
