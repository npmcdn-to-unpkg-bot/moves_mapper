# Moves Live Map Tracker
This is a small app written for the www.i-remember.com.au charity ride.

It extracts GEO data from the Moves API detailed https://dev.moves-app.com/ and outputs the trail taken onto a map. 

## Requirements
Details of the following will need to be passed into the init function as a conf dict.

- Moves Access Token
- Proxy of the https://api.moves-app.com/api/1.1/user/storyline API which can be queried via XHR
- Mapbox project id and public access token
