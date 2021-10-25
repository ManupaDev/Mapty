'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// let map;
// let mapEvent;

class App {
  #map;
  #mapEvent;
    
  constructor() {
    this._getPosition();
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () { //the "this" keyword in bind refers to the current instance, first this keyword is undefined as it's treated as a normal function call.
        alert('Could not get your location!');
      });
    }
  }

  _loadMap(position) {
    //console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

    const ourcoords = [latitude, longitude];
    this.#map = L.map('map').setView(ourcoords, 13); //setView(focused-coordinate, zoomlevel)
    //L is a global valiable inside the leaflet library, so we can access it.
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', function (mapE) {
      //Handling clicks on map.
      this.#mapEvent = mapE;
      form.classList.remove('hidden');
      inputDistance.focus();
    });

    // L.marker(ourcoords)
    //   .addTo(map)
    //   .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //   .openPopup();
  }

  _showForm() {}

  _toggleElevationField() {}

  _newWorkout() {}
}

const app = new App();

/* Basic Map Display at current location setup
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      //console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);
      
      const ourcoords = [latitude, longitude];
      const map = L.map('map').setView(ourcoords, 13);   //setView(center-coordinate, zoomlevel)  
      //L is a global valiable inside the leaflet library, so we can access it.  
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(ourcoords)
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
    },
    function () {
      alert('Could not get your location!');
    }
  );
}*/

/*Adding Markers.
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      //console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

      const ourcoords = [latitude, longitude];
      const map = L.map('map').setView(ourcoords, 13); //setView(focused-coordinate, zoomlevel)
      //L is a global valiable inside the leaflet library, so we can access it.
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(ourcoords)
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
      
      map.on('click', function (mapEvent) {
        console.log(mapEvent);//Returns the event object.
        const {lat, lng} = mapEvent.latlng; //latitude and longitude valuess are inside the latlng child obj.

        //adding a marker.
        L.marker([lat, lng])
        .addTo(map)
        .bindPopup('Workout')
        .openPopup();

        // CUSTOMIZING 
        //adding a marker.
        //.marker([lat, lng], {<option-object-properties})
        //.bindPopup({option-object-properties})
        //.setPopupContent(<string|HTMLElement>)
        L.marker([lat, lng]).addTo(map).bindPopup({maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: "running-popup"}).setPopupContent('Workout').openPopup();
      });  
    },
    function () {
      alert('Could not get your location!');
    }
  );
}*/

/* Initial prototype before restructuring
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      //console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

      const ourcoords = [latitude, longitude];
      map = L.map('map').setView(ourcoords, 13); //setView(focused-coordinate, zoomlevel)
      //L is a global valiable inside the leaflet library, so we can access it.
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);


      map.on('click', function (mapE) {//Handling clicks on map.
        form.classList.remove('hidden');
        inputDistance.focus();
        mapEvent = mapE;
    });
    },
    function () {
      alert('Could not get your location!');
    }
  );
}

form.addEventListener('submit', function(e){
    e.preventDefault();//prevent page reloading just after rendering the marker when the form is submitted.
    
    //Clear input fields.
    inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';
    
    //Display the marker.
    console.log(mapEvent); //Returns the event object.
    const { lat, lng } = mapEvent.latlng; //latitude and longitude valuess are inside the latlng child obj.
    //adding a marker.
    L.marker([lat, lng]).addTo(map).bindPopup({maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: "running-popup"}).setPopupContent('Workout').openPopup();
});

inputType.addEventListener('change', function() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});*/
