<template>
  <div>
    <div class="pb-3 border-bottom mb-4">
      <h5 class="fw-semibold mb-1">Compare Domains</h5>
      <p class="text-muted small mb-0">
        Enter domain names, one per line. Max 10 domains.
      </p>
    </div>

    <div class="mb-3">
      <label class="form-label fw-medium">Domains</label>

      <div
        class="form-control d-flex flex-wrap align-items-center gap-2"
        :class="{ 'is-invalid': error }"
        style="min-height: 52px; cursor: text"
        @click="focusInput"
      >
        <span
          v-for="(domain, index) in domains"
          :key="domain"
          class="badge d-flex align-items-center gap-1"
          :style="{ background: getDomainColor(index), color: '#fff' }"
        >
          <span class="text-truncate" style="max-width: 120px">{{
            domain
          }}</span>
          <button
            type="button"
            class="btn btn-sm btn-link text-white p-0 text-decoration-none lh-1"
            style="font-size: 1.2rem"
            @click.stop="removeDomain(domain)"
            aria-label="Remove domain"
          >
            ×
          </button>
        </span>

        <input
          ref="inputEl"
          v-model="input"
          class="form-control border-0 shadow-none p-0 flex-grow-1 bg-transparent"
          style="min-width: 150px; outline: none"
          placeholder="Type and press Enter..."
          @keydown="onKeydown"
          @blur="addFromInput"
          @paste="onPaste"
        />
      </div>

      <div class="d-flex justify-content-between align-items-center mt-2">
        <span class="small text-muted">{{ domains.length }}/10 domains</span>
        <button
          v-if="domains.length > 0"
          type="button"
          class="btn btn-link btn-sm text-decoration-none p-0"
          @click="clearAll"
        >
          Clear all
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="alert alert-danger py-2 px-3 mb-3 small"
      role="alert"
    >
      <div class="d-flex align-items-center gap-2">
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="d-flex gap-2 mb-4">
      <button
        class="btn btn-primary flex-grow-1"
        type="button"
        :disabled="domains.length === 0 || pending"
        @click="submit"
      >
        <span
          v-if="pending"
          class="d-flex align-items-center justify-content-center gap-2"
        >
          <span
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Comparing...
        </span>
        <span v-else>Compare Domains</span>
      </button>
    </div>

    <!-- Quick Examples -->
    <div class="pt-3 border-top">
      <div class="d-flex align-items-center gap-2 mb-3">
        <span class="small fw-medium text-muted">Quick Examples</span>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="
            setExample([
              'google.com',
              'facebook.com',
              'amazon.com',
              'apple.com',
            ])
          "
        >
          Tech Giants
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="
            setExample([
              'netflix.com',
              'hulu.com',
              'disneyplus.com',
              'hbomax.com',
            ])
          "
        >
          Streaming
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="
            setExample([
              'reddit.com',
              'twitter.com',
              'instagram.com',
              'tiktok.com',
            ])
          "
        >
          Social Media
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="
            setExample([
              'commbank.com.au',
              'westpac.com.au',
              'anz.com.au',
              'nab.com.au',
            ])
          "
        >
          Australian Banks
        </button>
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
const error = ref<string | null>(null);
const pending = ref(false);

const colorPalette = [
  "#667eea",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

function getDomainColor(index: number): string {
  return colorPalette[index % colorPalette.length] || "#667eea";
}

// Regex for valid domain format
const DOMAIN_REGEX =
  /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

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

function validateDomain(s: string): string | null {
  if (!s) return null;
  if (!DOMAIN_REGEX.test(s)) {
    return `Invalid domain format: "${s}"`;
  }
  return null;
}

function normalizeDomain(s: string) {
  let v = s.trim().toLowerCase();
  if (!v) return "";
  v = v.replace(/^https?:\/\//, "");
  const parts = v.split("/");
  v = parts[0] ?? "";
  v = v.replace(/^www\./, "");
  v = v.replace(/[,\s.]+$/, "");
  return v;
}

function addDomains(list: string[]) {
  error.value = null;

  for (const raw of list) {
    if (domains.value.length >= 10) break;

    const normalized = normalizeDomain(raw);
    if (!normalized) continue;

    const validationError = validateDomain(normalized);
    if (validationError) {
      error.value = validationError;
      continue;
    }

    if (!domains.value.includes(normalized)) domains.value.push(normalized);
  }
}

function addFromInput() {
  const v = input.value?.trim() || "";
  if (!v) return;

  const parts = v
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s): s is string => Boolean(s));
  if (parts.length > 0) {
    addDomains(parts);
  }
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

  if (e.key === "Backspace" && !input.value && domains.value.length) {
    domains.value.pop();
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData("text") ?? "";
  if (!text) return;

  if (text.includes("\n") || text.includes(",") || text.includes(" ")) {
    e.preventDefault();
    const parts = text
      .split(/[\s,\n]+/)
      .map((s) => s.trim())
      .filter((s): s is string => Boolean(s));
    addDomains(parts);
  }
}

function submit() {
  if (domains.value.length === 0) {
    error.value = "Please enter at least one domain.";
    return;
  }
  emit("submit", domains.value.slice(0, 10));
}

function clearAll() {
  domains.value = [];
  input.value = "";
  error.value = null;
  emit("clear");
}

function setExample(list: string[]) {
  domains.value = [];
  addDomains(list);
  nextTick(() => focusInput());
}
</script>
