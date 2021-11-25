module.exports = {
    extends: ['airbnb-base', 'plugin:prettier/recommended'],

    overrides: [
        {
            files: ['**/*.spec.js'],
            env: {
                jest: true,
            },
        },
    ],
};
