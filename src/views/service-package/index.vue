<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- <el-input v-model="listQuery.roleName" placeholder="套餐名称" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button> -->
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="#" align="center" width="80">
        <template slot-scope="{$index}">
          <span>{{ $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="套餐名称" prop="roleName" align="center" />
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
          <el-button size="mini" type="danger" @click="handleGetJurisdiction(row)">
            权限设置
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 500px; margin-left:50px;">
        <el-form-item label="套餐名称" prop="roleName">
          <el-input v-model="temp.roleName" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确 认
        </el-button>
      </div>
    </el-dialog>
    <el-dialog title="权限设置" :visible.sync="jurisdictionVisible">
      <el-form label-position="left" label-width="80px" style="width: 500px; margin-left:50px;">
        <el-form-item label="权限设置">
          <div style="height: 330px;overflow: auto;">
            <el-tree
              ref="tree"
              :data="routerTree"
              :props="defaultProps"
              show-checkbox
              node-key="id"
              :default-checked-keys="checkedKeys"
            />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="jurisdictionVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="setJurisdiction">
          确 认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRoutesTree, getServicePackage, getItemJurisdiction, saveServicePackage, setItemJurisdiction, deleteServicePackage } from '@/api/service-package'
import waves from '@/directive/waves' // waves directive
import { parseTime, arrToStr } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ServicePackage',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        current: 1,
        size: 10
      },
      temp: {
        roleName: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '新增'
      },
      dialogPvVisible: false,
      rules: {
        roleName: [{ required: true, message: 'roleName is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      routerTree: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      checkedKeys: [],
      jurisdictionVisible: false,
      nowId: ''
    }
  },
  created() {
    this.getList()
    getRoutesTree().then(res => {
      this.routerTree = res.data
    })
  },
  methods: {
    getList() {
      this.listLoading = true
      getServicePackage(this.listQuery).then(res => {
        console.log(res)
        this.list = res.data.records
        this.total = res.data.total
        // Just to simulate the time of the request
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    resetTemp() {
      this.temp = {
        roleName: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          saveServicePackage(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          saveServicePackage(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteServicePackage(row.id).then(res => {
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    handleGetJurisdiction(row) {
      getItemJurisdiction(row.id).then(res => {
        this.jurisdictionVisible = true
        this.nowId = row.id
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(res.data)
        })
      })
    },
    setJurisdiction() {
      const str = arrToStr(this.$refs.tree.getCheckedKeys())
      const obj = {
        roleIds: this.nowId,
        menuIds: str
      }
      setItemJurisdiction(obj).then(res => {
        this.jurisdictionVisible = false
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>

<style scoped>
.el-button--mini {
  width: auto;
}
</style>
