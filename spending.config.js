import typescript from 'rollup-plugin-typescript2'

export default 
{
    input: 'src/scripts/spending.ts',
    output: 
    [
        {
            file: 'out/spending.js',
            format: 'es',
            sourcemap: true,
        },
    ],
    plugins: [ typescript() ],
}
