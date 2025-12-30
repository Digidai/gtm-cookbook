// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
// import CACCalculator from '../components/CACCalculator.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp() {
    // app.component('CACCalculator', CACCalculator)
  }
}
