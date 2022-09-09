<template>
  <div class="content">
    <a-card class="card">
      <a-card-grid v-for="item in stockBoard" :key="item.f12" class="card-grid">
        <span class="card-title">{{ item.f14 }}</span>
        <span :class="'index ' + (item.f4 >= 0 ? 'red' : 'green')">{{ item.f2 | changeTwoDecimal }}</span>
        <div class="increase-box">
          <span :class="'increase-number ' + (item.f4 >= 0 ? 'red' : 'green')">{{ item.f4 | changeTwoDecimalAndAddSymbol }}</span>
          <span :class="'increase-percent ' + (item.f4 >= 0 ? 'red' : 'green')">{{ item.f3 | changeTwoDecimalAndAddSymbol }}%</span>
        </div>
      </a-card-grid>
    </a-card>

    <div class="action-box">
      <a-input-group compact>
        <a-select default-value="stock" class="search-opt" @change="changeSearch">
          <a-select-option value="stock">股票</a-select-option>
          <a-select-option value="fund">基金</a-select-option>
        </a-select>
        <a-select
          class="search-bar"
          :dropdownMenuStyle="{ maxHeight: '150px' }"
          v-model="searchVal"
          showSearch
          allowClear
          autoClearSearchValue
          :placeholder="searchType === 'stock' ? '请输入股票代码/名称' : '请输入基金代码/名称'"
          :default-active-first-option="false"
          :filter-option="false"
          :not-found-content="null"
          :options="searchList"
          @search="selectSearch"
          @change="selectChage"
        >
        </a-select>
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

    <a-table v-if="listData && listData.length > 0" class="table" :data-source="listData" :pagination="false" size="small" rowClassName="table-row">
      <a-table-column title="名称" data-index="name" :align="'center'">
        <template slot-scope="text, record">
          <span class="table-column bold">{{ record.name }}</span>
          <a-tag v-if="record.type === 'stock'" color="red">股</a-tag>
          <a-tag v-else color="orange">基</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="代码" data-index="code" :align="'center'">
        <template slot-scope="code">
          <span class="table-column">{{ code }}</span>
        </template>
      </a-table-column>
      <a-table-column
        title="价格"
        data-index="price"
        :align="'center'"
        :sorter="
          (a, b) => {
            return a.price - b.price;
          }
        "
      >
        <template slot-scope="text, record">
          <span :class="'table-column bold ' + (record.percent >= 0 ? 'red' : 'green')">{{ record.price | changeTwoDecimal }}</span>
        </template>
      </a-table-column>
      <a-table-column
        title="涨幅"
        data-index="percent"
        :align="'center'"
        :sorter="
          (a, b) => {
            return a.percent - b.percent;
          }
        "
      >
        <template slot-scope="percent">
          <span :class="'table-column ' + (percent >= 0 ? 'red' : 'green')">{{ percent | changeTwoDecimalAndAddSymbol }}%</span>
        </template>
      </a-table-column>
      <a-table-column title="操作" :align="'center'">
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
      searchKey: null,
      showQrModal: false,
      stockBoard: [],
      listData: [],
      searchList: [],
    };
  },
  mounted() {
    chrome.storage.sync.get('listData', res => {
      if (res.listData) {
        this.listData = res.listData;
      }
      this.updateListData(true);
    });

    this.getStockBoard();

    if (util.isDealingTime()) {
      setInterval(() => {
        this.getStockBoard();
        this.updateListData();
      }, 3800);
    }
  },
  filters: {
    /**
     * 补全小数
     */
    changeTwoDecimal(val) {
      return util.changeDecimalAddZero(val, 2);
    },
    /**
     * 补全小数并添加符号
     */
    changeTwoDecimalAndAddSymbol(val) {
      return (val >= 0 ? '+' : '') + util.changeDecimalAddZero(val, 2);
    },
  },
  methods: {
    /**
     * 获取大盘数据
     */
    getStockBoard() {
      const url = 'https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f14&secids=1.000001,1.000300,1.000905,0.399001,0.399005,0.399006';
      this.$axios.get(url).then(res => {
        if (res.status === 200 && res.data.data) {
          this.stockBoard = res.data.data.diff;
        }
      });
    },
    /**
     * 获取股票数据
     */
    getStockData(code) {
      return new Promise(resolve => {
        const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f14&secids=1.${code},0.${code}`;
        const stocks = [];

        this.$axios
          .get(url)
          .then(res => {
            if (res.status === 200 && res.data.data) {
              const data = res.data.data.diff;
              for (const i in data) {
                const stock = {};
                stock.name = data[i].f14;
                stock.code = data[i].f12;
                stock.price = data[i].f2;
                stock.percent = data[i].f3;
                stock.type = 'stock';
                stocks.push(stock);
              }
            }
            if (stocks.length === 2) {
              resolve(stocks[1]);
            } else {
              resolve(stocks[0]);
            }
          })
          .catch(() => {
            resolve(null);
          });
      });
    },
    /**
     * 获取基金数据
     */
    getFundData(code) {
      return new Promise(resolve => {
        const url = `https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=20&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=1&Fcodes=${code}`;
        const fund = {};

        this.$axios
          .get(url)
          .then(res => {
            if (res.status === 200) {
              const data = res.data.Datas;
              const info = data[0];
              fund.name = info.SHORTNAME;
              fund.code = info.FCODE;
              fund.price =
                util.isDealingTime() || (util.isDealingDay() && !util.isToday(info.GZTIME))
                  ? parseFloat(isNaN(info.GSZ) ? null : info.GSZ)
                  : parseFloat(isNaN(info.NAV) ? null : info.NAV);
              fund.percent = parseFloat(info.GSZZL);
              fund.type = 'fund';
            }
            resolve(fund);
          })
          .catch(() => {
            resolve(null);
          });
      });
    },
    /**
     * 模糊查询股票
     */
    searchStockData(key) {
      return new Promise(resolve => {
        if (key === null || key === '') {
          resolve([]);
        }
        const url = `https://api.doctorxiong.club/v1/stock/all?keyWord=${key}`;
        const stocks = [];

        this.$axios
          .get(url)
          .then(res => {
            if (res.status === 200) {
              let data = res.data.data;
              data = data.splice(0, 10);
              for (const i in data) {
                const stock = {};
                const label = data[i][1];
                const value = data[i][0].replace(/[^0-9]/gi, '');
                stock.label = label + '（' + value + '）';
                stock.value = value;
                stocks.push(stock);
              }
            }
            resolve(stocks);
          })
          .catch(() => {
            resolve(null);
          });
      });
    },
    /**
     * 模糊查询基金
     */
    searchFundData(key) {
      return new Promise(resolve => {
        if (key === null || key === '') {
          resolve([]);
        }
        const url = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?&m=9&key=${key}`;
        const funds = [];

        this.$axios
          .get(url)
          .then(res => {
            if (res.status === 200) {
              const data = res.data.Datas;
              for (const i in data) {
                const fund = {};
                const label = data[i].NAME;
                const value = data[i].CODE;
                fund.label = label + '（' + value + '）';
                fund.value = value;
                funds.push(fund);
              }
            }
            resolve(funds);
          })
          .catch(() => {
            resolve(null);
          });
      });
    },
    /**
     * 更改搜索类型
     */
    changeSearch(event) {
      this.searchType = event;
      this.searchVal = undefined;
      this.searchList = [];
    },
    /**
     * 下拉查找
     */
    selectSearch(event) {
      if (this.searchType === 'stock') {
        util.debounce(() => {
          this.searchStockData(event).then(res => {
            this.searchList = res;
          });
        });
      } else {
        util.debounce(() => {
          this.searchFundData(event).then(res => {
            this.searchList = res;
          });
        });
      }
    },
    /**
     * 下拉选择
     */
    selectChage(event) {
      this.onSearch(event);
      this.searchVal = undefined;
      this.searchList = [];
    },
    /**
     * 搜索股票或基金
     */
    onSearch(code) {
      if (code === null || code.replace(/(\s*$)/g, '') === '') {
        return;
      }
      const listData = this.listData;

      if (this.searchType === 'stock') {
        this.getStockData(code).then(res => {
          if (res && 'code' in res) {
            if (this.getDataIndex(res.code, res.type, res.name) !== -1) {
              this.$message.warning('不可重复添加股票');
            } else {
              listData.push(res);
              chrome.storage.sync.set({ listData: listData }, () => {
                this.$message.success('股票添加成功');
              });
              this.searchKey = null;
            }
          } else {
            this.$message.warning('未找到该股票');
          }
        });
      }

      if (this.searchType === 'fund') {
        this.getFundData(code).then(res => {
          if (res && 'code' in res) {
            if (this.getDataIndex(res.code, res.type, res.name) !== -1) {
              this.$message.warning('不可重复添加基金');
            } else {
              listData.push(res);
              chrome.storage.sync.set({ listData: listData }, () => {
                this.$message.success('基金添加成功');
              });
              this.searchKey = null;
            }
          } else {
            this.$message.warning('未找到该基金');
          }
        });
      }
    },
    /**
     * 通过code、type、name查询数据下标
     */
    getDataIndex(code, type, name) {
      for (const index in this.listData) {
        if (code === this.listData[index].code && type === this.listData[index].type && name === this.listData[index].name) {
          return index;
        }
      }
      return -1;
    },
    /**
     * 更新列表数据
     */
    updateListData(updateStorage = false) {
      const promises = [];

      for (const index in this.listData) {
        const item = this.listData[index];
        if (item.type === 'stock') {
          promises.push(this.getStockData(item.code));
        } else if (item.type === 'fund') {
          promises.push(this.getFundData(item.code));
        }
      }

      Promise.all(promises).then(res => {
        if (res.length > 0 && res.length === this.listData.length && 'code' in res[0]) {
          this.listData = res;

          if (updateStorage) {
            chrome.storage.sync.set({ listData: res });
          }
        }
      });
    },
    /**
     * 删除数据
     */
    removeData(event) {
      const that = this;

      this.$confirm({
        title: '删除提示',
        content: `您确定要删除该${event.type === 'stock' ? '股票' : '基金'}`,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        width: 300,
        onOk() {
          const index = that.getDataIndex(event.code, event.type, event.name);
          const listData = that.listData;
          listData.splice(index, 1);
          that.listData = listData;

          chrome.storage.sync.set({ listData: listData }, () => {
            that.$message.success(`${event.type === 'stock' ? '股票' : '基金'}删除成功`);
          });
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

    /deep/ .table-row td {
      cursor: pointer;
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
      width: 250px !important;
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
