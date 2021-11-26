const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const { afterAll, expect, test } = require('@jest/globals');
const glob = require('glob');

const baseDir = './tests';
const isDir = filepath => {
    return fs.lstatSync(filepath).isDirectory();
};

const tests = fs
    .readdirSync(baseDir)
    .filter(testDir => isDir(path.join(baseDir, testDir)))
    .map(testDir => [
        testDir,
        /* eslint-disable import/no-dynamic-require, global-require */
        require(`./${testDir}/expected.json`),
        require(`./${testDir}/dist/output.json`),
        /* eslint-enable import/no-dynamic-require, global-require */
    ]);

afterAll(() => {
    const testNames = tests.map(([name]) => name);
    const pattern = `${baseDir}/@(${testNames.join('|')})/dist/`;
    glob.sync(pattern).forEach(dir => fs.rmSync(dir, { recursive: true }));
});

test.each(tests)(`%p generates the expected result`, (_, expected, output) => {
    expect(expected).toStrictEqual(output);
});
