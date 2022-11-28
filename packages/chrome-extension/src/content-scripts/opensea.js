/* eslint-disable no-undef */

var chainId = 0;

// extract NFT address and id from link
let getAddressAndId = (link) => {
  if (!link.href.includes("collection")) {
    // not processing solana
    if (link.href.includes("solana")) {
      console.log("Solana support is not yet available 😭");
      return null;
    }
    if (chainId === 0) {
      if (link.href.includes("klaytn")) {
        console.log("Chain: Klaytn");
        chainId = 8217;
      } else if (link.href.includes("matic")) {
        console.log("Chain: Matic");
        chainId = 137;
      } else {
        console.log("Chain: Ethereum");
        chainId = 1;
      }
    }
  }

  let fragments = link.href.split("/");
  let address = null;
  let id = null;
  for (let i = 0; i < fragments.length; i++) {
    let f = fragments[i];
    if (f.includes("0x")) {
      address = f;
      id = fragments[i + 1]; // id always follows address
      break;
    }
  }
  if (address !== null && id != null) {
    const key = chainId + address + id;

    console.log(
      "Processing : ",
      address + ", id: ",
      id + ", chain: ",
      chainId,
      ", key: ",
      key
    );
    return { address, id, key, chainId };
  } else {
    return null;
  }
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let sendPayloadToExtension = ({ address, id, chainId }) => {
  // send message to the background script
  chrome.runtime.sendMessage({ open: true }, async function (response) {
    console.log(response);
    // wait for the window to load
    await delay(1000);
    console.log("sending message....", address);
    // send message to the extension popup
    chrome.runtime.sendMessage({ address, id, chainId }, function (response) {
      console.log(response);
    });
  });
};

// initial page load
(async function main() {
  const url = window.location;
  console.log("url:", url);
  const { address, id } = getAddressAndId(url) || "";
  const nftPayload = getAddressAndId(url) || "";

  // if address and id are found, then we are on an NFT page
  if (address && id) {
    console.log("On NFT page:");

    // test comms with background script/extension
    sendPayloadToExtension(nftPayload);

    // user on NFT page inject review area
  } else if (url.href.includes("collection")) {
    console.log("On Collection page:");
  }
})();
