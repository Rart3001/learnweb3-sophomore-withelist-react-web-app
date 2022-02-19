import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";
import Image from "next/image";

export default function Home() {
  const [walletConnected, setWalletConneced] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const [maxOfWhitelist, setMaxOfWhitelist] = useState(0);

  const web3modalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3modalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change the network to Rinkeby");
    }
    if (needSigner) {
      return web3Provider.getSigner();
    }
    return web3Provider;
  };

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const transaction = await whitelListContract.addAddressToWhiteList();
      setLoading(true);
      await transaction.wait();
      setLoading(false);
      await this.getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getNumberOfWhiteListed = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const whitelListContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numberOfWhitelisted =
        await whitelListContract.numAdressesWhitedList();
      const _maxOfWhitelisted =
        await whitelListContract.maxWhitelistedAddress();
      setMaxOfWhitelist(_maxOfWhitelisted);
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (error) {
      console.error(error);
    }
  };

  const chekIfAddressInWhiteList = async () => {
    const signer = await getProviderOrSigner(true);
    const whitelListContract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      signer
    );
    const address = await signer.getAddress();
    const _joinedWhiteList = await whitelListContract.whiteListAdresses(
      address
    );
    setJoinedWhitelist(_joinedWhiteList);
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConneced(true);
      chekIfAddressInWhiteList();
      getNumberOfWhiteListed();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3modalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto. <br />
            With a max of&nbsp;
            {maxOfWhitelist} to join to the Whitelist.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img
            className={styles.image}
            src="./crypto-devs.svg"
            alt="Cryto Devs"
          />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
