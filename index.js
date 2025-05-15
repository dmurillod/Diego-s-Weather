import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

const app = express();
const port = 3000;
dotenv.config();

const API_KEY = process.env.API_KEY;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

function getCurrentDate() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = daysOfWeek[dayOfWeek];
  
    const dayOfMonth = today.getDate();
  
    function getDaySuffix(day) {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    }
  
    const daySuffix = getDaySuffix(dayOfMonth);
    const monthIndex = today.getMonth();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = months[monthIndex];
  
    return dayName + ", " + dayOfMonth + daySuffix + " " + monthName;
  }

async function getcoordinates(city){
    try{
        const response = await axios.get("http://api.openweathermap.org/geo/1.0/" + `direct?q=${city}&limit=1&appid=${API_KEY}`);
        console.log(response.data[0].country);
        return response;
    } catch(error){
        console.log(error.response.data);
    }   
}

async function getweather(lat, lon){
    try{
        const response = await axios.get("https://api.openweathermap.org/data/2.5/" + `weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        return response;
    } catch(error){
        console.log(error.response.data);
    }
};

async function getforecastify(lat, lon) {
    try{
        const response = await axios.get("https://api.openweathermap.org/data/2.5/" + `forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        return response;
    } catch(error){
        console.log(error.response.data);
    }  
};

app.get('/', (req, res)=>{
    res.render("index.ejs");
});

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'No city provided' });
  
    try {
      const response = await axios.get('http://api.openweathermap.org/geo/1.0/direct', {
        params: {
          q: query,
          limit: 5,
          appid: process.env.API_KEY
        }
      });
  
      const data = response.data;
  
      if (!Array.isArray(data)) {
        return res.status(500).json({ error: 'Unexpected response from OpenWeather' });
      }
  
      res.json(data);
    } catch (error) {
      console.error('Error fetching from OpenWeather:', error.message);
      res.status(500).json({ error: 'Error fetching city suggestions' });
    }
});
  

app.post('/submit', async (req, res)=>{
    const city = req.body['name-city'];
    const location = await getcoordinates(city);
    const latitud = location.data[0].lat;
    console.log(latitud);
    const longitud = location.data[0].lon;
    console.log(longitud);
    const content = await getweather(latitud, longitud);
    console.log(content.data);
    const forecast = await getforecastify(latitud, longitud);
    console.log(forecast.data.list[0].weather[0].icon);
    const currentDate = getCurrentDate();
    const drops = Array.from({ length: 100 }, () => ({
        left: (Math.random() * 100).toFixed(2),
        delay: (Math.random() * 2).toFixed(2),
      }));
    res.render("city.ejs", { content : content.data , forecast : forecast.data, currentDate : currentDate, drops: drops});
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
}); 