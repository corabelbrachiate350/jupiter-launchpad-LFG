import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { format } from 'date-fns';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { connected } = useWallet();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black">
      <nav className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">🚀 Jupiter Launchpad</span>
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Discover
                </Link>
                <Link
                  to="/trending"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/trending')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Trending
                </Link>
                {connected && (
                  <Link
                    to="/submit"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/submit')
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    Submit Project
                  </Link>
                )}
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin')
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Admin
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-800 bg-gray-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>Jupiter Launchpad - Discover the next generation of Solana projects</p>
            <p className="mt-2">© {format(new Date(), 'yyyy')} All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

