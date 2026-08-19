import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Configured root domain from environment (e.g. domainname.com or myproject.com:3000)
  const envRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "").toLowerCase();
  const rootDomain = envRoot.split(":")[0].replace(/^www\./, "");

  // Clean host (strip port number if present)
  const currentHost = hostname.split(":")[0].toLowerCase();
  const port = hostname.includes(":") ? `:${hostname.split(":")[1]}` : "";

  let subdomain: string | null = null;

  // Local development subdomain matching (e.g. apex.localhost or apex.myproject.com)
  if (currentHost.endsWith(".localhost")) {
    subdomain = currentHost.replace(".localhost", "");
  } else if (currentHost.endsWith(".myproject.com")) {
    subdomain = currentHost.replace(".myproject.com", "");
  } else if (rootDomain && currentHost.endsWith(`.${rootDomain}`)) {
    // Production / Configured root domain matching (e.g. apex.domainname.com)
    subdomain = currentHost.replace(`.${rootDomain}`, "");
  } else {
    // General fallback for multi-part hostnames (e.g. apex.my-app.vercel.app or apex.customdomain.org)
    const parts = currentHost.split(".");
    if (parts.length >= 3 && parts[0] !== "www") {
      subdomain = parts[0];
    }
  }

  // If a valid subdomain exists (not www)
  if (subdomain && subdomain !== "www") {
    // Redirect auth pages (/login, /signup) on subdomains to the main marketplace domain
    if (url.pathname === "/login" || url.pathname === "/signup") {
      const isLocal = currentHost.includes("localhost") || currentHost.includes("127.0.0.1");
      const mainProtocol = req.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
      const mainHost = isLocal
        ? `localhost${port}`
        : (rootDomain || "domainname.com");

      return NextResponse.redirect(
        new URL(`${url.pathname}${url.search}`, `${mainProtocol}://${mainHost}`)
      );
    }

    // Rewrite all other subdomain requests internally to /store/[subdomain]
    return NextResponse.rewrite(
      new URL(`/store/${subdomain}${url.pathname}${url.search}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
