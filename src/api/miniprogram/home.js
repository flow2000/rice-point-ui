import request from '@/utils/request'

// 查询轮播图列表
export function listHome(query) {
  return request({
    url: '/miniprogram/home/list',
    method: 'get',
    headers:{
      isToken: false
    },
    params: query
  })
}

// 查询轮播图详细
export function getHome(id) {
  return request({
    url: '/miniprogram/home/' + id,
    headers:{
      isToken: false
    },
    method: 'get'
  })
}

// 新增轮播图
export function addHome(data) {
  return request({
    url: '/miniprogram/home',
    method: 'post',
    data: data
  })
}

// 修改轮播图
export function updateHome(data) {
  return request({
    url: '/miniprogram/home',
    method: 'put',
    data: data
  })
}

// 删除轮播图
export function delHome(id) {
  return request({
    url: '/miniprogram/home/' + id,
    method: 'delete'
  })
}

// 导出轮播图
export function exportHome(query) {
  return request({
    url: '/miniprogram/home/export',
    method: 'get',
    params: query
  })
}
