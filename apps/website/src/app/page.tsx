import {
  Header,
  Footer,
  PageWrapper,
  PageContainer,
  Typography,
  Button,
} from '@mantle/ui'

/**
 *
 * @todo Updated with real components and content when ready
 */
export default function Page() {
  return (
    <PageWrapper
      header={<Header walletConnect={<Button>Wallet Connect???</Button>} />}
    >
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
