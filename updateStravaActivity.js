//require('dotenv').config();
const strava = require('strava-v3');
const axios = require('axios');

// Configuration from environment variables
const clientId = process.env.STRAVA_CLIENT_ID;
const clientSecret = process.env.STRAVA_CLIENT_SECRET;
let refreshToken = process.env.STRAVA_REFRESH_TOKEN;
const textToPrependDesc = 'Glory To My Lord And Saviour Jesus Christ.'; // Text to prepend to the activity description
const textToPrependName = 'Praise the Lord Jesus Christ: '; // Text to prepend to the activity description

// Function to refresh access token
async function refreshAccessToken() {
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to get the latest activity
async function getLatestActivity(accessToken) {
  return new Promise((resolve, reject) => {
    strava.athlete.listActivities({ access_token: accessToken, per_page: 5, page: 1 }, (err, payload) => {
      if (err) {
        console.error('Error fetching activities:', err);
        return reject(err);
      }
      if (!payload || payload.length === 0) {
        return reject(new Error('No activities found'));
      }
      resolve(payload);
    });
  });
}

// Function to update activity description
async function updateActivityDescription(accessToken, activityId, currentDescription, newText,nameTxt,nameNew) {
  const newDescription = newText + (currentDescription || '');
  const newNameUpdate = nameNew + (nameTxt || '');
  if (nameTxt && nameTxt.startsWith("Praise"))
    return new Promise((resolve, reject) => {
      resolve("No Need to Update");
    });
  return new Promise((resolve, reject) => {
    strava.activities.update(
      {
        access_token: accessToken,
        id: activityId,
        description: newDescription,
        name: newNameUpdate
      },
      (err, payload) => {
        if (err) {
          console.error('Error updating activity:', err);
          return reject(err);
        }
        resolve("Successfully Updated");
      }
    );
  });
}

// Main function to execute the logic
async function main() {
  try {
    // Step 1: Refresh access token
    const accessToken = await refreshAccessToken();
    console.log('Access token refreshed successfully');

    // Step 2: Get the latest activity
    const latestActivity = await getLatestActivity(accessToken);
    //console.log('Latest activity:', latestActivity.name,latestActivity.id);

    // Step 3: Update the activity description
    //updatedActivity=""
    for (const act of latestActivity)
      {
        const updatedActivity = await updateActivityDescription(
          accessToken,
          act.id,
          act.description,
          textToPrependDesc,
          act.name,
          textToPrependName
        );
        if(updatedActivity=="No Need to Update")
            console.log('No Need to Update');
        else
        console.log('Activity updated successfully:', act.id);
      }
    
  } catch (error) {
    console.error('Error in main process:', error.message);
  }
}

// Run the script
main();