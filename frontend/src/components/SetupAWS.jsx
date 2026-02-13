import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Copy, Check, Terminal, ChevronRight, ExternalLink, Loader2, PlayCircle, Info } from 'lucide-react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function SetupAWS({ onComplete }) {
    const navigate = useNavigate();
    const [roleArn, setRoleArn] = useState('');
    const [region, setRegion] = useState('ap-south-1');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const setupCommand = `wget https://github.com/user-attachments/files/25282127/hibernate-setup.sh && chmod +x hibernate-setup.sh && ./hibernate-setup.sh`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(setupCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/role', { roleArn, region });
            onComplete();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save role');
        } finally {
            setLoading(false);
            navigate('/dashboard');
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400">
                        Connect your AWS Account
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        CloudNap uses a secure, cross-account IAM role to manage your instances.
                        Follow the steps below to grant the necessary permissions.
                    </p>
                </div>

                <div className="flex flex-col gap-10">
                    {/* Method 1: CLI */}
                    <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center">
                                <Terminal className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Option 1: Quick Start (CLI)</h3>
                                <p className="text-sm text-gray-500">Recommended for most users</p>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6 flex gap-3 text-sm text-blue-300">
                            <Info className="w-5 h-5 shrink-0" />
                            <p>Make sure you have <strong>aws-cli</strong> installed and configured with appropriate IAM permissions.</p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">Run this command to automatically create the role and policy:</p>
                            <div className="relative group">
                                <pre className="bg-black/60 rounded-xl p-5 text-sm font-mono overflow-x-auto text-primary-300 border border-white/5 group-hover:border-primary-500/30 transition-colors">
                                    {setupCommand}
                                </pre>
                                <button
                                    onClick={copyToClipboard}
                                    className="absolute top-3 right-3 p-2.5 rounded-lg bg-white/5 hover:bg-primary-600 transition-all shadow-lg"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Method 2: Console */}
                    <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Option 2: AWS Console</h3>
                                <p className="text-sm text-gray-500">Manual step-by-step setup</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4 items-start">
                                    <span className="flex-none w-8 h-8 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center text-sm font-bold border border-primary-500/20">1</span>
                                    <p className="text-gray-300 pt-1">Navigate to <strong>IAM {'->'} Policies</strong> and create a new policy <strong>hibernateMinimumPolicy</strong> with the required EC2 permissions.</p>
                                </div>
                                <div className="ml-12 group relative">
                                    <pre className="bg-black/60 rounded-2xl p-6 text-sm font-mono overflow-x-auto text-primary-300 border border-white/5 group-hover:border-primary-500/30 transition-all">
                                        {`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "EC2Control",
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeInstances",
                "ec2:StartInstances",
                "ec2:StopInstances"
            ],
            "Resource": "*"
        }
    ]
}`}
                                    </pre>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "EC2Control",
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeInstances",
                "ec2:StartInstances",
                "ec2:StopInstances"
            ],
            "Resource": "*"
        }
    ]
}`);
                                        }}
                                        className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copy Policy JSON"
                                    >
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4 items-start">
                                    <span className="flex-none w-8 h-8 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center text-sm font-bold border border-primary-500/20">2</span>
                                    <p className="text-gray-300 pt-1">Create a <strong>new IAM Role</strong>, name <strong>hibernate-client</strong> and paste this JSON into the <strong>Trust Policy</strong> section:</p>
                                </div>
                                <div className="ml-12 group relative">
                                    <pre className="bg-black/60 rounded-2xl p-6 text-sm font-mono overflow-x-auto text-primary-300 border border-white/5 group-hover:border-primary-500/30 transition-all">
                                        {`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::711387126175:user/hibernate-user"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}`}
                                    </pre>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::711387126175:user/hibernate-user"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}`);
                                        }}
                                        className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copy Trust Policy JSON"
                                    >
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <span className="flex-none w-8 h-8 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center text-sm font-bold border border-primary-500/20">3</span>
                                <p className="text-gray-300 pt-1">Attach the policy you created and copy the resulting <strong>Role ARN</strong>.</p>
                            </div>
                        </div>

                        <a
                            href="https://console.aws.amazon.com/iam/home#/roles$new?step=type&type=externalAccount"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all border border-white/5"
                        >
                            Open AWS Console <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Video Tutorial */}
                <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-xl overflow-hidden relative group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
                            <PlayCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold">Video Tutorial</h3>
                    </div>

                    <div className="aspect-video w-full rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 relative overflow-hidden">
                        <div className="text-center z-10">
                            <p className="text-gray-500 mb-2">Tutorial video is coming soon!</p>
                            <span className="text-xs text-primary-500/50 uppercase tracking-widest font-bold">cloudnap walkthrough</span>
                        </div>
                        {/* Placeholder visual */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-purple-500/5" />
                    </div>
                </div>

                {/* Final Form */}
                <div className="glass-dark rounded-3xl p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="max-w-xl mx-auto relative z-10 text-center">
                        <h3 className="text-2xl font-bold mb-2">Final Step: Link your Role</h3>
                        <p className="text-gray-500 text-sm mb-8">Enter your Role ARN and preferred region to finish the setup.</p>

                        <form onSubmit={handleSubmit} className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">IAM Role ARN</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field h-12 px-4 rounded-xl"
                                    placeholder="arn:aws:iam::123456789012:role/CloudNapAccessRole"
                                    value={roleArn}
                                    onChange={(e) => setRoleArn(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 ml-1">Default Cloud Region</label>
                                <div className="relative">
                                    <select
                                        className="input-field h-12 px-4 rounded-xl appearance-none cursor-pointer"
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                    >
                                        <option value="ap-south-1">Asia Pacific (Mumbai) - ap-south-1</option>
                                        <option value="us-east-1">US East (N. Virginia) - us-east-1</option>
                                        <option value="us-west-2">US West (Oregon) - us-west-2</option>
                                        <option value="eu-central-1">Europe (Frankfurt) - eu-central-1</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
                                    </div>
                                </div>
                            </div>
                            <button
                                disabled={loading}
                                className="w-full btn-primary h-12 flex items-center justify-center gap-3 font-bold text-lg rounded-xl shadow-lg shadow-primary-600/20"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-5 h-5" />}
                                Save & Connect
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
