import { use } from 'react'

const DEF_DELAY = 1000
const sourceData = [
  {
    id: '001',
    name: 'Cat',
  },
]
function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms || DEF_DELAY)
  })
}

async function getData() {
  await sleep(3000)
  return sourceData
}

export default function DynamicCard() {
  const data = use(getData())

  return (
    <div className="mt-6 w-96 rounded-xl border p-6 text-left text-gray-50 hover:text-blue-600 focus:text-blue-600">
      <h3 className="text-2xl font-bold">Suspense &rarr;</h3>
      <p className="mt-4 text-xl">descrition</p>
      {data.map(d => (
        <li key={d.id}>{d.name}</li>
      ))}
    </div>
  )
}
