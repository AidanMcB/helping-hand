import axios from 'axios'

const RAW_URL = import.meta.env.VITE_APPS_SCRIPT_URL

/**
 * In dev, requests go to /dev-api which Vite proxies to the real GAS URL.
 * This avoids CORS preflight issues when testing locally.
 * In production the full URL is used directly.
 */
const BASE_URL = import.meta.env.DEV ? '/dev-api' : RAW_URL

function validateConfig() {
  if (!RAW_URL) {
    const detail = import.meta.env.DEV
      ? 'Set VITE_APPS_SCRIPT_URL in .env.local'
      : 'VITE_APPS_SCRIPT_URL was not set at build time — check the GitHub Actions secret and redeploy'
    console.error(`[sheets] ${detail}`)
    throw new Error('Something went wrong. Please try again later.')
  }
  try {
    new URL(RAW_URL)
  } catch {
    const detail = import.meta.env.DEV ? 'in .env.local' : 'in the GitHub Actions secret'
    console.error(`[sheets] VITE_APPS_SCRIPT_URL ${detail} is not a valid URL: "${RAW_URL}"`)
    throw new Error('Something went wrong. Please try again later.')
  }
}

const apiClient = axios.create()

async function request(params = {}) {
  validateConfig()
  try {
    const { data } = await apiClient.get(BASE_URL, { params })
    return data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        console.error(`[sheets] Server error ${err.response.status}:`, err.response.data)
        throw new Error('The server returned an error. Please try again.')
      }
      if (err.request) {
        console.error('[sheets] No response received:', err.request)
        throw new Error('Could not reach the server. Check your connection and try again.')
      }
      console.error('[sheets] Request setup error:', err.message)
    } else {
      console.error('[sheets] Unexpected error:', err)
    }
    throw new Error('Something went wrong. Please try again later.')
  }
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
