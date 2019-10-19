var APIkey = 'HnjUqj64YGTy3issTGRAHpa8OY2ISTLk0h6mkGBPHS5c7vzEne';
var secret = '9Duuxvzs7cN68tlp0Hfz0AbZNONGNSOhcC7gyHeq';
var token;
var organizations = 'https://api.petfinder.com/v2/organizations/?location=55414';
var tokenURL = 'https://api.petfinder.com/v2/oauth2/token';

let authorization = {
    withCredentials: true,
    credentials: 'include',
    headers: {
        'Authorization': 'Bearer ' + token,
    } 
}

let tokenFields = {
    method: 'POST',
    body: 'grant_type=client_credentials' + 
          '&client_id=' + APIkey + 
          '&client_secret=' + secret,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

function getToken() {
    fetch(tokenURL, tokenFields)
    .then((response) => response.json())
    .then(function(data) {
        token =  data.access_token;
        console.log(data); 
    })
}

function getData() {
    fetch(organizations, authorization)
        .then(response => {
            return response.json();
        })
        .then(responseData => {
            console.log(responseData);
        });
}

const sendData = () => {
    sendHTTP
}