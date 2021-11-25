import typescript from './import.ts';
import yaml from './import.yml';

export default {
    name: 'Supports Plugins',
    plugins: [
        typescript.plugin,
        yaml.plugin,
    ],
};
