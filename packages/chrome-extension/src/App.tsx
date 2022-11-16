import React, { useState, useCallback, useEffect } from "react";
import {
  // useBalance,
  // useContractLoader,
  // useContractReader,
  // useGasPrice,
  // useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";

import logo from "./logo.svg";
import "./App.css";
import Account from "./components/Account";
import { useStaticJsonRPC } from "./hooks";
import { ALCHEMY_KEY } from "./constants";
import { getRPCPollTime, Web3ModalSetup } from "./helpers";

const { ethers } = require("ethers");

const USE_BURNER_WALLET: boolean = true; // toggle burner wallet feature
// const initialNetwork = NETWORKS.localhost;
// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

const web3Modal = Web3ModalSetup();

// TODO fetch from constants
const localRpcUrl = process.env.REACT_APP_CODESPACES
  ? `https://${window.location.hostname.replace("3000", "8545")}`
  : "http://" + (global.window ? window.location.hostname : "localhost") + ":8545";

function App() {
  // const networkOptions = [initialNetwork.name, "mainnet", "goerli"];
  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState<any>();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("localhost");

  // @ts-nocheck
  const targetNetwork: any = {
    name: "localhost",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: localRpcUrl,
  };
  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;
  // load all your providers
  const localProvider: any = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider: any = useStaticJsonRPC(providers, localProvider);

  const localProviderPollingTime = getRPCPollTime(localProvider);
  const mainnetProviderPollingTime = getRPCPollTime(mainnetProvider);

  const userProviderAndSigner: any = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", (chainId: number) => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code: any, reason: any) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider, mainnetProviderPollingTime);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
        <Account // useBurner={USE_BURNER_WALLET}
              isContract={false}
              minimized={false}
              address={address}
              localProvider={localProvider}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              price={price}
              web3Modal={web3Modal}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              blockExplorer={blockExplorer}></Account>
      </header>
    </div>
  );
}

export default App;
