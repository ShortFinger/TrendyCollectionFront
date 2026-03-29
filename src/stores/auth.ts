import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getCurrentAdmin, getPublicKey } from '@/api/auth'
import type { AdminVO } from '@/types/auth'
import JSEncrypt from 'jsencrypt'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const admin = ref<AdminVO | null>(null)

  async function login(username: string, password: string) {
    const { data: keyData } = await getPublicKey()
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(keyData.publicKey)
    const encryptedPassword = encrypt.encrypt(password)
    if (!encryptedPassword) {
      throw new Error('密码加密失败')
    }
    const { data } = await loginApi({ username, password: encryptedPassword })
    token.value = data.token
    admin.value = data.admin
    localStorage.setItem('token', data.token)
    return data
  }

  async function fetchUserInfo() {
    const { data } = await getCurrentAdmin()
    admin.value = data
    return data
  }

  function logout() {
    token.value = ''
    admin.value = null
    localStorage.removeItem('token')
  }

  return { token, admin, login, fetchUserInfo, logout }
})
