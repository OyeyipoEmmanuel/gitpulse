
export const fetchGraphQL = async (query: string, variables: object, token: string) => {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })
  
  const { data } = await res.json()
  
  return data
}