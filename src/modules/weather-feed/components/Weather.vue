<template>
  <div class="row center-xs">
    <div class="row col-md-12">
      {{ $t('Choose') }}
    </div>
    <div class="row col-md-12 flex ">
      <input type="radio" id="currentWeather" name="weather" value="currentWeather" @click="getWeather('current')">
      <label for="currentWeather">{{ $t('Load Current Weather') }}</label><br>
      <input type="radio" id="forecastWeather" name="weather" value="forecastWeather" @click="getWeather('forecast')">
      <label for="forecastWeather">{{ $t('Load Forecast Weather') }}</label><br>
      <input type="radio" id="other" name="weather" value="other" @click="getWeather()">
      <label for="other">{{ $t('Other') }}</label>
    </div>
    <div class="row col-md-12 flex ">
      <div class="row col-md-12" v-if="weatherData === 'input'">
        {{ $t('Get specific date and show weather') }}
        <form @submit.prevent="submitWeather" novalidate>
          <base-input
            class="mb10"
            type="text"
            name="weatherData"
            v-model="selectedDate"
            :placeholder="$t('01/12/2021 *')"
            @blur="$v.$touch()"
            :validations="[
              {
                condition: !$v.selectedDate.required,
                text: $t('Field is required.')
              },
              {
                condition: !validateDate(),
                text: $t(`Date should be from ${ minDate } to ${ maxDate }.`)
              }
            ]"
          />
          <button-full class="mb20" type="submit">
            {{ $t('Get weather') }}
          </button-full>
        </form>
      </div>
      <div v-if="getCurrent.length !== 0 || getForecast.length !== 0">
        <div v-if="weatherData === 'forecast'">
          <ul v-for="day in getForecast.forecast.forecastday" :key="day.date_epoch">
            <li>{{ $t('Date') }}{{ day.date }}</li>
            <li>{{ $t('Min temp.') }}{{ day.day.mintemp_c }}</li>
            <li>{{ $t('Max temp.') }}{{ day.day.maxtemp_c }}</li>
            <li>{{ $t('Wind Speed') }}{{ day.day.maxwind_kph }}</li>
            <li>{{ $t('Will it rain?') }}{{ day.day.daily_will_it_rain }}</li>
          </ul>
        </div>
        <div v-else-if="weatherData === 'current'">
          <ul>
            <li>{{ getCurrent.current.temp_c }}</li>
            <li>{{ getCurrent.current.wind_dir }}</li>
            <li>{{ getCurrent.current.wind_kph }}</li>
          </ul>
        </div>
        <div v-else-if="weatherData === 'input' && inputData">
          <ul>
            <li>{{ inputData.date }}</li>
            <li>{{ inputData.day.mintemp_c }}</li>
            <li>{{ inputData.day.maxtemp_c }}</li>
            <li>{{ inputData.day.maxwind_kph }}</li>
            <li>{{ inputData.day.daily_will_it_rain }}</li>
          </ul>
        </div>
      </div>
      <div v-else>
        {{ $t('No data selected') }}
      </div>
    </div>
  </div>
</template>

<script>
import { maxValue, minValue, required, between, common, numeric } from 'vuelidate/lib/validators'
import ButtonFull from 'theme/components/theme/ButtonFull.vue'
import dayjs from 'dayjs';
import { mapGetters, mapActions } from 'vuex'
import BaseInput from 'theme/components/core/blocks/Form/BaseInput.vue'

export default {
  name: 'WeatherFeed',
  components: {
    ButtonFull,
    BaseInput
  },
  computed: {
    ...mapGetters({
      getCurrent: 'weather-feed/getCurrent',
      getForecast: 'weather-feed/getForecast'
    })
  },
  data () {
    return {
      inputData: null,
      maxDate: null,
      minDate: null,
      weatherData: null,
      selectedDate: null
    }
  },
  validations () {
    return {
      selectedDate: {
        required
      }
    }
  },
  methods: {
    ...mapActions({
      loadCurrentWeather: 'weather-feed/loadCurrent',
      loadForecastWeather: 'weather-feed/loadForecast'
    }),
    getWeather (type) {
      if (type === 'current') {
        this.resetWeatherType();
        this.loadCurrentWeather();
        this.weatherData = type;
      } else if (type === 'forecast') {
        this.resetWeatherType();
        this.loadForecastWeather();
        this.weatherData = type;
      } else {
        this.resetWeatherType();
        this.loadForecastWeather();
        this.weatherData = 'input';
        this.setDate();
      }
    },
    submitWeather () {
      if (!this.$v.$invalid && this.validateDate()) {
        this.inputData = this.getForecast;
        this.getForecast.forecast.forecastday.forEach(value => {
          if (dayjs(value.date).format('DD/MM/YYYY') === this.selectedDate) {
            this.inputData = value;
          }
        })
      }
    },
    resetWeatherType () {
      this.weatherData = null;
    },
    setDate () {
      this.minDate = dayjs().format('DD/MM/YYYY');
      const numberOfDaysToAdd = 9;
      this.maxDate = dayjs().add(numberOfDaysToAdd, 'day').format('DD/MM/YYYY');
    },
    validateDate () {
      const customParseFormat = require('dayjs/plugin/customParseFormat');
      dayjs.extend(customParseFormat);
      const isBetween = require('dayjs/plugin/isBetween');
      dayjs.extend(isBetween);
      const dayFormatValid = dayjs(this.selectedDate, 'DD/MM/YYYY').format('DD/MM/YYYY') === this.selectedDate;
      if (dayFormatValid) {
        return dayjs(this.selectedDate).isBetween(this.minDate, this.maxDate, null, '[]');
      }
    }
  }
}
</script>
