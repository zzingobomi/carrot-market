import { getIronSession } from "iron-session/edge";
import {
  NextFetchEvent,
  NextRequest,
  NextResponse,
  userAgent,
} from "next/server";

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  if (userAgent(req).isBot) {
    // 새로운 error 화면을 만들고 그쪽으로 rewrite 시켜줄것
  }

  const res = NextResponse.next();
  const session = await getIronSession(req, res, {
    cookieName: "carrotsession",
    password: process.env.COOKIE_PASSWORD!,
    cookieOptions: {
      secure: process.env.NODE_ENV! === "production", // if you are using https
    },
  });

  if (!session.user && !req.url.includes("/enter")) {
    req.nextUrl.searchParams.set("from", req.nextUrl.pathname);
    req.nextUrl.pathname = "/enter";
    return NextResponse.redirect(req.nextUrl);
  }
};
export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
