"use strict";

document.addEventListener("DOMContentLoaded", (event) => {
  const widgetElement = document.querySelector(".widget");
  const searchForm = document.querySelector(".search-panel__form");
  const messageElement = document.querySelector(".message-block");
  const messageTextBlock = document.querySelector(".message-block-text");
  let lastTimeOutIndex = 0;
  const apiKey = "&appid=21cc77cc93174a61e65a63cdd2f81e82";
  const baseCityTempUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
  const baseCityImgUrl = "https://api.pexels.com/v1/search?query=";
  const imgUrl = "http://openweathermap.org/img/w/";
  const citysJSONUrl =
    "https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json";
  let elems = document.querySelector(".autocomplete");
  getCityNames(citysJSONUrl);
  getSearchValueData("Lviv");

  async function getCityNames(cityUrl) {
    try {
      const cityResponse = await fetch(cityUrl);
      if (!cityResponse.ok) {
        throw new Error(`${cityResponse.status}`);
      }
      const cityObject = await cityResponse.json();
      const cityNamesObject = cityObject.reduce((acc, element) => {
        acc[element.name] = null;
        return acc;
      }, {});

      let instances = M.Autocomplete.init(elems, {
        data: cityNamesObject,
        limit: 3,
        minLength: 2,
      });
      return cityNamesObject;
    } catch (error) {
      showMessage(`Ooops, something went wrong: ${error.message}`);
    }
  }

  async function fetchTemperature(url, searchValue) {
    try {
      const response = await fetch(url + searchValue + apiKey);
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async function fetchImg(baseUrl, searchValue) {
    try {
      const response = await fetch(
        `${baseUrl + searchValue}&orientation=portrait&size=small&per_page=60`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization:
              "563492ad6f91700001000001410fe8c8392e4b698cbfbc493777ceb7",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  const changeWidgetContent = ({
    main: { temp, humidity, pressure },
    weather: [{ main: weatherDescription, icon: imgName }],
    wind: { speed, deg },
  }) => {
    widgetElement.innerHTML = getWidgetMarkup(
      `${imgUrl + imgName}.png`,
      weatherDescription,
      toCelsius(temp),
      pressure,
      humidity,
      speed,
      deg
    );
  };

  const toCelsius = (temp) => {
    return Math.trunc(+temp - 273.15);
  };

  function getCityImage(imgObj) {
    const { photos } = imgObj;
    if (!photos.length) {
      showMessage(`Sorry, can't find any images about this city`);
    } else {
      const cityImgsArray = photos.reduce((acc, element) => {
        acc.push(element.src.portrait);
        return acc;
      }, []);

      widgetSlideShow(cityImgsArray);
    }
  }

  const widgetSlideShow = (imgArray) => {
    if (lastTimeOutIndex) {
      clearTimeOuts(lastTimeOutIndex);
    }
    for (let i = 0; i < imgArray.length; i++) {
      const id = setTimeout(() => {
        changeWidgetStyle(imgArray[i]);
      }, i * 5000);
      if (i === imgArray.length - 1) {
        lastTimeOutIndex = id;
      }
    }
  };

  const changeWidgetStyle = (imgUrl) => {
    widgetElement.style.backgroundImage = `url(${imgUrl})`;
  };

  const showMessage = (content) => {
    messageElement.classList.add("message-block--active");
    messageTextBlock.textContent = "";
    messageTextBlock.textContent = content;
    setTimeout(() => {
      messageElement.classList.remove("message-block--active");
    }, 4000);
  };

  const getWidgetMarkup = (
    imgUrl = "http://openweathermap.org/img/w/10d.png",
    weatherDescription = "mist",
    temp = 0,
    pressure = 0,
    humidity = 0,
    speed = 0,
    deg = 0
  ) => {
    return `
    <div class="widget__inner">
    <div class="widget__content">
      <div class="widget__img">
        <img
          src=${imgUrl}
          alt="weather-img"
        />
      </div>
      <div class="widget__captions">
        <p class="widget__caption">${weatherDescription}</p>
      </div>
      <div class="widget__subtitles">
        <p class="widget__subtitle">
          <span class="widget__subtitle-caption temperature">${temp}</span>°
        </p>
      </div>
      <div class="widget__items">
        <div class="widget__item item">
          <div class="widget__item-logo">
            <img src="./img/pressure.svg" alt="pressure" srcset="" />
          </div>
          <div class="widget__item-content">
            <div class="widget__item-caption">Pressure</div>
            <div class="widget__item-subtitle">
              <p><span class="pressure">${pressure}</span> hPa</p>
            </div>
          </div>
        </div>
        <div class="widget__item item">
          <div class="widget__item-logo">
            <img src="./img/wind.svg" alt="wind" srcset="" />
          </div>
          <div class="widget__item-content">
            <div class="widget__item-caption">Wind</div>
            <div class="widget__item-subtitle">
              <p><span class="wind">${speed}</span> m/sec</p>
            </div>
          </div>
        </div>
        <div class="widget__item item">
          <div class="widget__item-logo">
            <img src="./img/humidity.svg" alt="humidity" srcset="" />
          </div>
          <div class="widget__item-content">
            <div class="widget__item-caption">Humidity</div>
            <div class="widget__item-subtitle">
              <p><span class="humidity">${humidity}</span> %</p>
            </div>
          </div>
        </div>
        <div class="widget__item item">
          <div class="widget__item-logo">
            <img src="./img/wind-degree.svg" alt="clouds" srcset="" />
          </div>
          <div class="widget__item-content">
            <div class="widget__item-caption">Wind dir.</div>
            <div class="widget__item-subtitle">
              <p><span class="wind-direction">${deg}</span> deg.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    `;
  };

  function getSpinnerMarkup() {
    return `
    <div class="loadingio-spinner-disk-7ehj4lp0rj">
    <div class="ldio-xg0aivnxjl">
      <div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>`;
  }

  function clearTimeOuts(lastTimeOutIndex) {
    for (let i = lastTimeOutIndex; i >= 0; i--) {
      clearTimeout(i);
    }
  }

  async function getSearchValueData(searchValue) {
    try {
      widgetElement.style = "";
      widgetElement.innerHTML = getSpinnerMarkup();
      const searchedInfoArray = await Promise.all([
        fetchImg(baseCityImgUrl, searchValue),
        fetchTemperature(baseCityTempUrl, searchValue),
      ]);
      const [imgData, tempData] = searchedInfoArray;
      changeWidgetContent(tempData);
      getCityImage(imgData);
    } catch (error) {
      clearTimeOuts(lastTimeOutIndex);
      widgetElement.innerHTML = getWidgetMarkup();
      showMessage(`Sorry, can't find this city. Error: ${error.message}`);
    }
  }

  const doValidateInput = (searchValue) => {
    let regExp = /^[A-Za-z||А-Яа-я][A-Za-z||А-Яа-я||\s]+$/;
    return regExp.test(searchValue);
  };

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const { target } = event;
    const searchValue = this.elements.city.value;
    if (!doValidateInput(searchValue)) {
      elems.classList.add("invalid");
    } else {
      elems.classList.remove("invalid");
      getSearchValueData(searchValue);
    }
  });
});
