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
      <div class="row col-md-12" v-if="inputVisible">
        {{ $t('Get specific date and show weather') }}
        <form @submit.prevent="submit" novalidate>
          <label>
            <input
              type="date"
              name="date"
              autocomplete=""
              :max="maxDate"
              :min="minDate"
              v-model="selectedDate"
              class="py10 w-100 border-box brdr-none brdr-bottom-1 brdr-cl-primary h4 sans-serif empty"
            >
          </label>
          <button-full class="mb20" type="submit">
            {{ $t('Get weather') }}
          </button-full>
        </form>
      </div>
      <div v-if="currentWeatherType">
        <div v-if="currentWeatherType.current">
          <ul>
            <li>{{ currentWeatherType.current.temp_c }}</li>
            <li>{{ currentWeatherType.current.wind_dir }}</li>
            <li>{{ currentWeatherType.current.wind_kph }}</li>
          </ul>
        </div>
        <div v-else-if="currentWeatherType">
          <ul v-for="day in currentWeatherType" :key="day.date_epoch">
            <li>{{ $t('Date') }}{{ day.date }}</li>
            <li>{{ $t('Min temp. ') }}{{ day.day.mintemp_c }}</li>
            <li>{{ $t('Max temp. ') }}{{ day.day.maxtemp_c }}</li>
            <li>{{ $t('Wind Speed ') }}{{ day.day.maxwind_kph }}</li>
            <li>{{ $t('Will it rain? ') }}{{ day.day.daily_will_it_rain }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WeatherFeed from 'src/modules/weather-feed/mixins/WeatherFeed'
import { date, required, sameAs } from 'vuelidate/lib/validators'
import ButtonFull from 'theme/components/theme/ButtonFull.vue'

export default {
  name: 'WeatherFeed',
  mixins: [WeatherFeed],
  components: {
    ButtonFull
  },
  validations: {
    date: {
      required,
      date
    }
  },
  data () {
    return {
      currentWeatherType: [],
      inputVisible: false,
      maxDate: date,
      minDate: date,
      selectedDate: date
    }
  },
  methods: {
    getCurrentWeather () {
      this.currentWeatherType = this.current
      this.inputVisible = false
    },
    getForecastWeather () {
      const threeDayForecast = this.forecast
      this.currentWeatherType = threeDayForecast.forecast.forecastday.slice(0, 3)
      this.inputVisible = false
    },
    openInput () {
      this.inputVisible = true
      this.currentWeatherType = ''
      this.setDate()
    },
    submit () {
      this.forecast.forecast.forecastday.forEach(value => {
        if (value.date === this.selectedDate) {
          this.currentWeatherType = [value]
        }
      })
    },
    setDate () {
      const currentDate = new Date()
      // set min date
      this.minDate = currentDate.getFullYear() + '-' + ((currentDate.getMonth() > 8) ? (currentDate.getMonth() + 1) : ('0' + (currentDate.getMonth() + 1))) + '-' + ((currentDate.getDate() > 9) ? currentDate.getDate() : ('0' + currentDate.getDate()))

      this.selectedDate = this.minDate

      // set max date
      const numberOfDaysToAdd = 9;
      currentDate.setDate(currentDate.getDate() + numberOfDaysToAdd);
      this.maxDate = currentDate.getFullYear() + '-' + ((currentDate.getMonth() > 8) ? (currentDate.getMonth() + 1) : ('0' + (currentDate.getMonth() + 1))) + '-' + ((currentDate.getDate() > 9) ? currentDate.getDate() : ('0' + currentDate.getDate()))
    }
  },
  watch: {
    weatherType: {
      handler () {
        this.getCurrentWeather()
        this.getForecastWeather()
        this.setDate()
        this.submit()
      }
    }
  }
}
</script>
