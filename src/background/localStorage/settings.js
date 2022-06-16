class Settings {
    getSettingValue(settingName) {
        const setting = localStorage.getItem(settingName);

        // if setting does not already exist - create it
        if (setting === null) {
            localStorage.setItem(settingName, false);
        }

        return setting;
    }

    updateSettingValue(settingName, settingValue) {
        localStorage.setItem(settingName, settingValue);
    }
}

export default new Settings();
