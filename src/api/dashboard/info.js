import request from '@/utils/request'

// 初始化首页面板
export function initBoard() {
  return request({
    url: 'board/info/initBoard',
    method: 'get',
  })
}

//查询每周访问人数，每周投票数，每周订单量，每周交易金额的折线图
export function initLine() {
  return request({
    url: '/board/info/initLine',
    method: 'get',
  })
}

//查询饼状图信息
export function initBar() {
  return request({
    url: '/board/info/initBar',
    method: 'get',
  })
}

