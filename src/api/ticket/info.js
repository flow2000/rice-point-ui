import request from '@/utils/request'

// 查询投票信息列表
export function listInfo(query) {
  return request({
    url: '/ticket/info/list',
    method: 'get',
    params: query
  })
}

// 查询投票信息详细
export function getInfo(ticketId) {
  return request({
    url: '/ticket/info/' + ticketId,
    method: 'get'
  })
}

// 新增投票信息
export function addInfo(data) {
  return request({
    url: '/ticket/info',
    method: 'post',
    data: data
  })
}

// 修改投票信息
export function updateInfo(data) {
  return request({
    url: '/ticket/info',
    method: 'put',
    data: data
  })
}

// 删除投票信息
export function delInfo(ticketId) {
  return request({
    url: '/ticket/info/' + ticketId,
    method: 'delete'
  })
}

// 导出投票信息
export function exportInfo(query) {
  return request({
    url: '/ticket/info/export',
    method: 'get',
    params: query
  })
}