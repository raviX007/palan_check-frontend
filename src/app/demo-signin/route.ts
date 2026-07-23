import { NextResponse } from "next/server";

/**
 * Mints a short-lived Clerk sign-in ticket for one of the fixed demo accounts.
 *
 * No credential reaches the browser. The only thing a caller can ask for is a
 * session on one of the four sandbox tenants below — the mapping lives here,
 * server-side, so an arbitrary email can never be targeted.
 *
 * NOTE: deliberately NOT under /api. In production, nginx routes /api/* to the
 * regulation-check-api container (which runs with --root-path /api), so a Next route
 * handler there is unreachable and returns FastAPI's 404.
 */

const CLERK_API = "https://api.clerk.com/v1";

/** Server-side allowlist. These keys are the only accepted request values. */
const DEMO_ACCOUNTS: Record<string, string> = {
  novapay: "novapay+clerk_test@demo.com",
  eduspark: "eduspark+clerk_test@demo.com",
  freshbasket: "freshbasket+clerk_test@demo.com",
  dataflow: "dataflow+clerk_test@demo.com",
};

/** Long enough to redeem immediately, short enough to be useless if leaked. */
const TICKET_TTL_SECONDS = 60;

// Coarse per-instance throttle. Not a distributed rate limiter, but it blunts
// trivial scripted abuse of a deliberately public endpoint.
const RATE_LIMIT = { windowMs: 60_000, max: 10 };
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // bound memory
  return recent.length > RATE_LIMIT.max;
}

export async function POST(request: Request) {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Demo sign-in is not configured." }, { status: 503 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many demo sign-ins. Wait a minute and try again." },
      { status: 429 },
    );
  }

  let company: unknown;
  try {
    ({ company } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof company === "string" ? DEMO_ACCOUNTS[company] : undefined;
  if (!email) {
    return NextResponse.json({ error: "Unknown demo account." }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };

  try {
    const lookup = await fetch(
      `${CLERK_API}/users?email_address=${encodeURIComponent(email)}`,
      { headers, cache: "no-store" },
    );
    if (!lookup.ok) {
      return NextResponse.json({ error: "Could not look up the demo user." }, { status: 502 });
    }

    const users = (await lookup.json()) as { id: string }[];
    if (!users.length) {
      return NextResponse.json(
        { error: "Demo user not seeded. Run regulation-check-api/Scripts/seed_demo_users.py." },
        { status: 404 },
      );
    }

    const minted = await fetch(`${CLERK_API}/sign_in_tokens`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        user_id: users[0].id,
        expires_in_seconds: TICKET_TTL_SECONDS,
      }),
    });

    if (!minted.ok) {
      return NextResponse.json({ error: "Could not create a sign-in ticket." }, { status: 502 });
    }

    const { token } = (await minted.json()) as { token: string };
    return NextResponse.json({ ticket: token });
  } catch {
    return NextResponse.json({ error: "Demo sign-in failed." }, { status: 502 });
  }
}
