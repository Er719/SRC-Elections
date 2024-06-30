import React, { useContext, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { AiFillLock, AiFillUnlock } from 'react-icons/ai';

// INTERNAL IMPORT
import { VotingContext } from '../../context/Voter';
import Style from './NavBar.module.css';
import images from '../../assets';

const NavBar = () => {
  const { connectWallet, error, currentAccount } = useContext(VotingContext);
  const [openNav, setOpenNav] = useState(true);

  const openNavigation = () => {
    setOpenNav(!openNav);
  };

  return (
    <div className={Style.navbar}>
      {error === "" ? (
        ""
      ) : (
        <div className={Style.message__box}>
          <div className={Style.message}>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className={Style.navbar_box}>
        <div>
          <Link href={{ pathname: '/' }}>
            <Image src={images.logo} alt="Navbar logo" width ={100} height = {70} />
          </Link>
        </div>

        <div className={Style.connect}>
          {currentAccount ? (
            <div>
              <div className={Style.connect_flex}>
                <button onClick={openNavigation}>
                  {currentAccount.slice(0, 10)}...
                </button>
                {currentAccount && (
                  <span>
                    {openNav ? (
                      <AiFillUnlock onClick={openNavigation} />
                    ) : (
                      <AiFillLock onClick={openNavigation} />
                    )}
                  </span>
                )}
              </div>
              <div>
                {openNav && (
                  <div className={Style.navigation}>
                    <p>
                      <Link href = {{ pathname: "/" }}>Home</Link>
                    </p>
                    <p>
                      <Link href = {{ pathname: "candidate-registration" }}>Register Candidate</Link>
                    </p>
                    <p>
                      <Link href = {{ pathname: "allowed-voters" }}>Register Voter</Link>
                    </p>
                    <p>
                      <Link href = {{ pathname: "voterList" }}>Voter List</Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </div>
    // </div>
  );
};

export default NavBar;
