// Function to clear the page content
function clearPage() {
  // Clear the city name text by setting the text content to an empty string
  document.getElementById("cityName").textContent = "";

  // Clear any error messages by setting the inner HTML of the error container to an empty string
  document.getElementById("errorContainer").innerHTML = "";

  // Clear the irrigation pattern text by setting the text content to a space
  document.getElementById("irrigationPattern").textContent = " ";

  // Clear the weather table by setting the inner HTML of the container to an empty string
  document.getElementById("oneDayTableContainer").innerHTML = "";
}

// Function to handle form submission
function submitForm(event) {
  // Check if an event object is passed (for form submission)
  if (event) {
    // Prevent the default behavior of form submission, which typically reloads the page
    event.preventDefault();
  }

  // Call the clearPage function to reset the page before displaying new data
  clearPage();

  // Retrieve the value of the latitude input field by using its ID and store it in a variable
  const latitude = document.getElementById("latitude").value;

  // Retrieve the value of the longitude input field by using its ID and store it in a variable
  const longitude = document.getElementById("longitude").value;

  // Retrieve the value of the crop type input field by using its ID and store it in a variable
  const cropType = document.getElementById("cropType").value;

  // (Further processing of the data would go here)

  // Send form data to the server using a GET request
  axios
    .get("http://localhost:3000/weather", {
      // Set the URL to which the request will be sent
      params: {
        // Send the form data (latitude, longitude, cropType) as query parameters
        latitude: latitude, // Send latitude value as a query parameter
        longitude: longitude, // Send longitude value as a query parameter
        cropType: cropType, // Send crop type value as a query parameter
      },
    })
    .then((response) => {
      // Handle successful response from the server

      // Store the weather data returned by the server in a variable
      const weatherData = response.data;

      // Analyze the weather forecast data to determine the irrigation pattern
      const irrigationPattern = analyzeForecast(weatherData);

      // Call a function to display the irrigation pattern recommendation to the user
      displayIrrigationPattern(irrigationPattern);

      // Call a function to display the fetched weather data (e.g., temperature, humidity)
      displayWeatherData(weatherData, latitude, longitude);

      // Call a function to create and display a weather chart visualization for the data
      createWeatherChart(weatherData);
    })
    .catch((error) => {
      // Handle any errors that occur while making the request

      // Log the error to the browser console for debugging
      console.error("Error fetching weather data:", error);

      // Call a function to display a user-friendly error message on the page
      displayError("Error fetching weather data. Please try again later.");
    });
}

// Function to display weather data on the webpage
function displayWeatherData(weatherData, latitude, longitude) {
  // Get the container where the weather table will be displayed
  const oneDayTableContainer = document.getElementById("oneDayTableContainer");

  // Get the element where the city name will be displayed
  const cityName = document.getElementById("cityName");

  // Clear any previous weather data or city name that may be displayed
  oneDayTableContainer.innerHTML = "";
  cityName.innerHTML = "";

  // Fetch city name using reverse geocoding based on latitude and longitude
  axios
    .get(
      // Use the reverse geocoding API to get the city name from latitude and longitude
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    )
    .then((response) => {
      // Extract the city name from the response data
      const city = response.data.locality;

      // Set the city name in the `cityName` element, displaying the forecast location
      cityName.textContent = `Forecast for ${city}`;
    })
    .catch((error) => {
      // Handle any errors that occur while fetching the city name

      // Log the error to the browser console for debugging
      console.error("Error fetching city name:", error);

      // Display an error message to the user if fetching the city name fails
      displayError("Error fetching city name. Please try again later.");
    });

  // Create a table element that contains the weather data using a helper function
  const table = createWeatherTable(weatherData);

  // Create a scrollable container for the table to handle large amounts of data
  const scrollableContainer = document.createElement("div");

  // Add CSS classes to the scrollable container to make the table responsive and scrollable
  scrollableContainer.classList.add("table-responsive", "scrollable-table");

  // Append the weather table to the scrollable container
  scrollableContainer.appendChild(table);

  // Append the scrollable container (with the table inside) to the weather data container on the webpage
  oneDayTableContainer.appendChild(scrollableContainer);
}

// Function to display irrigation pattern suggestion
function displayIrrigationPattern(irrigationPattern) {
  // Get the container element where the irrigation pattern will be displayed
  const irrigationPatternContainer =
    document.getElementById("irrigationPattern");

  // Check if the container exists in the DOM
  if (irrigationPatternContainer) {
    // Set the text content of the container to display the irrigation pattern suggestion
    irrigationPatternContainer.textContent = `Recommended Irrigation Pattern: ${irrigationPattern}`;
  } else {
    // If the container is not found in the DOM, log an error message in the console
    console.error("Irrigation pattern container not found in the DOM.");
  }
}

// Function to create a weather table to display weather data
function createWeatherTable(weatherData) {
  // Create a table element to hold the weather data
  const table = document.createElement("table");

  // Add a CSS class to style the table
  table.classList.add("table");

  // Create a table header element (thead)
  const tableHeader = document.createElement("thead");

  // Define the structure of the table header using innerHTML, which includes columns for various weather attributes
  tableHeader.innerHTML = `
        <tr>
            <th>Time</th>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Precipitation Probability (%)</th>
            <th>Evapotranspiration</th>
            <th>Wind Speed (m/s)</th>
            <th>Wind Direction (°)</th>
            <th>Soil Temperature (0 cm)</th>
            <th>Soil Temperature (6 cm)</th>
            <th>Soil Temperature (18 cm)</th>
            <th>Soil Temperature (54 cm)</th>
            <th>Soil Moisture (0-1 cm)</th>
            <th>Soil Moisture (1-3 cm)</th>
            <th>Soil Moisture (3-9 cm)</th>
            <th>Soil Moisture (9-27 cm)</th>
            <th>Soil Moisture (27-81 cm)</th>
        </tr>
    `;

  // Append the header to the table
  table.appendChild(tableHeader);

  // Create a table body element (tbody) to hold the rows of weather data
  const tableBody = document.createElement("tbody");

  // Loop through the hourly time data in the weatherData object
  weatherData.hourly.time.forEach((time, index) => {
    // Create a table row element for each hourly time entry
    const row = document.createElement("tr");

    // Populate the row with the weather data for the corresponding time
    row.innerHTML = `
            <td>${formatDateTime(
              time
            )}</td>  <!-- Format the time using a helper function and insert it in the first cell -->
            <td>${
              weatherData.hourly.temperature_2m[index]
            }</td>  <!-- Display temperature at 2 meters -->
            <td>${
              weatherData.hourly.relative_humidity_2m[index]
            }</td>  <!-- Display relative humidity at 2 meters -->
            <td>${
              weatherData.hourly.precipitation_probability[index]
            }</td>  <!-- Display precipitation probability -->
            <td>${
              weatherData.hourly.evapotranspiration[index]
            }</td>  <!-- Display evapotranspiration -->
            <td>${
              weatherData.hourly.wind_speed_10m[index]
            }</td>  <!-- Display wind speed at 10 meters -->
            <td>${
              weatherData.hourly.wind_direction_10m[index]
            }</td>  <!-- Display wind direction at 10 meters -->
            <td>${
              weatherData.hourly.soil_temperature_0cm[index]
            }</td>  <!-- Display soil temperature at 0 cm depth -->
            <td>${
              weatherData.hourly.soil_temperature_6cm[index]
            }</td>  <!-- Display soil temperature at 6 cm depth -->
            <td>${
              weatherData.hourly.soil_temperature_18cm[index]
            }</td>  <!-- Display soil temperature at 18 cm depth -->
            <td>${
              weatherData.hourly.soil_temperature_54cm[index]
            }</td>  <!-- Display soil temperature at 54 cm depth -->
            <td>${
              weatherData.hourly.soil_moisture_0_to_1cm[index]
            }</td>  <!-- Display soil moisture for 0-1 cm depth -->
            <td>${
              weatherData.hourly.soil_moisture_1_to_3cm[index]
            }</td>  <!-- Display soil moisture for 1-3 cm depth -->
            <td>${
              weatherData.hourly.soil_moisture_3_to_9cm[index]
            }</td>  <!-- Display soil moisture for 3-9 cm depth -->
            <td>${
              weatherData.hourly.soil_moisture_9_to_27cm[index]
            }</td>  <!-- Display soil moisture for 9-27 cm depth -->
            <td>${
              weatherData.hourly.soil_moisture_27_to_81cm[index]
            }</td>  <!-- Display soil moisture for 27-81 cm depth -->
        `;

    // Append the row to the table body
    tableBody.appendChild(row);
  });

  // Append the table body to the table
  table.appendChild(tableBody);

  // Return the complete table element to be used elsewhere in the DOM
  return table;
}

// Function to format date and time
function formatDateTime(dateTime) {
  // Create a Date object from the provided dateTime string
  const date = new Date(dateTime);

  // Format the date and time into a readable string using locale settings
  const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

  // Return the formatted date and time
  return formattedDate;
}

// Function to display an error message
function displayError(message) {
  // Call the clearPage function to reset any existing content on the page
  clearPage();

  // Create a new paragraph element to display the error message
  const errorMessage = document.createElement("p");

  // Set the text content of the paragraph to the error message passed to the function
  errorMessage.textContent = message;

  // Add a CSS class to style the error message as "text-danger" (typically red text for errors)
  errorMessage.classList.add("text-danger");

  // Append the error message to the error container element in the DOM
  document.getElementById("errorContainer").appendChild(errorMessage);
}

// Function to analyze weather forecast data and suggest an irrigation pattern
function analyzeForecast(weatherData) {
  // Extract the relevant weather data: precipitation probability, temperature, humidity, and soil moisture
  const precipitation = weatherData.hourly.precipitation_probability;
  const temperature = weatherData.hourly.temperature_2m;
  const humidity = weatherData.hourly.relative_humidity_2m;
  const soilMoisture = weatherData.hourly.soil_moisture_0_to_1cm;

  // Define possible irrigation patterns, each with a set of conditions based on weather data
  const irrigationPatterns = [
    {
      pattern: "Biweekly irrigation (every 3 days)", // Pattern: irrigate every 3 days
      condition: () =>
        // Condition: precipitation < 20%, temperature > 25°C, humidity < 70%, and soil moisture < 50%
        precipitation.every((value) => value < 20) &&
        temperature.every((value) => value > 25) &&
        humidity.every((value) => value < 70) &&
        soilMoisture.every((value) => value < 50),
    },
    {
      pattern: "Weekly irrigation (every 7 days)", // Pattern: irrigate once a week
      condition: () =>
        // Condition: precipitation < 30%, temperature > 20°C, humidity < 60%, and soil moisture < 60%
        precipitation.every((value) => value < 30) &&
        temperature.every((value) => value > 20) &&
        humidity.every((value) => value < 60) &&
        soilMoisture.every((value) => value < 60),
    },
    {
      pattern: "Twice a week irrigation (every 3-4 days)", // Pattern: irrigate twice a week
      condition: () =>
        // Condition: precipitation < 40%, temperature > 18°C, humidity < 65%, and soil moisture < 70%
        precipitation.every((value) => value < 40) &&
        temperature.every((value) => value > 18) &&
        humidity.every((value) => value < 65) &&
        soilMoisture.every((value) => value < 70),
    },
  ];

  // Find the first irrigation pattern that meets all the conditions
  const suggestedPattern = irrigationPatterns.find((pattern) =>
    pattern.condition()
  );

  // If a matching pattern is found, return the suggested irrigation pattern
  if (suggestedPattern) {
    return suggestedPattern.pattern;
  } else {
    // If no matching pattern is found, return a default irrigation pattern
    return "Standard irrigation pattern";
  }
}

// Function to create a weather chart using Chart.js library
function createWeatherChart(weatherData) {
  // Check if there's an existing chart with the ID "weatherChart"
  const existingChart = Chart.getChart("weatherChart");
  if (existingChart) {
    existingChart.destroy(); // Destroy the existing chart to avoid overlap
  }

  // Get the context of the canvas element with the ID "weatherChart"
  const ctx = document.getElementById("weatherChart").getContext("2d");

  // Format the time data from the weatherData to be used as labels in the chart
  const timeLabels = weatherData.hourly.time.map((time) =>
    formatDateTime(time)
  );

  // Extract temperature, humidity, and precipitation data from the weatherData object
  const temperatureData = weatherData.hourly.temperature_2m;
  const humidityData = weatherData.hourly.relative_humidity_2m;
  const precipitationData = weatherData.hourly.precipitation_probability;

  // Create a new chart
  const weatherChart = new Chart(ctx, {
    type: "line", // Define the chart type as a line chart
    data: {
      labels: timeLabels, // Set the X-axis labels (formatted time)
      datasets: [
        {
          label: "Temperature (°C)", // Label for the temperature data
          yAxisID: "temperature", // Link this dataset to the temperature axis
          borderColor: "rgb(255, 99, 132)", // Line color for temperature
          data: temperatureData, // Provide temperature data points
        },
        {
          label: "Humidity (%)", // Label for the humidity data
          yAxisID: "humidity", // Link this dataset to the humidity axis
          borderColor: "rgb(54, 162, 235)", // Line color for humidity
          data: humidityData, // Provide humidity data points
        },
        {
          label: "Precipitation Probability (%)", // Label for the precipitation data
          yAxisID: "precipitation", // Link this dataset to the precipitation axis
          borderColor: "rgb(75, 192, 192)", // Line color for precipitation
          data: precipitationData, // Provide precipitation data points
        },
      ],
    },
    options: {
      scales: {
        // Define multiple Y-axes for temperature, humidity, and precipitation
        yAxes: [
          {
            id: "temperature", // ID for the temperature axis
            type: "linear", // Define it as a linear axis
            position: "left", // Position it on the left side of the chart
            scaleLabel: {
              display: true, // Display label for this axis
              labelString: "Temperature (°C)", // Label text for temperature
            },
          },
          {
            id: "humidity", // ID for the humidity axis
            type: "linear", // Define it as a linear axis
            position: "right", // Position it on the right side of the chart
            scaleLabel: {
              display: true, // Display label for this axis
              labelString: "Humidity (%)", // Label text for humidity
            },
          },
          {
            id: "precipitation", // ID for the precipitation axis
            type: "linear", // Define it as a linear axis
            position: "right", // Position it on the right side
            scaleLabel: {
              display: true, // Display label for this axis
              labelString: "Precipitation Probability (%)", // Label text for precipitation
            },
          },
        ],
      },
    },
  });
}

// Function to get the user's current location using the browser's geolocation API
function getLocation() {
  // Check if the geolocation feature is available in the user's browser
  if (navigator.geolocation) {
    // Use geolocation to get the user's current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Extract latitude and longitude from the user's position
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Set the latitude and longitude input fields in the form to the user's coordinates
        document.getElementById("latitude").value = latitude;
        document.getElementById("longitude").value = longitude;
      },
      (error) => {
        // Handle errors that occur when trying to get the user's location
        console.error("Error getting location:", error); // Log the error in the console
        displayError(
          "Error getting location. Please try again or enter manually." // Display an error message to the user
        );
      }
    );
  } else {
    // If geolocation is not supported by the browser, log an error and display a message
    console.error("Geolocation is not supported by this browser.");
    displayError("Geolocation is not supported by this browser.");
  }
}

// Add event listeners to handle interactions on the webpage
document
  .getElementById("getLocationBtn") // Get the button for getting the user's location
  .addEventListener("click", getLocation); // Attach a click event listener to trigger the getLocation function

document
  .getElementById("farmDetailsForm") // Get the form element for submitting farm details
  .addEventListener("submit", submitForm); // Attach a submit event listener to trigger the form submission and data processing
