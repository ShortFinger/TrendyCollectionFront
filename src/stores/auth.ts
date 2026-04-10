import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useTabsStore } from '@/stores/tabs'
import { login as loginApi, getCurrentAdmin, getPublicKey } from '@/api/auth'
import type { AdminVO } from '@/types/auth'
import { axiosErrorMessage, isRequestTimeoutError } from '@/utils/httpErrors'
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
    try {
      const { data } = await getCurrentAdmin({ skipErrorMessage: true })
      admin.value = data
      return data
    } catch (e1) {
      if (isRequestTimeoutError(e1)) {
        const { data } = await getCurrentAdmin()
        admin.value = data
        return data
      }
      ElMessage.error(axiosErrorMessage(e1))
      throw e1
    }
  }

  function logout() {
    useTabsStore().clear()
    token.value = ''
    admin.value = null
    localStorage.removeItem('token')
  }

  return { token, admin, login, fetchUserInfo, logout }
})
