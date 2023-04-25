import React from 'react'
import Image from 'next/image'
/**
 * Full Page Background Images
 *

 *
 */
export const PageBackroundImage = ({
  className,
  imgSrc,
  altDesc,
}: {
  /**
   * What this?
   */
  imgSrc: any
  altDesc: string
  // eslint-disable-next-line react/require-default-props
  className?: string
}) => (
  <div
    className={`fixed h-screen w-screen overflow-hidden z-pageBackgroundImage ${
      className || ``
    }`}
  >
    <Image
      alt={altDesc}
      src={imgSrc}
      placeholder="blur"
      quality={100}
      fill
      sizes="100vw"
      style={{
        objectFit: 'cover',
      }}
    />
  </div>
)
