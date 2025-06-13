import { loadJS } from '@/scripts/utils/helpers';

const SRC = 'https://js.getcatch.com/catchjs/v1/catch.js';

const loadCatch = async () => {
    try {
        await loadJS(SRC);
        catchjs.init('CWnmRdK1XjU6SOZmHYMuvmZJ');
    } catch (error) {
        console.error(`Error loading Catch: ${ error }`);
    }
};

loadCatch();
