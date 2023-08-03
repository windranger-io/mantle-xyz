import { Footer, PageWrapper, PageContainer, Typography } from '@mantle/ui'
import Nav from 'src/components/Nav'

/**
 *
 * @todo Updated with real components and content when ready
 */
export default function Page() {
  return (
    <PageWrapper header={<Nav />}>
      <PageContainer className="gap-8">
        <Typography variant="appPageHeading" className="text-center">
          Bridge
        </Typography>

        <div>
          <Footer page="website" />
        </div>
      </PageContainer>
    </PageWrapper>
  )
}
