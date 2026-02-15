"use client";
import { Appbar } from "@/components/Appbar";
import Landing from "@/components/Landing";
import NextTask from "@/components/NextTask";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <div>
      <Appbar />
      {publicKey ? <NextTask /> : <Landing />}
    </div>
  );
}
