<template>
  <div class="content">
    <a-card class="card">
      <a-card-grid v-for="item in stockBoard" :key="item.code" class="card-grid">
        <span class="card-title">{{ item.name }}</span>
        <span :class="'index ' + (item.price - item.close >= 0 ? 'red' : 'green')">{{ item.price }}</span>
        <div class="increase-box">
          <span :class="'increase-number ' + (item.price - item.close >= 0 ? 'red' : 'green')">{{
            ((item.price - item.close >= 0 ? '+' : '-') + item.price - item.close) | formatAmount
          }}</span>
          <span :class="'increase-percent ' + (item.price - item.close >= 0 ? 'red' : 'green')">{{ (item.changePercent >= 0 ? '+' : '-') + item.changePercent + '%' }}</span>
        </div>
      </a-card-grid>
    </a-card>
  </div>
</template>

<script>
import config from '../config';

export default {
  data() {
    return {
      stockBoard: [],
    };
  },
  mounted() {
    this.getStockBoard();
    setInterval(this.getStockBoard, 3000);
  },
  filters: {
    formatAmount(value) {
      let tempVal = parseFloat(value).toFixed(3);
      let realVal = tempVal.substring(0, tempVal.length - 1);
      return realVal;
    },
  },
  methods: {
    /**
     * 获取大盘指数
     */
    getStockBoard() {
      let url = config.baseAPI + '/stock/board';
      this.$axios.get(url).then(res => {
        if (res.data.code === 200) {
          this.stockBoard = res.data.data;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  width: auto;

  .card {
    width: 541px;

    .card-grid {
      font-size: 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 180px;
      height: 80px;
      box-sizing: border-box;
      text-align: center;
      cursor: pointer;

      .card-title {
        color: #141414;
      }

      .index {
        font-weight: bold;
      }

      .increase-box {
        .increase-percent {
          margin-left: 8px;
        }
      }
    }
  }

  .red {
    color: #cf1322;
  }

  .green {
    color: #389e0d;
  }
}
</style>
