const { request, VERBOSE } = require('./utils');

class Measurand {
    constructor({ input_param, parameter, unit }) {
        // How a measurand is described by external source (e.g. "CO")
        this.input_param = input_param;
        // How a measurand is described internally (e.g. "co")
        this.parameter = parameter;
        // Unit for measurand (e.g "ppb")
        this.unit = unit;
    }

    /**
     * Normalize unit and values of a given measurand.
     * @param {string} unit
     *
     * @returns { Object } normalizer
     */
    get _normalizer() {
        return (
            {
                ppb: ['ppm', (val) => val / 1000],
                'ng/m³': ['µg/m³', (val) => val / 1000],
                pp100ml: ['particles/cm³', (val) => val / 100]
            }[this.unit] || [this.unit, (val) => val]
        );
    }

    get normalized_unit() {
        return this._normalizer[0];
    }

    get normalize_value() {
        return this._normalizer[1];
    }

    /**
     * reshapes the parameters
     * use to look things up in the database but no reason to do that
     * Measurand objects that are supported by the OpenAQ API.
     *
     * @param {*} lookups, e.g. {'CO': ['co', 'ppb'] }
     * @returns { Measurand[] }
     */
    static async getSupportedMeasurands(lookups) {
      // Assume they are all supported
      const m = [];
      for (const [k, v] of Object.entries(lookups)) {
        const input_param = k;
        const parameter = v[0];
        const unit = v[1];
        m.push(new Measurand({ input_param, parameter, unit }));
      };
      return m;
    }

    /**
     * Given a map of lookups from an input parameter (i.e. how a data provider
     * identifies a measurand) to a tuple of a measurand parameter (i.e. how we
     * identify a measurand internally) and a measurand unit, generate an object
     * of Measurand objects that are supported by the OpenAQ API, indexed by their
     * input parameter.
     *
     * @param {*} lookups  e.g. {'CO': ['co', 'ppb'] }
     * @returns {object}
     */
    static async getIndexedSupportedMeasurands(lookups) {
        const measurands = await Measurand.getSupportedMeasurands(lookups);
        return Object.assign(
            {},
            ...measurands.map((measurand) => ({ [measurand.input_param]: measurand }))
        );
    }
}

module.exports = { Measurand };
