import typescript from 'rollup-plugin-typescript2'

export default 
{
    input: 'src/scripts/shopping_list.ts',
    output: 
    [
        {
            file: 'out/shopping_list.js',
            format: 'es',
            sourcemap: true,
        },
    ],
    plugins: [ typescript() ],
}
