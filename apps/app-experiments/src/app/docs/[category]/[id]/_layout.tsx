import Link from 'next/link'

const menu = [
  {
    category: 'prompts',
    documents: ['P001', 'P002', 'P003', 'P004'],
  },
  {
    category: 'research',
    documents: ['R001', 'R002', 'R003', 'R004'],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row">
      <div className="w-64 p-5">
        {menu.map(item => (
          <div className="mb-5">
            <div className="uppercase">{item.category}</div>
            <div>
              {item.documents.map(doc => (
                <Link
                  className="ml-3 block hover:underline"
                  href={`/docs/${item.category}/${doc}`}
                >
                  {doc}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full p-5">{children}</div>
    </div>
  )
}
