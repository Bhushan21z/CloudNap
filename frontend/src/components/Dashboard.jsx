import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Play, Square, Clock, Calendar, ChevronRight, Settings, Loader2 } from 'lucide-react';
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
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white">Your Instances</h1>
                    <p className="text-gray-400">Manage and schedule your EC2 resources</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => fetchInstances(true)}
                        className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={onResetConfig}
                        className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors text-sm"
                    >
                        <Settings className="w-4 h-4" />
                        Config
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {instances.length === 0 ? (
                    <div className="text-center py-20 glass-dark rounded-2xl border border-white/5">
                        <p className="text-gray-500 italic">No EC2 instances found in this region.</p>
                    </div>
                ) : (
                    instances.map((instance, idx) => (
                        <motion.div
                            layout
                            key={instance.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-dark rounded-2xl p-5 border border-white/5 flex flex-wrap items-center gap-6 hover:border-white/20 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <div className={`w-3 h-3 rounded-full ${instance.state === 'running' ? 'bg-green-500' : 'bg-red-500'} shadow-lg ${instance.state === 'running' ? 'shadow-green-500/50' : 'shadow-red-500/50'}`} />
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <h3 className="text-lg font-bold text-white mb-0.5">{instance.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="font-mono">{instance.id}</span>
                                    <span>•</span>
                                    <span>{instance.type}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-gray-300">
                                    {instance.state.toUpperCase()}
                                </div>

                                <button
                                    onClick={() => toggleInstance(instance.id, instance.state)}
                                    className={`p-3 rounded-xl transition-all duration-300 ${instance.state === 'running' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                                >
                                    {instance.state === 'running' ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                                </button>

                                <button
                                    onClick={() => setShowScheduleModal(instance)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all text-sm font-medium"
                                >
                                    <Clock className="w-4 h-4" />
                                    Schedule
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Schedule Instance</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl mb-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="font-bold">{instance.name}</h4>
                        <p className="text-xs text-gray-400 font-mono">{instance.id}</p>
                    </div>
                </div>

                {schedules.length > 0 && (
                    <div className="mb-8 space-y-3">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Schedules</h4>
                        {schedules.map(s => (
                            <div key={s.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-green-400 font-medium">{s.start_time}</span>
                                    <ChevronRight className="w-3 h-3 text-gray-600" />
                                    <span className="text-red-400 font-medium">{s.stop_time}</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-xs text-indigo-400">Weekly</span>
                                </div>
                                <button onClick={() => deleteSchedule(s.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium tracking-wider uppercase">Start Time</label>
                            <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-medium tracking-wider uppercase">Stop Time</label>
                            <input type="time" className="input-field" value={stopTime} onChange={e => setStopTime(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs text-gray-500 font-medium tracking-wider uppercase">Days of Week</label>
                        <div className="flex justify-between">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <button
                                    key={i}
                                    onClick={() => toggleDay(i)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${days.includes(i) ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={save} className="w-full btn-primary py-3">
                        Add Schedule
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
