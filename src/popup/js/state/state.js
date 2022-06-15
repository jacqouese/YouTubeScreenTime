export const globalState = {
    restrictedItems: {
        state: [],
        subscribers: [],
        setState(state) {
            this.state = state;
            this.subscribers.forEach((elem) => {
                elem();
            });
        },
    },
};

export const updater = (callback, state) => {
    callback();
    if (!(state in globalState)) {
        console.warn(
            `updater: State "${state}" does not exist. Callback will not be subscribed to any changes`
        );
        return;
    }

    globalState[state].subscribers.push(callback);
};

export const setState = (state, value) => {
    if (state in globalState) {
        globalState[state].setState(value);
    } else {
        globalState[state] = {
            state: value,
            subscribers: [],
            setState(state) {
                this.state = state;
                this.subscribers.forEach((elem) => {
                    elem();
                });
            },
        };
    }
};
