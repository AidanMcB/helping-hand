const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL

async function get(params = {}) {
  const url = new URL(BASE_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { redirect: 'follow' })
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

async function post(body) {
  const form = new URLSearchParams(body)
  const res = await fetch(BASE_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

export async function fetchPosts() {
  return get()
}

export async function createPost({ type, title, description, posterName, contact }) {
  return post({
    action: 'create',
    type,
    title,
    description,
    posterName,
    contact: contact || '',
  })
}

export async function claimPost(id, claimerName) {
  return post({ action: 'claim', id, claimerName })
}

export async function deletePost(id) {
  return post({ action: 'delete', id })
}
