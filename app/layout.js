import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './globals.css';
import SessionProviderWrapper from '../components/SessionProviderWrapper';

export const metadata = {
  title: 'GenAPI',
  description: 'AI-powered content and media generation through dynamic APIs.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SessionProviderWrapper>
          {/* Common Navigation Bar */}
          <NavBar />

          {/* Page Content */}
          <main className="flex-1 container mx-auto sm:px-6 sm:py-6">{children}</main>

          {/* Common Footer */}
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
