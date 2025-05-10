import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import './BuyPage.css';
import CryptoFall from './CryptoFall';
import { useNavigate } from 'react-router-dom';

function BuyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [isTransactionConfirmed, setIsTransactionConfirmed] = useState(false);
  const [showPainusInfo, setShowPainusInfo] = useState(false);
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [terminalLines, setTerminalLines] = useState([
    { text: 'C:\\PAINUS> Initializing PAINUS terminal...', type: 'system' },
    { text: 'C:\\PAINUS> Ready for transaction.', type: 'system' }
  ]);
  
  const terminalRef = useRef(null);
  const terminalOutputRef = useRef(null);
  
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  // Replace with your actual Telegram bot link
  const telegramLink = "https://t.me/PainusBot";

  // Check if wallet is already connected on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Auto-scroll terminal to bottom when new lines are added
  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Check if wallet is already connected
  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          addTerminalLine(`C:\\PAINUS> Wallet connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`, 'success');
        } else {
          addTerminalLine('C:\\PAINUS> No wallet connected. Please connect to proceed.', 'system');
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  // Add a line to the terminal
  const addTerminalLine = (text, type = 'system') => {
    setTerminalLines(prev => [...prev, { text, type }]);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      addTerminalLine('C:\\PAINUS> ERROR: MetaMask not detected. Please install MetaMask.', 'error');
      return;
    }

    try {
      addTerminalLine('C:\\PAINUS> Requesting wallet connection...', 'system');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
      addTerminalLine(`C:\\PAINUS> Wallet connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`, 'success');
    } catch (error) {
      addTerminalLine(`C:\\PAINUS> ERROR: ${error.message || 'Failed to connect wallet'}`, 'error');
      console.error("Error connecting wallet:", error);
    }
  };

  const handleBuy = async () => {
    // Reset states
    setIsLoading(true);
    setTxHash('');
    setError('');
    setIsTransactionConfirmed(false);
    setShowTelegramPopup(false);
    
    addTerminalLine('C:\\PAINUS> Initiating transaction...', 'command');

    // Check if MetaMask is installed
    if (!window.ethereum) {
      const errorMsg = "Please install MetaMask to make transactions";
      setError(errorMsg);
      addTerminalLine(`C:\\PAINUS> ERROR: ${errorMsg}`, 'error');
      setIsLoading(false);
      return;
    }

    // Check if wallet is connected
    if (!isConnected) {
      try {
        addTerminalLine('C:\\PAINUS> No wallet connected. Requesting connection...', 'system');
        await connectWallet();
      } catch (error) {
        addTerminalLine(`C:\\PAINUS> ERROR: Failed to connect wallet`, 'error');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Request account access if needed
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      // Check if we're on Sepolia network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') { // Sepolia chainId
        try {
          // Try to switch to Sepolia
          addTerminalLine('C:\\PAINUS> Switching to Sepolia network...', 'system');
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
          });
        } catch (switchError) {
          // If Sepolia is not added to MetaMask, add it
          if (switchError.code === 4902) {
            try {
              addTerminalLine('C:\\PAINUS> Adding Sepolia network to wallet...', 'system');
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Test Network',
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                  }
                ],
              });
            } catch (addError) {
              addTerminalLine(`C:\\PAINUS> ERROR: Failed to add Sepolia network`, 'error');
              setError("Failed to add Sepolia network");
              setIsLoading(false);
              return;
            }
          } else {
            addTerminalLine(`C:\\PAINUS> ERROR: Failed to switch to Sepolia network`, 'error');
            setError("Failed to switch to Sepolia network");
            setIsLoading(false);
            return;
          }
        }
      }
      
      addTerminalLine('C:\\PAINUS> Connected to Sepolia network', 'success');
      
      // Create a provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Create transaction
      addTerminalLine('C:\\PAINUS> Sending 0.1 ETH to PAINUS contract...', 'system');
      const tx = await signer.sendTransaction({
        to: '0x63dD8bEC663867393810Cba5037Cc739347172D1',
        value: ethers.utils.parseEther('0.1')
      });
      
      console.log("Transaction sent:", tx.hash);
      setTxHash(tx.hash);
      addTerminalLine(`C:\\PAINUS> Transaction sent! Hash: ${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 6)}`, 'success');
      addTerminalLine(`C:\\PAINUS> View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`, 'system');
      addTerminalLine('C:\\PAINUS> Waiting for confirmation...', 'system');
      
      // Wait for transaction to be mined
      await tx.wait();
      console.log("Transaction confirmed");
      setIsTransactionConfirmed(true);
      addTerminalLine('C:\\PAINUS> Transaction confirmed!', 'success');
      addTerminalLine('C:\\PAINUS> PAINUS tokens added to your wallet', 'success');
      addTerminalLine('C:\\PAINUS> CRITICAL: Join Telegram immediately to avoid being rugged!', 'error');
      
      // Show the Telegram popup
      setShowTelegramPopup(true);
      
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(error.message || "Transaction failed");
      addTerminalLine(`C:\\PAINUS> ERROR: ${error.message || "Transaction failed"}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePainusInfo = () => {
    setShowPainusInfo(!showPainusInfo);
  }

  const closeTelegramPopup = () => {
    setShowTelegramPopup(false);
  }

  const handleBack = () => {
    navigate('/');
  };
  
  const handleConfirm = () => {
    setShowPopup(false);
    setTransactionComplete(true);
    
    // Show warning popup after a delay
    setTimeout(() => {
      setShowWarning(true);
    }, 2000);
  };
  
  const handleCancel = () => {
    setShowPopup(false);
  };
  
  const handleJoinTelegram = () => {
    window.open('https://t.me/yourgroup', '_blank');
    setShowWarning(false);
  };
  
  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  return (
    <div className="buy-page">
      <CryptoFall />
      <div className="buy-page-content">
        <div className="dos-header">
          <div className="title-container">
            <div className="painus-title-effect">
              <h1 className="painus-title">PAINUS</h1>
            </div>
            <div className="tagline">Permisionless Artificial Intelegence Navigator for Unlimited Speculation</div>
          </div>
        </div>
        
        <div className="terminal-container">
          <div className="terminal-header">
            <div className="terminal-title">PAINUS TERMINAL</div>
            <button 
              className={`buy-button ${isLoading ? 'loading' : ''}`} 
              onClick={handleBuy}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Buy 0.1 ETH'}
            </button>
          </div>
          <div className="terminal" ref={terminalRef}>
            {!isConnected && (
              <div className="wallet-status not-connected">
                <span>Wallet not connected</span>
                <button className="connect-wallet-button" onClick={connectWallet}>Connect Wallet</button>
              </div>
            )}
            {isConnected && (
              <div className="wallet-status connected">
                <span>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
                <span className="network-badge">Sepolia</span>
              </div>
            )}
            <div className="terminal-output" ref={terminalOutputRef}>
              {terminalLines.map((line, index) => (
                <div key={index} className={`terminal-line ${line.type}`}>
                  {line.text}
                </div>
              ))}
              <div className="terminal-cursor"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Popup modal for PAINUS info */}
      {showPainusInfo && (
        <div className="modal-overlay" onClick={togglePainusInfo}>
          <div className="painus-info-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>What is PAINUS?</h2>
              <button className="close-button" onClick={togglePainusInfo}>×</button>
            </div>
            <div className="modal-content">
              <p>PAINUS is a revolutionary crypto project that leverages artificial intelligence to navigate the volatile world of cryptocurrency speculation.</p>
              <p>Our proprietary algorithms analyze market trends, social sentiment, and blockchain data to identify potential investment opportunities.</p>
              <p>Join the PAINUS community today and experience the future of crypto trading!</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Telegram warning popup */}
      {showTelegramPopup && (
        <div className="modal-overlay warning-overlay">
          <div className="warning-modal" onClick={e => e.stopPropagation()}>
            <div className="warning-header">
              <h2>⚠️ CAUTION: CRITICAL ACTION REQUIRED ⚠️</h2>
              <button className="close-button" onClick={closeTelegramPopup}>×</button>
            </div>
            <div className="warning-content">
              <div className="warning-icon">⚠️</div>
              <p className="warning-text">If you do not join the Telegram you will miss opportunities and are GUARANTEED to get RUGGED.</p>
              <a 
                href={telegramLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="telegram-button warning-button"
              >
                JOIN TELEGRAM NOW
              </a>
              <p className="warning-subtext">Your investment is at risk if you ignore this warning!</p>
            </div>
          </div>
        </div>
      )}
      
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2 className="popup-title">Confirm Purchase</h2>
            <p className="popup-text">
              You are about to purchase 1 PAINUS for 0.05 ETH.
              This transaction cannot be reversed.
            </p>
            <div className="popup-buttons">
              <button className="confirm-button" onClick={handleConfirm}>Confirm</button>
              <button className="cancel-button" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {transactionComplete && (
        <div className="transaction-complete">
          <div className="checkmark">✓</div>
          <h2 className="complete-title">Transaction Complete!</h2>
          <p className="complete-text">
            Congratulations! You now own 1 PAINUS.
          </p>
        </div>
      )}
      
      {showWarning && (
        <div className="warning-overlay">
          <div className="warning-popup">
            <div className="warning-header">
              <div className="warning-icon">⚠️</div>
              <h2 className="warning-title">IMPORTANT NOTICE</h2>
              <div className="warning-icon">⚠️</div>
            </div>
            
            <div className="warning-content">
              <p className="warning-text">
                To receive important updates and maximize your profits, you <span className="highlight">MUST</span> join our Telegram group immediately!
              </p>
              <p className="warning-text danger">
                Failure to join may result in missed opportunities and potential loss of investment!
              </p>
            </div>
            
            <div className="warning-buttons">
              <button className="join-button" onClick={handleJoinTelegram}>
                Join Telegram Now
              </button>
              <button className="close-warning" onClick={handleCloseWarning}>
                I Understand the Risk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyPage; 