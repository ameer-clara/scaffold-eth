import './App.css';
import { useWallet } from './context/WalletProvider';

function App() {
  const { isAuthenticated, connectWallet, disconnectWallet, account } = useWallet();

  return (
    <div className='App'>
      <header className='App-header'>
        <button onClick={isAuthenticated ? disconnectWallet : connectWallet} id='wallet-connect'>
          {isAuthenticated ? 'Disconnect Wallet' : 'Connect Wallet'}
        </button>
        Connected to: {account}
      </header>
    </div>
  );
}

export default App;
