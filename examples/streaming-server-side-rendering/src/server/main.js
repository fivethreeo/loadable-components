import path from 'path'
import express from 'express'
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server'
import { Writable } from 'stream';
import fs from  'fs';

const app = express()

app.use(express.static(path.join(__dirname, '../../public')))

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable global-require, import/no-extraneous-dependencies */
  const { default: webpackConfig } = require('../../webpack.config.babel')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpack = require('webpack')
  /* eslint-enable global-require, import/no-extraneous-dependencies */

  const compiler = webpack(webpackConfig)

  app.use(
    webpackDevMiddleware(compiler, {
      logLevel: 'silent',
      publicPath: '/dist/web',
      writeToDisk(filePath) {
        return /dist\/node\//.test(filePath) || /loadable-stats/.test(filePath)
      },
    }),
  )
}

const nodeStats = path.resolve(
  __dirname,
  '../../public/dist/node/loadable-stats.json',
)

const webStats = path.resolve(
  __dirname,
  '../../public/dist/web/loadable-stats.json',
)

app.get('*', (req, res) => {
  let didError = false;
  let shellReady = false;

  let statsNode = JSON.parse(fs.readFileSync(nodeStats))
  let statsWeb = JSON.parse(fs.readFileSync(webStats))


  const nodeExtractor = new ChunkExtractor({ stats: statsNode })
  const { default: App } = nodeExtractor.requireEntrypoint()

  const webExtractor = new ChunkExtractor({ stats: statsWeb })

  // Ignore entry 
  webExtractor.getScriptTagsSince()

  class LoadableWritable extends Writable {
    constructor(writable) {
      super();
      this._writable = writable;
    }

    _write(chunk, encoding, callback) {
      // This should pick up any new link tags that hasn't been previously
      // written to this stream.
        const scriptTags = webExtractor.getScriptTagsSince()
        const linkTags = webExtractor.getLinkTagsSince()
        if (scriptTags) {
          this._writable.write(scriptTags, encoding)
        }
        if (linkTags.length) {
          this._writable.write(linkTags, encoding) 
        }
      // Finally write whatever React tried to write.

      this._writable.write(chunk, encoding);
      callback()
    }

    end() {
      this._writable.end();
    }

    flush() {
      if (typeof this._writable.flush === 'function') {
        this._writable.flush();
      }
    }
  }

  const writeable = new LoadableWritable(res)


  const stream = renderToPipeableStream(webExtractor.collectChunks(<App assets={statsWeb}/>),
    {
      bootstrapScripts: webExtractor.getMainAssets().map((asset)=>asset.url),
      onShellReady() {
        // The content above all Suspense boundaries is ready.
        // If something errored before we started streaming, we set the error code appropriately.
        res.statusCode = didError ? 500 : 200;
        res.setHeader('Content-type', 'text/html');
        shellReady = true;
        stream.pipe(writeable);

      },
      onShellError(error) {
        // Something errored before we could complete the shell so we emit an alternative shell.
        res.statusCode = 500;
        res.send(
          '<!doctype html><p>Loading...</p><script src="clientrender.js"></script>'
        );
      },
      onAllReady() {
        // If you don't want streaming, use this instead of onShellReady.
        // This will fire after the entire page content is ready.
        // You can use this for crawlers or static generation.

        // res.statusCode = didError ? 500 : 200;
        // res.setHeader('Content-type', 'text/html');
        // stream.pipe(res);
      },
      onError(err) {
        didError = true;
        console.error(err);
      },
    }
  );


});

// eslint-disable-next-line no-console
app.listen(9000, () => console.log('Server started http://localhost:9000'))
