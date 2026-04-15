<template>
  <div class="min-h-screen bg-stone-100 dark:bg-zinc-950 transition-colors duration-200 overflow-x-hidden">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-b border-stone-200 dark:border-zinc-700">
      <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">🤝</span>
          <span class="font-semibold text-stone-900 dark:text-zinc-50 tracking-tight">Helping Hand</span>
        </div>
        <div class="flex items-center gap-2">
          <!-- Dark mode toggle -->
          <button
            class="p-2 rounded-xl text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-100 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleDark"
          >
            <!-- Sun icon (shown in dark mode) -->
            <svg v-if="isDark" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
            <!-- Moon icon (shown in light mode) -->
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          </button>
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
      </div>
    </header>

    <!-- Filter tabs -->
    <div class="max-w-2xl mx-auto px-4 pt-5 pb-2 overflow-x-auto">
      <div class="flex gap-1 bg-stone-200 dark:bg-zinc-800 p-1 rounded-xl w-fit min-w-0">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="[
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            filter === tab.value
              ? 'bg-white dark:bg-zinc-600 text-stone-900 dark:text-zinc-50 shadow-sm'
              : 'text-stone-600 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200',
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
        <div v-for="i in 3" :key="i" class="rounded-2xl bg-stone-200 dark:bg-zinc-800 animate-pulse h-36" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-4xl mb-3">😬</p>
        <p class="font-medium text-stone-600 dark:text-zinc-300">Could not load posts.</p>
        <p class="text-sm mt-1 text-stone-500 dark:text-zinc-400">{{ error }}</p>
        <button
          class="mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
          @click="load"
        >
          Try again
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredPosts.length === 0" class="text-center py-20">
        <p class="text-4xl mb-3">{{ emptyEmoji }}</p>
        <p class="font-medium text-stone-600 dark:text-zinc-300">{{ emptyMessage }}</p>
        <button
          class="mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
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

// Dark mode — respects system preference on first visit, then persists to localStorage
const isDark = ref(
  localStorage.getItem('theme') === 'dark' ||
  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
)

function toggleDark() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

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
