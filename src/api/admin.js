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
        url: '/content/collect/posts',
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

export const editUserInfo = (data) => {
    return request({
        url: '/platform/user/eidt',
        method: 'post',
        data
    });
}

export const addUser = (data) => {
    return request({
        url: '/platform/user/add',
        method: 'post',
        data
    });
}