import React from 'react'
import BoringAvatar from 'boring-avatars'

export type AvatarProps = {
  walletAddress: string
}

const Avatar = ({ walletAddress }: AvatarProps) => {
  return (
    <BoringAvatar
      size={28}
      name={walletAddress}
      variant="pixel"
      colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
    />
  )
}

export default Avatar
