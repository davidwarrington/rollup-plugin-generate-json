import path from 'path';
import plugin from '../plugin/index';

const baseDir = 'tests/';

export default {
    input: path.join(baseDir, 'exports-value/src/index.js'),
    output: {
        file: path.join(baseDir, 'exports-value/dist/output.js'),
    },
    plugins: [
        plugin({
            input: './tests/exports-value/src/schema.js',
            output: 'schema.json',
        }),
    ],
};
