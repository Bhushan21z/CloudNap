import { Power, LogOut, User, LayoutDashboard, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ user, onLogout }) {
    const location = useLocation();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform">
                        <Power className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Cloud<span className="text-primary-500 uppercase italic">Nap</span></span>
                </Link>

                {user ? (
                    <div className="flex items-center gap-8">
                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link
                                to="/setup"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/setup' ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Settings className="w-4 h-4" />
                                Setup
                            </Link>
                        </nav>

                        <div className="h-6 w-px bg-white/10 hidden md:block" />

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                <User className="w-4 h-4 text-primary-400" />
                                <span>{user.email}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Sign In</Link>
                        <Link to="/signup" className="btn-primary px-6 py-2 text-sm font-semibold">Get Started</Link>
                    </div>
                )}
            </div>
        </header>
    );
}
