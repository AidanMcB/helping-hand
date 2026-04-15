<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-stone-100">
      <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🤝</span>
          <span class="font-semibold text-stone-800 tracking-tight">Helping Hand</span>
        </div>
        <button
          class="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm"
          @click="showForm = true"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New post
        </button>
      </div>
    </header>

    <!-- Filter tabs -->
    <div class="max-w-2xl mx-auto px-4 pt-5 pb-2">
      <div class="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="[
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            filter === tab.value
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700',
          ]"
          @click="filter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Feed -->
    <main class="max-w-2xl mx-auto px-4 pb-20 pt-3">
      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="rounded-2xl bg-stone-100 animate-pulse h-36" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20 text-stone-400">
        <p class="text-4xl mb-3">😬</p>
        <p class="font-medium text-stone-500">Could not load posts.</p>
        <p class="text-sm mt-1">{{ error }}</p>
        <button
          class="mt-4 text-sm text-emerald-600 hover:underline"
          @click="load"
        >
          Try again
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredPosts.length === 0" class="text-center py-20 text-stone-400">
        <p class="text-4xl mb-3">{{ emptyEmoji }}</p>
        <p class="font-medium text-stone-500">{{ emptyMessage }}</p>
        <button
          class="mt-4 text-sm text-emerald-600 hover:underline"
          @click="showForm = true"
        >
          Be the first to post
        </button>
      </div>

      <!-- Cards -->
      <TransitionGroup
        v-else
        name="list"
        tag="div"
        class="space-y-3"
      >
        <PostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
          @updated="onUpdated"
          @deleted="onDeleted"
        />
      </TransitionGroup>
    </main>

    <!-- Post form modal -->
    <PostForm
      v-if="showForm"
      @close="showForm = false"
      @created="onCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PostCard from './components/PostCard.vue'
import PostForm from './components/PostForm.vue'
import { fetchPosts } from './api/sheets.js'

const posts = ref([])
const loading = ref(true)
const error = ref('')
const showForm = ref(false)
const filter = ref('all')

const tabs = [
  { label: 'All', value: 'all' },
  { label: '🤲 Offers', value: 'offer' },
  { label: '🙏 Needs', value: 'need' },
]

const filteredPosts = computed(() => {
  const list = filter.value === 'all'
    ? posts.value
    : posts.value.filter(p => p.type === filter.value)
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const emptyEmoji = computed(() => {
  if (filter.value === 'offer') return '🌱'
  if (filter.value === 'need') return '🤷'
  return '✨'
})

const emptyMessage = computed(() => {
  if (filter.value === 'offer') return 'No offers yet.'
  if (filter.value === 'need') return 'No requests yet.'
  return 'Nothing here yet.'
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    posts.value = await fetchPosts()
  } catch (e) {
    error.value = e.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}

function onCreated(post) {
  posts.value.unshift(post)
}

function onUpdated(updated) {
  const idx = posts.value.findIndex(p => p.id === updated.id)
  if (idx !== -1) posts.value[idx] = updated
}

function onDeleted(id) {
  posts.value = posts.value.filter(p => p.id !== id)
}

onMounted(load)
</script>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
