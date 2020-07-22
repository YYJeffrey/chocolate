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

    <div class="action-box">
      <a-input-group compact>
        <a-select default-value="股票" class="search-opt" @change="changeSearch">
          <a-select-option value="stock">股票</a-select-option>
          <a-select-option value="fund">基金</a-select-option>
        </a-select>
        <a-input-search class="search-bar" :placeholder="searchType === 'stock' ? '请输入股票代码' : '请输入基金代码'" enter-button="添加" maxlength="12" @search="onSearch" />
      </a-input-group>
    </div>

    <a-table class="table" :data-source="listData" :pagination="false" size="small">
      <a-table-column title="名称" data-index="name" align="center">
        <template slot-scope="text, record">
          <span class="table-column bold">{{ record.name }}</span>
          <a-tag v-if="record.type === 'stock'" color="red">股</a-tag>
          <a-tag v-else color="orange">基</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="代码" data-index="code" align="center">
        <template slot-scope="code">
          <span class="table-column">{{ code }}</span>
        </template>
      </a-table-column>
      <a-table-column
        title="价格"
        data-index="price"
        align="center"
        :sorter="
          (a, b) => {
            return a.price - b.price;
          }
        "
      >
        <template slot-scope="text, record">
          <span :class="'table-column bold ' + (record.percent > 0 ? 'red' : 'green')">{{ record.price }}</span>
        </template>
      </a-table-column>
      <a-table-column
        title="涨幅"
        data-index="percent"
        align="center"
        :sorter="
          (a, b) => {
            return a.percent - b.percent;
          }
        "
      >
        <template slot-scope="percent">
          <span :class="'table-column ' + (percent > 0 ? 'red' : 'green')">{{ (percent > 0 ? '+' : '') + percent + '%' }}</span>
        </template>
      </a-table-column>
      <a-table-column title="操作" align="center">
        <template slot-scope="code">
          <a-icon type="delete" @click="remove(code)" />
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
          price: 3330.57,
          percent: 0.5,
          type: 'stock',
        },
        {
          name: '天弘沪深300ETF联接A',
          code: '000961',
          price: 1.4608,
          percent: 2.8517,
          type: 'fund',
        },
      ],
      searchType: 'stock',
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
      const url = config.baseAPI + '/stock/board';
      this.$axios.get(url).then(res => {
        if (res.data.code === 200) {
          this.stockBoard = res.data.data;
        }
      });
    },

    changeSearch(e) {
      this.searchType = e;
    },

    onSearch(code) {
      if (this.searchType === 'stock') {
        const stockUrl = config.baseAPI + '/stock/detail?code=' + code;
        this.$axios.get(stockUrl).then(res => {
          if (res.data.code === 200) {
            const data = res.data.data;
            const info = {};
            info.name = data.name;
            info.code = data.code;
            info.price = parseFloat(data.price);
            info.percent = parseFloat(data.changePercent);
            info.type = 'stock';
            this.listData.push(info);
          }
        });
      }

      if (this.searchType === 'fund') {
        const fundUrl = config.baseAPI + '/fund/detail?code=' + code;
        this.$axios.get(fundUrl).then(res => {
          if (res.data.code === 200) {
            const data = res.data.data;
            const info = {};
            info.name = data.name;
            info.code = data.code;
            info.price = data.expectWorth;
            info.percent = parseFloat(data.dayGrowth);
            info.type = 'fund';
            this.listData.push(info);
          }
        });
      }
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

    .table-column {
      color: #141414;
      font-size: 12px;
    }
  }

  .action-box {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding-top: 38px;

    .search-opt {
      width: 68px;
    }

    .search-bar {
      width: 280px;
    }
  }
}

.red {
  color: #cf1322 !important;
}

.green {
  color: #389e0d !important;
}

.bold {
  font-weight: bold;
}

/deep/ .ant-table-content > .ant-table-body {
  margin: 0 !important;
}

/deep/ .ant-table-thead > tr > th {
  font-size: 12px;
  color: #141414;
  font-weight: bold;
  line-height: 23px;
}

/deep/ .ant-table-thead > tr > th .ant-table-column-sorter .ant-table-column-sorter-inner {
  height: 1.5em;
  margin-left: 0.57142857em;
  color: #bfbfbf;
  line-height: 1em;
  text-align: center;
  transition: all 0.3s;
}

/deep/ .ant-table-small {
  border: 1px solid #e8e8e8;
  border-radius: 0;
}
</style>
