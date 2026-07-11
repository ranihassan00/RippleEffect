import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Ripple Effect · Airborne-Hazard Intelligence", description: "Predictive airborne-hazard intelligence for emergency response." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body suppressHydrationWarning>{children}</body></html>;
}
