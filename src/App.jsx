import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import BuyPage from './BuyPage'
import CryptoFall from './CryptoFall'

// Home component with navigation
function Home() {
  const navigate = useNavigate();
  const [walletConnected, setWalletConnected] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  
  const handleConnectWallet = () => {
    // Simulate wallet connection
    setWalletConnected(true);
  };
  
  const handleGetPainus = () => {
    navigate('/buy');
  };
  
  const handleInfoClick = () => {
    setShowInfoPopup(true);
  };
  
  const handleCloseInfo = () => {
    setShowInfoPopup(false);
  };
  
  return (
    <div className="home-container">
      <CryptoFall />
      
      <div className="home-content">
        <div className="title-box">
          <h1 className="title">PAINUS</h1>
          <p className="subtitle">
            Permisionless Artificial Intelegence Navigator for Unlimited Speculation
          </p>
        </div>
        
        <div className="guarantee-text">
          GUARANTEED 10X ON ALL INVESTMENTS FOR SOME POTENTIALLY.
        </div>
        
        <button className="info-button" onClick={handleInfoClick}>
          What is PAINUS?
        </button>
        
        <div className="quote-text">
          Only those who leap, survive the sweep. The rug giveth and the rug taketh away.
        </div>
        
        {!walletConnected ? (
          <button className="connect-wallet-button" onClick={handleConnectWallet}>
            Connect Wallet
          </button>
        ) : (
          <button className="get-painus-button" onClick={handleGetPainus}>
            Get PAINUS
          </button>
        )}
      </div>
      
      {showInfoPopup && (
        <div className="info-popup-overlay">
          <div className="info-popup">
            <h2 className="info-popup-title">What is PAINUS?</h2>
            <p className="info-popup-text">
              PAINUS (Permisionless Artificial Intelegence Navigator for Unlimited Speculation) 
              is a revolutionary AI-driven investment platform that leverages cutting-edge 
              algorithms to identify high-potential opportunities in the crypto market.
            </p>
            <p className="info-popup-text">
              Our proprietary technology analyzes market trends, sentiment, and on-chain 
              data to provide unparalleled insights that can potentially lead to significant 
              returns for our community members.
            </p>
            <p className="info-popup-text warning">
              Remember: All investments carry risk. Past performance is not indicative of future results.
            </p>
            <button className="close-info-button" onClick={handleCloseInfo}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App component with router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buy" element={<BuyPage />} />
      </Routes>
    </Router>
  )
}

export default App
