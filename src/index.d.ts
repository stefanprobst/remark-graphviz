import type { Plugin } from 'unified'

export type Options = {
  /**
   * When enabled, optimizes the generated svg output with `svgo`.
   */
  optimize?: true
} & (
  | never
  | {
    /**
     * Folder path where egnerated .svg file will be written to.
     */
      outputFolder: string
      /**
       * Folder path which will be used in the `<img>` element's `src` attribute.
       */
      publicFolder: string
    }
)

const remarkGraphviz: Plugin<[Options?]>

export default remarkGraphviz
