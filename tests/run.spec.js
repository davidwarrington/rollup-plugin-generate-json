const fs = require('fs');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const { expect, test } = require('@jest/globals');

const baseDir = './tests';
const isDir = filepath => {
    return fs.lstatSync(filepath).isDirectory();
};

const tests = fs
    .readdirSync(baseDir)
    .filter(testDir => isDir(path.join(baseDir, testDir)))
    .map(testDir => {
        return [
            testDir,
            /* eslint-disable import/no-dynamic-require, global-require */
            require(`./${testDir}/expected.json`),
            require(`./${testDir}/dist/output.json`),
            /* eslint-enable import/no-dynamic-require, global-require */
        ];
    });

test.each(tests)(`%p generates the expected result`, (_, expected, output) => {
    expect(expected).toStrictEqual(output);
});
