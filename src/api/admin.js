import request from '@/plugins/request';

export function getUserList(data) {
    return request({
        url: '/user/list',
        method: 'get',
        params: data
    });
}

export function getApplyist(data) {
    return request({
        url: '/enterprise/apply/list',
        method: 'get',
        params: data
    });
}

export const getCollectPosts = (data) => {
    return request({
        url: '/user/collect/posts',
        method: 'get',
        params: data
    });
}

export const getCaptcha = (data) => {
    return request({
        url: '/public/captcha',
        method: 'get',
        params: data
    });
}