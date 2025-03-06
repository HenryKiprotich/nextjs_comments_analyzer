import '@/app/global.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Comment Analyzer',
  description: 'Analyze customer comments for sentiment and purchase intent',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-100">
        <main className="flex-grow container mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
