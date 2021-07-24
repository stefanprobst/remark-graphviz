import * as fs from 'fs'
import * as path from 'path'

import graphviz from '@hpcc-js/wasm'
import fromHtml from 'rehype-parse'
import { optimize, extendDefaultPlugins } from 'svgo'
import unified from 'unified'
import { visit, SKIP } from 'unist-util-visit'

import { generateContentHash } from './generateContentHash'

const languages = ['dot', 'graphviz']

const processor = unified().use(fromHtml, { fragment: true, space: 'svg' })

/** @type {import('svgo').OptimizeOptions} */
const svgoOptions = {
  multipass: true,
  plugins: extendDefaultPlugins([
    { name: 'removeDimensions', active: true },
    { name: 'removeViewBox', active: false },
    // {name: 'removeXMLNS', active: true},
    { name: 'prefixIds', active: true },
  ]),
}

export default function attacher(options = {}) {
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

          const svgString =
            options.optimize === true ? optimize(svg, svgoOptions).data : svg
          const hast = processor.parse(svgString)

          if (options.outputFolder != null) {
            if (options.publicFolder == null) {
              throw new Error(
                'When providing the "outputFolder" option, a "publicFolder" option must be provided as well.',
              )
            }

            const outputFolder = path.isAbsolute(options.outputFolder)
              ? options.outputFolder
              : path.join(process.cwd(), options.outputFolder)
            if (!fs.existsSync(outputFolder)) {
              fs.mkdirSync(outputFolder, { recursive: true })
            }

            const fileName = generateContentHash(svgString) + '.svg'
            const destinationFilePath = path.join(outputFolder, fileName)
            const publicFilePath = path.join(options.publicFolder, fileName)

            fs.writeFileSync(destinationFilePath, svgString, {
              encoding: 'utf-8',
            })

            node.data = {
              hName: 'figure',
              hProperties: {},
              hChildren: [
                {
                  type: 'element',
                  tagName: 'img',
                  properties: {
                    src: publicFilePath,
                    alt: '',
                  },
                },
              ],
            }
          } else {
            node.data = {
              hName: 'figure',
              hProperties: {},
              hChildren: hast.children,
            }
          }
        })

      promises.push(convertToSvgPromise)

      return SKIP
    }
  }
}
