$(document).ready(function()
{
	var fiveDayForecast = [];

	function Forecast(dayText, tempHigh, tempLow, condition, iconCode)
	{
		this.day = dayText;
		this.tempHigh = Math.round(tempHigh);
		this.tempLow = Math.round(tempLow);
		this.condition = condition;
		this.iconCode = iconCode;

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



	$('#locationForm').on('submit', function(e)
	{
		e.preventDefault();

		getForecastFromAPI($('#locationInput').val());
	});



	function getForecastFromAPI(location)
	{
		var $locationInput = $('#locationInput');

		$locationInput.val(location).focus();

		if(location === undefined || location.trim() === "")
		{
			location = 'Cincinnati';
		}

		$.ajax({
			url: `http://api.openweathermap.org/data/2.5/forecast/daily?q=${location}&type=like&units=imperial&cnt=7&APPID=ebf5e5843530b4f8cf4c0bd17b6b6048`,
			method: 'GET',
			success: function(data) { prepareFiveDayForecast(data); },
			error: function(err) { console.log("Error! Message: " + e.responseText); },
			complete: function() { console.log("All done!"); }
		})
	}


	getForecastFromAPI();


	function getIconFilename(self)
	{
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


	function prepareFiveDayForecast(data)
	{
		fiveDayForecast = [];

		data.list.forEach(function(day)
		{
			var date 		= new Date(day.dt * 1000),
				dayText 	= getDayText(date.getDay()),
				tempHigh 	= day.temp.max,
				tempLow 	= day.temp.min,
				condition 	= day.weather[0].description,
				iconCode 	= day.weather[0].icon;

			var forecastDay = new Forecast(dayText, tempHigh, tempLow, condition, iconCode);

			fiveDayForecast.push(forecastDay);
		});

		displayFiveDayForecast();
	}



	function displayFiveDayForecast()
	{
		var $forecastData = $('#forecastData');

		$forecastData.empty();

		fiveDayForecast.forEach(function(day)
		{
			var forecastBlock = 
			`
				<div class="forecast-day">
					<div class="details">
						<h3 class="day">${day.day}</h3>
						<p class="condition">${day.condition}</p>
					</div>
					<img class="forecast-icon" src="${day.getIconImageURL()}" alt="${day.condition}">
					<div class="temps">
						<p class="temp low">${day.tempLow}&deg;</p>
						<p class="temp high">${day.tempHigh}&deg;</p>
					</div>
				</div> 
			`;

			$forecastData.append(forecastBlock);
		});
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