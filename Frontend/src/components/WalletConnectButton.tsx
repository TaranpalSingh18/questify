import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletConnectButton: React.FC = () => {
  const { connected } = useWallet();

  return (
    <div className="flex items-center">
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white !rounded-md !px-4 !py-2 !text-sm !font-medium" />
      {connected && (
        <span className="ml-2 text-sm text-green-600">
          Connected
        </span>
      )}
    </div>
  );
};

export default WalletConnectButton; 