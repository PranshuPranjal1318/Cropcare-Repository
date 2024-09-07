// Import required modules
const express = require("express");
const app = express();
const axios = require("axios");
const open = require("open");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file

// Set the port number, use environment variable if available, otherwise default to 3000
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Define a route for fetching weather data
app.get("/weather", async (req, res) => {
  try {
    // Get latitude and longitude from query parameters
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;

    // Fetch weather data from Open-Meteo API
    const weatherData = await getWeatherData(latitude, longitude);

    // Send weather data as JSON response
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

// Start the server and open the browser
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  // Open the index.html file in the default browser
  open("Frontend/index.html")
    .then(() => {
      console.log("Default browser opened");
    })
    .catch((err) => {
      console.error("Error opening browser:", err);
    });
});

// Function to fetch weather data based on latitude and longitude
async function getWeatherData(latitude, longitude) {
  try {
    // Construct the API URL with the provided latitude and longitude
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,evapotranspiration,wind_speed_10m,wind_direction_10m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm`;

    // Make a GET request to the Open-Meteo API
    const response = await axios.get(apiUrl);
    // Return the response data
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}
