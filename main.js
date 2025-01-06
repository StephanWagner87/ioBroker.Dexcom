
const utils = require('@iobroker/adapter-core');
const axios = require('axios');

class Dexcom extends utils.Adapter {
    constructor(options = {}) {
        super({
            ...options,
            name: 'dexcom',
        });

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        try {
            const username = this.config.username;
            const password = this.config.password;
            const interval = this.config.pollInterval || 300; // Default 5 minutes

            const sessionId = await this.getSessionId(username, password);
            if (sessionId) {
                this.log.info('Successfully authenticated with Dexcom API.');
                this.fetchGlucoseData(sessionId);
                this.setInterval(() => this.fetchGlucoseData(sessionId), interval * 1000);
            } else {
                this.log.error('Authentication failed. Please check your credentials.');
            }
        } catch (error) {
            this.log.error(`Initialization error: ${error.message}`);
        }
    }

    async getSessionId(username, password) {
        try {
            const response = await axios.post('https://share2.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccount', {
                accountName: username,
                password: password,
                applicationId: 'd89443d2-327c-4a6f-89e5-496bbb0317db'
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data || null;
        } catch (error) {
            this.log.error(`Error fetching session ID: ${error.message}`);
            return null;
        }
    }

    async fetchGlucoseData(sessionId) {
        try {
            const response = await axios.post('https://share2.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues', {
                sessionId: sessionId,
                minutes: 1440,
                maxCount: 1
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const glucoseData = response.data[0];
            if (glucoseData) {
                await this.setStateAsync('glucose.current', { val: glucoseData.Value, ack: true });
                await this.setStateAsync('glucose.timestamp', { val: glucoseData.WT, ack: true });
                this.log.info(`Glucose data updated: ${glucoseData.Value} mg/dL`);
            } else {
                this.log.warn('No glucose data received.');
            }
        } catch (error) {
            this.log.error(`Error fetching glucose data: ${error.message}`);
        }
    }

    onUnload(callback) {
        try {
            callback();
        } catch (error) {
            callback();
        }
    }
}

if (require.main !== module) {
    module.exports = (options) => new Dexcom(options);
} else {
    new Dexcom();
}
