import { NextRequest, NextResponse } from "next/server";

const routeRoles = [
  { prefix: "/super-admin", role: "super-admin" },
  { prefix: "/academy", role: "academy" },
  { prefix: "/coach", role: "coach" },
  { prefix: "/employee", role: "employee" },
  { prefix: "/student", role: "student" },
];

const roleHome: Record<string, string> = {
  "super-admin": "/super-admin/dashboard",
  academy: "/academy/dashboard",
  coach: "/coach/dashboard",
  employee: "/employee/dashboard",
  student: "/student/dashboard",
};

const employeeRoutePermissions: Record<string, string> = {
  "/employee/tasks": "tasks:read",
  "/employee/profile": "profile:read",
  "/employee/schedule": "schedule:read",
  "/employee/payments": "payments:read",
  "/employee/tickets": "tickets:read",
  "/employee/admissions": "admissions:read",
  "/employee/reports": "reports:read",
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const match = routeRoles.find((item) =>
    path.startsWith(item.prefix)
  );

  if (!match) {
    return NextResponse.next();
  }

  const role =
    request.cookies.get("role")?.value ||
    request.cookies.get("pg_role")?.value;

  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("pg_token")?.value;

  if (!role || !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role !== match.role) {
    return NextResponse.redirect(
      new URL(roleHome[role] || "/login", request.url)
    );
  }

  if (role === "employee") {
    const required = Object.entries(employeeRoutePermissions).find(
      ([prefix]) => path.startsWith(prefix)
    )?.[1];

    const permissions = decodeURIComponent(
      request.cookies.get("permissions")?.value ||
        request.cookies.get("pg_permissions")?.value ||
        ""
    )
      .split(",")
      .filter(Boolean);

    if (
      required &&
      !permissions.includes("*") &&
      !permissions.includes(required)
    ) {
      return NextResponse.redirect(
        new URL("/employee/dashboard", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/academy/:path*",
    "/coach/:path*",
    "/employee/:path*",
    "/student/:path*",
  ],
};