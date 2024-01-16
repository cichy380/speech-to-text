class MyAudioWorkletProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        for (let channel = 0; channel < input.length; ++channel) {
            output[channel].set(input[channel]);
            const volumeArray = new Uint8Array(input[channel]);
            this.port.postMessage({ volumeArray: volumeArray });
        }

        return true;
    }
}

registerProcessor('audioWorkletProcessor', MyAudioWorkletProcessor);