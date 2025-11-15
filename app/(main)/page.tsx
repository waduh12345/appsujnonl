"use client";

import { ReactNode, useMemo } from "react";
import { User2 } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetParticipantHistoryListQuery } from "@/services/student/tryout.service";
import type { ParticipantHistoryItem } from "@/types/student/tryout";
import { useSession } from "next-auth/react";

const CARD_STYLES = `
  /* Paksa browser mencetak warna & background */
  html, body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .student-card-root,
  .student-card-header,
  .student-card-body,
  .student-card-box,
  .student-card-photo-frame,
  .student-card-idchip,
  .student-card-badge-inner {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .student-card-root {
    width: 100%;
    max-width: 720px;
    border-radius: 18px;
    border: 2px solid #e2e8f0;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial;
    color: #0f172a;
  }

  .student-card-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* HEADER: oranye -> biru seperti logo */
  .student-card-header {
    padding: 18px 22px;
    background: linear-gradient(120deg, #f97316 0%, #f59e0b 24%, #2563eb 68%, #1d4ed8 100%);
    background-color: #2563eb; /* fallback jika gradient di-remove */
    color: #f9fafb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: relative;
  }

  .student-card-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  /* Logo kubus oranye */
  .student-card-logo {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: linear-gradient(135deg, #facc15 0%, #f97316 40%, #ea580c 80%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f172a;
    font-weight: 900;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    box-shadow:
      0 10px 30px rgba(15, 23, 42, 0.55),
      inset 0 0 0 1px rgba(15, 23, 42, 0.4);
  }

  .student-card-school-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .student-card-school-name {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .student-card-exam-name {
    font-size: 9px;
    font-weight: 600;
    opacity: 0.95;
  }

  .student-card-exam-year {
    font-size: 8px;
    opacity: 0.9;
  }

  .student-card-header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  .student-card-exam-tag {
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.26);
    border: 1px solid rgba(254, 249, 195, 0.9);
    font-size: 11px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .student-card-exam-tag-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.35);
  }

  .student-card-header-watermark {
    position: absolute;
    right: -16px;
    bottom: -40px;
    width: 140px;
    height: 140px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 0%, rgba(248, 250, 252, 0.85) 0%, rgba(59, 130, 246, 0.4) 40%, transparent 70%);
    opacity: 0.35;
    pointer-events: none;
  }

  /* BODY: latar lembut oranye + biru */
  .student-card-body {
    padding: 18px 22px 16px 22px;
    background: radial-gradient(130% 140% at 0% 0%, #fff7ed 0%, #ffffff 55%, #e0f2fe 100%);
    background-color: #fff7ed;
  }

  .student-card-box {
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: radial-gradient(120% 120% at 0% 0%, #fffbeb 0%, #ffffff 45%, #eff6ff 100%);
    background-color: #fffbeb;
    padding: 18px 18px 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .student-card-row {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
  }

  .student-card-col-main {
    flex: 1 1 0;
    min-width: 0;
  }

  .student-card-divider {
    height: 1px;
    width: 100%;
    margin-bottom: 8px;
    background: linear-gradient(to right, transparent 0%, #fed7aa 15%, #bfdbfe 85%, transparent 100%);
  }

  .student-card-kv {
    display: grid;
    grid-template-columns: 135px minmax(0, 1fr);
    align-items: baseline;
    gap: 2px;
    margin: 3px 0;
  }

  .student-card-k {
    font-size: 9px;
    color: #6b7280;
  }

  .student-card-v {
    font-size: 9px;
    font-weight: 700;
    color: #111827;
  }

  .student-card-col-side {
    flex: 0 0 auto;
    width: 150px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  /* FRAME FOTO: biru gradient */
  .student-card-photo-frame {
    width: 100px;
    height: 120px;
    border-radius: 18px;
    background: linear-gradient(150deg, #0ea5e9 0%, #2563eb 45%, #1e40af 80%);
    background-color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e5e7eb;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    box-shadow: 0 14px 30px rgba(30, 64, 175, 0.55);
    position: relative;
    overflow: hidden;
  }

  .student-card-photo-frame svg {
    opacity: 0.9;
  }

  .student-card-photo-overlay-label {
    position: absolute;
    bottom: 8px;
    inset-inline: 10px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.65);
    padding: 3px 7px;
    font-size: 10px;
    text-align: center;
  }

  /* CHIP NOMOR PESERTA: oranye + biru */
  .student-card-idchip {
    margin-top: 4px;
    padding: 6px 10px;
    border-radius: 999px;
    background: #fffbeb;
    border: 1px solid #fed7aa;
    font-size: 11px;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .student-card-idchip span {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #9ca3af;
  }

  .student-card-idchip strong {
    font-size: 12px;
    letter-spacing: 0.06em;
    color: #ea580c;
  }

  /* FOOTER */
  .student-card-footer {
    padding: 10px 22px 16px 22px;
    background: #f9fafb;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    border-top: 1px solid #e5e7eb;
  }

  .student-card-note {
    font-size: 8px;
    color: #6b7280;
    max-width: 70%;
  }

  .student-card-signature {
    min-width: 180px;
    text-align: right;
    font-size: 10px;
    color: #6b7280;
  }

  .student-card-signature-label {
    margin-bottom: 22px;
  }

  .student-card-signature-line {
    border-bottom: 1px dashed #9ca3af;
    margin-top: 12px;
  }

  .student-card-badge-bottom {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
  }

  .student-card-badge-inner {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #e0f2fe;
    background-color: #e0f2fe;
    border: 1px solid #bae6fd;
    font-size: 11px;
    color: #0369a1;
    font-weight: 600;
  }

  .student-card-badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #0ea5e9;
  }

  @media (max-width: 640px) {
    .student-card-body {
      padding: 14px 14px 12px 14px;
    }
    .student-card-header {
      padding: 14px 14px;
      flex-direction: column;
      align-items: flex-start;
    }
    .student-card-header-right {
      align-items: flex-start;
    }
    .student-card-row {
      flex-direction: column;
    }
    .student-card-col-side {
      width: 100%;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }
`;

/** ===== Utils ===== */
function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeStyle: "medium",
      timeZone: "Asia/Jakarta",
    }).format(d);
  } catch {
    return iso ?? "—";
  }
}

/** ===== Page ===== */
export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const nameUser = user?.name;
  const emailUser = user?.email;

  // Add student data for the card
  const student = {
    id: user?.id ?? 0,
    nim: "12345", // example NIM, replace with real data
    name: user?.name ?? "—",
    email: user?.email ?? "—",
    class_name: "Class A", // Replace with actual class data
    school_name: "My School", // Replace with actual school name
    session: "Session 1", // Replace with actual session data
    room: "Room 101", // Replace with actual room number
    password: "password123", // Replace with actual password
  };

  // query hanya jalan kalau user ada
  const queryArg =
    user != null
      ? {
          user_id: user.id,
          paginate: 10,
          orderBy: "updated_at" as const,
        }
      : skipToken;

  const {
    data: history,
    isLoading,
    isError,
  } = useGetParticipantHistoryListQuery(queryArg);

  // ambil 5 terbaru
  const latestTop5 = useMemo(() => {
    const items = (history?.data ?? []).slice();
    const ts = (r: ParticipantHistoryItem): number => {
      const pick =
        r.updated_at ?? r.end_date ?? r.start_date ?? r.created_at ?? null;
      return pick ? new Date(pick).getTime() : 0;
    };
    items.sort((a, b) => ts(b) - ts(a));
    return items.slice(0, 5);
  }, [history]);

  const totalHistory = history?.total ?? 0;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border bg-white/80 px-5 py-4 text-center shadow-sm">
          <p className="text-sm text-zinc-700">
            Kamu belum masuk. Silakan login agar data dashboard dapat dimuat
            dari session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 py-6">
        {/* Welcome */}
        <div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white ring-1 ring-sky-200">
                <User2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold md:text-xl">
                  Selamat Datang {nameUser}
                </p>
                <p className="truncate text-sm text-sky-700">{emailUser}</p>
              </div>
            </div>
          </div>

          {/* Kartu Peserta langsung tampil di dashboard */}
          <div className="pt-2">
            {/* Directly using the existing CSS for the card */}
            <style dangerouslySetInnerHTML={{ __html: CARD_STYLES }} />

            {/* Tampilkan kartu siswa langsung */}
            <div className="student-card-root">
              <div className="student-card-inner">
                <div className="student-card-header">
                  <div className="student-card-header-left">
                    <div className="student-card-logo">EDU</div>
                    <div className="student-card-school-block">
                      <div className="student-card-school-name">
                        {student.school_name}
                      </div>
                      <div className="student-card-exam-name">
                        KARTU PESERTA SUMATIF AKHIR TAHUN
                      </div>
                      <div className="student-card-exam-year">
                        Tahun Pelajaran 2023/2024
                      </div>
                    </div>
                  </div>
                  <div className="student-card-header-right">
                    <div className="student-card-exam-tag">
                      <span className="student-card-exam-tag-dot"></span>
                      <span>RESMI • UJIAN SEKOLAH</span>
                    </div>
                  </div>
                </div>

                <div className="student-card-body">
                  <div className="student-card-box">
                    <div className="student-card-row">
                      <div className="student-card-col-main">
                        <div className="student-card-divider"></div>
                        <div className="student-card-kv">
                          <div className="student-card-k">Nama Peserta</div>
                          <div className="student-card-v">{student.name}</div>
                        </div>
                        <div className="student-card-kv">
                          <div className="student-card-k">NIM / NIS</div>
                          <div className="student-card-v">{student.nim}</div>
                        </div>
                        <div className="student-card-kv">
                          <div className="student-card-k">Password Ujian</div>
                          <div className="student-card-v">
                            {student.password}
                          </div>
                        </div>
                        <div className="student-card-kv">
                          <div className="student-card-k">Kelas</div>
                          <div className="student-card-v">
                            {student.class_name}
                          </div>
                        </div>
                        <div className="student-card-kv">
                          <div className="student-card-k">Sesi / Ruang</div>
                          <div className="student-card-v">
                            {student.session} / {student.room}
                          </div>
                        </div>
                        <div className="student-card-kv">
                          <div className="student-card-k">
                            Program / Sekolah
                          </div>
                          <div className="student-card-v">
                            {student.school_name}
                          </div>
                        </div>
                      </div>

                      <div className="student-card-col-side">
                        <div className="student-card-photo-frame">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 10L12 15 2 10l10-5 10 5z"></path>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                          </svg>
                          <div className="student-card-photo-overlay-label">
                            Foto 3x4
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="student-card-footer">
                  <div className="student-card-note">
                    Harap kartu ini dibawa dan ditunjukkan kepada pengawas pada
                    saat ujian berlangsung. Kartu berlaku untuk seluruh
                    rangkaian ujian pada Tahun Pelajaran 2023/2024.
                  </div>
                  <div className="student-card-signature">
                    <div className="student-card-signature-label">
                      Peserta Ujian
                    </div>
                    <div className="student-card-signature-line"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hasil Latihan Terbaru */}
        <div className="rounded-2xl bg-white/80 ring-1 ring-zinc-100 shadow-sm backdrop-blur">
          <div className="border-b border-zinc-100 px-4 py-3 md:px-6">
            <h3 className="font-semibold text-zinc-900">
              Hasil Latihan Terbaru
            </h3>
            <p className="text-xs text-zinc-500">
              Menampilkan {latestTop5.length} aktivitas terakhir
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-sky-50/60 text-zinc-700">
                  <Th>Test</Th>
                  <Th>Mulai</Th>
                  <Th>Selesai</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={`skeleton-${i}`}
                      className={i % 2 ? "bg-zinc-50/40" : "bg-white/50"}
                    >
                      <Td>
                        <div className="h-4 w-56 animate-pulse rounded bg-zinc-200" />
                      </Td>
                      <Td>
                        <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
                      </Td>
                      <Td>
                        <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
                      </Td>
                      <Td>
                        <div className="h-5 w-16 animate-pulse rounded bg-zinc-200" />
                      </Td>
                    </tr>
                  ))}

                {isError && (
                  <tr>
                    <Td colSpan={4}>
                      <span className="text-red-600">Gagal memuat data.</span>
                    </Td>
                  </tr>
                )}

                {!isLoading && !isError && latestTop5.length === 0 && (
                  <tr>
                    <Td colSpan={4}>
                      <span className="text-zinc-600">
                        Belum ada hasil latihan.
                      </span>
                    </Td>
                  </tr>
                )}

                {!isLoading &&
                  !isError &&
                  latestTop5.map((r, i) => {
                    const isDone = !!(r.end_date ?? r.updated_at);
                    return (
                      <tr
                        key={r.id}
                        className={i % 2 ? "bg-zinc-50/40" : "bg-white/50"}
                      >
                        <Td>
                          <span className="inline-flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500/70" />
                            {r.test_details?.title ?? "—"}
                          </span>
                        </Td>
                        <Td>{formatDateTime(r.start_date)}</Td>
                        <Td>
                          {formatDateTime(r.end_date ?? r.updated_at ?? null)}
                        </Td>
                        <Td>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              isDone
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current/70" />
                            {isDone ? "Selesai" : "Sedang dikerjakan"}
                          </span>
                        </Td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ===== UI bits ===== */
function Card({
  tone,
  title,
  value,
  subtitle,
  icon,
}: {
  tone: "sky" | "indigo" | "soft";
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  const theme =
    tone === "sky"
      ? {
          wrap: "bg-sky-100/70 ring-sky-200/70",
          value: "text-sky-700",
          chip: "bg-white/60 text-sky-700 ring-1 ring-white/70",
        }
      : tone === "indigo"
      ? {
          wrap: "bg-indigo-700 text-white ring-indigo-800/60",
          value: "text-white",
          chip: "bg-white/10 text-white/90 ring-1 ring-white/20",
        }
      : {
          wrap: "bg-zinc-100/70 ring-zinc-200/80",
          value: "text-zinc-900",
          chip: "bg-sky-600/10 text-sky-700 ring-1 ring-sky-600/20",
        };

  return (
    <div className={`rounded-2xl p-4 ring-1 shadow-sm ${theme.wrap}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm/5 font-medium opacity-80">{title}</p>
          <div className={`mt-1 text-4xl font-semibold ${theme.value}`}>
            {value}
          </div>
          {subtitle && <p className="mt-1 text-xs opacity-80">{subtitle}</p>}
        </div>
        {icon && <div className={`rounded-xl p-2 ${theme.chip}`}>{icon}</div>}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  description,
  tone = "sky",
}: {
  title: string;
  description: string;
  tone?: "sky" | "indigo" | "zinc";
}) {
  const toneMap: Record<
    typeof tone,
    { wrap: string; title: string; desc: string }
  > = {
    sky: {
      wrap: "bg-sky-50/80 ring-1 ring-sky-100",
      title: "text-sky-900",
      desc: "text-sky-700/80",
    },
    indigo: {
      wrap: "bg-indigo-50/80 ring-1 ring-indigo-100",
      title: "text-indigo-900",
      desc: "text-indigo-700/80",
    },
    zinc: {
      wrap: "bg-zinc-50/80 ring-1 ring-zinc-100",
      title: "text-zinc-900",
      desc: "text-zinc-700/80",
    },
  };

  const t = toneMap[tone];

  return (
    <div className={`rounded-2xl p-4 ${t.wrap}`}>
      <p className={`text-sm font-semibold ${t.title}`}>{title}</p>
      <p className={`mt-1 text-xs leading-relaxed ${t.desc}`}>{description}</p>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  colSpan,
}: {
  children: ReactNode;
  align?: "left" | "right";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 text-zinc-700 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
