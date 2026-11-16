"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/* Field definitions: each admin editor is described by a list of these.      */
/* -------------------------------------------------------------------------- */

export type Obj = Record<string, unknown>;

type Base = { key: string; label: string; help?: string };

export type FieldDef =
  | { type: "heading"; label: string; help?: string }
  | (Base & {
      type: "text" | "textarea" | "url" | "email" | "number" | "color";
      placeholder?: string;
      rows?: number;
      half?: boolean;
    })
  | (Base & { type: "boolean" })
  | (Base & { type: "tags"; placeholder?: string })
  | (Base & { type: "lines"; addLabel?: string })
  | (Base & { type: "upload"; accept: "image" | "document"; folder: string })
  | (Base & { type: "group"; fields: FieldDef[] })
  | (Base & {
      type: "list";
      fields: FieldDef[];
      itemTitle: (item: Obj) => string;
      itemMeta?: (item: Obj) => string;
      newItem: () => Obj;
      addLabel: string;
    })
  | (Base & { type: "shots"; folder: string });

export const newId = () => crypto.randomUUID().slice(0, 8);

/* -------------------------------------------------------------------------- */
/* Shared bits                                                                 */
/* -------------------------------------------------------------------------- */

export const inputClass =
  "w-full rounded-lg border border-line bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-cyan/60 focus:outline-none focus:ring-2 focus:ring-cyan/20";

const iconBtn =
  "grid size-8 shrink-0 place-items-center rounded-md border border-line text-muted transition-colors hover:bg-white/10 hover:text-ink disabled:pointer-events-none disabled:opacity-30";

const Svg = ({ d }: { d: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
export const UpIcon = () => <Svg d="m6 15 6-6 6 6" />;
export const DownIcon = () => <Svg d="m6 9 6 6 6-6" />;
export const TrashIcon = () => <Svg d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />;
export const PlusIcon = () => <Svg d="M12 5v14M5 12h14" />;

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function Label({ htmlFor, children, help }: { htmlFor?: string; children: ReactNode; help?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {children}
      </label>
      {help && <p className="mt-0.5 text-xs leading-relaxed text-faint">{help}</p>}
    </div>
  );
}

/** Delete button that asks once before acting. */
export function ConfirmDelete({ onConfirm, label }: { onConfirm: () => void; label: string }) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button type="button" className={`${iconBtn} hover:border-red-400/50 hover:text-red-300`} aria-label={`Delete ${label}`} onClick={() => setArmed(true)}>
        <TrashIcon />
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <button
        type="button"
        autoFocus
        className="rounded-md bg-red-500/90 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        Delete
      </button>
      <button type="button" className="rounded-md border border-line px-2.5 py-1.5 text-xs text-muted hover:text-ink" onClick={() => setArmed(false)}>
        Cancel
      </button>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Uploads                                                                     */
/* -------------------------------------------------------------------------- */

async function uploadFile(file: File, folder: string, accept: "image" | "document"): Promise<string> {
  const body = new FormData();
  body.set("file", file);
  body.set("folder", folder);
  body.set("accept", accept);
  const res = await fetch("/admin/api/upload", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { src?: string; error?: string };
  if (!res.ok || !json.src) throw new Error(json.error ?? "Upload failed.");
  return json.src;
}

async function imageSize(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

function UploadField({ def, value, onChange }: { def: Extract<FieldDef, { type: "upload" }>; value: string; onChange: (v: string) => void }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isImage = def.accept === "image";

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadFile(file, def.folder, def.accept));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <Label htmlFor={id} help={def.help}>
        {def.label}
      </Label>
      <div className="flex flex-wrap items-center gap-4">
        {isImage && (
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white/[0.03] text-xs text-faint">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {value ? <img src={value} alt="" className="size-full object-cover" /> : "None"}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <input id={id} className={inputClass} value={value} placeholder={isImage ? "/media/… or https://…" : "/media/… or https://…"} onChange={(e) => onChange(e.target.value)} />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="rounded-md border border-line bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10 disabled:opacity-50">
              {busy ? "Uploading…" : isImage ? "Upload image" : "Upload PDF"}
            </button>
            {value && (
              <>
                <a href={value} target="_blank" rel="noreferrer" className="text-xs text-cyan hover:underline">
                  Open
                </a>
                <button type="button" onClick={() => onChange("")} className="text-xs text-muted hover:text-red-300">
                  Remove
                </button>
              </>
            )}
          </div>
          {error && (
            <p role="alert" className="text-xs text-red-300">
              {error}
            </p>
          )}
        </div>
      </div>
      <input ref={input} type="file" hidden accept={isImage ? "image/png,image/jpeg,image/webp,image/gif,image/avif" : "application/pdf"} onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

type ShotValue = { id: string; src: string; width: number; height: number; caption: string };

function ShotsField({ def, value, onChange }: { def: Extract<FieldDef, { type: "shots" }>; value: ShotValue[]; onChange: (v: ShotValue[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    const added: ShotValue[] = [];
    try {
      for (const file of Array.from(files)) {
        const [src, size] = await Promise.all([uploadFile(file, def.folder, "image"), imageSize(file)]);
        const caption = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        added.push({ id: newId(), src, ...size, caption: caption.charAt(0).toUpperCase() + caption.slice(1) });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      if (added.length) onChange([...value, ...added]);
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <Label help={def.help}>{def.label}</Label>
      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-faint">
          No screenshots yet. The project shows a generated cover until you add one.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {value.map((s, i) => (
            <li key={s.id} className="flex gap-3 rounded-xl border border-line bg-white/[0.02] p-2.5">
              <a href={s.src} target="_blank" rel="noreferrer" className="relative block size-20 shrink-0 overflow-hidden rounded-lg bg-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="" loading="lazy" className="size-full object-cover object-top" />
                {i === 0 && <span className="absolute inset-x-0 bottom-0 bg-violet/90 py-0.5 text-center text-[0.6rem] font-semibold uppercase tracking-wide text-white">Cover</span>}
              </a>
              <div className="min-w-0 flex-1">
                <input
                  aria-label={`Caption for screenshot ${i + 1}`}
                  className={`${inputClass} py-1.5`}
                  value={s.caption}
                  placeholder="Caption"
                  onChange={(e) => onChange(value.map((x) => (x.id === s.id ? { ...x, caption: e.target.value } : x)))}
                />
                <div className="mt-2 flex items-center gap-1.5">
                  <button type="button" className={iconBtn} disabled={i === 0} aria-label="Move earlier" onClick={() => onChange(move(value, i, i - 1))}>
                    <UpIcon />
                  </button>
                  <button type="button" className={iconBtn} disabled={i === value.length - 1} aria-label="Move later" onClick={() => onChange(move(value, i, i + 1))}>
                    <DownIcon />
                  </button>
                  <span className="ml-auto">
                    <ConfirmDelete label={`screenshot ${i + 1}`} onConfirm={() => onChange(value.filter((x) => x.id !== s.id))} />
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10 disabled:opacity-50">
          <PlusIcon />
          {busy ? "Uploading…" : "Upload screenshots"}
        </button>
        {error && (
          <p role="alert" className="text-xs text-red-300">
            {error}
          </p>
        )}
      </div>
      <input ref={input} type="file" hidden multiple accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={(e) => add(e.target.files)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* String lists                                                                */
/* -------------------------------------------------------------------------- */

function TagsField({ def, value, onChange }: { def: Extract<FieldDef, { type: "tags" }>; value: string[]; onChange: (v: string[]) => void }) {
  const id = useId();
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const parts = raw
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p && !value.includes(p));
    if (parts.length) onChange([...value, ...parts]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <Label htmlFor={id} help={def.help}>
        {def.label}
      </Label>
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-line bg-white/[0.03] p-2 focus-within:border-cyan/60 focus-within:ring-2 focus-within:ring-cyan/20">
        {value.map((tag, i) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-line bg-white/5 py-1 pl-2.5 pr-1 font-mono text-xs text-ink">
            {tag}
            <button type="button" aria-label={`Move ${tag} earlier`} disabled={i === 0} className="rounded px-0.5 text-faint hover:text-ink disabled:opacity-30" onClick={() => onChange(move(value, i, i - 1))}>
              ‹
            </button>
            <button type="button" aria-label={`Move ${tag} later`} disabled={i === value.length - 1} className="rounded px-0.5 text-faint hover:text-ink disabled:opacity-30" onClick={() => onChange(move(value, i, i + 1))}>
              ›
            </button>
            <button type="button" aria-label={`Remove ${tag}`} className="grid size-5 place-items-center rounded-full text-faint hover:bg-red-500/20 hover:text-red-300" onClick={() => onChange(value.filter((t) => t !== tag))}>
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft && commit(draft)}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text.includes(",")) {
              e.preventDefault();
              commit(text);
            }
          }}
          placeholder={def.placeholder ?? "Type and press Enter"}
          className="min-w-[10rem] flex-1 bg-transparent px-1.5 py-1 text-sm text-ink placeholder:text-faint focus:outline-none"
        />
      </div>
    </div>
  );
}

function LinesField({ def, value, onChange }: { def: Extract<FieldDef, { type: "lines" }>; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <Label help={def.help}>{def.label}</Label>
      <ul className="space-y-2">
        {value.map((line, i) => (
          <li key={i} className="flex flex-wrap items-start justify-end gap-1.5">
            <textarea
              aria-label={`${def.label} ${i + 1}`}
              rows={Math.min(4, Math.max(1, Math.ceil(line.length / 70)))}
              className={`${inputClass} min-w-0 flex-1 basis-56 resize-y`}
              value={line}
              onChange={(e) => onChange(value.map((l, j) => (j === i ? e.target.value : l)))}
            />
            <button type="button" className={iconBtn} disabled={i === 0} aria-label="Move up" onClick={() => onChange(move(value, i, i - 1))}>
              <UpIcon />
            </button>
            <button type="button" className={iconBtn} disabled={i === value.length - 1} aria-label="Move down" onClick={() => onChange(move(value, i, i + 1))}>
              <DownIcon />
            </button>
            <button type="button" className={`${iconBtn} hover:border-red-400/50 hover:text-red-300`} aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...value, ""])} className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-line px-3 py-2 text-xs font-medium text-muted hover:border-cyan/50 hover:text-ink">
        <PlusIcon />
        {def.addLabel ?? "Add line"}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Lists of objects                                                            */
/* -------------------------------------------------------------------------- */

function ListField({ def, value, onChange }: { def: Extract<FieldDef, { type: "list" }>; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const [open, setOpen] = useState<string | null>(null);

  const add = () => {
    const item = def.newItem();
    onChange([...value, item]);
    setOpen(String(item.id));
  };

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">
            {def.label} <span className="font-mono text-xs font-normal text-faint">({value.length})</span>
          </p>
          {def.help && <p className="mt-0.5 text-xs text-faint">{def.help}</p>}
        </div>
      </div>

      {value.length === 0 && <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-faint">Nothing here yet.</p>}

      <ul className="space-y-2">
        {value.map((item, i) => {
          const id = String(item.id);
          const isOpen = open === id;
          const title = def.itemTitle(item) || "Untitled";
          return (
            <li key={id} className={`rounded-xl border bg-white/[0.02] transition-colors ${isOpen ? "border-violet/50" : "border-line"}`}>
              <div className="flex flex-wrap items-center justify-end gap-2 p-2.5">
                <button type="button" onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 basis-56 items-center gap-3 rounded-md px-1.5 py-1 text-left">
                  <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{title}</span>
                    {def.itemMeta && <span className="block truncate text-xs text-faint">{def.itemMeta(item)}</span>}
                  </span>
                  <span className={`ml-auto shrink-0 text-xs ${isOpen ? "text-cyan" : "text-muted"}`}>{isOpen ? "Close" : "Edit"}</span>
                </button>
                <button type="button" className={iconBtn} disabled={i === 0} aria-label={`Move ${title} up`} onClick={() => onChange(move(value, i, i - 1))}>
                  <UpIcon />
                </button>
                <button type="button" className={iconBtn} disabled={i === value.length - 1} aria-label={`Move ${title} down`} onClick={() => onChange(move(value, i, i + 1))}>
                  <DownIcon />
                </button>
                <ConfirmDelete label={title} onConfirm={() => onChange(value.filter((x) => x.id !== item.id))} />
              </div>
              {isOpen && (
                <div className="border-t border-line p-4">
                  <Fields fields={def.fields} value={item} onChange={(next) => onChange(value.map((x) => (x.id === item.id ? next : x)))} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={add} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-line px-3.5 py-2.5 text-sm font-medium text-muted hover:border-cyan/50 hover:text-ink">
        <PlusIcon />
        {def.addLabel}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Renderer                                                                    */
/* -------------------------------------------------------------------------- */

function SimpleField({ def, value, onChange }: { def: Extract<FieldDef, { type: "text" | "textarea" | "url" | "email" | "number" | "color" }>; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  const common = { id, className: inputClass, placeholder: def.placeholder };

  return (
    <div>
      <Label htmlFor={id} help={def.help}>
        {def.label}
      </Label>
      {def.type === "textarea" ? (
        <textarea {...common} rows={def.rows ?? 3} className={`${inputClass} resize-y`} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      ) : def.type === "number" ? (
        <input {...common} type="number" min={0} value={Number.isFinite(value as number) ? (value as number) : 0} onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(0, Math.round(Number(e.target.value))))} />
      ) : def.type === "color" ? (
        <div className="flex items-center gap-2">
          <input type="color" aria-label={`${def.label} picker`} className="size-10 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent p-1" value={/^#[0-9a-fA-F]{6}$/.test(String(value)) ? String(value) : "#000000"} onChange={(e) => onChange(e.target.value)} />
          <input {...common} className={`${inputClass} font-mono`} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </div>
      ) : (
        <input {...common} type={def.type === "email" ? "email" : def.type === "url" ? "url" : "text"} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export function Fields({ fields, value, onChange }: { fields: FieldDef[]; value: Obj; onChange: (next: Obj) => void }) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
      {fields.map((def, index) => {
        if (def.type === "heading") {
          return (
            <div key={`h-${index}`} className={`sm:col-span-2 ${index > 0 ? "mt-3 border-t border-line pt-6" : ""}`}>
              <h3 className="font-display text-lg font-semibold">{def.label}</h3>
              {def.help && <p className="mt-1 text-sm text-muted">{def.help}</p>}
            </div>
          );
        }

        const v = value[def.key];
        const half = "half" in def && def.half;
        let node: ReactNode;

        switch (def.type) {
          case "boolean":
            node = (
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white/[0.02] px-3.5 py-3">
                <input type="checkbox" className="mt-0.5 size-4 accent-violet-500" checked={Boolean(v)} onChange={(e) => set(def.key, e.target.checked)} />
                <span>
                  <span className="block text-sm font-medium text-ink">{def.label}</span>
                  {def.help && <span className="mt-0.5 block text-xs text-faint">{def.help}</span>}
                </span>
              </label>
            );
            break;
          case "tags":
            node = <TagsField def={def} value={(v as string[]) ?? []} onChange={(n) => set(def.key, n)} />;
            break;
          case "lines":
            node = <LinesField def={def} value={(v as string[]) ?? []} onChange={(n) => set(def.key, n)} />;
            break;
          case "upload":
            node = <UploadField def={def} value={String(v ?? "")} onChange={(n) => set(def.key, n)} />;
            break;
          case "shots":
            node = <ShotsField def={def} value={(v as ShotValue[]) ?? []} onChange={(n) => set(def.key, n)} />;
            break;
          case "list":
            node = <ListField def={def} value={(v as Obj[]) ?? []} onChange={(n) => set(def.key, n)} />;
            break;
          case "group":
            node = (
              <fieldset className="min-w-0 rounded-xl border border-line p-4">
                <legend className="px-1.5 text-sm font-medium text-ink">{def.label}</legend>
                {def.help && <p className="-mt-1 mb-4 text-xs text-faint">{def.help}</p>}
                <Fields fields={def.fields} value={(v as Obj) ?? {}} onChange={(n) => set(def.key, n)} />
              </fieldset>
            );
            break;
          default:
            node = <SimpleField def={def} value={v} onChange={(n) => set(def.key, n)} />;
        }

        return (
          <div key={def.key} className={`min-w-0 ${half ? "" : "sm:col-span-2"}`}>
            {node}
          </div>
        );
      })}
    </div>
  );
}
