import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";

export const metadata = {
  title: "Vance Studio",
  description: "Vance Studio",
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body suppressHydrationWarning className={`antialiased`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
