import typescript from 'rollup-plugin-typescript2'

export default 
{
    input: 'src/scripts/service_worker.ts',
    output: 
    [
        {
            file: 'out/service_worker.js',
            format: 'es',
            sourcemap: true,
        },
    ],
    plugins: [ typescript() ],
}
