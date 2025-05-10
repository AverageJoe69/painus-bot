import React, { useEffect, useState } from 'react';
import './CryptoFall.css';

const CryptoFall = () => {
  const [cryptos, setCryptos] = useState([]);
  
  // Array of crypto symbols to use
  const cryptoSymbols = [
    '₿', // Bitcoin
    'Ξ', // Ethereum
    'Ł', // Litecoin
    '◎', // Solana
    'Ð', // Dogecoin
    '₳', // Cardano
    'Ꮻ', // Monero
    'Ƀ', // Bitcoin (alt)
    '₮', // Tether
    'Ⓝ', // Near
    '$', // Dollar (for stablecoins)
    '₽', // PAINUS (using Ruble symbol)
  ];
  
  useEffect(() => {
    // Create initial cryptos
    const initialCryptos = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // random horizontal position (%)
      size: Math.random() * 40 + 10, // random size between 10px and 50px
      delay: Math.random() * 5, // random delay for animation
      duration: Math.random() * 10 + 10, // random duration between 10s and 20s
      rotation: Math.random() * 360, // random initial rotation
      rotationSpeed: Math.random() > 0.5 ? 1 : -1, // random rotation direction
      isBig: Math.random() < 0.1, // 10% chance of being extra large
      symbol: cryptoSymbols[Math.floor(Math.random() * cryptoSymbols.length)] // random symbol
    }));
    
    setCryptos(initialCryptos);
    
    // Add new cryptos periodically
    const interval = setInterval(() => {
      setCryptos(prev => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 100,
          size: Math.random() * 40 + 10,
          delay: 0,
          duration: Math.random() * 10 + 10,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() > 0.5 ? 1 : -1,
          isBig: Math.random() < 0.1,
          symbol: cryptoSymbols[Math.floor(Math.random() * cryptoSymbols.length)]
        }
      ]);
    }, 1500);
    
    // Clean up old cryptos periodically
    const cleanupInterval = setInterval(() => {
      setCryptos(prev => {
        if (prev.length > 60) {
          return prev.slice(prev.length - 60);
        }
        return prev;
      });
    }, 10000);
    
    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, []);
  
  return (
    <div className="crypto-fall-container">
      {cryptos.map(crypto => (
        <div
          key={crypto.id}
          className="crypto"
          style={{
            left: `${crypto.left}%`,
            width: `${crypto.isBig ? crypto.size * 3 : crypto.size}px`,
            height: `${crypto.isBig ? crypto.size * 3 : crypto.size}px`,
            fontSize: `${crypto.isBig ? crypto.size * 2 : crypto.size}px`,
            animationDelay: `${crypto.delay}s`,
            animationDuration: `${crypto.duration}s`,
            transform: `rotate(${crypto.rotation}deg)`,
            animationName: crypto.rotationSpeed > 0 ? 'fall-and-rotate' : 'fall-and-rotate-reverse',
            opacity: crypto.isBig ? 0.3 : 0.7
          }}
        >
          {crypto.symbol}
        </div>
      ))}
    </div>
  );
};

export default CryptoFall; 