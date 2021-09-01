# `remark-graphviz`

This is a [`remark`](https://github.com/remarkjs/remark) plugin to generate svg
images from graphviz (dot) code blocks.

## How to install

```bash
yarn add @stefanprobst/remark-graphviz
```

## How to use

Add the plugin to a [`unified`](https://github.com/unifiedjs/unified) pipeline
which transforms markdown to
[`hast`](https://github.com/syntax-tree/hast#list-of-utilities) with
[`remark-rehype`](https://github.com/remarkjs/remark-rehype). Note that the
plugin runs async, so `processor.runSync()` and `processor.processSync()` will
not work.

````js
import { unified } from 'unified'
import fromMarkdown from 'remark-parse'
import withGraphviz from '@stefanprobst/remark-graphviz'
import toHast from 'remark-rehype'
import toHtml from 'rehype-stringify'

const processor = unified()
  .use(fromMarkdown)
  .use(withGraphviz)
  .use(toHast)
  .use(toHtml)

const md = `
Some text before.

\```dot
digraph {
  a -> b
}
\```

Some text after.
`

processor.process(md).then((file) => {
  console.log(String(file))
})
````

### Options

By default, the svg image is wrapped in a HTML `figure` element:

```html
<figure>
  <!-- svg generated by graphviz -->
  <svg></svg>
</figure>
```

#### `outputFolder` and `publicFolder`

When the `outputFolder` and `publicFolder` options are provided, the svg image
is written to file, and an `<img>` element is created:

```js
const processor = unified()
  .use(fromMarkdown)
  .use(withGraphviz, {
    outputFolder: './public/assets',
    publicFolder: '/assets',
  })
  .use(toHast)
  .use(toHtml)
```

This will write the image to `./public/assets/contenthash.svg` and generate
`<img src="/assets/contenthash.svg" alt="" />`.

Note that relative paths in `outputFolder` are treated as relative to
`process.cwd()`.

#### `optimize`

When setting `optimize: true`, the generated svg string will be optimized with
[`svgo`](https://github.com/svg/svgo).

## How to use in the browser

The only option available is
[`wasmFolder`](https://github.com/hpcc-systems/hpcc-js-wasm#wasmFolder) to point
to a location of the required `graphviz.wasm`. It defaults to
`https://unpkg.com/@hpcc-js/wasm/dist`.

## TODO

- Allow providing `figcaption` / `alt` text via `node.meta`.
