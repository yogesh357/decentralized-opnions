'use client';

import { useMemo } from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    ConnectionProvider,
    WalletProvider
} from "@solana/wallet-adapter-react";

import {
    WalletModalProvider,
    WalletMultiButton,
    WalletDisconnectButton
} from "@solana/wallet-adapter-react-ui";

import {
    PhantomWalletAdapter,
    SolflareWalletAdapter
} from "@solana/wallet-adapter-wallets";

import { clusterApiUrl } from "@solana/web3.js";

// Default styles
require("@solana/wallet-adapter-react-ui/styles.css");

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    // Network
    const network = WalletAdapterNetwork.Devnet;

    // RPC endpoint
    const endpoint = useMemo(
        () => clusterApiUrl(network),
        [network]
    );

    // Register wallets (IMPORTANT)
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {/* Buttons */}
                    <div className="bg-red-400 p-10">
                        buttons 
                    </div>
                    <WalletMultiButton />
                    <WalletDisconnectButton />

                    {children}

                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
