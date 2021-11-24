import fs from 'fs';
import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { rollup } from 'rollup';

const PLUGIN_NAME = 'generate-json';
const DEFAULT_OPTIONS = {
    replacer: null,
    space: 4,
};

function getDefaultFromCjs(namespace) {
    // eslint-disable-next-line no-underscore-dangle
    return namespace.__esModule ? namespace.default : namespace;
}

async function loadCompiledModule(fileName, bundledCode) {
    const resolvedFileName = fs.realpathSync(fileName);
    const extension = path.extname(resolvedFileName);
    const defaultLoader = require.extensions[extension];

    require.extensions[extension] = (module, requiredFileName) => {
        if (requiredFileName === resolvedFileName) {
            // eslint-disable-next-line no-underscore-dangle
            module._compile(bundledCode, requiredFileName);
        } else {
            defaultLoader(module, requiredFileName);
        }
    };

    delete require.cache[resolvedFileName];

    // eslint-disable-next-line no-useless-catch
    try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const defaultExport = getDefaultFromCjs(require(fileName));
        require.extensions[extension] = defaultLoader;
        return defaultExport;
    } catch (error) {
        throw error;
    }
}

export default function GenerateJsonPlugin(options = DEFAULT_OPTIONS) {
    return {
        name: PLUGIN_NAME,
        async generateBundle() {
            const input = path.resolve(process.cwd(), options.input);
            const childBundle = await rollup({ input });

            const {
                output: [{ code }],
            } = await childBundle.generate({
                exports: 'default',
                format: 'cjs',
            });

            const value = await loadCompiledModule(input, code);

            this.emitFile({
                type: 'asset',
                fileName: options.output,
                source: JSON.stringify(value, options.replacer, options.space),
            });
        },
    };
}
