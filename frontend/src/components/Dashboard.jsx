import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Play, Square, Clock, Calendar, ChevronRight, Settings, Loader2, Server, TrendingDown, ShieldCheck, Activity } from 'lucide-react';
import api from '../lib/api';

export default function Dashboard({ onResetConfig }) {
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [showScheduleModal, setShowScheduleModal] = useState(null);

    const fetchInstances = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const [instRes, schedRes] = await Promise.all([
                api.get('/instances'),
                api.get('/schedules')
            ]);
            setInstances(instRes.data);
            setSchedules(schedRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInstances();
        const interval = setInterval(() => fetchInstances(false), 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleInstance = async (id, currentState) => {
        const action = currentState === 'running' ? 'stop' : 'start';
        try {
            await api.post(`/instances/${id}/toggle`, { action });
            fetchInstances(true);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to toggle instance');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                    <p className="text-gray-500 font-medium animate-pulse">Syncing with AWS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 md:px-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Cloud<span className="text-primary-500">Inventory</span></h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        Connected to your infrastructure: <span className="text-gray-200 font-mono text-sm">{instances.length} Active Nodes</span>
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => fetchInstances(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 glass rounded-xl hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh Status
                    </button>
                    <button
                        onClick={onResetConfig}
                        className="p-3 glass rounded-xl hover:bg-white/10 transition-all border border-white/5 group"
                        title="Configure Connection"
                    >
                        <Settings className="w-5 h-5 text-gray-400 group-hover:text-primary-400 group-hover:rotate-45 transition-all duration-500" />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    icon={Server}
                    label="Total Instances"
                    value={instances.length}
                    color="primary"
                />
                <StatCard
                    icon={TrendingDown}
                    label="Active Schedules"
                    value={schedules.length}
                    color="purple"
                    subtext="Optimizing costs"
                />
                <StatCard
                    icon={ShieldCheck}
                    label="System Status"
                    value="Synced"
                    color="green"
                    subtext="Real-time monitoring"
                />
            </div>

            {/* Instance List */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-6 bg-primary-500 rounded-full" />
                    <h2 className="text-xl font-bold">AWS Resource Monitor</h2>
                </div>

                <div className="grid gap-6">
                    {instances.length === 0 ? (
                        <div className="text-center py-24 glass-dark rounded-3xl border border-white/5 shadow-inner">
                            <Server className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-20" />
                            <p className="text-gray-400 italic text-lg">No EC2 instances found in this region.</p>
                            <p className="text-gray-600 text-sm mt-2">Check your IAM role permissions if this is unexpected.</p>
                        </div>
                    ) : (
                        instances.map((instance, idx) => (
                            <motion.div
                                layout
                                key={instance.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-dark rounded-3xl p-6 border border-white/5 flex flex-col lg:flex-row items-center gap-8 hover:border-primary-500/20 transition-all group relative overflow-hidden"
                            >
                                {/* Active background effect */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${instance.state === 'running' ? 'from-green-500/5' : 'from-red-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                                <div className="flex-none w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform z-10 border border-white/5 shadow-xl">
                                    <div className={`w-4 h-4 rounded-full ${instance.state === 'running' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'} shadow-lg animate-pulse`} />
                                </div>

                                <div className="flex-1 min-w-[200px] z-10 text-center lg:text-left">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold text-white">{instance.name || 'Unnamed Instance'}</h3>
                                        <div className="px-2 py-0.5 bg-primary-600/20 text-primary-400 text-[10px] font-bold uppercase rounded tracking-wider border border-primary-500/20 w-fit mx-auto lg:mx-0">
                                            {instance.type}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-500">
                                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">{instance.id}</span>
                                        <span>•</span>
                                        <span className="uppercase text-xs font-bold tracking-widest">{instance.state}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 z-10">
                                    <button
                                        onClick={() => toggleInstance(instance.id, instance.state)}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${instance.state === 'running'
                                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                                                : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20'
                                            }`}
                                    >
                                        {instance.state === 'running' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                        {instance.state === 'running' ? 'Stop Node' : 'Start Node'}
                                    </button>

                                    <button
                                        onClick={() => setShowScheduleModal(instance)}
                                        className="flex items-center gap-3 px-6 py-3 bg-indigo-500/10 text-indigo-400 rounded-2xl hover:bg-indigo-500/20 transition-all font-bold border border-indigo-500/20"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Schedule
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showScheduleModal && (
                    <ScheduleModal
                        instance={showScheduleModal}
                        schedules={schedules.filter(s => s.instance_id === showScheduleModal.id)}
                        onClose={() => setShowScheduleModal(null)}
                        onSave={fetchInstances}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, subtext }) {
    const colors = {
        primary: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        green: 'text-green-400 bg-green-500/10 border-green-500/20'
    };

    return (
        <div className="glass-dark p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-5 pointer-events-none transition-transform group-hover:scale-150 duration-700 bg-current ${colors[color]}`} />
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]} border shrink-0`}>
                    <Icon className="w-6 h-6" />
                </div>
                <p className="text-gray-500 font-medium">{label}</p>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-white">{value}</h3>
                {subtext && <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">{subtext}</span>}
            </div>
        </div>
    );
}

function ScheduleModal({ instance, schedules, onClose, onSave }) {
    const [startTime, setStartTime] = useState('09:00');
    const [stopTime, setStopTime] = useState('18:00');
    const [days, setDays] = useState([1, 2, 3, 4, 5]);

    const toggleDay = (day) => {
        setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const save = async () => {
        try {
            await api.post('/schedules', { instanceId: instance.id, startTime, stopTime, days });
            onSave();
            onClose();
        } catch (err) {
            alert('Failed to save schedule');
        }
    };

    const deleteSchedule = async (id) => {
        try {
            await api.delete(`/schedules/${id}`);
            onSave();
        } catch (err) {
            alert('Failed to delete schedule');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-xl glass-dark rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600" />

                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">Node <span className="text-primary-500">Scheduler</span></h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500">
                        <Square className="w-6 h-6 rotate-45" />
                    </button>
                </div>

                <div className="p-6 bg-white/5 rounded-[2rem] mb-10 border border-white/5 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                        <Server className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold">{instance.name || 'Unnamed Instance'}</h4>
                        <p className="text-sm text-gray-500 font-mono tracking-widest uppercase">{instance.id}</p>
                    </div>
                </div>

                {schedules.length > 0 && (
                    <div className="mb-10 space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">Active Automation</h4>
                        {schedules.map(s => (
                            <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4 text-sm font-bold">
                                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
                                        <Play className="w-3 h-3 fill-current" />
                                        {s.start_time}
                                    </div>
                                    <div className="w-4 h-0.5 bg-gray-800 rounded-full" />
                                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                                        <Square className="w-3 h-3 fill-current" />
                                        {s.stop_time}
                                    </div>
                                </div>
                                <button onClick={() => deleteSchedule(s.id)} className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors bg-red-500/5 px-3 py-1.5 rounded-xl border border-red-500/10">Delete</button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs text-gray-500 font-bold tracking-widest uppercase ml-1">Wake Up</label>
                            <input type="time" className="input-field h-14 rounded-2xl font-bold text-center" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs text-gray-500 font-bold tracking-widest uppercase ml-1">Go to Sleep</label>
                            <input type="time" className="input-field h-14 rounded-2xl font-bold text-center" value={stopTime} onChange={e => setStopTime(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs text-gray-500 font-bold tracking-widest uppercase ml-1">Active Days</label>
                        <div className="flex justify-between gap-2">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                                <button
                                    key={i}
                                    onClick={() => toggleDay(i)}
                                    className={`flex-1 h-14 rounded-2xl text-[10px] font-black transition-all border ${days.includes(i) ? 'bg-primary-600 text-white border-primary-500 shadow-xl shadow-primary-600/20 scale-105' : 'bg-white/5 text-gray-600 border-white/5 hover:border-white/10'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={save} className="w-full btn-primary h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary-600/20 flex items-center justify-center gap-3">
                        <Clock className="w-6 h-6" />
                        Initialize Schedule
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
