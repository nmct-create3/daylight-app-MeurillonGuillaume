{
	// _ = helper functions
	let _calculateTimeDistance = (startTime, endTime) => {
		// Bereken hoeveel tijd er tussen deze twee periodes is.
		// Tip: werk met minuten.
		return _getMinutes(endTime) - _getMinutes(startTime);
	}

	// Deze functie kan een am/pm tijd omzetten naar een 24u tijdsnotatie, deze krijg je dus al. Alsjeblieft, veel plezier ermee.
	let _convertTime = (t) => {
		/* Convert 12 ( am / pm ) naar 24HR */
		let time = new Date('0001-01-01 ' + t);
		let formatted = time.getHours() + ':' + ('0' + time.getMinutes()).slice(-2);
		return formatted;
	}

	let _getMinutes = (t) => {
		let timestring = _convertTime(t);
		let a = timestring.split(':');
		return ((parseInt(a[0]) * 60) + parseInt(a[1]));
	}

	// 5 TODO: maak updateSun functie
	let updateSun = (percentage) => {
		let $sun = document.querySelector('.js-sun');
		$sun.setAttribute("data-time", `${new Date().getHours()}:${new Date().getMinutes()}`)
		$sun
		if (percentage <= 50) {
			$sun.style.bottom = `${percentage * 2}%`;
		} else {
			$sun.style.bottom = `${100 - percentage}%`;
		}
		$sun.style.left = `${percentage}%`;
	}

	// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
	let placeSunAndStartMoving = (totalMinutes, sunrise, sunset) => {
		// In de functie moeten we eerst wat zaken ophalen en berekenen.

		// Bepaal het aantal minuten dat de zon al op is.
		let $modeselector = document.querySelector('.js-mode');
		let _now = `${new Date().getHours()}:${new Date().getMinutes()}`;
		let _uptime = _getMinutes(_now);

		// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
		updateSun((_uptime / (totalMinutes + sunrise)) * 100);

		// We voegen ook de 'is-loaded' class toe aan de body-tag.
		// Vergeet niet om het resterende aantal minuten in te vullen.
		let $timeleft = document.querySelector('.js-time-left');
		$timeleft.innerHTML = `${_calculateTimeDistance(_now, sunset)} minutes <span class="u-muted">of sunlight left today. Make the most of it!</span>`;
		// Nu maken we een functie die de zon elke minuut zal updaten
		// Bekijk of de zon niet nog onder of reeds onder is
		setInterval(function () {
			let _now = `${new Date().getHours()}:${new Date().getMinutes()}`;
			if (_getMinutes(_now) < _getMinutes(sunset)) {
				_uptime = _getMinutes(_now);
				updateSun((_uptime / (totalMinutes + sunrise)) * 100);
				$timeleft.innerHTML = `${_calculateTimeDistance(_now, sunset)} minutes <span class="u-muted">of sunlight left today. Make the most of it!</span>`;
				$modeselector.classList.remove("is-night");
				$modeselector.classList.add("is-day");
			} else {
				$timeleft.innerHTML = `Sun is down! Come back tomorrow.`;
				$modeselector.classList.add("is-night");
				$modeselector.classList.remove("is-day");
			}

		}, 1000);

		// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
		// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
	}

	// 3 Met de data van de API kunnen we de app opvullen
	let showResult = (queryResponse) => {
		console.log(queryResponse);
		// We gaan eerst een paar onderdelen opvullen
		let $location = document.querySelector('.js-location');
		let $sunrise = document.querySelector('.js-sunrise');
		let $sunset = document.querySelector('.js-sunset');
		// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
		$location.innerHTML = `${queryResponse.location.city}, ${queryResponse.location.region}, ${queryResponse.location.country}`;
		// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
		$sunrise.innerHTML = _convertTime(queryResponse.astronomy.sunrise);
		$sunset.innerHTML = _convertTime(queryResponse.astronomy.sunset);

		// Hier gaan we een functie oproepen die de zon een bepaalde postie kan geven en dit kan updaten.
		// Geef deze functie de periode tussen $sunrise en $sunset mee en het tijdstip van $sunrise.
		let totminutes = _getMinutes($sunset.textContent) - _getMinutes($sunrise.textContent);
		placeSunAndStartMoving(totminutes, _getMinutes($sunrise.textContent), $sunset.textContent);
	};

	// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
	let getAPI = (lat, lon) => {
		// Eerst bouwen we onze url op
		// en doen we een query met de Yahoo query language
		let url = `https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text="(${lat},${lon})")&format=json&env=store://datatables.org/alltableswithkeys`;

		// Met de fetch API proberen we de data op te halen.
		// Als dat gelukt is, gaan we naar onze showResult functie.
		fetch(url, { method: 'GET' })
			.then(res => res.json())
			.then(response => showResult(response.query.results.channel))
			.catch(error => console.error('Error:', error));
	}

	document.addEventListener('DOMContentLoaded', function () {
		// 1 We will query the API with longitude and latitude.
		getAPI(50.8027841, 3.2097454);
	});
}