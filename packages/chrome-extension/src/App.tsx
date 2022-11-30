import logo from './logo.svg';
import './App.css';
import { useWallet } from './context/WalletProvider';
import Transactor from './utils/Transactor';
import { useGasPrice, useContractLoader } from 'eth-hooks';
import { NETWORKS } from './constants';
import deployedContracts from './contracts/hardhat_contracts.json';

const targetNetwork = NETWORKS.goerli;

function App() {
  const { isAuthenticated, connectWallet, disconnectWallet, account, userSigner } = useWallet();

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, 'fast', 3000);
  // load your contracts
  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: {} };
  // @ts-ignore
  const writeContracts = useContractLoader(userSigner, contractConfig, 5);
  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice) || undefined;

  const sendTx = async () => {
    const createTx = writeContracts.HumbleOpinion.create('review from chrome extension', false, '0xe4339c37b171761f808a0c25c77f50d512edd4ca', '6', 3, 1);

    // @ts-ignore
    const result = tx(createTx, (update) => {
      console.log('📡 Transaction Update:', update);
      if (update && (update.status === 'confirmed' || update.status === 1)) {
        console.log(' 🍾 Transaction ' + update.hash + ' finished!');
        console.log(' ⛽️ ' + update.gasUsed + '/' + (update.gasLimit || update.gas) + ' @ ' + parseFloat(update.gasPrice) / 1000000000 + ' gwei');
      }
    });
    console.log('awaiting metamask/web3 confirm result...', result);
    console.log(await result);
  };

  const messageFromContentScript = (message: any, sender: any, sendResponse: any) => {
    if (message.address) {
      connectWallet();
      // trigger transaction
      // sendTx(message.address, message.id, message.chainId);

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
          <button onClick={sendTx}>Send Tx</button>
        </p>
      </header>
    </div>
  );
}

export default App;
