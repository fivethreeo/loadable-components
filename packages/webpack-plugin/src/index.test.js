import * as path from 'path';
import * as fs from 'fs';
import { Volume } from 'memfs';
import * as MemoryFileSystem from 'memory-fs';
import { Union } from 'unionfs';
import * as webpack from 'webpack';
import { promisify } from 'util';


function getFileSystems(jsonFs = {}) {
    const inputUnionFileSystem = new Union()
    const inputMemoryFileSystem = new MemoryFileSystem()

    const inputVolume = Volume.fromJSON(jsonFs);

    inputUnionFileSystem.use(fs)
        .use(inputVolume)
        .use(inputMemoryFileSystem);

    const outputFileSystem = new MemoryFileSystem()

    return {
        inputUnion: inputUnionFileSystem,
        inputMemory: inputMemoryFileSystem,
        outputMemory: outputFileSystem
    }
}

function getCompiler(config) {
    const compiler = webpack(config);
    compiler.run = thenify(compiler.run);
    return compiler;
}

function getCompilerWithFs(config, jsonFs = {}) {
    const compiler = getCompiler(config);
    compiler.run = promisify(compiler.run);
    compiler.inputFileSystem = fileSystems.inputUnion;
    compiler.outputFileSystem = fileSystems.outputMemory;
    return {
        compiler,
        input: fileSystems.inputMemory,
        output: fileSystems.outputMemory
    }
}

describe('LoadablePlugin', () => {
    it('builds', async () => {
        const { compiler, input, output } = getCompilerWithFs({
            entry: { file: '/file.js' },
            output: {
                path: '/build',
                filename: '[name].js'
            },
            module: {
                loaders: [
                    { test: /\.json$/, loader: 'json' }
                ],  
            }
        });
        const stats = await compiler.run()
    })
})