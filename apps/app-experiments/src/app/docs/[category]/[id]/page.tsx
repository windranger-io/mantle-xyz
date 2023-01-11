import React, { use } from 'react'
import Markdoc from '@markdoc/markdoc'
import { getDoc } from '../../../data'
import callout from '../../../schema/callout.markdown'
import heading from '../../../schema/heading.markdown'

export default function DocPage({
  params,
}: {
  params: { category: string; id: string }
}) {
  const document = use(getDoc(params.category, params.id))
  const buff = document.content ? Buffer.from(document.content, 'base64') : ''
  const str = buff.toString('utf-8')
  const ast = Markdoc.parse(str)
  const config = {
    tags: {
      callout,
    },
    nodes: {
      heading,
    },
    variables: {},
  }
  const content = Markdoc.transform(ast, config)
  const md = Markdoc.renderers.react(content, React)

  return <div className="resource-document">{md}</div>
}
