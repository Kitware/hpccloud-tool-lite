// Import polyfills
import 'core-js/modules/web.immediate';

import { ROOT_STATE } from 'paraview-lite/src/stores';

import registerModules from 'paraview-lite/src/modules/registerModules';
import ParaviewLite from '../PVLiteComponent';

const HTTP_TO_WS = {
  'http:': 'ws:',
  'https:': 'wss:',
};

let INITIALIZED = false;

function initialize($store) {
  if (!INITIALIZED) {
    INITIALIZED = true;
    $store.registerModule('ParaviewLite', ROOT_STATE);
    $store.commit('PVL_COLOR_PRESET_NAMES_SET', [
      'Cool to Warm',
      'Cool to Warm (Extended)',
      'Rainbow Desaturated',
      'Cold and Hot',
      'erdc_rainbow_bright',
      '2hot',
      'erdc_iceFire_H',
      'erdc_iceFire_L',
      'Inferno (matplotlib)',
    ]);
    registerModules($store);
  }
}

export default {
  props: {
    simulation: {
      type: Object,
      default: null,
    },
    primaryJob: {
      type: String,
      default: 'paraview',
    },
  },
  components: {
    ParaviewLite,
  },
  created() {
    initialize(this.$store);
    this.$vuetify.icons.pvLite = {
      connect: 'mdi-cast-connected',
      close: 'mdi-close',
      error: 'mdi-alert-circle',
      edit: 'mdi-pencil',
      resetCamera: 'mdi-image-filter-center-focus',
      rotateLeft: 'mdi-rotate-left',
      rotateRight: 'mdi-rotate-right',
      undo: 'mdi-undo',
      floating: 'mdi-map-marker-plus',
      cancel: 'mdi-close-circle',
      caretDown: 'mdi-menu-down',
      check: 'mdi-check',
      advanced: 'mdi-settings',
      piecewise: 'mdi-chart-timeline-variant',
      expandRange: 'mdi-arrow-expand-horizontal',
      colorPalette: 'mdi-palette',
      delete: 'mdi-trash-can-outline',
      upDirectory: 'mdi-arrow-top-left',
      directory: 'mdi-folder',
      group: 'mdi-folder-star',
      file: 'mdi-file',
      show: 'mdi-eye-outline',
      hide: 'mdi-eye-off-outline',

      representationType: 'mdi-widgets',
      representationColor: 'mdi-palette',
      representationOpacity: 'mdi-contrast-box',
      time: 'mdi-clock-outline',
      pointSize: 'mdi-chart-bubble',
      lineWidth: 'mdi-format-line-weight',
    };
  },
  mounted() {
    if (this.canConnect && INITIALIZED) {
      this.connect();
    }
  },
  watch: {
    canConnect(shouldConnect) {
      if (shouldConnect) {
        this.connect();
      }
    },
  },
  data() {
    return {
      connected: false,
    };
  },
  computed: {
    client() {
      return this.$store.getters.PVL_NETWORK_CLIENT;
    },
    sessionId() {
      return this.simulation.steps[this.simulation.active].metadata.sessionId;
    },
    taskflowId() {
      return this.simulation.steps[this.simulation.active].metadata.taskflowId;
    },
    jobStatus() {
      const statusMap = {};
      if (this.taskflow && this.taskflow.jobMapById) {
        Object.values(this.taskflow.jobMapById).forEach(({ name, status }) => {
          statusMap[name] = status;
        });
      }
      return statusMap;
    },
    baseURL() {
      return `${HTTP_TO_WS[location.protocol]}//${location.host}`;
    },
    sessionURL() {
      return `${this.baseURL}/proxy?sessionId=${this.sessionId}&path=ws`;
    },
    canConnect() {
      return this.jobStatus[this.primaryJob] === 'running';
    },
  },
  asyncComputed: {
    taskflow() {
      const taskflow = this.$store.getters.TASKFLOW_GET_BY_ID(this.taskflowId);
      if (!taskflow) {
        return this.$store.dispatch('TASKFLOW_FETCH', this.taskflowId);
      }
      return Promise.resolve(taskflow);
    },
  },
  methods: {
    goToSimulation() {
      this.$router.push(`/simulation/view/${this.simulation._id}`);
    },
    connect() {
      console.log('try to connect...');
      if (!this.connected && this.canConnect) {
        console.log('connecting...');
        this.$store.commit('PVL_NETWORK_CONFIG_SET', {
          sessionURL: this.sessionURL,
        });
        this.$store.dispatch('PVL_APP_ROUTE_RUN');
        this.$store.dispatch('PVL_NETWORK_CONNECT');
        this.connected = true;
      }
    },
  },
};
