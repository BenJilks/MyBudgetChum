import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default
{
    input: 'src/index.ts',
    output:
    {
        file: 'out/bundle.js',
        format: 'es',
        sourcemap: true
    },
    plugins:
    [
        resolve(),
        typescript({ typescript: require('typescript'), module: 'CommonJS' }),
        commonjs(
        {
            extensions: [ '.js', '.ts' ]
        })
    ],
    watch: {
        exclude: ['node_modules/**']
    }
}

