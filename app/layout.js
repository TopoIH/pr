export const metadata = {
  title: 'Extractor Pro',
  description: 'Email Source Extractor',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
