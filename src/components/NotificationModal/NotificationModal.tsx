import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './NotificationModal.module.css';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  duration = 3000
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <AlertCircle size={24} />;
      case 'warning':
        return <AlertTriangle size={24} />;
      case 'info':
        return <Info size={24} />;
      default:
        return <Info size={24} />;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${styles[type]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            {getIcon()}
          </div>
          <div className={styles.content}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        {autoClose && (
          <div className={styles.progressBar}>
            <div 
              className={styles.progress}
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;