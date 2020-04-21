import request from '@/utils/request'
import { baseUrl } from './index'
export function login(data) {
  return request({
    url: `${baseUrl}/api/enterpriseUser/token`,
    method: 'post',
    params: data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-element-admin/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}
