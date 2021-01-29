import { Module } from 'vuex'
import * as types from './mutation-types'
import fetch from 'isomorphic-fetch'
import config from 'config'
import RootState from 'core/types/RootState'
import WeatherFeedState from '../types/WeatherFeedState'

export const module: Module<WeatherFeedState, RootState> = {
  namespaced: true,
  state: {
    current: [],
    forecast: []
  },
  mutations: {
    [types.SET_WEATHER_FEED] (state, payload) {
      state.current = payload
    },
    [types.SET_WEATHER_FORECAST] (state, payload) {
      state.forecast = payload
    }
  },
  actions: {
    getCurrent ({ commit }) {
      fetch(config.weather.endpoint.current, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      })
        .then(res => {
          return res.json()
        })
        .then(res => {
          commit(types.SET_WEATHER_FEED, res.result)
        })
    },
    getForecast ({ commit }) {
      fetch(config.weather.endpoint.forecast, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      })
        .then(res => {
          return res.json()
        })
        .then(res => {
          commit(types.SET_WEATHER_FORECAST, res.result)
        })
    }
  },
  getters: {
    current: state => state.current,
    forecast: state => state.forecast
  }
}
