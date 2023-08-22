'use client'

import { Button } from '@mantle/ui'
import { Header } from '@mantle/ui/src/navigation/Header'

type NavProps = {
  // eslint-disable-next-line react/require-default-props
  className?: string | undefined
}

function Nav({ className = '' }: NavProps) {
  return (
    <Header
      walletConnect={<Button>Wallet Connect???</Button>}
      className={className}
      navItems={[]}
      activeKey="website"
      mobileMenuOpen={false}
      setMobileMenuOpen={() => {}}
    />
  )
}

export default Nav
