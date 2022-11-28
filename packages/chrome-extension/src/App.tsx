import logo from './logo.svg';
import './App.css';
import { useWallet } from './context/WalletProvider';

function App() {
  const { isAuthenticated, connectWallet, disconnectWallet, account } = useWallet();

  const messageFromContentScript = (message: any, sender: any, sendResponse: any) => {
    if (message.address) {
      // simulates triggering a transaction
      connectWallet();
      sendResponse({
        message: 'Transaction submitted',
      });
    }
  };
  chrome.runtime.onMessage.addListener(messageFromContentScript);

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <p>{isAuthenticated && 'Connected to: ' + account}</p>
        <p>
          <button onClick={isAuthenticated ? disconnectWallet : connectWallet} id='wallet-connect'>
            {isAuthenticated ? 'Disconnect Wallet' : 'Connect Wallet'}
          </button>
        </p>
      </header>
    </div>
  );
}

export default App;
