import type { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-control border border-line bg-white px-3 py-2 text-[11px] font-extrabold text-text shadow-soft transition hover:-translate-y-px hover:shadow-hover disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn('rounded-card border border-line bg-card shadow-card', className)} {...props} />;
}

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-pill border border-line bg-soft px-2 py-1 text-[9px] font-black uppercase tracking-[.06em] text-muted', className)} {...props} />;
}

export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return <div className="mb-3 flex items-end justify-between gap-3"><div><h3 className="text-[13px] font-black text-ink">{title}</h3>{detail && <p className="mt-1 text-[10px] font-semibold text-muted">{detail}</p>}</div></div>;
}

export function EmptyState({ children }: PropsWithChildren) {
  return <div className="rounded-control border border-dashed border-line bg-soft px-4 py-8 text-center text-[11px] font-bold text-muted">{children}</div>;
}
