<template>
  <div class="row center-xs">
    <div class="row col-md-12">
      {{ $t('Choose') }}
    </div>
    <div class="row col-md-12 flex ">
      <input type="radio" id="currentWeather" name="weather" value="currentWeather" @click="getCurrentWeather()">
      <label for="currentWeather">currentWeather</label><br>
      <input type="radio" id="forecastWeather" name="weather" value="forecastWeather" @click="getForecastWeather()">
      <label for="forecastWeather">forecastWeather</label><br>
      <input type="radio" id="other" name="weather" value="other" @click="openInput()">
      <label for="other">Other</label>
    </div>
    <div class="row col-md-12 flex ">
      <div v-if="currentWeatherType">
        <div v-if="currentWeatherType.forecast">
          <ul v-for="day in currentWeatherType.forecast.forecastday" :key="day.date_epoch">
            <li>{{ $t('Date') }}{{ day.date }}</li>
            <li>{{ $t('Min temp. ') }}{{ day.day.mintemp_c }}</li>
            <li>{{ $t('Max temp. ') }}{{ day.day.maxtemp_c }}</li>
            <li>{{ $t('Wind Speed ') }}{{ day.day.maxwind_kph }}</li>
            <li>{{ $t('Will it rain? ') }}{{ day.day.daily_will_it_rain }}</li>
          </ul>
        </div>
        <div v-else>
          <ul>
            <li>{{ currentWeatherType.current.temp_c }}</li>
            <li>{{ currentWeatherType.current.wind_dir }}</li>
            <li>{{ currentWeatherType.current.wind_kph }}</li>
          </ul>
        </div>
      </div>
      <div v-if="inputVisible">
        {{ $t('Cant select a specific date and show forecast') }}
        <input id="" class="" :placeholder="$t('Select a date')" type="date">
      </div>
    </div>
  </div>
</template>

<script>
import WeatherFeed from 'src/modules/weather-feed/mixins/WeatherFeed'

export default {
  name: 'WeatherFeed',
  mixins: [WeatherFeed],
  data () {
    return {
      currentWeatherType: '',
      inputVisible: false
    }
  },
  methods: {
    getCurrentWeather () {
      this.currentWeatherType = this.current
      this.inputVisible = false
    },
    getForecastWeather () {
      this.currentWeatherType = this.forecast
      this.inputVisible = false
    },
    openInput () {
      this.inputVisible = true
      this.currentWeatherType = null
    }
  },
  watch: {
    weatherType: {
      handler () {
        this.getCurrentWeather()
        this.getForecastWeather()
      }
    }
  }
}
</script>
