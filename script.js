'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10); //Date.now() is used to create a unique id.
  clicks = 0;


  constructor(coords, distance, duration) {
    this.coords = coords; //[lat, lon]
    this.distance = distance; //in km
    this.duration = duration; //in mins
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }

  click() {
      this.clicks++;
  }
}

class Running extends Workout {  
  type = "running";  

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }


}

class Cycling extends Workout {
  type = "cycling";
    
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//const run1 = new Running([39, -12], 5.2, 24, 178);
//const cycling1 = new Cycling([39, -12], 27, 95, 523);
//console.log(run1);
//console.log(cycling1);

///////////////////////////////////////
//Application Architecture
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this)); //point the  "this" to app object.
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          //the "this" keyword in bind refers to the current instance, this keyword when used inside the callback is undefined as it's treated as a normal function call in the event listener.
          alert('Could not get your location!');
        }
      );
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

    this.#map.on('click', this._showForm.bind(this));

    // L.marker(ourcoords)
    //   .addTo(map)
    //   .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //   .openPopup();
  }

  _showForm(mapE) {
    //Handling clicks on map.
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => {form.style.display = 'grid'}, 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault(); //prevent page reloading just after rendering the marker when the form is submitted.

    //Get data from the form.
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng; //latitude and longitude valuess are inside the latlng child obj.
    let workout;

    //If workout is running => create a running object.
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid.
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert('Please enter valid inputs.');
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //If workout is cycling  => create a cycling object.
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //Check if data is valid.
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert('Please enter valid inputs.');
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    //add the new object to the workout array.
    this.#workouts.push(workout);

    //Render workout on map as a marker.
    this._renderWorkoutMarker(workout);

    //Render workout on sidebar list.
    this._renderWorkout(workout);

    //hide form + clear input fields.
    this._hideForm();
  }

  _renderWorkoutMarker(workout) {
    //adding a marker.
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
      })
    //.setPopupContent(`${workout.type} Workout for ${workout.distance}`)
      .setPopupContent(`${workout.type === 'running' ? 'R' : 'C'} ${workout.description()}`)
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = 
      `<li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description()}</h2>
            <div class="workout__details">
                <span class="workout__icon">${workout.type === 'running' ? 'R' : 'C'}</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">T</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>`;
    
    if (workout.type === 'running') {
        html += 
        `<div class="workout__details">
            <span class="workout__icon">P</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">Ca</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
        </div>
        </li>`;
    }
    if (workout.type === 'cycling') {
        html += 
        `<div class="workout__details">
            <span class="workout__icon">S</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">Ca</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
        </div>
        </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const woukoutEl = e.target.closest('.workout');
    
    if(!workoutEl) { 
        return
    }

    const Idworkout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
    console.log(Idworkout);
    
    this.#map.setView(Idworkout.coords, 13, {
        animate: true,
        pan = {duration: 1},
    });
    
    Idworkout.click();

}
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
