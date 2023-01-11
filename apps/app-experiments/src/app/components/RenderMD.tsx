'use client'

import React from 'react'
import Markdoc, { RenderableTreeNode } from '@markdoc/markdoc'

export default function RenderMD({ content }: { content: RenderableTreeNode }) {
  const md = Markdoc.renderers.react(content, React)

  return <div>{md}</div>
}
