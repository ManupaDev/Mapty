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

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      //console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);
      
      const ourcoords = [latitude, longitude];
      const map = L.map('map').setView(ourcoords, 10);   //setView(center-coordinate, zoomlevel)  
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
}
