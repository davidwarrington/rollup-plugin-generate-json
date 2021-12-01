import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

/** @typedef {import('rollup').Plugin} RollupPlugin */

const PLUGIN_NAME = 'generate-json';
const DEFAULT_OPTIONS = {
    /** @type {string} */
    input: undefined,
    /** @type {string} */
    output: undefined,
    /** @type {'auto' | RollupPlugin[]} */
    plugins: 'auto',
    replacer: null,
    space: 4,
};

function getDefaultFromCjs(namespace) {
    // eslint-disable-next-line no-underscore-dangle
    return namespace.__esModule ? namespace.default : namespace;
}

/**
 * @param {string} fileName
 * @param {string} bundledCode
 */
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

/** @returns {RollupPlugin} */
export default function GenerateJsonPlugin(pluginOptions = DEFAULT_OPTIONS) {
    const options = { ...DEFAULT_OPTIONS, ...pluginOptions };

    return {
        name: PLUGIN_NAME,
        options(config) {
            const { plugins } = config;

            if (options.plugins === 'auto') {
                options.plugins = plugins;
            }
        },
        async generateBundle(outputOptions, bundle) {
            const input = path.resolve(process.cwd(), options.input);

            const outputChunk = Object.values(bundle).find(
                chunk => chunk.facadeModuleId === input
            );

            const cjsOutput = await esbuild.transform(outputChunk.code, {
                format: 'cjs',
            });
            const value = await loadCompiledModule(input, cjsOutput.code);
            const isFunction = typeof value === 'function';

            const exportValue = isFunction ? value() : value;

            this.emitFile({
                type: 'asset',
                fileName: options.output,
                source: JSON.stringify(
                    exportValue,
                    options.replacer,
                    options.space
                ),
            });
        },
    };
}
