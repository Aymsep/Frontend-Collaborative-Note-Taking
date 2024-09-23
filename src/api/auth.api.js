import api from './axiosInstance'



export const login = async data =>{
    return api.post('/auth/local/signin', data)
}

export const register = async data =>{
    return api.post('/auth/local/signup', data)
}

export const getProfile = async data =>{
    return api.get('/auth/local/profile')
}

