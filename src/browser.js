import graphviz from '@hpcc-js/wasm'
import fromHtml from 'rehype-parse'
import unified from 'unified'
import { visit, SKIP } from 'unist-util-visit'

const languages = ['dot', 'graphviz']

const processor = unified().use(fromHtml, { fragment: true, space: 'svg' })

export default function attacher(options = {}) {
  graphviz.wasmFolder(
    options.wasmFolder || 'https://unpkg.com/@hpcc-js/wasm/dist',
  )

  return transformer

  async function transformer(tree) {
    const promises = []

    visit(tree, 'code', onCode)

    await Promise.all(promises)

    function onCode(node) {
      if (!languages.includes(node.lang)) return undefined

      const convertToSvgPromise = graphviz.graphviz
        .layout(node.value, 'svg', 'dot')
        .then((svg) => {
          /**
           * Overwrite node type, because leaving `code` would wrap the `figure`
           * in a `pre` element when transforming to hast.
           */
          node.type = 'paragraph'

          const hast = processor.parse(svg)

          node.data = {
            hName: 'figure',
            hProperties: {},
            hChildren: hast.children,
          }
        })

      promises.push(convertToSvgPromise)

      return SKIP
    }
  }
}
