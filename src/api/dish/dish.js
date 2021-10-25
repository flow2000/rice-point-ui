import request from '@/utils/request'

// 查询菜品列表
export function listDish(query) {
  return request({
    url: '/dish/dish/list',
    method: 'get',
    params: query
  })
}

// 查询菜品详细
export function getDish(dishId) {
  return request({
    url: '/dish/dish/' + dishId,
    method: 'get'
  })
}

// 新增菜品
export function addDish(data) {
  return request({
    url: '/dish/dish',
    method: 'post',
    data: data
  })
}

// 修改菜品
export function updateDish(data) {
  return request({
    url: '/dish/dish',
    method: 'put',
    data: data
  })
}

// 删除菜品
export function delDish(dishId) {
  return request({
    url: '/dish/dish/' + dishId,
    method: 'delete'
  })
}

// 导出菜品
export function exportDish(query) {
  return request({
    url: '/dish/dish/export',
    method: 'get',
    params: query
  })
}

// 菜品状态修改
export function changeDishStatus(dishId, status) {
  const data = {
    dishId,
    status
  }
  return request({
    url: '/dish/dish/changeStatus',
    method: 'put',
    data: data
  })
}
