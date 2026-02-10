import { Power, LogOut, User } from 'lucide-react';

export default function Header({ user, onLogout }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
                        <Power className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Hibernate<span className="text-primary-500">SaaS</span></span>
                </div>

                {user ? (
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-4 h-4" />
                            <span>{user.email}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 text-sm font-medium hover:text-primary-400 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <button className="text-sm font-medium hover:text-primary-400 transition-colors">Sign In</button>
                        <button className="btn-primary py-1.5 text-sm">Get Started</button>
                    </div>
                )}
            </div>
        </header>
    );
}
