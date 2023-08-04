'use client'

import React from 'react'
import * as Accordion from '@radix-ui/react-accordion'
import classNames from 'classnames'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import './styles.css'

/* eslint-disable react/jsx-props-no-spreading */
const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  // eslint-disable-next-line react/require-default-props
  { children: React.ReactNode; className?: string }
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      className={classNames(
        'AccordionTrigger flex items-center justify-between grow p-4',
        className,
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <ChevronDownIcon className="AccordionChevron" aria-hidden />
    </Accordion.Trigger>
  </Accordion.Header>
))

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  // eslint-disable-next-line react/require-default-props
  { children: React.ReactNode; className?: string }
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Content
    className={classNames('AccordionContent overflow-hidden', className)}
    {...props}
    ref={forwardedRef}
  >
    <div className="mx-4 mb-4">{children}</div>
  </Accordion.Content>
))

export type AccordionItemType = {
  trigger: React.ReactNode
  content: React.ReactNode
  value: string
}

type AccordionUiProps = {
  list: AccordionItemType[]
  // eslint-disable-next-line react/require-default-props
  defaultValue?: string
  // eslint-disable-next-line react/require-default-props
  collapsible?: boolean
  // eslint-disable-next-line react/require-default-props
  className?: string
}

export const AccordionUi = ({
  list,
  defaultValue = '',
  collapsible = true,
  className = '',
}: AccordionUiProps) => (
  <Accordion.Root
    type="single"
    defaultValue={defaultValue}
    collapsible={collapsible}
    className={className}
  >
    {list.map(el => (
      <Accordion.Item
        className="overflow-hidden border-b border-[#1C1E20]"
        value={el.value}
        key={el.value}
      >
        <AccordionTrigger>{el.trigger}</AccordionTrigger>
        <AccordionContent>{el.content}</AccordionContent>
      </Accordion.Item>
    ))}
  </Accordion.Root>
)
