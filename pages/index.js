import { useState, useEffect } from "react";
import Head from "next/head";
import Web3 from "web3";
import lotteryContract from "../blockchain/lottery";
import styles from "../styles/Home.module.css";
import "bulma/css/bulma.css";

export default function Home() {
  const [web3, setWeb3] = useState();
  const [address, setAddress] = useState();
  const [lcContract, setLcContract] = useState();
  const [lotteryPot, setLotteryPot] = useState();
  const [lotteryPlayers, setPlayers] = useState([]);

  useEffect(() => {
    if (lcContract) getPot();
    if (lcContract) getPlayers();
  }, [lcContract, lotteryPot]);

  const updateState = () => {
    if (lcContract) getPot();
    if (lcContract) getPlayers();
    if (lcContract) getLotteryId();
  };

  const getPot = async () => {
    const pot = await lcContract.methods.getBalance().call();
    setLotteryPot(pot);
  };

  const getPlayers = async () => {
    const players = await lcContract.methods.getPlayers().call();
    setPlayers(players);
  };

  const getHistory = async (id) => {
    setLotteryHistory([]);
    for (let i = parseInt(id); i > 0; i--) {
      const winnerAddress = await lcContract.methods.lotteryHistory(i).call();
      const historyObj = {};
      historyObj.id = i;
      historyObj.address = winnerAddress;
      setLotteryHistory((lotteryHistory) => [...lotteryHistory, historyObj]);
    }
  };

  const getLotteryId = async () => {
    const lotteryId = await lcContract.methods.lotteryId().call();
    setLotteryId(lotteryId);
    await getHistory(lotteryId);
  };

  const connectWalletHandler = async () => {
    // setError("");
    // setSuccessMsg("");
    /* check if MetaMask is installed */
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      try {
        /* request wallet connection */
        await window.ethereum.request({ method: "eth_requestAccounts" });
        /* create web3 instance & set to state */
        const web3 = new Web3(window.ethereum);
        /* set web3 instance in React state */
        setWeb3(web3);
        /* get list of accounts */
        const accounts = await web3.eth.getAccounts();
        /* set account 1 to React state */
        setAddress(accounts[0]);

        /* create local contract copy */
        const lc = lotteryContract(web3);
        setLcContract(lc);

        // window.ethereum.on("accountsChanged", async () => {
        // const accounts = await web3.eth.getAccounts();
        // console.log(accounts[0]);
        /* set account 1 to React state */
        // setAddress(accounts[0]);
        // }
        // );
      } catch (err) {
        setError(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  return (
    <div>
      <Head>
        <title>Ether Lottery</title>
        <meta name="description" content="An Ethereum Lottery dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <nav className="navbar mt-4 mb-4">
          <div className="container">
            <div className="navbar-brand">
              <h1>Ether Lottery</h1>
            </div>
            <div className="navbar-end">
              <button onClick={connectWalletHandler} className="button is-link">
                Connect Wallet
              </button>
            </div>
          </div>
        </nav>
        <div className="container">
          <section className="mt-5">
            <div className="columns">
              <div className="column is-two-thirds">
                <section className="mt-5">
                  <p>Enter the lottery by sending 0.01 Ether</p>
                  <button
                    // onClick={enterLotteryHandler}
                    className="button is-link is-large is-light mt-3"
                  >
                    Play now
                  </button>
                </section>
                <section className="mt-6">
                  <p>
                    <b>Admin only:</b> Pick winner
                  </p>
                  <button
                    // onClick={pickWinnerHandler}
                    className="button is-primary is-large is-light mt-3"
                  >
                    Pick Winner
                  </button>
                </section>
                <section className="mt-6">
                  <p>
                    <b>Admin only:</b> Pay winner
                  </p>
                  <button
                    // onClick={payWinnerHandler}
                    className="button is-success is-large is-light mt-3"
                  >
                    Pay Winner
                  </button>
                </section>
              </div>
              <div className={`${styles.lotteryinfo} column is-one-third`}>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Players ({lotteryPlayers.length})</h2>

                        <div></div>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Pot</h2>
                        <p>{lotteryPot} Ether</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2022 Block Explorer</p>
      </footer>
    </div>
  );
}
