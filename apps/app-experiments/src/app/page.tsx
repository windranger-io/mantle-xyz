import React, { Suspense } from 'react'
import { CardLink, Page as PageWrapper, Container } from '@bitdao/ui'
import DynamicCard from './components/DynamicCard'

/**
 *
 * @todo Updated with real components and content when ready
 */
export default function Page() {
  return (
    <PageWrapper>
      <Container>
        <h1 className="text-6xl font-bold text-white">
          BitDAO OS App Template
        </h1>
        <p className="mt-5 text-2xl text-white">
          Get started by editing{' '}
          <code className="rounded-md bg-gray-800 p-3 font-mono text-lg">
            app/page.tsx
          </code>
        </p>
        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <Suspense
            fallback={
              <div className="mt-6 w-96 rounded-xl border p-6 text-left text-gray-50 hover:text-blue-600 focus:text-blue-600">
                <div className="flex animate-pulse flex-col h-full space-x-5">
                  <div className="flex flex-col space-y-3">
                    <div className="w-32 bg-gray-300 h-6 rounded-md " />
                    <div className="w-64 bg-gray-300 h-6 rounded-md " />
                    <div className="w-64 bg-gray-300 h-6 rounded-md " />
                  </div>
                </div>
              </div>
            }
          >
            <DynamicCard />
          </Suspense>
          <CardLink
            link="https://github.com/windranger-io"
            title="Documentation"
            description="Contributor guidelines & Git Processs and all the good stuff"
          />
          <CardLink
            link="https://github.com/windranger-io"
            title="Design System"
            description="Learn how to use the design system to build consistently awesome UI"
          />
          <CardLink
            link="https://github.com/windranger-io"
            title="Testing"
            description="Testing your app and making sure you have good e2e tests"
          />
          <CardLink
            link="https://github.com/windranger-io"
            title="Deploy"
            description="Deploy your app with Vercel and configure multi zone"
          />
        </div>
      </Container>
      <footer className="flex h-24 w-full items-center justify-center border-t text-gray-50">
        Powered by BIT
      </footer>
    </PageWrapper>
  )
}
