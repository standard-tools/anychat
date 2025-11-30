export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|assets).*)',
};

export default function middleware(request) {
  const url = new URL(request.url);
  const entryParam = url.searchParams.get('entry');

  // Check if the correct password is provided
  if (entryParam === 'const') {
    // Remove the query param and redirect to clean URL
    const cleanUrl = new URL(url.pathname, url.origin);
    const response = Response.redirect(cleanUrl, 302);

    // Set a cookie to remember authentication
    response.headers.set('Set-Cookie', 'auth_token=authenticated; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/');
    return response;
  }

  // Check if already authenticated via cookie
  const cookies = request.headers.get('cookie') || '';
  if (cookies.includes('auth_token=authenticated')) {
    return Response.next();
  }

  // Not authenticated - show auth gate
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Access Required</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #0a0a0a;
            color: #fff;
          }
          .container {
            text-align: center;
            padding: 2rem;
            border-radius: 8px;
            background: #1a1a1a;
            border: 1px solid #333;
            max-width: 400px;
            width: 90%;
          }
          h1 { margin: 0 0 0.5rem; }
          p { color: #999; margin: 0 0 1.5rem; }
          input {
            padding: 0.75rem 1rem;
            font-size: 1rem;
            border: 1px solid #444;
            border-radius: 4px;
            background: #2a2a2a;
            color: #fff;
            width: 100%;
            box-sizing: border-box;
          }
          button {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border: none;
            border-radius: 4px;
            background: #0070f3;
            color: #fff;
            cursor: pointer;
            margin-top: 1rem;
            width: 100%;
          }
          button:hover { background: #0051cc; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔒 Access Required</h1>
          <p>Enter access code to continue</p>
          <form onsubmit="event.preventDefault(); window.location.href='?entry='+document.getElementById('code').value;">
            <input type="password" id="code" placeholder="Access code" autofocus />
            <button type="submit">Enter</button>
          </form>
        </div>
      </body>
    </html>
  `, {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
