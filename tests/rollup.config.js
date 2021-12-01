import fs from 'fs';
import path from 'path';
import typescript from '@rollup/plugin-typescript';
import yaml from '@rollup/plugin-yaml';
import plugin from '../plugin/index';

const isDir = filepath => {
    return fs.lstatSync(filepath).isDirectory();
};

const baseDir = 'tests/';
const tests = fs
    .readdirSync(baseDir)
    .filter(test => isDir(path.join(baseDir, test)));

export default tests.map(test => {
    const testPath = path.join(baseDir, test);

    let plugins = [
        plugin({
            input: path.join(testPath, '/src/input.js'),
            output: 'output.json',
        }),
    ];

    if (test === 'supports-plugins') {
        plugins = [typescript(), yaml(), ...plugins];
    }

    return {
        input: [
            path.join(testPath, '/src/index.js'),
            path.join(testPath, '/src/input.js'),
        ],
        output: {
            dir: path.join(testPath, '/dist'),
            entryFileNames: '[name].js',
        },
        plugins,
    };
});
