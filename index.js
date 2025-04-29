import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

const API_KEY = 'ba93f7758b026fbc16c5ed63c941d915';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));


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

app.get('/', (req, res)=>{
    res.render("index.ejs");
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
    res.render("city.ejs", { content : content , location : location});
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});