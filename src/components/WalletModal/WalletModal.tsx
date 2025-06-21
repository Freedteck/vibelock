import React from 'react';
import { X, Wallet } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNotification } from '../../hooks/useNotification';
import styles from './WalletModal.module.css';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { dispatch } = useAppContext();
  const { showSuccess } = useNotification();

  const handleConnect = () => {
    // Simulate wallet connection
    setTimeout(() => {
      dispatch({ type: 'CONNECT_WALLET' });
      showSuccess('Wallet Connected', 'Your wallet has been connected successfully!');
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Connect Wallet</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.icon}>
            <Wallet size={48} />
          </div>
          <p className={styles.description}>
            Connect your wallet to unlock tracks, trade coins, and support artists.
          </p>
          
          <button onClick={handleConnect} className={styles.connectButton}>
            <Wallet size={20} />
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;