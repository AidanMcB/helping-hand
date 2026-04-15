const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL

async function request(params = {}) {
  const url = new URL(BASE_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { redirect: 'follow' })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

export async function fetchPosts() {
  return request()
}

export async function createPost({ type, title, description, posterName, contact }) {
  return request({
    action: 'create',
    type,
    title,
    description,
    posterName,
    contact: contact || '',
  })
}

export async function claimPost(id, claimerName) {
  return request({ action: 'claim', id, claimerName })
}

export async function deletePost(id) {
  return request({ action: 'delete', id })
}
