<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h5 class="card-title mb-2">Compare domains</h5>
      <small class="d-block text-muted mb-3">
        Type a domain name, press Enter to add it and start comparing. Click ×
        to remove.
      </small>

      <label class="form-label fw-semibold">Domains</label>

      <div
        class="d-flex flex-wrap gap-2 align-items-center border rounded-3 p-2 bg-white"
        style="min-height: 44px; cursor: text"
        @click="focusInput"
      >
        <span
          v-for="d in domains"
          :key="d"
          class="badge rounded-pill d-inline-flex align-items-center gap-2 border border-primary-subtle text-primary bg-primary bg-opacity-10 px-3 py-2"
          title="Click × to remove"
        >
          <span class="fw-normal">{{ d }}</span>
          <button
            type="button"
            class="btn btn-sm p-0 border-0 lh-1 text-primary"
            aria-label="Remove domain"
            @click.stop="removeDomain(d)"
          >
            &times;
          </button>
        </span>

        <input
          ref="inputEl"
          v-model="input"
          class="form-control border-0 shadow-none p-0 flex-grow-1 bg-transparent"
          style="min-width: 180px"
          placeholder="Type domain and press Enter"
          @keydown="onKeydown"
          @blur="addFromInput"
          @paste="onPaste"
        />
      </div>

      <div class="form-text mt-2">{{ domains.length }}/10 domains</div>

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-dark" type="button" @click="submit">
          Compare
        </button>
        <button
          class="btn btn-outline-secondary"
          type="button"
          @click="clearAll"
        >
          Clear
        </button>
      </div>

      <!-- Optional examples -->
      <div class="mt-3">
        <div class="text-muted mb-2 small">Try examples:</div>
        <div class="d-flex flex-wrap gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="
              setExample([
                'commbank.com.au',
                'westpac.com.au',
                'nab.com.au',
                'anz.com.au',
                'macquarie.com.au',
              ])
            "
          >
            Major Australian banks
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="setExample(['google.com', 'facebook.com', 'openai.com'])"
          >
            Big tech
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="setExample(['abc.net.au', 'smh.com.au', 'theguardian.com'])"
          >
            News sites
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

const props = defineProps<{ initialDomains?: string[] }>();
const emit = defineEmits<{
  (e: "submit", domains: string[]): void;
  (e: "clear"): void;
}>();

const domains = ref<string[]>([]);
const input = ref("");
const inputEl = ref<HTMLInputElement | null>(null);

watch(
  () => props.initialDomains,
  (val) => {
    domains.value = (val ?? [])
      .map(normalizeDomain)
      .filter(Boolean)
      .slice(0, 10);
  },
  { immediate: true }
);

function focusInput() {
  inputEl.value?.focus();
}

function normalizeDomain(s: string) {
  let v = s.trim().toLowerCase();
  if (!v) return "";

  v = v.replace(/^https?:\/\//, "");
  v = v.split("/")[0] ?? "";
  v = v.replace(/^www\./, "");
  v = v.replace(/[,\s.]+$/, "");

  return v;
}

function addDomains(list: string[]) {
  for (const raw of list) {
    if (domains.value.length >= 10) break;

    const d = normalizeDomain(raw);
    if (!d) continue;

    if (!domains.value.includes(d)) domains.value.push(d);
  }
}

function addFromInput() {
  const v = input.value;
  if (!v.trim()) return;

  // allow comma-separated typing too
  addDomains(v.split(/[\n,]+/));
  input.value = "";
}

function removeDomain(d: string) {
  domains.value = domains.value.filter((x) => x !== d);
  nextTick(() => focusInput());
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    addFromInput();
  }

  // Backspace removes last chip if input empty
  if (e.key === "Backspace" && !input.value && domains.value.length) {
    domains.value.pop();
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData("text") ?? "";
  if (!text) return;

  // If user pastes multiple, convert to chips
  if (text.includes("\n") || text.includes(",") || text.includes(" ")) {
    e.preventDefault();
    addDomains(text.split(/[\s,\n]+/));
  }
}

function submit() {
  emit("submit", domains.value.slice(0, 10));
}

function clearAll() {
  domains.value = [];
  input.value = "";
  emit("clear");
}

function setExample(list: string[]) {
  domains.value = [];
  addDomains(list);
  nextTick(() => focusInput());
}
</script>
