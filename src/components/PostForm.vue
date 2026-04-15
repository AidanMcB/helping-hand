<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    @click.self="$emit('close')"
  >
    <!-- Sheet / Modal -->
    <div class="relative z-50 w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100">
        <h2 class="text-lg font-semibold text-stone-800">New Post</h2>
        <button
          class="text-stone-400 hover:text-stone-600 transition-colors p-1 rounded-full hover:bg-stone-100"
          @click="$emit('close')"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form class="px-5 py-4 space-y-4" @submit.prevent="handleSubmit">
        <!-- Type toggle -->
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1.5">I want to…</label>
          <div class="flex rounded-xl bg-stone-100 p-1 gap-1">
            <button
              type="button"
              :class="[
                'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                form.type === 'offer'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              ]"
              @click="form.type = 'offer'"
            >
              🤲 Offer something
            </button>
            <button
              type="button"
              :class="[
                'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                form.type === 'need'
                  ? 'bg-amber-400 text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              ]"
              @click="form.type = 'need'"
            >
              🙏 Ask for help
            </button>
          </div>
        </div>

        <!-- Your name -->
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1.5" for="posterName">
            Your name <span class="text-rose-400">*</span>
          </label>
          <input
            id="posterName"
            v-model="form.posterName"
            type="text"
            placeholder="e.g. Aidan"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition text-sm"
          />
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1.5" for="title">
            What is it? <span class="text-rose-400">*</span>
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            :placeholder="form.type === 'offer' ? 'e.g. Extra toilet paper' : 'e.g. Need a ride to the airport'"
            required
            maxlength="80"
            class="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition text-sm"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1.5" for="description">
            More details
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="2"
            :placeholder="form.type === 'offer' ? 'e.g. 3 rolls, brand new, pick up anytime' : 'e.g. Saturday morning, going to PDX around 8am'"
            maxlength="300"
            class="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition text-sm resize-none"
          />
        </div>

        <!-- Contact -->
        <div>
          <label class="block text-sm font-medium text-stone-600 mb-1.5" for="contact">
            How to reach you <span class="text-stone-400 font-normal">(optional)</span>
          </label>
          <input
            id="contact"
            v-model="form.contact"
            type="text"
            placeholder="e.g. text 555-1234 or DM me on Instagram"
            class="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition text-sm"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-rose-500">{{ error }}</p>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          :class="[
            'w-full py-3 rounded-xl font-semibold text-sm transition-all',
            loading ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98]',
            form.type === 'offer'
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-amber-400 hover:bg-amber-500 text-stone-900'
          ]"
        >
          <span v-if="loading">Posting…</span>
          <span v-else-if="form.type === 'offer'">Post offer</span>
          <span v-else>Post request</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { createPost } from '../api/sheets.js'

const emit = defineEmits(['close', 'created'])

const form = reactive({
  type: 'offer',
  posterName: '',
  title: '',
  description: '',
  contact: '',
})
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const post = await createPost({ ...form })
    emit('created', post)
    emit('close')
  } catch (e) {
    error.value = 'Something went wrong. Try again.'
  } finally {
    loading.value = false
  }
}
</script>
