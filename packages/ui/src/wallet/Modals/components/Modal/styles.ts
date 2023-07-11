import tw from 'twin.macro'
import { motion } from 'framer-motion'

const { div } = motion

export const BackgroundOverlay = tw(
  div
)`fixed grid justify-center content-center right-0 left-0 top-0 border-0 h-full w-full backdrop-blur-lg z-[9999]`
