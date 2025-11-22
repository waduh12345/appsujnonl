"use client";

import { ReactNode, useMemo } from "react";
import { User2 } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetParticipantHistoryListQuery } from "@/services/student/tryout.service";
import type { ParticipantHistoryItem } from "@/types/student/tryout";
import { useSession } from "next-auth/react";
import { displayDate } from "@/lib/format-utils";

const CARD_STYLES = `
  /* ===================== BASE & PRINT ===================== */
  html, body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .student-card-root, .student-card-header, .student-card-body, .student-card-box, .student-card-photo-frame, .student-card-idchip, .student-card-badge-inner {
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
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12); /* Adjusted shadow */
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial;
    color: #0f172a;
  }
  .student-card-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* ===================== HEADER ===================== */
  .student-card-header {
    padding: 16px 20px; /* Reduced padding */
    background: linear-gradient(120deg, #006400 0%, #228b22 100%);  /* Hijau gelap dan terang */
    background-color: #006400;
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
    gap: 12px; /* Adjusted gap */
  }
  .student-card-logo {
    width: 48px; /* Reduced size */
    height: 48px; /* Reduced size */
    border-radius: 12px; /* Adjusted border radius */
    background: linear-gradient(135deg, #52b788 0%, #004d00 40%, #006400 80%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f172a;
    font-weight: 900;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.45); /* Adjusted shadow */
  }
  .student-card-school-block {
    display: flex;
    flex-direction: column;
    gap: 1px; /* Reduced gap */
  }
  .student-card-school-name {
    font-size: 13px; /* Reduced font size */
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .student-card-exam-name {
    font-size: 8px; /* Reduced font size */
    font-weight: 600;
    opacity: 0.95;
  }
  .student-card-exam-year {
    font-size: 7px; /* Reduced font size */
    opacity: 0.9;
  }
  .student-card-header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px; /* Reduced gap */
  }
  .student-card-exam-tag {
    padding: 3px 8px; /* Reduced padding */
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.26);
    border: 1px solid rgba(254, 249, 195, 0.9);
    font-size: 10px; /* Reduced font size */
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px; /* Reduced gap */
  }
  .student-card-exam-tag-dot {
    width: 6px; /* Reduced size */
    height: 6px; /* Reduced size */
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.25); /* Adjusted shadow */
  }

  /* ===================== BODY ===================== */
  .student-card-body {
    padding: 16px 20px 14px 20px; /* Reduced padding */
    background: #e2f3e2;  /* Latar hijau muda */
  }
  .student-card-box {
    border-radius: 14px; /* Adjusted border radius */
    border: 1px solid #e5e7eb;
    background: radial-gradient(120% 120% at 0% 0%, #fffbeb 0%, #ffffff 45%, #eff6ff 100%);
    background-color: #fffbeb;
    padding: 16px 16px 12px 16px; /* Reduced padding */
    display: flex;
    flex-direction: column;
    gap: 10px; /* Reduced gap */
  }
  .student-card-row {
    display: flex;
    flex-wrap: nowrap; /* Prevent wrap by default */
    gap: 16px; /* Reduced gap */
  }
  .student-card-col-main {
    flex: 1 1 0;
    min-width: 0;
  }
  .student-card-divider {
    height: 1px;
    width: 100%;
    margin-bottom: 6px; /* Reduced margin */
    background: linear-gradient(to right, transparent 0%, #fed7aa 15%, #bfdbfe 85%, transparent 100%);
  }
  .student-card-kv {
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr); /* Reduced label width */
    align-items: baseline;
    gap: 1px;
    margin: 2px 0; /* Reduced margin */
  }
  .student-card-k {
    font-size: 8px; /* Reduced font size */
    color: #6b7280;
  }
  .student-card-v {
    font-size: 8px; /* Reduced font size */
    font-weight: 700;
    color: #111827;
  }
  .student-card-col-side {
    flex: 0 0 auto;
    width: 120px; /* Adjusted width */
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px; /* Reduced gap */
  }
  .student-card-photo-frame {
    width: 85px; /* Reduced size */
    height: 105px; /* Reduced size */
    border-radius: 16px; /* Adjusted border radius */
    background: linear-gradient(150deg, #006400 0%, #228b22 45%);  /* Hijau gelap dan terang */
    background-color: #006400;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e5e7eb;
    font-size: 10px; /* Reduced font size */
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    box-shadow: 0 10px 20px rgba(30, 64, 175, 0.45); /* Adjusted shadow */
    position: relative;
    overflow: hidden;
  }
  .student-card-photo-frame svg {
    width: 30px; /* Reduced size */
    height: 30px; /* Reduced size */
    opacity: 0.9;
  }
  .student-card-photo-overlay-label {
    position: absolute;
    bottom: 6px; /* Adjusted position */
    inset-inline: 8px; /* Adjusted position */
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.65);
    padding: 2px 5px; /* Reduced padding */
    font-size: 8px; /* Reduced font size */
    text-align: center;
  }
  .student-card-idchip {
    margin-top: 2px; /* Reduced margin */
    padding: 5px 8px; /* Reduced padding */
    border-radius: 999px;
    background: #fffbeb;
    border: 1px solid #fed7aa;
    font-size: 10px; /* Reduced font size */
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }
  .student-card-idchip span {
    font-size: 9px; /* Reduced font size */
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #9ca3af;
  }
  .student-card-idchip strong {
    font-size: 11px; /* Reduced font size */
    letter-spacing: 0.05em;
    color: #ea580c;
  }

  /* ===================== FOOTER ===================== */
  .student-card-footer {
    padding: 8px 20px 14px 20px; /* Reduced padding */
    background: #f9fafb;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px; /* Reduced gap */
    border-top: 1px solid #e5e7eb;
  }
  .student-card-note {
    font-size: 7px; /* Reduced font size */
    color: #6b7280;
    max-width: 65%; /* Adjusted width */
  }
  .student-card-signature {
    min-width: 140px; /* Reduced width */
    text-align: right;
    font-size: 9px; /* Reduced font size */
    color: #6b7280;
  }
  .student-card-signature-label {
    margin-bottom: 18px; /* Reduced margin */
  }
  .student-card-signature-line {
    border-bottom: 1px dashed #9ca3af;
    margin-top: 10px; /* Reduced margin */
  }

  /* ===================== MOBILE RESPONSIVENESS (<= 640px) ===================== */
  @media (max-width: 640px) {
    .student-card-root {
        border-radius: 12px;
        box-shadow: 0 6px 15px rgba(15, 23, 42, 0.08);
    }
    .student-card-header {
      padding: 12px 14px;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .student-card-header-left {
        gap: 10px;
    }
    .student-card-logo {
        width: 40px;
        height: 40px;
        border-radius: 10px;
    }
    .student-card-school-name {
        font-size: 11px;
    }
    .student-card-header-right {
      align-items: flex-start;
    }
    .student-card-header-watermark {
        display: none;
    }

    .student-card-body {
      padding: 12px;
    }
    .student-card-box {
        padding: 12px;
        border-radius: 12px;
    }
    .student-card-row {
      flex-direction: column; /* Stack main and side column */
      gap: 10px;
    }
    .student-card-col-side {
      width: 100%;
      flex-direction: row-reverse; /* Put photo on the right */
      align-items: flex-start; /* Align elements to start of row */
      justify-content: space-between;
    }
    .student-card-photo-frame {
        width: 75px;
        height: 95px;
        margin-left: 0;
    }
    .student-card-idchip {
        margin-top: 0;
        align-items: flex-start;
    }
    .student-card-divider {
        margin-bottom: 4px;
    }

    .student-card-footer {
      padding: 8px 14px 12px 14px;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .student-card-note {
        max-width: 100%;
        font-size: 8px;
    }
    .student-card-signature {
        width: 100%;
        text-align: left;
    }
  }
`;

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const nameUser = user?.name;
  const emailUser = user?.email;

  // Data siswa dummy/placeholder:
  const student = {
    id: user?.id ?? 0,
    nim: "12345678",
    name: user?.name ?? "Nama Peserta",
    email: user?.email ?? "email@example.com",
    class_name: "XII IPA 1",
    school_name: "MA Miftahululum Bettet Pamekasan",
    session: "Sesi 1",
    room: "R. 101",
    password: "PASS123",
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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
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
    <div className="min-h-screen p-4 md:p-0">
      {" "}
      {/* Tambahkan padding di mobile */}
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 py-6">
        {/* Welcome Header */}
        <div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-grid h-10 w-10 place-items-center rounded-xl bg-sky-500 text-white ring-1 ring-sky-200">
                <User2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold md:text-xl">
                  Selamat Datang {nameUser} 👋
                </p>
                <p className="truncate text-sm text-sky-700">{emailUser}</p>
              </div>
            </div>
          </div>

          {/* Kartu Peserta langsung tampil di dashboard */}
          <div className="pt-4">
            <h2 className="text-lg font-semibold mb-3">Kartu Peserta Ujian</h2>
            <style dangerouslySetInnerHTML={{ __html: CARD_STYLES }} />
            {/* Student Card Component */}
            <div className="student-card-root">
              <div className="student-card-inner">
                <div className="student-card-header">
                  <div className="student-card-header-left">
                    <div className="student-card-logo">
                      <img
                        src="/masbettet-logo.webp"
                        alt="Logo"
                        width="52"
                        height="52"
                      />
                    </div>
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
                  <Th align="left">Test</Th>
                  <Th align="left" className="hidden sm:table-cell">
                    Mulai
                  </Th>
                  <Th align="left" className="hidden sm:table-cell">
                    Selesai
                  </Th>
                  <Th align="left">Status</Th>
                </tr>
              </thead>
              <tbody>
                {/* Skeleton Loading */}
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={`skeleton-${i}`}
                      className={i % 2 ? "bg-zinc-50/40" : "bg-white/50"}
                    >
                      <Td>
                        <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
                      </Td>
                      <Td className="hidden sm:table-cell">
                        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
                      </Td>
                      <Td className="hidden sm:table-cell">
                        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
                      </Td>
                      <Td>
                        <div className="h-5 w-16 animate-pulse rounded bg-zinc-200" />
                      </Td>
                    </tr>
                  ))}

                {/* Error/No Data States */}
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

                {/* Data Rows */}
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
                          {/* Tampilkan waktu mulai di mobile */}
                          <div className="text-xs text-zinc-500 mt-0.5 sm:hidden">
                            {displayDate(r.start_date)}
                          </div>
                        </Td>
                        <Td className="hidden sm:table-cell">
                          {displayDate(r.start_date)}
                        </Td>
                        <Td className="hidden sm:table-cell">
                          {displayDate(r.end_date ?? r.updated_at ?? null)}
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
                            {isDone ? "Selesai" : "Proses"}
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

/** ===== UI bits (Adjusted for responsiveness) ===== */

// New Th/Td component to integrate Tailwind classes easier
function Th({
  children,
  align = "left",
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  colSpan,
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  colSpan?: number;
  className?: string;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 text-zinc-700 align-top ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}