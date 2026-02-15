import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';


const Landing = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-linear-to-br from-slate-900 to-slate-800 text-white p-6">
            <div className="max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-400">
                        Earn Crypto for Your Opinions
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Join the world's first decentralized opinion marketplace. Complete simple tasks, share your thoughts, and get paid instantly in SOL.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6 mt-12">
                    <div className="p-[2px] rounded-lg bg-linear-to-r from-blue-500 to-indigo-500 hover:scale-105 transition-transform duration-300">
                        <div className="bg-slate-900 rounded-lg px-4 py-1">
                            <WalletMultiButton />
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm">
                        Connect your Solana wallet to start earning
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-slate-700/50">
                    <div className="space-y-3">
                        <div className="text-blue-400 font-bold text-lg">Fast Payouts</div>
                        <p className="text-slate-400">Get your earnings directly in your wallet without delays.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="text-indigo-400 font-bold text-lg">Decentralized</div>
                        <p className="text-slate-400">No middlemen. Just you, the tasks, and the blockchain.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="text-blue-400 font-bold text-lg">Global Access</div>
                        <p className="text-slate-400">Available to everyone, everywhere, at any time.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;