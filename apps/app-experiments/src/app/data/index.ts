import { env } from 'process'

export async function getDoc(cat: string, id: string) {
  const response = fetch(
    `https://api.github.com/repos/windranger-io/public-docs/contents/${cat}/${id}.md`,
    {
      headers: {
        authorization: `token ${env.GITHUB_TOKEN}`,
      },
    },
  )

  return (await response).json()
}
