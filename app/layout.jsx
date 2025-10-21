import '@/app/styles/globals.css';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata = {
  title: "Mi recetario",
  description: "Recetario de uso personal",
  authors: ['Brenda Giambelluca'],
  icons: {
    icon: {
      url: "/favicon.ico",
      type: "image/x-icon"
    }
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-ar">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
