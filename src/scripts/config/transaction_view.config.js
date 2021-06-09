import typescript from 'rollup-plugin-typescript2'

export default 
{
    input: 'src/scripts/transaction_view.ts',
    output: 
    [
        {
            file: 'out/transaction_view.js',
            format: 'es',
            sourcemap: true,
        },
    ],
    plugins: [ typescript() ],
}
