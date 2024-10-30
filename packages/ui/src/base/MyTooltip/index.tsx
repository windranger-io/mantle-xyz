'use client'

import React, { ReactNode } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
// import "./styles.css";

export const SIDE_OPTIONS: readonly ['top', 'right', 'bottom', 'left'] = [
  'top',
  'right',
  'bottom',
  'left',
]
type Side = (typeof SIDE_OPTIONS)[number]

export const MyTooltip = ({
  title,
  content,
  side = 'right',
  sideOffset = 30,
}: {
  /**
   * The title of the tooltip
   */
  title: ReactNode | string
  /**
   * The content of the tooltip
   */
  content: ReactNode
  side: Side
  sideOffset: number
}) => {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="cursor-pointer	">{title}</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            className="bg-white rounded-lg p-4 z-20"
            sideOffset={sideOffset}
          >
            {content}
            <Tooltip.Arrow className="TooltipArrow fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
