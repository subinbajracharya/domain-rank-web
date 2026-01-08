<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h5 class="card-title mb-2">Compare domains</h5>
      <small class="d-block text-muted mb-3">
        Enter up to 10 domains (one per line) to compare their rankings over
        time.
      </small>

      <label class="form-label fw-semibold">Domains</label>
      <textarea
        v-model="text"
        class="form-control"
        rows="7"
        placeholder="safewill.com&#10;willed.com.au&#10;bare.com.au"
      />

      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-dark" type="button" @click="submit">
          Compare
        </button>
        <button class="btn btn-outline-secondary" type="button" @click="clear">
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ initialDomains?: string[] }>();
const emit = defineEmits<{
  (e: "submit", domains: string[]): void;
  (e: "clear"): void;
}>();

const text = ref("");

watch(
  () => props.initialDomains,
  (val) => {
    text.value = (val ?? []).join("\n");
  },
  { immediate: true }
);

function parseDomains(): string[] {
  return text.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10); // limit
}

function submit() {
  emit("submit", parseDomains());
}

function clear() {
  text.value = "";
  emit("clear");
}
</script>
