/// <reference types="jest" />

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidCall(): R;
            toHaveValidCallId(): R;
        }
    }
}

export { };
