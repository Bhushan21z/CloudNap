import { motion } from 'framer-motion';
import { Shield, Zap, Clock, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="relative isolate">
            {/* Hero Section */}
            <div className="px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-purple-400">
                            Stop Burning Money on Idle Cloud Resources
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-400">
                            CloudNap automatically hibernates your EC2 instances when they're not in use. Save up to 70% on your AWS bill with zero effort.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                to="/signup"
                                className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all flex items-center gap-2"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Start Saving Now
                            </Link>
                            <a href="#features" className="text-sm font-semibold leading-6 text-white flex items-center gap-1 hover:text-primary-400 transition-colors">
                                Learn more <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary-400 uppercase tracking-widest">Efficiency first</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Everything you need to manage cloud costs
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {[
                                {
                                    name: 'Automated Schedules',
                                    description: 'Set custom start/stop times for your development and staging environments. Set it and forget it.',
                                    icon: Clock,
                                },
                                {
                                    name: 'Seamless Setup',
                                    description: 'Connect your AWS account in minutes with our non-intrusive IAM role-based approach.',
                                    icon: Shield,
                                },
                                {
                                    name: 'Cost Insights',
                                    description: 'Coming soon: Real-time visualization of your savings and resource utilization.',
                                    icon: Zap,
                                },
                            ].map((feature) => (
                                <div key={feature.name} className="flex flex-col glass-dark p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                                        <feature.icon className="h-5 w-5 flex-none text-primary-500" aria-hidden="true" />
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                                        <p className="flex-auto">{feature.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
