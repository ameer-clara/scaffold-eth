/* global chrome */

var chainId = 0;

const fetchGReviews = async (chainId, address, id) => {
  const review = await fetch(
    `https://api.thegraph.com/subgraphs/name/ameer-clara/honft-test`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
                  newReviews(
                    where: {
                      assetHash: "${address}",
                      assetId: "${id}"
                    }
                  ) {
                    id, sender, assetHash, assetId, review, rating
                  }
                }`,
      }),
    }
  );

  return (await review.json())?.data?.newReviews;
};

const buildReviewsHtml = ({ createdAt, userName, sender, rating, review }) => {
  let html = `
        <div display="inline-block">
          <span class="row">Posted: <i>Today</i> &nbsp;&nbsp; Rating: ${"⭐".repeat(rating)}</span>
          <span class="row"><a class="styles__StyledLink-sc-l6elh8-0 hubhNL Blockreact__Block-sc-1xf18x6-0 laCjUo AccountLink--ellipsis-overflow" href="${sender}"></a></span><br/></br/>
          <span class="row" style="font-size: 15px; padding: 10px 0px;">${review}</span><br/><br/>
        </div>
        <hr/>`;
  const el = document.createElement("div");
  el.innerHTML = html;
  el.style = "padding:0.5em;";
  el.className = "review-wrap";
  return el;
};

const injectReviewForm = async (address, id) => {
  console.log("injecting review form");
  const reviewSection = document.createElement("div");
  reviewSection.style = "padding: 0.5em; border: 1p solid #fafafa; border-radius: 5px;"
    + "background: #f5f5f5; margin: 0.5em;";
  reviewSection.innerHTML = `<h3 style="color: #68099a;">Reviews from The Graph</h3>`;
  document.querySelector(".TradeStation--main")
    .parentElement.appendChild(reviewSection);

  // TODO: insert review form

  // don't process if there are no reviews
  const fetchReviews = await fetchGReviews(chainId, address, id);
  console.log("fetched review: ", fetchReviews);
  for (let i = 0; i < fetchReviews?.length; i++) {
    const review = fetchReviews[i];
    console.log("review: ", review);
    const reviewEl = buildReviewsHtml(review);
    reviewSection.appendChild(reviewEl);
  }
  if (!fetchReviews || fetchReviews.length < 1) {
    const emptyMsg = `<p>No reviews found for this asset</p>`;
    reviewSection.insertAdjacentHTML("beforeend", emptyMsg);
  }
  console.log("done fetching reviews");
};

/**
 * renderReviews() embeds reviews on asset page
 * @param {*} address asset collection hash
 * @param {*} id asset id
 */
async function renderReviews(address, id) {
  const url = window.location;
  console.log("url:", window.location);
  // const { address, id } = getAddressAndId(url) || "";
  // if address and id are found, then we are on an NFT page
  if (address && id) {
    console.log("On NFT page:");
    await injectReviewForm(address, id);

    // user on NFT page inject review area
  } else if (url.href.includes("collection")) {
    console.log("On Collection page:");
  }
}

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

let sendPayloadToExtension = (nftPayload) => {
  // send message to the background script to open the extension in a popup window
  chrome.runtime.sendMessage({ open: true }, async (response) => {
    console.log(response);
    // wait for the window to load
    await delay(1000);
    // send message to extension to perform the transaction
    console.log("sending payload....", nftPayload);
    chrome.runtime.sendMessage(nftPayload, (response) => {
      console.log(response);
    });
  });
};

// initial page load
(async function main() {
  const url = window.location;
  console.log("url:", url);
  const nftPayload = getAddressAndId(url) || "";
  const { address, id } = nftPayload;

  // if address and id are found, then we are on an NFT page
  if (address && id) {
    console.log("On NFT page:");

    // test comms with background script/extension
    sendPayloadToExtension(nftPayload);

    // Insert reviews
    await renderReviews(address, id);

    // user on NFT page inject review area
  } else if (url.href.includes("collection")) {
    console.log("On Collection page:");
  }
})();
