import typescript from 'rollup-plugin-typescript2'

export default 
{
    input: 'src/scripts/index.ts',
    output: 
    [
        {
            file: 'out/index.js',
            format: 'es',
            sourcemap: true,
        },
    ],
    plugins: [ typescript() ],
}
