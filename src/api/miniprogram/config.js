import request from '@/utils/request'

// 查询微信小程序配置列表
export function listConfig(query) {
  return request({
    url: '/miniprogram/config/list',
    method: 'get',
    params: query
  })
}

// 查询微信小程序配置详细
export function getConfig(id) {
  return request({
    url: '/miniprogram/config/' + id,
    method: 'get'
  })
}

// 新增微信小程序配置
export function addConfig(data) {
  return request({
    url: '/miniprogram/config',
    method: 'post',
    data: data
  })
}

// 修改微信小程序配置
export function updateConfig(data) {
  return request({
    url: '/miniprogram/config',
    method: 'put',
    data: data
  })
}

// 删除微信小程序配置
export function delConfig(id) {
  return request({
    url: '/miniprogram/config/' + id,
    method: 'delete'
  })
}

// 导出微信小程序配置
export function exportConfig(query) {
  return request({
    url: '/miniprogram/config/export',
    method: 'get',
    params: query
  })
}