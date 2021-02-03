<template>
  <div class="row center-xs">
    <div class="row col-md-12">
      {{ $t('Choose') }}
    </div>
    <div class="row col-md-12 flex ">
      <input type="radio" id="currentWeather" name="weather" value="current" v-model="weatherData">
      <label for="currentWeather">{{ $t('Load Current Weather') }}</label><br>
      <input type="radio" id="forecastWeather" name="weather" value="forecast" v-model="weatherData">
      <label for="forecastWeather">{{ $t('Load Forecast Weather') }}</label><br>
      <input type="radio" id="other" name="weather" value="input" v-model="weatherData">
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
            placeholder="01/12/2021 *"
            @blur="$v.$touch()"
            :validations="[
              {
                condition: !$v.selectedDate.required,
                text: $t('Field is required.')
              },
              {
                condition: !$v.selectedDate.isValidDate,
                text: $t(`Date should be from ${ minDate } to ${ maxDate }.`)
              }
            ]"
          />
          <button-full class="mb20" type="submit">
            {{ $t('Get weather') }}
          </button-full>
        </form>
      </div>
      <div v-if="weatherData === 'forecast'">
        <ul v-for="day in getForecast.forecast.forecastday" :key="day.date_epoch">
          <li>{{ $t('Date') }} {{ day.date }}</li>
          <li>{{ $t('Min temp.') }} {{ day.day.mintemp_c }}</li>
          <li>{{ $t('Max temp.') }} {{ day.day.maxtemp_c }}</li>
          <li>{{ $t('Wind Speed') }} {{ day.day.maxwind_kph }}</li>
          <li>{{ $t('Will it rain?') }} {{ day.day.daily_will_it_rain }}</li>
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
      <div v-else>
        {{ $t('Please select...mzzz') }}
      </div>
    </div>
  </div>
</template>

<script>
import { required, helpers } from 'vuelidate/lib/validators'
import ButtonFull from 'theme/components/theme/ButtonFull.vue'
import dayjs from 'dayjs';
import { mapGetters, mapActions } from 'vuex'
import BaseInput from 'theme/components/core/blocks/Form/BaseInput.vue'
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
const validate = (params) => (value) => dayjs(value, 'DD/MM/YYYY').format('DD/MM/YYYY') === value && dayjs(value).isBetween(params.mindDate, params.maxDate, null, '[]');

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
        required,
        isValidDate: validate({ minDate: this.mindDate, maxDate: this.maxDate })
      }
    }
  },
  methods: {
    ...mapActions({
      loadCurrentWeather: 'weather-feed/loadCurrent',
      loadForecastWeather: 'weather-feed/loadForecast'
    }),
    getWeather () {
      if (this.weatherData === 'current') {
        this.loadCurrentWeather();
      } else if (this.weatherData === 'forecast') {
        this.loadForecastWeather();
      } else {
        this.loadForecastWeather();
        this.setDate();
      }
    },
    submitWeather () {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.inputData = this.getForecast;
        this.getForecast.forecast.forecastday.forEach(value => {
          if (dayjs(value.date).format('DD/MM/YYYY') === this.selectedDate) {
            this.inputData = value;
          }
        })
      }
    },
    setDate () {
      this.minDate = dayjs().format('DD/MM/YYYY');
      const numberOfDaysToAdd = 9;
      this.maxDate = dayjs().add(numberOfDaysToAdd, 'day').format('DD/MM/YYYY');
    }
  },
  watch: {
    weatherData: {
      handler () {
        this.getWeather();
      }
    }
  }
}
</script>
