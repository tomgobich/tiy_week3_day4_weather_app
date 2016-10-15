$(document).ready(function()
{
	// Weekly forecast array
	var weeklyForecast = [];
	var forecastUnit = JSON.parse(localStorage.getItem('unit'));



	// DOM selectors
	var $locationInput 	= $('#locationInput');
	var $forecastData 	= $('#forecastData');
	var $forecastUnit 	= $('#forecastUnit');



	// ------------------------------------------------------------
	// Forecast object constructor
	// ------------------------------------------------------------
	function Forecast(dayText, tempHigh, tempLow, condition, iconCode)
	{
		this.day = dayText;
		this.tempHigh = Math.round(tempHigh);
		this.tempLow = Math.round(tempLow);
		this.condition = condition;
		this.iconCode = iconCode;

		// ------------------------------------------------------------
		// Prepares link to icon file
		// ------------------------------------------------------------
		this.getIconImageURL = function()
		{
			var self = this;

			// Get filename from iconCode
			var filename = getIconFilename(self);

			// Did filename come back as number? (means it's openweathermap code still)
			if(typeof filename === typeof 0)
			{
				// Yes, pass in openweathermap icon to deal with exception
				return `http://openweathermap.org/img/w/${filename}.png`;
			}
			else
			{
				// No, pass in local icon image
				return `images/${filename}`;
			}
		}
	}



	// ------------------------------------------------------------
	// ------------------------------------------------------------
	// 
	// Event Listeners
	// 
	// ------------------------------------------------------------
	// ------------------------------------------------------------

	// Event listener for location input form
	$('#locationForm').on('submit', function(e)
	{
		// Prevent form from submitting
		e.preventDefault();

		// Get forecast data from openweathermap API using location from user input
		getForecastFromAPI($locationInput.val());
	});


	// Event listener for forecast unit toggle
	$('#forecastUnit').on('click', function()
	{
		// Toggle forecast unit
		toggleForecastUnit();
	});



	// ------------------------------------------------------------
	// ------------------------------------------------------------
	// 
	// Getting & Displaying Forecast
	// 
	// ------------------------------------------------------------
	// ------------------------------------------------------------

	// Call API request on initial load run-through
	getForecastFromAPI();



	// ------------------------------------------------------------
	// Makes AJAX call to openweathermap API
	// ------------------------------------------------------------
	function getForecastFromAPI(location)
	{
		// Set focus to location input
		$locationInput.focus();

		// Is the location undefined or empty?
		if(location === undefined || location.trim() === "")
		{
			// Use Cincinnati as default 
			location = 'Cincinnati';
		}

		if(forecastUnit === undefined)
		{
			forecastUnit = "imperial";
		}

		setForecastUnit();

		// AJAX call to openweatherdata api
		$.ajax({
			url: `http://api.openweathermap.org/data/2.5/forecast/daily?q=${location}&type=like&units=${forecastUnit}&cnt=7&APPID=ebf5e5843530b4f8cf4c0bd17b6b6048`,
			method: 'GET',
			success: function(data) { prepareWeeklyForecast(data); },
			error: function(err) { console.log("Error! Message: " + e.responseText); },
			complete: function() { console.log("All done!"); }
		})
	}



	// ------------------------------------------------------------
	// Strips needed data from API data and puts it in an object
	// ------------------------------------------------------------
	function prepareWeeklyForecast(data)
	{
		// Clear out weekly forecast array
		weeklyForecast = [];

		// Display the city openweatherdata matched with user's input and add the country to the end
		$('#locationInput').val(data.city.name + ", " + data.city.country);

		// Loop through forecast days
		data.list.forEach(function(day)
		{
			var date 		= new Date(day.dt * 1000),
				dayText 	= getDayText(date.getDay()),
				tempHigh 	= day.temp.max,
				tempLow 	= day.temp.min,
				condition 	= day.weather[0].description,
				iconCode 	= day.weather[0].icon;

			// Create new Forecast object and load with forecast data
			var forecastDay = new Forecast(dayText, tempHigh, tempLow, condition, iconCode);

			// Push into weekly forecast array
			weeklyForecast.push(forecastDay);
		});

		// Prepare HTML and display data
		displayWeeklyForecast();
	}



	// ------------------------------------------------------------
	// Sets Forecast Day's HTML and appends it to parent element
	// ------------------------------------------------------------
	function displayWeeklyForecast()
	{
		// Empty HTML element
		$forecastData.empty();

		// Loop through weekly forecast array
		weeklyForecast.forEach(function(day)
		{
			// Load data into HTML block
			var forecastBlock = 
			`
				<div class="forecast-day">
					<div class="details">
						<h3 class="day">${day.day}</h3>
						<p class="condition">${day.condition}</p>
					</div>
					<img class="forecast-icon" src="${day.getIconImageURL()}" alt="${day.condition}">
					<div class="temps">
						<p class="temp low"><img src="images/low.svg" alt="Low Temperature">${day.tempLow}&deg;</p>
						<p class="temp high"><img src="images/high.svg" alt="High Temperature">${day.tempHigh}&deg;</p>
					</div>
				</div> 
			`;

			// Append HTML block to DOM
			$forecastData.append(forecastBlock);
		});
	}



	// ------------------------------------------------------------
	// ------------------------------------------------------------
	//
	// Toggle Unit of Temperature
	//
	// ------------------------------------------------------------
	// ------------------------------------------------------------

	// ------------------------------------------------------------
	// Toggle the unit of measurement for temperature
	// ------------------------------------------------------------
	function toggleForecastUnit()
	{

		console.log('before: ' + forecastUnit);
		// Was unit of measurement imperial?
		if(forecastUnit === "imperial")
		{
			// Yes, toggle over to metric
			forecastUnit = "metric";
		}
		else
		{
			// No, toggle over to imperial
			forecastUnit = "imperial";
		}
		console.log('after: ' + forecastUnit);

		// Save new unit in local storage
		localStorage.setItem('unit', JSON.stringify(forecastUnit));

		setForecastUnit();

		calculateUnits();

		displayWeeklyForecast();
	}



	// ------------------------------------------------------------
	// Toggle the unit of measurement for temperature
	// ------------------------------------------------------------
	function setForecastUnit()
	{
		if(forecastUnit === "metric")
		{
			$forecastUnit.addClass('metric');
		}
		else
		{
			$forecastUnit.removeClass('metric');
		}
	}



	function calculateUnits()
	{
		if(forecastUnit === "metric")
		{
			weeklyForecast.forEach(function(day)
			{
				day.tempHigh = Math.round((day.tempHigh - 32) / 1.8);
				day.tempLow  = Math.round((day.tempLow - 32) / 1.8);
			});
		}
		else
		{
			weeklyForecast.forEach(function(day)
			{
				day.tempHigh = Math.round((day.tempHigh * 1.8) + 32);
				day.tempLow  = Math.round((day.tempLow * 1.8) + 32);
			});
		}
	}



	// ------------------------------------------------------------
	// ------------------------------------------------------------
	//
	// Utilities
	//
	// ------------------------------------------------------------
	// ------------------------------------------------------------

	// ------------------------------------------------------------
	// Takes in icon code from API and sets different images to code
	// ------------------------------------------------------------
	function getIconFilename(self)
	{
		// Match icon code then return appropriate image name.type
		switch(self.iconCode)
			{
				case '01d':
					return 'sunny.svg';
					break;
				case '01n':
					return 'moon.svg';
					break;
				case '02d':
					return 'cloud-few.svg';
					break;
				case '02n':
					return 'cloud-few-night.svg';
					break;
				case '03d':
				case '03n':
				case '04d':
				case '04n':
					return 'cloud-scattered.svg';
					break;
				case '09d':
					return 'rainy.svg';
					break;
				case '09n':
					return 'rainy-night.svg';
					break;
				case '10d':
				case '10n':
					return 'rain.svg';
					break;
				case '11d':
				case '11n':
					return 'storm.svg';
					break;
				case '13d':
				case '13n':
					return 'snowflake.svg';
					break;
				case '50d':
				case '50n':
					return 'raindrop.svg';
					break;
				default:
					return self.iconCode;
					break;
			}
	}



	// ------------------------------------------------------------
	// Takes index of day from date and returns full day's text
	// ------------------------------------------------------------
	function getDayText(dayIndex)
	{
		// Match day index and return full text
		switch(dayIndex)
		{
			case 0:
				return 'Sunday';
				break;
			case 1:
				return 'Monday';
				break;
			case 2:
				return 'Tuesday';
				break;
			case 3:
				return 'Wednesday';
				break;
			case 4:
				return 'Thursday';
				break;
			case 5:
				return 'Friday';
				break;
			case 6:
				return 'Saturday';
				break;
			default:
				return 'Invalid Date';
				break;
		}
	}

});