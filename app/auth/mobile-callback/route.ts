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
    const encodedToken = encodeURIComponent(bridgeToken);
    const intentUri = `intent://auth-callback?bridge_token=${encodedToken}#Intent;scheme=life.mgn.app;package=life.mgn.app;end`;
    const customSchemeUri = `life.mgn.app://auth-callback?bridge_token=${encodedToken}`;
    const webHomeUrl = `/home?bridge_token=${encodedToken}`;

    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>Logging into MedGlobalNetwork...</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background-color: #0f4c81;
              color: white;
              text-align: center;
              padding: 16px;
            }
            .card {
              background: #ffffff;
              color: #171717;
              padding: 32px 24px;
              border-radius: 24px;
              max-width: 380px;
              width: 100%;
              box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            }
            .logo {
              height: 48px;
              margin-bottom: 20px;
            }
            .spinner {
              width: 42px;
              height: 42px;
              border: 4px solid #e2e8f0;
              border-top: 4px solid #0f4c81;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 20px auto;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h2 {
              margin: 0 0 8px 0;
              color: #0f4c81;
              font-size: 1.35rem;
              font-weight: 700;
            }
            p {
              color: #64748b;
              font-size: 14px;
              line-height: 1.5;
              margin: 0 0 24px 0;
            }
            .btn-primary {
              display: block;
              width: 100%;
              padding: 14px 20px;
              background: #0f4c81;
              color: #ffffff;
              text-decoration: none;
              border-radius: 14px;
              font-weight: 700;
              font-size: 15px;
              transition: background-color 0.2s;
              border: none;
              cursor: pointer;
            }
            .btn-primary:active {
              background: #0a355c;
            }
            .btn-secondary {
              display: block;
              width: 100%;
              margin-top: 10px;
              padding: 12px 20px;
              background: #f8fafc;
              color: #475569;
              text-decoration: none;
              border-radius: 14px;
              font-weight: 600;
              font-size: 13px;
              border: 1px solid #e2e8f0;
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 4px 12px;
              background: #ecfdf5;
              color: #059669;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <div class="badge">✓ Google Account Connected</div>
            <h2>Opening MGN App...</h2>
            <p>
              Your healthcare session has been verified. Redirecting you back to MedGlobalNetwork.
            </p>
            <a href="${intentUri}" id="appBtn" class="btn-primary">Open MedGlobalNetwork App</a>
            <a href="${webHomeUrl}" class="btn-secondary">Continue in Web Browser</a>
          </div>
          <script>
            function tryOpenApp() {
              try {
                // Try Android Intent URL first (works reliably on Chrome for Android)
                window.location.href = "${intentUri}";
              } catch(e) {
                try {
                  window.location.href = "${customSchemeUri}";
                } catch(e2) {}
              }
            }

            // Trigger immediate redirect
            tryOpenApp();

            // Set button click handler
            document.getElementById('appBtn').addEventListener('click', function(e) {
              tryOpenApp();
            });
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
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redirecting - MGN</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f4c81; color: white; }
            .card { background: white; color: #171717; padding: 24px; border-radius: 16px; text-align: center; max-width: 320px; }
            .btn { display: inline-block; margin-top: 16px; padding: 12px 20px; background: #0f4c81; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h3 style="color:#0f4c81;">Connecting to App...</h3>
            <p style="color:#666; font-size:14px;">If the app does not open automatically, tap below.</p>
            <a href="intent://auth-callback?error=server_error#Intent;scheme=life.mgn.app;package=life.mgn.app;end" class="btn">Return to App</a>
          </div>
          <script>
            try {
              window.location.href = "intent://auth-callback?error=server_error#Intent;scheme=life.mgn.app;package=life.mgn.app;end";
            } catch(e) {}
          </script>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
