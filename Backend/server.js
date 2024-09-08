// CORS (Cross-Origin Resource Sharing) is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript code from accessing responses for cross-origin requests.

// Why axios used for http request

// ease of use for http request
// returns the information fetched by API in JSON form like we do not have to do it manually

// Import required modules
const express = require("express"); // Express framework for building web servers
const app = express(); // Initialize Express application
const axios = require("axios"); // Axios for making HTTP requests
const open = require("open"); // Module to open URLs in the browser
const cors = require("cors"); // CORS middleware to allow cross-origin requests
require("dotenv").config(); // Load environment variables from a .env file

// Set the port number, use environment variable if available, otherwise default to 3000
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors()); // Allow all cross-origin requests to the server

// Serve static files from the 'public' directory
app.use(express.static("public")); // Serve files like index.html, CSS, and JS from the 'public' folder

// Define a route for fetching weather data
app.get("/weather", async (req, res) => {
  try {
    // Get latitude and longitude from query parameters
    const latitude = req.query.latitude; // Extract latitude from request query
    const longitude = req.query.longitude; // Extract longitude from request query

    // Fetch weather data from Open-Meteo API using the latitude and longitude
    const weatherData = await getWeatherData(latitude, longitude);

    // Send weather data as JSON response back to the client
    res.json(weatherData);
  } catch (error) {
    // Handle errors during the request to the weather API
    console.error("Error fetching weather data:", error);
    // Respond with a 500 status code and error message
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

// Start the server and open the browser
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  // Open the index.html file located in the "Frontend" folder using the default browser
  open("Frontend/index.html")
    .then(() => {
      console.log("Default browser opened");
    })
    .catch((err) => {
      // Handle any errors while opening the browser
      console.error("Error opening browser:", err);
    });
});

// Function to fetch weather data based on latitude and longitude
async function getWeatherData(latitude, longitude) {
  try {
    // Construct the API URL with the provided latitude and longitude
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,evapotranspiration,wind_speed_10m,wind_direction_10m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm`;

    // Make a GET request to the Open-Meteo API using axios
    const response = await axios.get(apiUrl);

    // Return the weather data from the API response
    return response.data;
  } catch (error) {
    // Log any errors that occur during the API request
    console.error("Error fetching weather data:", error);
    return null; // Return null if an error occurs
  }
}
