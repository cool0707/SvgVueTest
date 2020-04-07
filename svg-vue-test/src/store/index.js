import Vue from 'vue'
import Vuex from 'vuex'
import {gameObjects} from './modules/game-objects';

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    gameObjects,
  }
})
