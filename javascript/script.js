import { API_KEY } from "./config.js";

//ARCHITECTURE
const ipAddressEle = document.getElementById("ip-address");
const locationEle = document.getElementById("location");
const timezoneEle = document.getElementById("time");
const ispEle = document.getElementById("provider");
const input = document.getElementById("ip-address__input");
const detailsBtn = document.getElementById("details-btn");

class App {
  #map;
  #zoomlevel = 15;
  constructor() {
    this._getPosition();
    // this._fetchDetails();

    detailsBtn.addEventListener("click", this._getIPDetails.bind(this));
  }

  _renderDetails(address = "", location = "", time = "", provider = "") {
    ipAddressEle.innerText = address;
    locationEle.innerText = location;
    timezoneEle.innerText = time;
    ispEle.innerText = provider;
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    this._renderDetails();

    this.#map = L.map("map").setView(coords, this.#zoomlevel);
    L.marker(coords).addTo(this.#map);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
  }

  async _getIPDetails() {
    try {
      const inputIPAddress = input.value;
      input.value = "";
      this._renderDetails();
      console.log(inputIPAddress);
      this._validateInput(inputIPAddress);
      const details = await this._fetchDetails(inputIPAddress);
      console.log(details);
      const { ip, location, isp } = details;
      const locationString = `${location?.city}, ${location?.country} ${location?.postalCode}`;
      const timezone = location?.timezone;
      const { lat, lng } = location;

      this._renderDetails(ip, locationString, timezone, isp);
      this.#map.setView([lat, lng], this.#zoomlevel, {
        animate: true,
        pan: {
          duration: 1,
        },
      });

      L.marker([lat, lng]).addTo(this.#map);
    } catch (err) {
      alert("Looks like provided IP address does not exist");
    }
  }

  _validateInput(inputIPAddress) {
    if (!inputIPAddress) {
      throw Error("Please enter details");
    }
  }

  async _fetchDetails(input) {
    try {
      const fetchedDetails = await fetch(
        `https://geo.ipify.org/api/v1?apiKey=${API_KEY}&ipAddress=${input}`
      );

      const details = await fetchedDetails.json();
      return details;
    } catch {
      throw Error("Cannot fetch details for given input ");
    }
  }
}

const app = new App();
