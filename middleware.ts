import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Configured root domain from environment (e.g. domainname.com or myproject.com:3000)
  const envRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "domainname.com").toLowerCase();
  const rootDomain = envRoot.split(":")[0];

  // Clean host (strip port number if present)
  const currentHost = hostname.split(":")[0].toLowerCase();

  let subdomain: string | null = null;

  // Local development subdomain matching (e.g. apex.localhost or apex.myproject.com)
  if (currentHost.endsWith(".localhost")) {
    subdomain = currentHost.replace(".localhost", "");
  } else if (currentHost.endsWith(".myproject.com")) {
    subdomain = currentHost.replace(".myproject.com", "");
  } else if (rootDomain && currentHost.endsWith(`.${rootDomain}`)) {
    // Production / Configured root domain matching (e.g. apex.domainname.com)
    subdomain = currentHost.replace(`.${rootDomain}`, "");
  }

  // If a valid subdomain exists (not www), rewrite internally to /store/[subdomain]
  if (subdomain && subdomain !== "www") {
    return NextResponse.rewrite(
      new URL(`/store/${subdomain}${url.pathname}${url.search}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
