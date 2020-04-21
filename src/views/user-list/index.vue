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
      ref="table"
      v-loading="listLoading"
      :data="list"
      fit
      highlight-current-row
    >
      <el-table-column label="#" align="center" width="80">
        <template slot-scope="{$index}">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="登录账号" prop="account" align="center" />
      <el-table-column label="企业名称" prop="enterpriseName" align="center" />
      <el-table-column label="联系电话" prop="companyPhone" align="center" />
      <el-table-column label="企业邮箱" prop="companyMailbox" align="center" />
      <el-table-column label="网关数量" prop="gatewayNum" align="center" />
      <el-table-column label="账号时长" align="center">
        <template slot-scope="{row}">
          <span>{{ timeDifference(row.expirationTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号套餐" align="center">
        <template slot-scope="{row}">
          <span>{{ tableShowSelect(row.serverProject, packageArr, 'id', 'roleName') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleUpdateStatus(row,$index)">{{ row.status === 1 ? '停用' : '启用' }}</el-button>
          <el-button size="mini" type="warning" @click="handleUpdateDuration(row,$index)">
            续费
          </el-button>
          <el-button size="mini" type="warning" @click="handleUpdateAgreement(row,$index)">
            关联协议
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" top="5vh">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: calc(100% - 100px); margin-left:50px;">
        <el-form-item v-if="showFormItem('create')" label="用户名" prop="account">
          <el-input v-model="temp.account" />
        </el-form-item>
        <el-form-item v-if="showFormItem('create')" label="密码" prop="password">
          <el-input v-model="temp.password" type="password" auto-complete="new-password" />
        </el-form-item>
        <el-form-item v-if="showFormItem('create', 'update')" label="企业名称" prop="enterpriseName">
          <el-input v-model="temp.enterpriseName" />
        </el-form-item>
        <el-form-item v-if="showFormItem('create', 'update')" label="企业地址" prop="companyAddress">
          <el-input v-model="temp.companyAddress" />
        </el-form-item>
        <el-form-item v-if="showFormItem('create', 'update')" label="联系电话" prop="companyPhone">
          <el-input v-model="temp.companyPhone" />
        </el-form-item>
        <el-form-item v-if="showFormItem('create', 'update')" label="企业邮箱" prop="companyMailbox">
          <el-input v-model="temp.companyMailbox" />
        </el-form-item>
        <el-form-item v-if="showFormItem('create', 'update')" label="服务套餐" prop="serverProject">
          <el-select v-model="temp.serverProject" style="width: 100%">
            <el-option
              v-for="(item) in packageArr"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="showFormItem('create', 'renew')" label="账号时长" prop="dayNum">
          <el-input v-model.number="temp.dayNum">
            <template slot="append">天</template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="showFormItem('create', 'update')" label="网关数量" prop="gatewayNum">
          <el-input v-model="temp.gatewayNum" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():(dialogStatus==='update' ? updateData() : renewData())">
          确 认
        </el-button>
      </div>
    </el-dialog>
    <el-dialog title="关联协议" :visible.sync="agreementVisible" top="5vh" :destroy-on-close="true">
      <div style="height: 330px;overflow: auto;">
        <el-tree
          ref="tree"
          :props="agreemProps"
          :data="argeementTree"
          node-key="id"
          show-checkbox
          :default-checked-keys="checkedKeys"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="agreementVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="updateAgreement">
          确 认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { validEmail, validPhone } from '@/utils/validate'
import { getServicePackage } from '@/api/service-package'
import { getUserList, saveUser, updateUser, renew, getAllAgreement, setUserAgreement, getItemAgreement, updateItemStatus } from '@/api/user-list'
import waves from '@/directive/waves' // waves directive
import { parseTime, arrToStr, timeDifference, tableShowSelect } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
const myValidPhone = (rule, value, callback) => {
  if (validPhone(value)) {
    callback()
  } else {
    callback(new Error('填写正确的格式'))
  }
}
const myValidEmail = (rule, value, callback) => {
  if (value === null || value.trim().length === 0 || validEmail(value)) {
    callback()
  } else {
    callback(new Error('填写正确的格式'))
  }
}

const myValidNumber = (rule, value, callback) => {
  if (!isNaN(Number(value))) {
    callback()
  } else {
    callback(new Error('填写正确的数字格式'))
  }
}
export default {
  name: 'UserList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      timeDifference,
      tableShowSelect,
      agreementVisible: false,
      total: 0,
      listLoading: true,
      listQuery: {
        current: 1,
        size: 10
      },
      temp: {},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '新增',
        renew: '续费'
      },
      dialogPvVisible: false,
      rules: {
        password: [
          { required: true, message: '密码为必填项', trigger: 'blur' },
          { min: 6, message: '至少6位以上', trigger: 'blur' },
          { max: 16, message: '最长16位', trigger: 'blur' }
        ],
        account: [
          { required: true, message: '用户名称为必填项', trigger: 'blur' },
          { min: 6, message: '至少6位以上', trigger: 'blur' },
          { max: 16, message: '最长16位', trigger: 'blur' }
        ],
        enterpriseName: [{ required: true, message: '公司名称为必填项', trigger: 'blur' }],
        companyAddress: [{ required: true, message: '公司地址为必填项', trigger: 'blur' }],
        companyPhone: [
          { required: true, message: '联系电话为必填项', trigger: 'blur' },
          { validator: myValidPhone, trigger: 'blur' }
        ],
        gatewayNum: [
          { required: true, message: '网关数量为必填项', trigger: 'blur' },
          { validator: myValidNumber, trigger: 'blur' }
        ],
        companyMailbox: [
          { validator: myValidEmail, trigger: 'blur' }
        ],
        serverProject: [{ required: true, message: '服务套餐为必填项', trigger: 'blur' }],
        dayNum: [{ required: true, message: '账号时长为必填项', trigger: 'change' }]
      },
      downloadLoading: false,
      routerTree: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      checkedKeys: [],
      jurisdictionVisible: false,
      nowId: '',
      packageArr: [],
      argeementTree: [],
      agreemProps: {
        label: 'protocolName'
      },
      activeId: null
    }
  },
  created() {
    this.getList()
    getServicePackage({ current: 1, size: 9999 }).then(res => {
      res.data.records.forEach(ele => {
        ele.id = '' + ele.id
      })
      this.packageArr = res.data.records
    })
    getAllAgreement({ current: 1, size: 99999 }).then(res => {
      res.data.records.forEach(ele => {
        ele.id = '' + ele.id
      })
      this.argeementTree = res.data.records
    })
  },
  methods: {
    getList() {
      this.listLoading = true
      getUserList(this.listQuery).then(res => {
        console.log(res)
        this.list = res.data.records
        this.total = res.data.total
        // Just to simulate the time of the request
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.temp = {}
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const obj = Object.assign({}, this.temp)
          const time = new Date()
          obj.expirationTime = parseTime(time.getTime() + 3600 * 1000 * 24 * obj.dayNum)
          obj.gatewayNum = String(obj.gatewayNum)
          obj.serverProject = String(obj.serverProject)
          obj.deptId = '1'
          delete obj.dayNum
          saveUser(obj).then(() => {
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
      console.log(row)
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].resetFields()
      // })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateUser(tempData).then(() => {
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
    showFormItem() {
      const arr = [...arguments]
      return arr.includes(this.dialogStatus)
    },
    handleUpdateDuration(row, index) {
      this.dialogStatus = 'renew'
      this.dialogFormVisible = true
      this.temp = {
        dayNum: '',
        expirationTime: row.expirationTime,
        id: row.id
      }
    },
    renewData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const time = new Date(this.temp.expirationTime).getTime() + 3600 * 1000 * 24 * this.temp.dayNum
          const obj = {
            enterpriseId: this.temp.id,
            stopTime: parseTime(new Date(time))
          }
          renew(obj).then(res => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '续费成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdateAgreement(row, index) {
      this.agreementVisible = true
      this.activeId = row.id
      getItemAgreement(this.activeId).then(res => {
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(res.data.split(','))
        })
      })
    },
    updateAgreement() {
      const obj = {
        enterpriseId: this.activeId,
        protocolId: arrToStr(this.$refs.tree.getCheckedKeys())
      }
      setUserAgreement(obj).then(res => {
        this.agreementVisible = false
        this.$notify({
          title: 'Success',
          message: '修改成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleUpdateStatus(row, index) {
      const status = row.status === 1 ? 2 : 1
      const obj = {
        id: row.id,
        status: status
      }
      updateItemStatus(obj).then(res => {
        this.$notify({
          title: 'Success',
          message: '修改成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      }).catch(() => {
        this.$notify({
          title: 'Error',
          message: '修改失败',
          type: 'error',
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

