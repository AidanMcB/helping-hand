<template>
  <div
    :class="[
      'relative rounded-2xl border p-4 transition-all',
      post.type === 'offer'
        ? 'bg-white border-emerald-100'
        : 'bg-white border-amber-100',
    ]"
  >
    <!-- Type badge -->
    <span
      :class="[
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3',
        post.type === 'offer'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-amber-50 text-amber-700',
      ]"
    >
      <span>{{ post.type === 'offer' ? '🤲' : '🙏' }}</span>
      {{ post.type === 'offer' ? 'Offering' : 'Needs help' }}
    </span>

    <!-- Title -->
    <h3 class="font-semibold text-stone-900 text-base leading-snug mb-1">{{ post.title }}</h3>

    <!-- Description -->
    <p v-if="post.description" class="text-sm text-stone-500 leading-relaxed mb-3">{{ post.description }}</p>

    <!-- Meta row -->
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400 mb-3">
      <span class="font-medium text-stone-600">{{ post.posterName }}</span>
      <span v-if="post.contact" class="flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
        {{ post.contact }}
      </span>
      <span class="ml-auto">{{ timeAgo(post.createdAt) }}</span>
    </div>

    <!-- Claimer banner -->
    <div
      v-if="post.claimerName"
      class="flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-100 px-3 py-2 mb-3 text-sm"
    >
      <span class="text-stone-400">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </span>
      <span class="text-stone-600"><span class="font-medium">{{ post.claimerName }}</span> is on it</span>
    </div>

    <!-- Claim form (inline) -->
    <div v-else-if="showClaimForm" class="flex gap-2 mb-3">
      <input
        v-model="claimerName"
        type="text"
        placeholder="Your name"
        autofocus
        class="flex-1 min-w-0 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        @keydown.enter="handleClaim"
        @keydown.escape="showClaimForm = false"
      />
      <button
        :disabled="!claimerName.trim() || claimLoading"
        class="px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-emerald-600 transition"
        @click="handleClaim"
      >
        {{ claimLoading ? '…' : 'Go' }}
      </button>
      <button
        class="px-3 py-2 text-stone-400 hover:text-stone-600 transition"
        @click="showClaimForm = false"
      >
        ✕
      </button>
    </div>

    <!-- Action buttons -->
    <div class="flex items-center gap-2">
      <button
        v-if="!post.claimerName && !showClaimForm"
        :class="[
          'flex-1 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98]',
          post.type === 'offer'
            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
        ]"
        @click="showClaimForm = true"
      >
        {{ post.type === 'offer' ? "I'll take it!" : "I can help!" }}
      </button>

      <!-- Delete with confirm -->
      <div v-if="!showDeleteConfirm" class="flex items-center">
        <button
          class="p-2 text-stone-300 hover:text-rose-400 transition-colors rounded-xl hover:bg-rose-50"
          title="Mark as done / remove"
          @click="showDeleteConfirm = true"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      <div v-else class="flex items-center gap-2 text-sm">
        <span class="text-stone-500 text-xs">Done / remove?</span>
        <button
          :disabled="deleteLoading"
          class="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-medium hover:bg-rose-600 transition disabled:opacity-50"
          @click="handleDelete"
        >
          {{ deleteLoading ? '…' : 'Yes, remove' }}
        </button>
        <button
          class="px-3 py-1.5 text-stone-400 hover:text-stone-600 transition text-xs"
          @click="showDeleteConfirm = false"
        >
          Cancel
        </button>
      </div>
    </div>

    <p v-if="claimError" class="text-xs text-rose-500 mt-2">{{ claimError }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { claimPost, deletePost } from '../api/sheets.js'

const props = defineProps({
  post: { type: Object, required: true },
})
const emit = defineEmits(['updated', 'deleted'])

const showClaimForm = ref(false)
const claimerName = ref('')
const claimLoading = ref(false)
const claimError = ref('')

const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

async function handleClaim() {
  if (!claimerName.value.trim() || claimLoading.value) return
  claimError.value = ''
  claimLoading.value = true
  try {
    await claimPost(props.post.id, claimerName.value.trim())
    emit('updated', { ...props.post, claimerName: claimerName.value.trim() })
    showClaimForm.value = false
  } catch {
    claimError.value = 'Could not claim. Try again.'
  } finally {
    claimLoading.value = false
  }
}

async function handleDelete() {
  deleteLoading.value = true
  try {
    await deletePost(props.post.id)
    emit('deleted', props.post.id)
  } catch {
    showDeleteConfirm.value = false
  } finally {
    deleteLoading.value = false
  }
}
</script>
