import typescript from 'rollup-plugin-typescript2'

export default 
{
    input: 'src/scripts/repeat.ts',
    output: 
    [
        {
            file: 'out/repeat.js',
            format: 'es',
            sourcemap: true,
        },
    ],
    plugins: [ typescript() ],
}
