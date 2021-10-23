import request from '@/utils/request'

// 查询食堂信息列表
export function listInfo(query) {
  return request({
    url: '/canteen/info/list',
    method: 'get',
    params: query
  })
}

// 查询食堂信息详细
export function getInfo(canteenId) {
  return request({
    url: '/canteen/info/' + canteenId,
    method: 'get'
  })
}

// 新增食堂信息
export function addInfo(data) {
  return request({
    url: '/canteen/info',
    method: 'post',
    data: data
  })
}

// 修改食堂信息
export function updateInfo(data) {
  return request({
    url: '/canteen/info',
    method: 'put',
    data: data
  })
}

// 删除食堂信息
export function delInfo(canteenId) {
  return request({
    url: '/canteen/info/' + canteenId,
    method: 'delete'
  })
}

// 导出食堂信息
export function exportInfo(query) {
  return request({
    url: '/canteen/info/export',
    method: 'get',
    params: query
  })
}

// 食堂信息状态修改
export function changeCanteenStatus(canteenId, status) {
  const data = {
    canteenId,
    status
  }
  return request({
    url: '/canteen/info/changeStatus',
    method: 'put',
    data: data
  })
}
