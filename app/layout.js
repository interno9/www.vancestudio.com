import Nav from "./components/Nav";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

export const metadata = {
  title: "Vance Studio",
  description: "Vance Studio",
};

const navClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

const navQuery = `*[_type == "navContent"]|order(_updatedAt desc)[0]{
  aboutText
}`;

export default async function RootLayout({ children }) {
  const navData = await navClient.fetch(navQuery).catch(() => null);
  const aboutText = navData?.aboutText || "";

  return (
    <html suppressHydrationWarning lang="en">
      <body
        suppressHydrationWarning
        className={`antialiased tracking-tight text-xs`}
      >
        <Nav aboutText={aboutText} />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
