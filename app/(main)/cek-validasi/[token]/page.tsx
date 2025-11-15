import CekValidasiClient from "./client";
import { decryptKtaToken } from "@/lib/kta-url";

export const runtime = "nodejs";

function pickSecret(): string {
  const s1 = (process.env.KTA_URL_SECRET ?? "").trim();
  return s1 || (process.env.NEXT_PUBLIC_KTA_URL_SECRET ?? "").trim();
}

type Params = { token: string };
type PageProps = { params: Promise<Params> };

export default async function Page({ params }: PageProps) {
  const { token } = await params;

  let memberRef = "";
  try {
    const secret = pickSecret();
    if (!secret) throw new Error("no-secret");
    memberRef = await decryptKtaToken(token, secret);
  } catch {
    // fallback non-enkripsi: pakai token apa adanya
    memberRef = token;
  }

  if (!memberRef) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Token tidak valid</h1>
          <p className="text-sm text-muted-foreground">
            Pastikan URL yang Anda buka benar atau belum kedaluwarsa.
          </p>
        </div>
      </div>
    );
  }

  return <CekValidasiClient memberRef={memberRef} token={token} />;
}