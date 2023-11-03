var redirect_uri = "http://websys-f22-team4.eastus.cloudapp.azure.com/ITWS2110-F22-BriansBots/project/home.html";
 
var client_id = "dbc4912c071543e78f2a667abed78e04"; 
var client_secret = "7e2d78ed06234eb4bfa0d19d86a5d462"; 

var access_token = null;
var refresh_token = null;

var recommendation_artist_seed = "https://api.spotify.com/v1/recommendations?seed_artists=";
var recommendation_tracks_seed = "https://api.spotify.com/v1/recommendations?seed_tracks=";

const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
const PLAYER = "https://api.spotify.com/v1/me/player";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const CURRENTLYPLAYING = "https://api.spotify.com/v1/me/player/currently-playing";
const SHUFFLE = "https://api.spotify.com/v1/me/player/shuffle";

function onPageLoad(){
    access_token = localStorage.getItem("access_token");
}

function handleRedirect() {
    if (localStorage.getItem("access_token") === null) { 
        let code = getCode();
        fetchAccessToken( code );
        window.history.pushState("", "", redirect_uri); // remove param from url
    }
    else { 
        if (window.location.href.length > 25) { 
            let code = getCode();
            fetchAccessToken(code);
            window.history.pushState("", "", redirect_uri); 
            console.log(access_token);// remove param from url
            onPageLoad();
        }
        fetchProfile();
    }
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}


function requestAuthorization(){

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private user-top-read user-follow-read";
    window.location.href = url; // Show Spotify's authorization screen
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    var data = JSON.parse(this.responseText);
    console.log(data);
    if ( this.status == 200 ){
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
            
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        fetchProfile();
        //onPageLoad();
    }

}

function refreshDevices(){
    callApi( "GET", DEVICES, null, handleDevicesResponse );
}

function handleDevicesResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems( "devices" );
        data.devices.forEach(item => addDevice(item));
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}


function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function fetchRecentlyPlayed(){    
    callApi( "GET", "https://api.spotify.com/v1/me/player/recently-played", null, handleRecentlyPlayed);
}

function fetchTopTracks(){    
    callApi( "GET", "https://api.spotify.com/v1/me/top/tracks", null, handleTopTracks);
}

function fetchTopTracks4Weeks() {
    callApi( "GET", "https://api.spotify.com/v1/me/top/tracks?time_range=short_term", null, handleTopTracks4Weeks);
}

function fetchTopTracks6Months() {
    callApi( "GET", "https://api.spotify.com/v1/me/top/tracks?time_range=medium_term", null, handleTopTracks6Months);
}

function fetchTopTracksAllTime() {
    callApi( "GET", "https://api.spotify.com/v1/me/top/tracks?time_range=long_term", null, handleTopTracksAllTime);
}

function fetchTopArtists() {
    callApi("GET", "https://api.spotify.com/v1/me/top/artists", null, handleTopArtists);
}

function fetchProfile() { 
    callApi("GET", "https://api.spotify.com/v1/me", null, handleProfile);
}

function fetchArtistsRecommendations() {
    callApi("GET", recommendation_artist_seed, null, handleRecommendationsArtists);
}

function fetchTracksRecommendations() {
    callApi("GET", recommendation_tracks_seed, null, handleRecommendationsTracks);
}

function handleRecommendationsArtists() {
    if (this.status == 200) {
        let recommend_data = JSON.parse(this.responseText);

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                let nameElement = document.getElementsByClassName("content-name")[i * 3 + j];
                let linkElement = document.getElementsByClassName("content-link")[i * 3 + j];
                nameElement.innerHTML = recommend_data.tracks[i * 3 + j].artists[0].name;
                linkElement.href = recommend_data.tracks[i * 3 + j].artists[0].external_urls.spotify;
            }
        }
    }

}

function handleRecommendationsTracks() {
    if (this.status == 200) {
        recommend_data = JSON.parse(this.responseText);

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                let nameElement = document.getElementsByClassName("content-name")[i * 3 + j + 15];
                let linkElement = document.getElementsByClassName("content-link")[i * 3 + j + 15];
                nameElement.innerHTML = recommend_data.tracks[i * 3 + j].name;
                linkElement.href = recommend_data.tracks[i * 3 + j].external_urls.spotify;
            }
        }
    }
}

function handleProfile() { 
    if (this.status == 200) { 
        data = JSON.parse(this.responseText);
        //console.log(this.responseText);    
        imageURL = "user.png";
        if (data.images.length != 0) { 
            imageURL = data.images[0].url;
        }  
        
        let accountMenu = '<div class="profile" onclick="menuToggle();"> <li><img src="' + imageURL + '" alt="spotify profile picture"></li></div>';
        accountMenu += '<div class="menu"><h3>' + data.display_name + '<div>' + data.email + '</div></h3><ul><li>';
        accountMenu += '<span class="material-icons icons-size">person</span><a href="' + data.external_urls.spotify + '">My Profile</a></li>'
        accountMenu += ' <li><span class="material-icons icons-size">logout</span><a href="#">Logout</a></li></ul></div></div>';
        //console.log(accountMenu);
        
        document.getElementById("account-menu").innerHTML = accountMenu;/* = data.display_name + "<div>" + data.email + "</div>"; */
    }
}

function storeAccount(){
    if (this.status == 200) { 
        data = JSON.parse(this.responseText);
    $.post("saveAccount.php",
    {
        display: data.display_name,
        email: data.email,
    });
}
}

function handleRecentlyPlayed() { 
    if (this.status == 200) { 
        recent_data = JSON.parse(this.responseText);
        createRecentsTable(recent_data);
    }
}

function handleTopTracks() {
    let data = JSON.parse(this.responseText);
    recommendation_tracks_seed = "https://api.spotify.com/v1/recommendations?seed_tracks=";
    for (let i = 0; i < Math.min(5, data.items.length); i++) {
        recommendation_tracks_seed += data.items[i].id;
        if (i < Math.min(5, data.items.length) - 1) {
            recommendation_tracks_seed += ',';
        }
    }
    fetchTracksRecommendations();
}

function handleTopArtists() {
    let data = JSON.parse(this.responseText);
    recommendation_artist_seed = "https://api.spotify.com/v1/recommendations?seed_artists=";
    for (let i = 0; i < Math.min(5, data.items.length); i++) {
        recommendation_artist_seed += data.items[i].id;
        if (i < Math.min(5, data.items.length) - 1) {
            recommendation_artist_seed += ',';
        }
    }

    for (let i = 0; i < 5; i++) {
        let element = document.getElementsByClassName("content-image");
        //console.log(data.items[0].images.length);
        //console.log(data.items);
        element[i].src =  data.items[i].images[0].url;
        element[i + 5].src = data.items[i].images[0].url;
    }
    fetchArtistsRecommendations();
}

function handleTopTracks4Weeks() { // Handles the top tracks for 4 weeks
    if (this.status == 200) {     
        top4Weeks = JSON.parse(this.responseText);
        createTopTable4Weeks(top4Weeks);
    }
}

function handleTopTracks6Months() { // Handles the top tracks for 6 months
    if (this.status == 200) {     
        top6Months = JSON.parse(this.responseText);
        createTopTable6Months(top6Months);
    }
}

function handleTopTracksAllTime() { // Handles the top tracks of All Time
    if (this.status == 200) {     
        topAllTime = JSON.parse(this.responseText);
        createTopTableAllTime(topAllTime);
    }
}

function createTopTable4Weeks(song_data) {  
    for (let i = 0; i < song_data.items.length; i++) {
        track  ='<tr>';
        track += '<td><b>' + song_data.items[i].name + '</b></td>';
        track += '<td><b>' + song_data.items[i].artists[0].name + '</b></td>';
        track += '<td><a target="_blank" href="http://open.spotify.com/track/' + song_data.items[i].uri.substring(14) + '"> <img src="./images/Spotify_icon.png" width=35px alt="spotify icon"></a></td>';
        track += '</tr>';
        $('#four-weeks-table').append(track);
    }
}

function createTopTable6Months(song_data) {  
    for (let i = 0; i < song_data.items.length; i++) {
        track  ='<tr>';
        track += '<td><b>' + song_data.items[i].name + '</b></td>';
        track += '<td><b>' + song_data.items[i].artists[0].name + '</b></td>';
        track += '<td><a target="_blank" href="http://open.spotify.com/track/' + song_data.items[i].uri.substring(14) + '"> <img src="./images/Spotify_icon.png" width=35px alt="spotify icon"></a></td>';
        track += '</tr>';
        $('#six-months-table').append(track);
    }
}

function createTopTableAllTime(song_data) {  
    for (let i = 0; i < song_data.items.length; i++) {
        track  ='<tr>';
        track += '<td><b>' + song_data.items[i].name + '</b></td>';
        track += '<td><b>' + song_data.items[i].artists[0].name + '</b></td>';
        track += '<td><a target="_blank" href="http://open.spotify.com/track/' + song_data.items[i].uri.substring(14) + '"> <img src="./images/Spotify_icon.png" width=35px alt="spotify icon"></a></td>';
        track += '</tr>';
        $('#all-time-table').append(track);
    }
}

function createRecentsTable(song_data) {
    for (let i = 0; i < song_data.items.length; i++) { 
        let tempDate = new Date(song_data.items[i].played_at);
        let formatted = "";
        if (tempDate.getMonth() < 10) { 
            formatted += '0';
        }
        formatted += tempDate.getMonth() + '/';
        if (tempDate.getDay() < 10) { 
            formatted += '0';
        }
        formatted += tempDate.getDay() + '/'
        formatted += tempDate.getFullYear() + ' ';
        if (tempDate.getHours() < 10) { 
            formatted += '0';
        }
        formatted += tempDate.getHours() + ':';
        if (tempDate.getMinutes() < 10) { 
            formatted += '0';
        }
        formatted += tempDate.getMinutes() + ':';
        if (tempDate.getSeconds() < 10) { 
            formatted += '0';
        }
        formatted += tempDate.getSeconds();
        track = '<tr>';
        track += '<td><b>' +
            song_data.items[i].track.name + '</b></td>';
        track += '<td><b>' +
            song_data.items[i].track.artists[0].name + '</b></td>';
        track += '<td><a target="_blank" href="http://open.spotify.com/track/' + song_data.items[i].track.uri.substring(14) + '"> <img src="./images/Spotify_icon.png" width=35px alt="spotify icon"></a></td>';
        track += '<td><b>' +
            formatted + '</b></td>';
        track += '</tr>';
        $('#table').append(track);
    }
}


function removeAllItems( elementId ){
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}


function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
}



function deleteCache() { 
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
}




