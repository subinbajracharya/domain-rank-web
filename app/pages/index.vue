<template>
  <div class="container py-5">
    <!-- Header Section -->
    <header class="text-center mb-5">
      <div class="mb-3">
        <span
          class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill"
        >
          Powered by Tranco List
        </span>
      </div>
      <h1 class="display-5 fw-bold mb-3">
        <span class="text-primary">Domain Ranking</span> Comparator
      </h1>
      <p class="text-muted lead mx-auto" style="max-width: 600px">
        Compare domain popularity over time with interactive charts. Track
        ranking trends and analyze market positioning.
      </p>
    </header>

    <!-- Stats Bar -->
    <div class="row g-3 mb-5 justify-content-center">
      <div class="col-6 col-md-3">
        <div class="bg-primary text-white rounded-3 p-3 text-center">
          <div class="h2 fw-bold mb-0">
            {{ Object.keys(data || {}).length }}
          </div>
          <small class="opacity-75">Domains Tracked</small>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="bg-warning text-dark rounded-3 p-3 text-center">
          <div class="h2 fw-bold mb-0">{{ totalDataPoints }}</div>
          <small class="opacity-75">Data Points</small>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="bg-success text-white rounded-3 p-3 text-center">
          <div class="h2 fw-bold mb-0">{{ dateRange }}</div>
          <small class="opacity-75">Days Tracked</small>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Left: Form Section -->
      <div class="col-12 col-xl-4">
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <DomainForm
            :initial-domains="domainsFromRoute"
            @submit="onSubmit"
            @clear="onClear"
          />

          <!-- Error Alert -->
          <div
            v-if="error"
            class="alert alert-danger alert-dismissible fade show mt-3"
            role="alert"
          >
            <div class="d-flex align-items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="flex-shrink-0 mt-1"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div>{{ error }}</div>
            </div>
            <button
              type="button"
              class="btn-close position-relative end-0 top-0 mt-2 me-2"
              data-bs-dismiss="alert"
              aria-label="Close"
              @click="error = null"
            ></button>
          </div>

          <!-- Unranked Domains Alert -->
          <div
            v-if="unrankedDomains.length > 0"
            class="alert alert-warning d-flex align-items-start gap-2 fade show mt-3"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="flex-shrink-0 mt-1"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              ></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div class="flex-grow-1">
              <strong>Not ranked in Tranco Top 1M:</strong>
              <ul class="mb-0 ps-3 mt-1 small">
                <li v-for="d in unrankedDomains" :key="d">{{ d }}</li>
              </ul>
            </div>
            <button
              type="button"
              class="btn-close position-absolute top-0 end-0 m-2"
              data-bs-dismiss="alert"
              aria-label="Close"
              @click="unrankedDomains = []"
            ></button>
          </div>
        </div>
      </div>

      <!-- Right: Results Section -->
      <div class="col-12 col-xl-8">
        <!-- Loading State -->
        <div
          v-if="pending"
          class="card border-0 shadow-sm rounded-4 p-5 text-center"
        >
          <div
            class="spinner-border text-primary mx-auto mb-3"
            role="status"
            style="width: 3rem; height: 3rem"
          >
            <span class="visually-hidden">Loading...</span>
          </div>
          <h5 class="fw-semibold mb-1">Fetching Rankings</h5>
          <p class="text-muted mb-0">Please wait while we gather the data...</p>
        </div>

        <!-- Results -->
        <div
          v-else-if="data && Object.keys(data).length"
          class="d-flex flex-column gap-4"
        >
          <!-- Chart -->
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <h5 class="fw-bold mb-4 text-secondary">
              <i class="bi bi-graph-up me-2"></i>Ranking History
            </h5>
            <div style="height: 380px">
              <RankChart :data="data" />
            </div>
          </div>

          <!-- Rankings Table -->
          <div class="card border-0 shadow-sm rounded-4">
            <div class="card-header bg-transparent border-bottom py-3">
              <h5 class="fw-bold mb-0 text-secondary">
                <i class="bi bi-list-ol me-2"></i>Latest Rankings
              </h5>
            </div>
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Domain</th>
                    <th>Latest Date</th>
                    <th class="text-center">Trend</th>
                    <th class="text-end">Current Rank</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in latestList" :key="item.domain">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <span
                          class="badge rounded-pill"
                          :style="{ background: getDomainColor(item.domain) }"
                          >&nbsp;</span
                        >
                        <span class="fw-semibold">{{ item.domain }}</span>
                      </div>
                    </td>
                    <td class="text-muted">{{ formatDate(item.date) }}</td>
                    <td class="text-center">
                      <span
                        v-if="item.change !== null"
                        class="badge"
                        :class="getTrendClass(item.change)"
                      >
                        <span v-if="item.change > 0">↓</span>
                        <span v-else-if="item.change < 0">↑</span>
                        <span v-else>→</span>
                        {{ Math.abs(item.change) }}
                      </span>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td class="text-end">
                      <span class="badge" :class="getRankClass(item.rank)">
                        #{{ item.rank.toLocaleString() }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="card border-0 shadow-sm rounded-4 p-5 text-center">
          <div class="text-muted mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <h5 class="fw-semibold mb-2">No Data Yet</h5>
          <p class="text-muted mb-0">
            Enter domains in the form and click "Compare" to see ranking charts
            and trends.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

type ApiSeries = { domain: string; labels: string[]; ranks: number[] };
type ApiResponse = Record<string, ApiSeries>;
type LatestItem = {
  domain: string;
  date: string;
  rank: number;
  change: number | null;
};

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const apiBase = config.public.apiBase;

const pending = ref(false);
const error = ref<string | null>(null);
const data = ref<ApiResponse | null>(null);
const unrankedDomains = ref<string[]>([]);

// Domain colors cache
const domainColors = new Map<string, string>();
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

function getDomainColor(domain: string): string {
  if (!domainColors.has(domain)) {
    const index = domainColors.size % colorPalette.length;
    const color = colorPalette[index] || "#667eea";
    domainColors.set(domain, color);
  }
  return domainColors.get(domain) || "#667eea";
}

function getTrendClass(change: number): string {
  if (change > 0) return "bg-danger bg-opacity-10 text-danger";
  if (change < 0) return "bg-success bg-opacity-10 text-success";
  return "bg-secondary bg-opacity-10 text-secondary";
}

function getRankClass(rank: number): string {
  if (rank <= 100) return "bg-success text-white";
  if (rank <= 1000) return "bg-primary text-white";
  if (rank <= 10000) return "bg-warning text-dark";
  return "bg-secondary text-white";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function readDomainsFromRoute(): string[] {
  const domainsParam = route.query.domains;
  if (!domainsParam) return [];
  const domainsStr = Array.isArray(domainsParam)
    ? domainsParam.join(",")
    : domainsParam;
  return domainsStr
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean);
}

const domainsFromRoute = computed(() => readDomainsFromRoute());

function setUrlDomains(domains: string[]) {
  if (domains.length) {
    const pathParam = domains.map(encodeURIComponent).join(",");
    router.push({ query: { domains: pathParam } });
  } else {
    router.push({ query: {} });
  }
}

async function fetchRankings(domains: string[]) {
  pending.value = true;
  error.value = null;
  data.value = null;
  unrankedDomains.value = domains.map((d) => d.toLowerCase());

  try {
    const pathParam = domains.map(encodeURIComponent).join(",");
    const url = `${apiBase}/rankings/${pathParam}`;
    const res = await $fetch<ApiResponse>(url);
    data.value = res;
    const rankedDomains = Object.keys(res);
    unrankedDomains.value = unrankedDomains.value.filter(
      (d) => !rankedDomains.includes(d)
    );
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || "Failed to fetch rankings";
    // If all domains are unranked, show warning instead of error
    if (msg.includes("None of the provided domains")) {
      error.value = null;
    } else {
      error.value = msg;
      // Try to extract unranked from partial data
      const rankedDomains = Object.keys(data.value || {});
      if (rankedDomains.length > 0) {
        unrankedDomains.value = domains
          .map((d) => d.toLowerCase())
          .filter((d) => !rankedDomains.includes(d));
      }
    }
  } finally {
    pending.value = false;
  }
}

async function onSubmit(domains: string[]) {
  if (!domains.length) {
    error.value = "Please enter at least one domain.";
    return;
  }
  setUrlDomains(domains);
  await fetchRankings(domains);
}

function onClear() {
  setUrlDomains([]);
  data.value = null;
  error.value = null;
  unrankedDomains.value = [];
}

onMounted(async () => {
  const domains = readDomainsFromRoute();
  if (domains.length) await fetchRankings(domains);
});

const latestList = computed<LatestItem[]>(() => {
  if (!data.value) return [];
  return Object.values(data.value)
    .map((s) => {
      const last = s.labels.length - 1;
      if (last < 0) return null;
      const prev = last - 1;
      const latestRank = s.ranks[last];
      const prevRank = prev >= 0 ? s.ranks[prev] : null;
      const latestLabel = s.labels[last];
      if (typeof latestRank !== "number" || typeof latestLabel !== "string")
        return null;
      return {
        domain: s.domain,
        date: latestLabel,
        rank: latestRank,
        change: typeof prevRank === "number" ? latestRank - prevRank : null,
      };
    })
    .filter((x): x is LatestItem => x !== null)
    .sort((a, b) => a.rank - b.rank);
});

const totalDataPoints = computed(() => {
  if (!data.value) return 0;
  return Object.values(data.value).reduce((sum, s) => sum + s.ranks.length, 0);
});

const dateRange = computed(() => {
  if (!data.value) return 0;
  const allDates = new Set<string>();
  Object.values(data.value).forEach((s) =>
    s.labels.forEach((d) => allDates.add(d))
  );
  return allDates.size;
});
</script>
