<template>
  <div class="login-page flex flex-center bg-gradient">
    <q-card class="login-card q-pa-md" flat bordered>
      <q-card-section class="text-center">
        <div class="text-h4 text-weight-bold q-mb-xs">PMkt</div>
        <div class="text-subtitle2 text-grey-7">
          Gestão de Conteúdo para Redes Sociais
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            type="email"
            label="Email"
            outlined
            :rules="[(val) => !!val || 'Email é obrigatório']"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Senha"
            outlined
            :rules="[(val) => !!val || 'Senha é obrigatória']"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div v-if="isSignUp">
            <q-input
              v-model="name"
              type="text"
              label="Nome"
              outlined
              :rules="[(val) => !!val || 'Nome é obrigatório']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
          </div>

          <div v-if="!isSignUp">
            <q-checkbox
              v-model="rememberMe"
              label="Lembrar de mim"
              color="primary"
            />
          </div>

          <div>
            <q-btn
              :label="isSignUp ? 'Criar Conta' : 'Entrar'"
              type="submit"
              color="primary"
              class="full-width"
              :loading="authStore.loading"
              size="lg"
            />
          </div>

          <div class="text-center">
            <q-btn
              :label="isSignUp ? 'Já tem conta? Entrar' : 'Criar nova conta'"
              flat
              color="primary"
              @click="toggleMode"
              :disable="authStore.loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const name = ref('')
const showPassword = ref(false)
const isSignUp = ref(false)
const rememberMe = ref(true) // Default true para lembrar

onMounted(() => {
  // Recuperar preferência de "lembrar de mim"
  const savedRememberMe = localStorage.getItem('rememberMe')
  if (savedRememberMe !== null) {
    rememberMe.value = savedRememberMe === 'true'
  }
})

function toggleMode() {
  isSignUp.value = !isSignUp.value
  name.value = ''
}

async function handleSubmit() {
  let result

  if (isSignUp.value) {
    result = await authStore.signUp(email.value, password.value, name.value)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Conta criada! Verifique seu email para confirmar.',
        position: 'top',
      })
      isSignUp.value = false
      email.value = ''
      password.value = ''
      name.value = ''
      return
    }
  } else {
    // Salvar preferência de "lembrar"
    localStorage.setItem('rememberMe', rememberMe.value.toString())
    
    result = await authStore.signIn(email.value, password.value, rememberMe.value)

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Login realizado com sucesso!',
        position: 'top',
      })
      router.push('/dashboard')
      return
    }
  }

  if (!result.success) {
    $q.notify({
      type: 'negative',
      message: result.error || 'Erro ao autenticar',
      position: 'top',
    })
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  width: 100%;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
}
</style>
