// const { async } = require("postcss-js");
// const { combinator } = require("postcss-selector-parser");
// const { json } = require("stream/consumers");
// const { getFormattedTokens } = require("sucrase");

// const { async } = require("postcss-js");

const userTab=document.querySelector("[data-userWeatehr]");
const searchTab=document.querySelector("[data-searchWeather]");
const userContainer=document.querySelector(".weather-container");
const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".Loading-container");
const userInfoContainer=document.querySelector(".user-info-container");
const errorContainer = document.querySelector(".error-container");

let currentTab=userTab;
const API_KEY='c21fdf989842b17537273872ba595019';
currentTab.classList.add("current-tab");


// intialy if data will be their then fatch the data
getfromSessionStroage();

// sewitching the tab
function switchTab(clickedTab){
    
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");
        errorContainer.classList.remove("active");

        //active class is use for visibe or Invisible the form 
        if(!searchForm.classList.contains("active")){
            // search tab is inisible the create visible 
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // pala search tab par hata , your tab active karvu  
            userInfoContainer.classList.remove("active");
            searchForm.classList.remove("active");
            // ab main your weather tab me aagye he , toh weather bhi display kara padega , so let's check local storage  firt 
            // for coordinates , if we haved seved them there .
            getfromSessionStroage();
        }

    }

}
userTab.addEventListener('click',() =>{
    // pass clicked tab as input parametr 
    switchTab(userTab);
})

searchTab.addEventListener('click',() =>{
    // pass clicked tab as input parametr 
    switchTab(searchTab);
})

// check if cordinates are already present in session storage
function getfromSessionStroage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if(!localCoordinates){
        // agar local coordinates nahi mile to 
        grantAccessContainer.classList.add("active");
    }
    else{
        const cordinates = JSON.parse(localCoordinates);

        fetchUserWeatherInfo(cordinates);
    }

}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon}=coordinates;
     
    // make grantcontainer invisible 
    
    grantAccessContainer.classList.remove("active");
    // make loding scree visible
    loadingScreen.classList.add("active");

    // API CALL
    try{
        const responce= await fetch( `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await responce.json();

        // make loding scree invisible
        loadingScreen.classList.remove("active");

        userInfoContainer.classList.add("active");
        // UI me value put kara ke liye 
        renderWeatherInfo(data);

    }
    catch(err){
        // make loding scree invisible
        // loadingScreen.classList.remove("active");
        // alert(" Please Enter City Name  agian")
        grantAccessContainer.classList.add("active");

    }
}

function renderWeatherInfo(weatherinfo){
    //fistly ,we have to fatch the element 
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon= document.querySelector("[data-countryIcon]");
    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");
    const windspeed=document.querySelector("[data-windspeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");

    // fetch value from weatherIndfo 
    cityName.innerText = weatherinfo?.name;
    countryIcon.src=`https://flagcdn.com/144x108/${weatherinfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText=weatherinfo?.weather?.[0]?.description
    weatherIcon.src=`http://openweathermap.org/img/w/${weatherinfo?.weather?.[0]?.icon}.png`;
    temp.innerText=`${weatherinfo?.main?.temp} °C`;
    windspeed.innerText=`${weatherinfo?.wind?.speed} m/s`;
    humidity.innerText=`${weatherinfo?.main?.humidity} %`;
    cloudiness.innerText=`${weatherinfo?.clouds?.all} %`;   
}

// IF INFO OF CURRENt POSITION IS NOT PRESENT THEN ALLOW GRANT LOCATION THAT FATCH CURRENT POSITION 

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("No Geolocation support available ");
    }
}

function showPosition(position){

    const userCoordinates={
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAcess]");
grantAccessButton.addEventListener('click',getLocation);


// wheve click on Search bar 

const searchInput=document.querySelector("[data-searchInput]");
searchForm.addEventListener('submit',(e) =>{
    e.preventDefault();

    let cityName=searchInput.value;

    if(cityName === ""){
        return alert("Please! Enter City Name ");
    }
    else {
        fetchUserWeatherInfowithCity(cityName);
    }
});

async function fetchUserWeatherInfowithCity(city){
    errorContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const responce = await fetch( `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data=await responce.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        // to check that eoor is happen or not 
        const errordata=data?.cod;

        console.log(errordata);
        if (errordata == "404") {
            // Handle the undefined data error
            throw new Error(errordata);
          } 
          else {
            // Proceed with accessing the data
            // userInfoContainer.classList.add("active");
            errorContainer.classList.remove("active");
            renderWeatherInfo(data);
          }
        // renderWeatherInfo(data);
    }
    catch(e){
        // alert(" Please Enter City Name  agian")
        userInfoContainer.classList.remove("active");
        errorContainer.classList.add("active");
    };
   
}

