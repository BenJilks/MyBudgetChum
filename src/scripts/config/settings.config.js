import typescript from 'rollup-plugin-typescript2'

export default 
{
    input: 'src/scripts/settings.ts',
    output: 
    [
        {
            file: 'out/settings.js',
            format: 'es',
            sourcemap: true,
        },
    ],
    plugins: [ typescript() ],
}
