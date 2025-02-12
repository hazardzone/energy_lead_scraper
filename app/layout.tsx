import React from 'react';
import { connectDB } from '../lib/db';
import { headers } from 'next/headers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energy Lead Generator',
  description: 'Professional energy lead generation platform',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

async function initDatabase() {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw new Error('Database connection failed');
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initDatabase();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
