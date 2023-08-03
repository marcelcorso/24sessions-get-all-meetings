const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config()

let instance = "meet"; // or supervista or ... 
let apiDomain = `https://${instance}.api.24sessions.com`;

// TODO we don't need to request this all the time. cache it until it expires
async function getAccessToken() {

  let params = {
    "client_id": process.env.CLIENT_ID,
    "client_secret": process.env.CLIENT_SECRET,
    "grant_type": "client_credentials",
  };

  let query = new URLSearchParams(params).toString(); 
	let url = apiDomain + "/oauth/v2/token?" + query; 

  const resp = await fetch(url)
    .then(response => response.json());

  return resp.access_token;
}

let allMeetings = [];

let page = 1;

fetchData(page, allMeetings);


async function fetchData(page, meetings) {

  let pagePath = `/meetings?page=${page}`
  let pageURL = apiDomain + pagePath;

  console.log("fetching " + pageURL);

  let token = await getAccessToken();

  let headers = {
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token, 
  };

  // Retrieve a list of all articles from Intercom
  fetch(pageURL, { headers: headers})
    .then(response => response.json())
    .then(data => {
      console.log("page", data['@id']);
      for (const meeting of data['hydra:member']) {
        meetings.push(meeting);
      }

      // if current page is different than the last page
      if (data['@id'] != data['hydra:lastPage']) {
        // recurse
        fetchData(page+1, meetings);
      } else {
        let meetingCount = meetings.length;
        console.log(`we are at the last page! we got ${meetingCount} meetings in total.`)
      }
    })
    .catch(error => console.error(error));
}

