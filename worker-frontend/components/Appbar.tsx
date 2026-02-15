"use client";
import {
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils';
import API_CLIENT from '@/utils/apiCLient';

export const Appbar = () => {
  const { publicKey, signMessage } = useWallet();
  const [balance, setBalance] = useState(0);
  async function signAndSend() {
    if (!publicKey) {
      return;
    }
    const message = new TextEncoder().encode("Sign into mechanical turks");
    const signature = await signMessage?.(message);
    console.log(signature)
    console.log(publicKey)
    const response = await axios.post(`${BACKEND_URL}/v1/worker/signup`, {
      signature,
      publicKey: publicKey?.toString()
    });

    localStorage.setItem("token", response.data.token);
  }

  useEffect(() => {
    signAndSend();
    fetchAccountBalance();
    userPayout()
  }, [publicKey]);

  const fetchAccountBalance = async () => {
    // const response = await axios.get(`${BACKEND_URL}`)
    const response = await API_CLIENT.get('/v1/worker/balance')
    console.log(response.data)
    setBalance(response.data.pendingAmount)
    // setBalance(response.data.lockedAmount )
  }

  const userPayout = async () => {
    const response = await API_CLIENT.post('/v1/worker/payout')
    console.log(response.data)
  }
  return <div className="flex justify-between border-b pb-2 pt-2">
    <div className="text-2xl pl-4 flex justify-center pt-3">
      Turkify
    </div>
    <div className="text-xl pr-4 pb-2 flex">

      <button onClick={userPayout} className="m-2 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5">

        Pay me out ({balance} SOL)
      </button>
      {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
    </div>
  </div>
}