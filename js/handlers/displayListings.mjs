import {
  getListings,
  getListing,
  getActiveListings,
  getEndedListings,
} from "../listings/read.mjs";
import { BidOnListing } from "../listings/bid.mjs";
import {
  listingsActive,
  listingsEnded,
  myListingsOnly,
  allListingsbtn,
  userName,
  searchForm,
  searchInput,

} from "../api/constants.mjs";
import { deleteListing } from "../handlers/deleteListing.mjs";
import { getProfileListings } from "../api/profile.mjs"

export function displayBids(bids) {
  let bidsHtml = "";
  for (let i = 0; i < bids.length; i++) {
    const bid = bids[i];
    bidsHtml += ` 
    <div class="card-div">
      <h3 class="card-text m-2">${bid.bidderName}</h3>
      <h3 class="card-text m-2">${bid.created.slice(0, 10)}</h3>
      <h3 class="card-text m-2"><strong>${bid.amount}</strong></h3>
    </div>
    <hr/>
    `;
  }
  return bidsHtml;
}


function displayListing(listing) {
  let listingHTML = "";
  listingHTML = `
        <div class="col" id="listItem_${listing.id}">
            <div class="card text-center mx-auto align-items-center">
            <h5 class="card-title mt-3 mb-0 capitalize">${listing.title}</h5>
            <div>`;
  if (listing.media && listing.media.length > 0) {
    listingHTML += `<img
              src="${listing.media[0]}"
              class="d-block card-img-bid-big"
              alt="Image of listing"
            />`
  }
  listingHTML += `
          </div>
              <div class="card-body text-center">
              <div class="card-div2">
                  <h3 class="me-3 capitalize">${listing.seller.name}</h3>
                  <h3>Ends: ${listing.endsAt.slice(0, 10)}</h3>
                </div>
                <hr class="mt-1 mb-2" />
                <a class="btn" type="button" href="/single-listing.html?id=${listing.id}">
                  View Listing
                </a>
                <button
                  class="btn"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#list_${listing.id}"
                  aria-expanded="false"
                  aria-controls="collapseExample"
                  href="collapsetext"
                >
                ${listing._count.bids}
                  Bids
                  <i class="fa-solid fa fa-coins"></i>
                </button>

                <div class="collapse" id="list_${listing.id}">
                  <div class="card2 card-body">
                  <hr/>
                  `;
  listingHTML += displayBids(listing.bids);
  listingHTML += `
                  
                  </div>
                </div>`;
  if (listing.seller.name === userName) {
    listingHTML += `<button class="btn del-button" type="button" id="${listing.id}">Delete</button>`;
  } else {

    listingHTML += ` 
                <div>
                  <button
                  class="btn-2 w25 btn-yellow mt-3"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#bidbtn_${listing.id}"
                  aria-expanded="false"
                  href="collapsetext"
                > 
                  BID
                </button>
          
                <div class="collapse" id="bidbtn_${listing.id}">
                  <form  class="form-inline mx-auto" role="form" onsubmit="return false">
                    <div class="form-group">
                    <label for="Bid" class="form-label"></label>
                    <input id="bidAmount_${listing.id}" type="number" name="Bid" class="form-control" placeholder="Place your Bid">
                  </div>
                  <button class="mt-3 btn btn-yellow" onclick="makeBid(event, '${listing.id}')">Place BID</button>
                </form>
                </div>
                </div>`;
  }
  listingHTML += `
              </div>
            </div>
          </div> `;
  return listingHTML;
}

export function displayListings(listings, containerId) {
  const listingContainer = document.querySelector(containerId);
  listingContainer.innerHTML = "";
  for (let i = 0; i < listings.length; i++) {
    listingContainer.innerHTML += displayListing(listings[i]);
  }
  deleteListing();
}

export async function makeBid(event, id) {
  event.preventDefault();
  const amountInput = document.querySelector(`#bidAmount_${id}`);
  await BidOnListing(id, parseInt(amountInput.value))

  let listing = document.querySelector(`#listItem_${id}`);
  const listingData = await getListing(id);
  listing.outerHTML = displayListing(listingData);
  return false;
}

window.makeBid = makeBid;

//-search -listings -filter 

export async function listingFeed() {
  const listings = await getListings();
  const activeListings = await getActiveListings();
  const endedListings = await getEndedListings();
  let isShowingSearchResults = false;

  if (myListingsOnly) {
    const myListings = await getProfileListings();
    myListingsOnly.addEventListener("click", function () {
      searchInput.value = "";
      displayListings(myListings, "#listingsFeed")
    });
  }

  listingsEnded.addEventListener("click", function () {
    searchInput.value = "";
    displayListings(endedListings, "#listingsFeed")
  });

  listingsActive.addEventListener("click", function () {
    searchInput.value = "";
    displayListings(activeListings, "#listingsFeed")
  });

  allListingsbtn.addEventListener("click", async function () {
    searchInput.value = "";
    displayListings(listings, "#listingsFeed")
  });

  function doSearch(searchValue) {
    if (searchValue.length === 0 && isShowingSearchResults) {
      displayListings(listings, "#listingsFeed");
      isShowingSearchResults = false;
      return;
    }
    const filteredSearch = listings.filter(function (listing) {
      if (listing.title.toLowerCase().includes(searchValue)) {
        return true;
      }
      if (listing.seller.name.toLowerCase().includes(searchValue)) {
        return true;
      }
      if (listing.id.toString().includes(searchValue)) {
        return true;
      }
      return false;
    });
    searchForm.reset();
    if (filteredSearch.length === 0) {
      alert("No listings found");
    } else {
      isShowingSearchResults = true;
      displayListings(filteredSearch, "#listingsFeed");
    }
  }
  searchForm.onsubmit = (event) => {
    event.preventDefault();
    const value = searchInput.value.trim().toLowerCase();
    doSearch(value);
    return false;
  }
}

export async function allListings() {
  let listings = await getListings();
  displayListings(listings, "#listingsFeed");
}