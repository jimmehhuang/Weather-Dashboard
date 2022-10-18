//global variables
var APIKey = '492bfb1c167496057a01a6589eba5d8e';
var coordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=';
var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=";
var userFormEl = $('#city-search');
var col2El = $('.col2');
var cityInputEl = $('#city');
var fiveDayEl = $('#forecast');
var searchHistoryEl = $('#search-history');
var currentDay = moment().format('M/DD/YYYY');
var city;
const weatherIconUrl = 'https://openweathermap.org/img/wn/';
var searchHistoryArray = loadSearchHistory();
//weatherbit.io API
var weatherbitKey = "cee3158b81624efdb69c85c5b782d480";
var weatherbitUrl = "https://api.weatherbit.io/v2.0/current?city=";
var weatherToCoordUrl;


//function for search button 

function submitCitySearch(event) {
    event.preventDefault();
    //retrieve city name/value from user input
    city = cityInputEl.val().trim();
    console.log(city);
    //notifies user if searched city has already been searched before
    if (searchHistoryArray.searchedCity.includes(city)) {
        alert(city + ' is included in history below. Click the ' + city + ' button to get weather.');
        cityInputEl.val('');
    } else if (city) {
        getWeather(city);
        searchHistory(city);
        searchHistoryArray.searchedCity.push(city);
        saveSearchHistory();
        //empties form text area
        cityInputEl.val('');                                             
        //if user leaves input box empty
    } else {
        alert("Please enter a city name.");
    }
}

// on submission of user data get user input for city and fetch api data
userFormEl.on('submit', submitCitySearch);

// clears current weather info if new search is performed
$('#search-btn').on('click', function () {
    $('#current-weather').remove();
    $('#forecast').empty();
    $('#five-day-header').remove();
})

//clear search history
// $('#clear-btn').on('click', function(){
// //      $('#search-history').remove();
//       localStorage.clear();
// })

//load cities from local storage and recreates history buttons
function loadSearchHistory() {
    var searchHistoryArray = JSON.parse(localStorage.getItem('search history'));
    // creates new object to track user inputs
    if (!searchHistoryArray) {
        searchHistoryArray = {
            searchedCity: [],
        };
    } else {
        //adds search history buttons to page
        for (var i = 0; i < searchHistoryArray.searchedCity.length; i++) {
            searchHistory(searchHistoryArray.searchedCity[i]);
        }
    }
    return searchHistoryArray;
}

//save to local storage
function saveSearchHistory() {
    localStorage.setItem('search history', JSON.stringify(searchHistoryArray));
};

//function to create history buttons
function searchHistory(city) {
    var searchHistoryBtn = $('<button>').addClass('btn').text(city)
        .on('click', function () {
            $('#current-weather').remove();
            $('#forecast').empty();
            $('#five-day-header').remove();
            weatherToCoordUrl = weatherbitUrl + city + "&key=" + weatherbitKey;
            getWeather(city);
        })
        .attr({
            type: 'button'
        });

    // append btn to search history div
    searchHistoryEl.append(searchHistoryBtn);
}

//using weatherbit.io to retrieve city coordinates from inputted name without needing state code
function getWeather(){
    fetch(weatherToCoordUrl).then(function(response){
        if(response.ok){
            return response.json().then(function(data){
                var cityLatitude = data.data[0].lat;
                var cityLongitude = data.data[0].lon;
                //console.log(cityLatitude);
                //console.log(cityLongitude);
                // fetch weather information from API
                var weatherUrl = coordinatesUrl + cityLatitude + '&lon=' + cityLongitude + '&appid=' + APIKey + '&units=imperial';
                //console.log(weatherUrl);
                fetch(weatherUrl).then(function (response) {
                    if (response.ok) {
                        return response.json().then(function (weatherData) {
                        // today's weather
                        //add div to hold current day details
                        var currentWeatherEl = $('<div>').attr({id: 'current-weather'})
                        // get the weather icon from API for searched city
                        var weatherIcon = weatherData.weather[0].icon;
                        var cityCurrentWeatherIcon = weatherIconUrl + weatherIcon + '.png';
                        // create a header to display city + current day + current weather icon
                        var cityInputEl = $(`#city`);
                        city = cityInputEl.val().trim();
                        var currentWeatherHeadingEl = $('<h2>').text('Your weather for today (' + currentDay + '):');
                        // create img element to display icon
                        var iconImgEl = $('<img>').attr({
                                id: 'current-weather-icon',
                                src: cityCurrentWeatherIcon,
                                alt: 'Weather Icon'
                                })
                        //create list of current weather details
                        var currWeatherListEl = $('<ul>')
                        var currWeatherDetails = [
                            "Temperature: " + weatherData.main.temp + " °F", 
                            "Wind Speed: " + weatherData.wind.speed + " MPH", 
                            "Humidity: " + weatherData.main.humidity + "%", 
                            ]
                        for (var i = 0; i < currWeatherDetails.length; i++) {
                            //creates individual list items and add to unordered list
                            var currWeatherListItem = $('<li>').text(currWeatherDetails[i])
                            currWeatherListEl.append(currWeatherListItem);
                        }
                        //append above items to current weather section
                        $('#forecast').before(currentWeatherEl);
                        currentWeatherEl.append(currentWeatherHeadingEl);
                        currentWeatherHeadingEl.append(iconImgEl);
                        currentWeatherEl.append(currWeatherListEl);

                        // 5-day forecast section
                        //create header
                        var fivedayUrl = forecastUrl + cityLatitude + "&lon=" + cityLongitude + "&appid=" + APIKey + '&units=imperial';
                        console.log(fivedayUrl);
                        fetch(fivedayUrl).then(function(response){
                            if(response.ok){
                                return response.json().then(function(forecastData) {
                                    //create headers
                                    var forecastHeaderEl = $('<h2>').text('5-Day Forecast:').attr({
                                        id: 'five-day-header'
                                    })
                                    //append 5 day forecast header after current weather div
                                    $('#current-weather').after(forecastHeaderEl)
                                    // array for the dates for the next 5 days
                                    var forecastArray = [];
                                    for (var x = 0; x < 5; x++) {
                                        let forecastDate = moment().add(x + 1, 'days').format('M/DD/YYYY');
                                        forecastArray.push(forecastDate);
                                    }
                                    // for each date in the array create a card displaying temp, wind and humidity
                                    for (var x = 0; x < forecastArray.length; x++) {
                                        var cardDivEl = $('<div>').addClass('col3');
                                        var cardBodyDivEl = $('<div>').addClass('card-body');
                                        var cardTitleEl = $('<h3>').addClass('card-title').text(forecastArray[x]);
                                        var forecastIcon = forecastData.list[x].weather[0].icon;
                                        var forecastIconEl = $('<img>').attr({
                                            src: weatherIconUrl + forecastIcon + '.png',
                                            alt: 'Weather Icon'
                                        });
                                        // create card text displaying weather details, increments of 3 hrs                           
                                        var tempEL = $('<p>').addClass('card-text')
                                            .text('Temp: ' + forecastData.list[x*8].main.temp + ' °F')
                                        var windEL = $('<p>').addClass('card-text')
                                            .text('Wind: ' + forecastData.list[x*8].wind.speed + ' MPH')
                                        var humidityEL = $('<p>').addClass('card-text')
                                            .text('Humidity: ' + forecastData.list[x*8].main.humidity + '%')
                                        //append card elements to cards
                                        fiveDayEl.append(cardDivEl);
                                        cardDivEl.append(cardBodyDivEl);
                                        cardBodyDivEl.append(cardTitleEl);
                                        cardBodyDivEl.append(forecastIconEl);
                                        cardBodyDivEl.append(tempEL);
                                        cardBodyDivEl.append(windEL);
                                        cardBodyDivEl.append(humidityEL);
                                    }
                                })
                            }
                        })
                        })
                    }
                    // if fetch goes through but Open Weather can't find details for city
                     else {
                        alert("Error: Open Weather unable to find city");
                    }
                })
            })
        } else {
            alert("Unable to connect to Open Weather!");
        }
    })
}