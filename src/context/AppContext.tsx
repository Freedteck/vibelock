import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Track, UserPortfolio, Transaction, mockTracks, mockPortfolio, mockTransactions } from '../data/mockData';

interface AppState {
  tracks: Track[];
  userPortfolio: UserPortfolio[];
  transactions: Transaction[];
  unlockedTracks: number[];
  isWalletConnected: boolean;
}

type AppAction = 
  | { type: 'UNLOCK_TRACK'; payload: number }
  | { type: 'ADD_TRACK'; payload: Track }
  | { type: 'TRADE_COINS'; payload: { trackId: number; type: 'buy' | 'sell'; amount: number } }
  | { type: 'CONNECT_WALLET' }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'ADD_TRANSACTION'; payload: Transaction };

const initialState: AppState = {
  tracks: mockTracks,
  userPortfolio: mockPortfolio,
  transactions: mockTransactions,
  unlockedTracks: [2, 4, 6], // Pre-unlocked tracks
  isWalletConnected: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UNLOCK_TRACK':
      return {
        ...state,
        unlockedTracks: [...state.unlockedTracks, action.payload],
        tracks: state.tracks.map(track => 
          track.id === action.payload 
            ? { ...track, isUnlocked: true, holders: track.holders + 1, currentSupply: track.currentSupply + 1 }
            : track
        ),
        userPortfolio: [
          ...state.userPortfolio.filter(p => p.trackId !== action.payload),
          {
            trackId: action.payload,
            coinsHeld: (state.userPortfolio.find(p => p.trackId === action.payload)?.coinsHeld || 0) + 1,
            purchasePrice: state.tracks.find(t => t.id === action.payload)?.coinPrice || 0,
            currentValue: state.tracks.find(t => t.id === action.payload)?.coinPrice || 0,
            percentageChange: 0
          }
        ]
      };

    case 'ADD_TRACK':
      return {
        ...state,
        tracks: [action.payload, ...state.tracks]
      };

    case 'TRADE_COINS':
      const { trackId, type, amount } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      if (!track) return state;

      const existingPortfolio = state.userPortfolio.find(p => p.trackId === trackId);
      
      if (type === 'buy') {
        return {
          ...state,
          tracks: state.tracks.map(t => 
            t.id === trackId 
              ? { ...t, holders: t.holders + 1, currentSupply: t.currentSupply + amount }
              : t
          ),
          userPortfolio: [
            ...state.userPortfolio.filter(p => p.trackId !== trackId),
            {
              trackId,
              coinsHeld: (existingPortfolio?.coinsHeld || 0) + amount,
              purchasePrice: track.coinPrice,
              currentValue: track.coinPrice,
              percentageChange: 0
            }
          ]
        };
      } else {
        // Sell
        const newCoinsHeld = (existingPortfolio?.coinsHeld || 0) - amount;
        return {
          ...state,
          tracks: state.tracks.map(t => 
            t.id === trackId 
              ? { ...t, currentSupply: Math.max(0, t.currentSupply - amount) }
              : t
          ),
          userPortfolio: newCoinsHeld > 0 
            ? state.userPortfolio.map(p => 
                p.trackId === trackId 
                  ? { ...p, coinsHeld: newCoinsHeld }
                  : p
              )
            : state.userPortfolio.filter(p => p.trackId !== trackId)
        };
      }

    case 'CONNECT_WALLET':
      return {
        ...state,
        isWalletConnected: true
      };

    case 'DISCONNECT_WALLET':
      return {
        ...state,
        isWalletConnected: false
      };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}