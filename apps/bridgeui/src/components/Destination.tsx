import { SiDogecoin } from 'react-icons/si'
import DirectionLabel from './DirectionLabel'

export default function Destination() {
  return (
    <div>
      <DirectionLabel direction="To" logo={<SiDogecoin />} chain="Doge" />
      <input
        className="w-full border border-stroke-inputs  rounded-lg  bg-black py-1.5 px-3 "
        disabled
        placeholder="123.4"
      />
    </div>
  )
}
