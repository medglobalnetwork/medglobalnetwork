import { NextRequest, NextResponse } from "next/server";
import { auth, pool } from "@/lib/auth";
import { createMobileBridgeCode } from "@/lib/mobile-bridge";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let sessionToken: string | null = null;
    let userId: string | null = null;

    // 1. Try Better Auth's standard session retrieval
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.session?.token && session?.user?.id) {
        sessionToken = session.session.token;
        userId = session.user.id;
      }
    } catch {
      // Continue to cookie fallback
    }

    // 2. Cookie fallback inspection
    if (!sessionToken) {
      const cookieToken =
        req.cookies.get("__Secure-better-auth.session_token")?.value ||
        req.cookies.get("better-auth.session_token")?.value ||
        req.cookies.get("better_auth.session_token")?.value;

      if (cookieToken) {
        try {
          const dbRes = await pool.query(
            `SELECT token, "userId" FROM "session" WHERE token = $1 AND "expiresAt" > NOW() LIMIT 1`,
            [cookieToken]
          );
          if (dbRes.rows && dbRes.rows.length > 0) {
            sessionToken = dbRes.rows[0].token;
            userId = dbRes.rows[0].userId;
          }
        } catch (dbErr) {
          console.error("Database session lookup error in mobile-callback:", dbErr);
        }
      }
    }

    if (!sessionToken || !userId) {
      // Auth failed or session not found
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Authentication Failed - MGN</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f4c81; color: white; text-align: center; padding: 20px; }
              .card { background: white; color: #171717; padding: 32px 24px; border-radius: 16px; max-width: 360px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
              .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #0f4c81; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="card">
              <h3 style="color: #e11d48; margin-top: 0;">Sign-In Incomplete</h3>
              <p style="color: #666; font-size: 14px;">We couldn't verify your session. Please return to the app and try signing in again.</p>
              <a href="life.mgn.app://auth-callback?error=session_not_found" class="btn">Return to App</a>
            </div>
            <script>
              setTimeout(() => {
                window.location.href = "life.mgn.app://auth-callback?error=session_not_found";
              }, 1500);
            </script>
          </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // 3. Create single-use bridge token
    const bridgeToken = await createMobileBridgeCode(sessionToken, userId);
    const deepLink = `life.mgn.app://auth-callback?bridge_token=${encodeURIComponent(bridgeToken)}`;

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Logging into MedGlobalNetwork...</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #0f4c81;
              color: white;
              text-align: center;
              padding: 20px;
            }
            .card {
              background: white;
              color: #171717;
              padding: 36px 24px;
              border-radius: 20px;
              max-width: 360px;
              width: 100%;
              box-shadow: 0 20px 40px rgba(0,0,0,0.25);
            }
            .spinner {
              width: 44px;
              height: 44px;
              border: 4px solid #eef5fc;
              border-top: 4px solid #0f4c81;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 16px auto;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .btn {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 28px;
              background: #0f4c81;
              color: white;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
              font-size: 15px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h3 style="margin: 0 0 8px 0; color: #0f4c81; font-size: 1.25rem;">Signing In...</h3>
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
              Connecting your verified session to MedGlobalNetwork App.
            </p>
            <a href="${deepLink}" class="btn" id="openBtn">Open MGN App</a>
          </div>
          <script>
            // Automatic deep link launch
            window.location.href = "${deepLink}";
            setTimeout(() => {
              try { window.close(); } catch(e) {}
            }, 2500);
          </script>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("Fatal error in mobile-callback:", error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <body>
          <script>
            window.location.href = "life.mgn.app://auth-callback?error=server_error";
          </script>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
