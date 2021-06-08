import typescript from 'rollup-plugin-typescript2'

export default 
{
    input: 'src/scripts/transaction_view.ts',
    output: 
    [
        {
            dir: 'out',
            format: 'es',
            souremap: true,
        },
    ],
    plugins: [ typescript() ],
}
