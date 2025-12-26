<template>
  <div class="calculator-card">
    <h3>💰 CAC 回收期计算器</h3>
    <div class="input-group">
      <label>
        获客成本 (CAC)
        <input type="number" v-model.number="cac" placeholder="e.g. 5000" />
      </label>
      <label>
        月度经常性收入 (MRR)
        <input type="number" v-model.number="mrr" placeholder="e.g. 500" />
      </label>
      <label>
        毛利率 (%)
        <input type="number" v-model.number="margin" placeholder="e.g. 80" />
      </label>
    </div>
    
    <div class="result-box" :class="statusClass">
      <div class="result-value">{{ paybackPeriod }} 个月</div>
      <div class="result-label">CAC 回收期</div>
      <div class="result-status">{{ statusText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const cac = ref(5000)
const mrr = ref(500)
const margin = ref(80)

const paybackPeriod = computed(() => {
  if (mrr.value <= 0 || margin.value <= 0) return 0
  const grossMargin = margin.value / 100
  const months = cac.value / (mrr.value * grossMargin)
  return months.toFixed(1)
})

const statusClass = computed(() => {
  const p = parseFloat(paybackPeriod.value)
  if (p <= 12) return 'status-good'
  if (p <= 18) return 'status-ok'
  return 'status-bad'
})

const statusText = computed(() => {
  const p = parseFloat(paybackPeriod.value)
  if (p <= 12) return '🚀 优秀 (< 12个月)'
  if (p <= 18) return '✅ 良好 (12-18个月)'
  return '⚠️ 需改进 (> 18个月)'
})
</script>

<style scoped>
.calculator-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
  background-color: var(--vp-c-bg-soft);
  margin: 20px 0;
  max-width: 400px;
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.1em;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}

input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 4px 8px;
  width: 100px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.result-box {
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  background: var(--vp-c-bg);
}

.result-value {
  font-size: 2em;
  font-weight: bold;
  line-height: 1.2;
}

.result-label {
  font-size: 0.8em;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.result-status {
  font-weight: 500;
  font-size: 0.9em;
}

.status-good { color: var(--vp-c-green-1); border: 1px solid var(--vp-c-green-soft); }
.status-ok { color: var(--vp-c-yellow-1); border: 1px solid var(--vp-c-yellow-soft); }
.status-bad { color: var(--vp-c-red-1); border: 1px solid var(--vp-c-red-soft); }
</style>
