<template>
  <div class="content">
    <a-card class="card">
      <a-card-grid v-for="item in stockBoard" :key="item.code" class="card-grid">
        <span class="card-title">{{ item.name }}</span>
        <span :class="'index ' + (item.priceChange >= 0 ? 'red' : 'green')">{{ item.price }}</span>
        <div class="increase-box">
          <span
            :class="'increase-number ' + (item.priceChange >= 0 ? 'red' : 'green')"
          >{{ (item.priceChange > 0 ? '+' : '') + item.priceChange }}</span>
          <span
            :class="'increase-percent ' + (item.priceChange >= 0 ? 'red' : 'green')"
          >{{ (item.changePercent > 0 ? '+' : '') + item.changePercent + '%' }}</span>
        </div>
      </a-card-grid>
    </a-card>

    <div class="action-box">
      <a-input-group compact>
        <a-select default-value="stock" class="search-opt" @change="changeSearch">
          <a-select-option value="stock">股票</a-select-option>
          <a-select-option value="fund">基金</a-select-option>
        </a-select>
        <a-input-search
          class="search-bar"
          :placeholder="searchType === 'stock' ? '请输入股票代码' : '请输入基金代码'"
          enter-button="添加"
          maxlength="12"
          @search="onSearch"
        />
      </a-input-group>

      <div class="support-box">
        <div class="support support-github" @click="redirectGitHub">
          <a-icon type="github" />
          <span>查看源码</span>
        </div>
        <div class="support support-author" @click="showQrModal = true">
          <a-icon type="like" theme="filled" />
          <span>支持作者</span>
        </div>
      </div>

      <a-modal v-model="showQrModal" centered width="228" :footer="null">
        <img style="width: 228px;" src="https://img.yejiefeng.com/qr/qr_like.png" />
      </a-modal>
    </div>

    <a-table
      v-if="listData && listData.length > 0"
      class="table"
      :data-source="listData"
      :pagination="false"
      size="small"
    >
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
          <span
            :class="'table-column bold ' + (record.percent >= 0 ? 'red' : 'green')"
          >{{ record.price }}</span>
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
          <span
            :class="'table-column ' + (percent >= 0 ? 'red' : 'green')"
          >{{ (percent >= 0 ? '+' : '') + percent + '%' }}</span>
        </template>
      </a-table-column>
      <a-table-column title="操作" align="center">
        <template slot-scope="record">
          <a-icon type="delete" @click="removeData(record)" />
        </template>
      </a-table-column>
    </a-table>
  </div>
</template>

<script>
import util from '../util/util';

export default {
  data() {
    return {
      searchType: 'stock',
      showQrModal: false,
      doNotUpdate: false,
      stockBoard: [],
      listData: [],
    };
  },
  mounted() {
    chrome.storage.sync.get('listData', res => {
      if (res.listData) {
        this.listData = res.listData;
      }
      this.updateListData();
    });

    this.getStockBoard();

    if (util.isDealingTime()) {
      setInterval(() => {
        this.getStockBoard();

        if (!this.doNotUpdate) {
          this.updateListData();
        }
      }, 3800);
    }
  },
  methods: {
    /**
     * 获取大盘指数
     */
    getStockBoard() {
      const url = '/stock/board';
      this.$axios.get(url).then(res => {
        if (res.data.code === 200) {
          this.stockBoard = res.data.data;
        }
      });
    },
    /**
     * 获取股票数据
     */
    getStockData(code) {
      return new Promise(resolve => {
        const url = '/stock/detail?code=' + code;

        this.$axios.get(url).then(res => {
          let info = {};
          if (res.data.code === 200) {
            const data = res.data.data;
            info.name = data.name;
            info.code = data.code;
            info.price = parseFloat(data.price);
            info.percent = parseFloat(data.changePercent);
            info.type = 'stock';
          }
          resolve(info);
        });
      });
    },
    /**
     * 获取基金数据
     */
    getFundData(code) {
      return new Promise(resolve => {
        const url = '/fund/detail?code=' + code;

        this.$axios.get(url).then(res => {
          let info = {};
          if (res.data.code === 200) {
            const data = res.data.data;
            info.name = data.name;
            info.code = data.code;
            info.price = util.isDealingTime() ? data.expectWorth : data.netWorth;
            info.percent = util.isDealingTime() ? parseFloat(data.expectGrowth) : parseFloat(data.dayGrowth);
            info.type = 'fund';
          }
          resolve(info);
        });
      });
    },
    /**
     * 更改搜索类型
     */
    changeSearch(event) {
      this.searchType = event;
    },
    /**
     * 搜索股票或基金
     */
    onSearch(code) {
      let listData = this.listData;
      this.doNotUpdate = true;

      if (this.searchType === 'stock') {
        this.getStockData(code).then(res => {
          if ('code' in res) {
            if (this.getDataIndexByCode(res.code) != -1) {
              this.$message.warning('不可重复添加股票');
              this.doNotUpdate = false;
            } else {
              listData.push(res);

              chrome.storage.sync.set({ listData: listData }, () => {
                this.doNotUpdate = false;
                this.$message.success('股票添加成功');
              });
            }
          } else {
            this.$message.warning('未找到该股票');
            this.doNotUpdate = false;
          }
        });
      }
      if (this.searchType === 'fund') {
        this.getFundData(code).then(res => {
          if ('code' in res) {
            if (this.getDataIndexByCode(res.code) != -1) {
              this.$message.warning('不可重复添加基金');
              this.doNotUpdate = false;
            } else {
              listData.push(res);

              chrome.storage.sync.set({ listData: listData }, () => {
                this.doNotUpdate = false;
                this.$message.success('基金添加成功');
              });
            }
          } else {
            this.$message.warning('未找到该基金');
            this.doNotUpdate = false;
          }
        });
      }
    },
    /**
     * 通过code查询数据下标
     */
    getDataIndexByCode(code) {
      for (const index in this.listData) {
        if (code == this.listData[index].code) {
          return index;
        }
      }
      return -1;
    },
    /**
     * 更新列表数据
     */
    updateListData() {
      let promises = [];

      for (const index in this.listData) {
        const item = this.listData[index];
        if (item.type === 'stock') {
          promises.push(this.getStockData(item.code));
        }
        if (item.type === 'fund') {
          promises.push(this.getFundData(item.code));
        }
      }

      Promise.all(promises).then(res => {
        if (res.length > 0 && !this.doNotUpdate) {
          this.listData = res;

          chrome.storage.sync.set({ listData: res });
        }
      });
    },
    /**
     * 删除数据
     */
    removeData(event) {
      const that = this;
      this.doNotUpdate = true;

      this.$confirm({
        title: '删除提示',
        content: '您确定要删除该' + (event.type == 'stock' ? '股票' : '基金'),
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        width: 300,
        onOk() {
          const index = that.getDataIndexByCode(event.code);
          let listData = that.listData;
          listData.splice(index, 1);
          that.listData = listData;

          chrome.storage.sync.set({ listData: listData }, () => {
            that.$message.success((event.type == 'stock' ? '股票' : '基金') + '删除成功');
            that.doNotUpdate = false;
          });
        },
        onCancel() {
          that.doNotUpdate = false;
        },
      });
    },
    /**
     * 跳转到GitHub
     */
    redirectGitHub() {
      window.open('https://github.com/YYJeffrey/chocolate');
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
    .table-column {
      color: #141414;
      font-size: 12px;
    }
  }

  .action-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 38px 0;

    .search-opt {
      width: 68px;
    }

    .search-bar {
      width: 208px;
    }

    .support-box {
      display: flex;
      flex-direction: row;

      .support {
        font-size: 12px;
        margin-top: 15px;
        line-height: 15px;
        cursor: pointer;
        color: #bfbfbf;
      }

      .support-author {
        margin-left: 15px;
      }
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
