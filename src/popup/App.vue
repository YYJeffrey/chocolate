<template>
  <div class="content">
    <a-card class="card">
      <a-card-grid v-for="item in stockBoard" :key="item.code" class="card-grid">
        <span class="card-title">{{ item.name }}</span>
        <span :class="'index ' + (item.priceChange >= 0 ? 'red' : 'green')">{{ item.price }}</span>
        <div class="increase-box">
          <span :class="'increase-number ' + (item.priceChange >= 0 ? 'red' : 'green')">{{ (item.priceChange > 0 ? '+' : '') + item.priceChange }}</span>
          <span :class="'increase-percent ' + (item.priceChange >= 0 ? 'red' : 'green')">{{ (item.changePercent > 0 ? '+' : '') + item.changePercent + '%' }}</span>
        </div>
      </a-card-grid>
    </a-card>

    <a-table class="table" :data-source="listData" :pagination="false" size="small">
      <a-table-column title="名称" data-index="name" align="center">
        <template slot-scope="name">
          <span class="column">{{ name }}</span>
        </template>
      </a-table-column>
      <a-table-column title="代码" data-index="code" align="center">
        <template slot-scope="code">
          <span class="column">{{ code }}</span>
        </template>
      </a-table-column>
      <a-table-column title="价格" data-index="price" align="center">
        <template slot-scope="price">
          <span class="column">{{ price }}</span>
        </template>
      </a-table-column>
      <a-table-column title="涨幅" data-index="percent" align="center">
        <template slot-scope="percent">
          <span class="column">{{ percent }}</span>
        </template>
      </a-table-column>
      <a-table-column title="时间" data-index="date" align="center">
        <template slot-scope="date">
          <span class="column">{{ date }}</span>
        </template>
      </a-table-column>
    </a-table>
  </div>
</template>

<script>
import config from '../config';
import util from '../util/util';

export default {
  data() {
    return {
      stockBoard: [],
      listData: [
        {
          name: '上证指数',
          code: 'sh000001',
          price: '3330.57',
          percent: '0.50',
          date: '07-20 09:35',
          type: 'stock',
        },
        {
          name: '天弘沪深300ETF联接A',
          code: '000961',
          price: 1.4608,
          percent: '2.8517',
          date: '07-20 09:35',
          type: 'fund',
        },
      ],
    };
  },
  mounted() {
    this.getStockBoard();

    if (util.isDealingTime()) {
      setInterval(this.getStockBoard, 3000);
    }
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
        font-weight: bold;
      }

      .index {
        font-weight: bold;
        margin-top: 2px;
      }

      .increase-box {
        .increase-percent {
          margin-left: 8px;
        }
      }
    }
  }

  .table {
    margin-top: 38px;

    .column {
      font-size: 12px;
    }
  }

  .ant-table-body {
    margin: 0 !important;
  }

  .red {
    color: #cf1322;
  }

  .green {
    color: #389e0d;
  }
}
</style>
