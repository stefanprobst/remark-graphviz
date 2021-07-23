import * as fs from 'fs'
import * as path from 'path'

import toHtml from 'rehype-stringify'
import fromMarkdown from 'remark-parse'
import toHast from 'remark-rehype'
import unified from 'unified'

import graphviz from '../src/index.js'

function createProcessor(options) {
  const processor = unified()
    .use(fromMarkdown)
    .use(graphviz, options)
    .use(toHast)
    .use(toHtml)
  return processor
}

const doc = fs.readFileSync(
  path.join(process.cwd(), 'test', '__fixtures__', 'digraph.md'),
  { encoding: 'utf-8' },
)

describe('remark-graphviz', () => {
  it('should generate figure element with generated svg', async () => {
    const result = String(await createProcessor().process(doc))
    expect(result).toMatchSnapshot()
  })

  describe('outputPath option', () => {
    it('should generate image element and svg file', async () => {
      const options = { outputFolder: './test/__output__', publicFolder: '/' }
      const result = String(await createProcessor(options).process(doc))
      expect(result).toMatchSnapshot()
      expect(
        fs.existsSync(
          path.join(
            process.cwd(),
            options.outputFolder,
            'f7348fe1104f7dab79c8d931cbece7f1.svg',
          ),
        ),
      ).toBe(true)
    })

    it.todo('should show error message when "publicFolder" option is missing')
  })
})
