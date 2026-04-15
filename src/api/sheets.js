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
    throw new Error('API not configured — set VITE_APPS_SCRIPT_URL in .env.local')
  }
  try {
    new URL(RAW_URL)
  } catch {
    throw new Error('VITE_APPS_SCRIPT_URL in .env.local is not a valid URL')
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
        throw new Error(`Server error ${err.response.status}: ${err.response.statusText}`)
      }
      if (err.request) {
        throw new Error('No response from server — check your network or the Apps Script URL.')
      }
      throw new Error(`Request failed: ${err.message}`)
    }
    throw err
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
