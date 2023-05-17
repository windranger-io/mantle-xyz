import React from 'react'
import BoringAvatar from 'boring-avatars'

export type AvatarProps = {
  walletAddress: string
  // eslint-disable-next-line react/require-default-props
  size?: number
}

const Avatar = ({ walletAddress, size = 18 }: AvatarProps) => {
  return (
    <BoringAvatar
      size={size}
      name={walletAddress}
      variant="pixel"
      colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
    />
  )
}

export default Avatar
