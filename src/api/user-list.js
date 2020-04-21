import request from '@/utils/request'
import { baseUrl } from './index'

export function getUserList(params) {
  return request({
    url: `${baseUrl}/api/enterpriseinfo/page`,
    method: 'get',
    params: params
  })
}

export function saveUser(params) {
  return request({
    url: `${baseUrl}/api/enterpriseinfo/save`,
    method: 'post',
    params: {
      ...params
    }
  })
}

export function updateUser(params) {
  return request({
    url: `${baseUrl}/api/enterpriseinfo/update`,
    method: 'post',
    params: {
      ...params
    }
  })
}

export function renew(params) {
  return request({
    url: `${baseUrl}/api/enterpriserenewlog/save`,
    method: 'post',
    params: {
      ...params
    }
  })
}

export function setUserAgreement(params) {
  return request({
    url: `${baseUrl}/api/enterpriseprotocol/submit`,
    method: 'post',
    params: {
      ...params
    }
  })
}

export function getAllAgreement(params) {
  return request({
    url: `${baseUrl}/api/protocol/page`,
    method: 'get',
    params: {
      ...params
    }
  })
}

export function getItemAgreement(id) {
  return request({
    url: `${baseUrl}/api/enterpriseprotocol/selectByEntId`,
    method: 'get',
    params: {
      enterpriseId: id
    }
  })
}

export function updateItemStatus(params) {
  return request({
    url: `${baseUrl}/api/enterpriseinfo/updateStatus`,
    method: 'post',
    params: {
      ...params
    }
  })
}
