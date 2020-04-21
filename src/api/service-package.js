import request from '@/utils/request'
import { baseUrl } from './index'

export function getRoutesTree() {
  return request({
    url: `${baseUrl}/api/system/menu//grant-tree`,
    method: 'get'
  })
}

export function getServicePackage(params) {
  return request({
    url: `${baseUrl}/api/serviceProject/selectRolePage`,
    method: 'get',
    params: params
  })
}

export function getItemJurisdiction(id) {
  return request({
    url: `${baseUrl}/api/system/menu/role-tree-keys`,
    method: 'get',
    params: {
      roleIds: id
    }
  })
}

export function saveServicePackage(params) {
  return request({
    url: `${baseUrl}/api/serviceProject/submit`,
    method: 'post',
    params: {
      ...params
    }
  })
}

export function setItemJurisdiction(params) {
  return request({
    url: `${baseUrl}/api/system/role/grant`,
    method: 'post',
    params: params
  })
}

export function deleteServicePackage(ids) {
  return request({
    url: `${baseUrl}/api/system/role/remove`,
    method: 'post',
    params: {
      ids
    }
  })
}
