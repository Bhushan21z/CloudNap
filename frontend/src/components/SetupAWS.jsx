import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Copy, Check, Terminal, ExternalLink, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function SetupAWS({ onComplete }) {
    const [roleArn, setRoleArn] = useState('');
    const [region, setRegion] = useState('ap-south-1');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const setupCommand = `# 1. Create a Trust Policy file
cat <<EOF > trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::827533316824:root" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. Create the IAM Role
aws iam create-role --role-name HibernateAccessRole --assume-role-policy-document file://trust-policy.json

# 3. Attach EC2 Full Access (or custom policy)
aws iam attach-role-policy --role-name HibernateAccessRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess`;

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
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Setup AWS Access</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        To manage your EC2 instances, we need permission to assume a role in your account.
                        Follow the steps below to create a cross-account IAM role.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Method 1: CLI */}
                    <div className="glass-dark rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Terminal className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold">Option 1: AWS CLI</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">Run this single command block in your terminal to set up everything automatically.</p>

                        <div className="relative group">
                            <pre className="bg-black/40 rounded-lg p-4 text-xs font-mono overflow-x-auto text-gray-300 max-h-60">
                                {setupCommand}
                            </pre>
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-2 right-2 p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Method 2: Console */}
                    <div className="glass-dark rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold">Option 2: AWS Console</h3>
                        </div>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">1</span>
                                Go to IAM Console {'>'} Roles {'>'} Create Role
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">2</span>
                                Select "AWS Account" and "Another AWS Account"
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">3</span>
                                Enter Account ID: <code className="bg-white/10 px-1 rounded text-gray-200">827533316824</code>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">4</span>
                                Attach policy <code className="bg-white/10 px-1 rounded text-gray-200">AmazonEC2FullAccess</code>
                            </li>
                        </ul>
                        <a
                            href="https://console.aws.amazon.com/iam/home#/roles$new?step=type&type=externalAccount"
                            target="_blank"
                            className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-400 hover:underline"
                        >
                            Open AWS Console <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Form */}
                <div className="glass-dark rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto shadow-2xl">
                    <h3 className="text-2xl font-bold mb-6 text-center">Final Step: Link your Role</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Role ARN</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="arn:aws:iam::123456789012:role/HibernateAccessRole"
                                value={roleArn}
                                onChange={(e) => setRoleArn(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Default Region</label>
                            <select
                                className="input-field appearance-none"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                            >
                                <option value="ap-south-1">Asia Pacific (Mumbai) - ap-south-1</option>
                                <option value="us-east-1">US East (N. Virginia) - us-east-1</option>
                                <option value="us-west-2">US West (Oregon) - us-west-2</option>
                            </select>
                        </div>
                        <button
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Configuration
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
