import request from '@/utils/request'

// 查询微信用户列表
export function listUser(query) {
  return request({
    url: '/miniprogram/user/list',
    method: 'get',
    headers:{
      isToken: false
    },
    params: query
  })
}

// 查询微信用户详细
export function getUser(id) {
  return request({
    url: '/miniprogram/user/' + id,
    headers:{
      isToken: false
    },
    method: 'get'
  })
}

// 新增微信用户
export function addUser(data) {
  return request({
    url: '/miniprogram/user',
    headers:{
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 修改微信用户
export function updateUser(data) {
  return request({
    url: '/miniprogram/user',
    headers:{
      isToken: false
    },
    method: 'put',
    data: data
  })
}

// 删除微信用户
export function delUser(id) {
  return request({
    url: '/miniprogram/user/' + id,
    headers:{
      isToken: false
    },
    method: 'delete'
  })
}

// 导出微信用户
export function exportUser(query) {
  return request({
    url: '/miniprogram/user/export',
    headers:{
      isToken: false
    },
    method: 'get',
    params: query
  })
}
