import request from '@/utils/request'

// 查询菜品类型列表
export function listType(query) {
  return request({
    url: '/dish/type/list',
    method: 'get',
    params: query
  })
}

// 查询菜品类型详细
export function getType(typeId) {
  return request({
    url: '/dish/type/' + typeId,
    method: 'get'
  })
}

// 新增菜品类型
export function addType(data) {
  return request({
    url: '/dish/type',
    method: 'post',
    data: data
  })
}

// 修改菜品类型
export function updateType(data) {
  return request({
    url: '/dish/type',
    method: 'put',
    data: data
  })
}

// 删除菜品类型
export function delType(typeId) {
  return request({
    url: '/dish/type/' + typeId,
    method: 'delete'
  })
}

// 导出菜品类型
export function exportType(query) {
  return request({
    url: '/dish/type/export',
    method: 'get',
    params: query
  })
}

// 菜品类型状态修改
export function changeTypeStatus(typeId, status) {
  const data = {
    typeId,
    status
  }
  return request({
    url: '/dish/type/changeStatus',
    method: 'put',
    data: data
  })
}
