import { useSignIn } from '@clerk/clerk-expo'
import type { EmailCodeFactor } from '@clerk/types'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Pressable, TextInput, View, Text } from 'react-native'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [showEmailCode, setShowEmailCode] = React.useState(false)

  // 处理登录表单提交
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return

    // 使用输入的邮箱和密码发起登录流程
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // 如果登录完成，则激活创建的会话并跳转
      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // 检查是否存在待处理任务，并跳转到自定义 UI 引导用户完成
              // 参考：https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask)
              return
            }

            router.replace('/')
          },
        })
      } else if (signInAttempt.status === 'needs_second_factor') {
        // 检查 email_code 是否可用作二次验证方式
        // 当启用 Client Trust 且用户在新设备登录时，这一步是必须的
        // 参考：https://clerk.com/docs/guides/secure/client-trust
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
        )

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          })
          setShowEmailCode(true)
        }
      } else {
        // 若状态不是 complete，说明用户可能还需要完成后续步骤
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // 错误处理参考：https://clerk.com/docs/guides/development/custom-flows/error-handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [isLoaded, signIn, setActive, router, emailAddress, password])

  // 处理邮箱验证码提交
  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // 检查是否存在待处理任务，并跳转到自定义 UI 引导用户完成
              // 参考：https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask)
              return
            }

            router.replace('/')
          },
        })
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }, [isLoaded, signIn, setActive, router, code])

  // 展示邮箱验证码输入表单
  if (showEmailCode) {
    return (
      <View className="flex-1 gap-3 p-5">
        <Text className="mb-2">
          Verify your email
        </Text>
        <Text className="mb-4 text-sm opacity-80">
          A verification code has been sent to your email.
        </Text>
        <TextInput
          className="rounded-lg border border-[#ccc] bg-white p-3 text-base"
          value={code}
          placeholder="Enter verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        <Pressable
          className="mt-2 items-center rounded-lg bg-[#0a7ea4] px-6 py-3 active:opacity-70"
          onPress={onVerifyPress}
        >
          <Text className="font-semibold text-white">Verify</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-1 gap-3 p-5">
      <Text className="text-2xl font-bold mb-2">
        Sign in
      </Text>
      <Text className="text-sm font-semibold">Email address</Text>
      <TextInput
        className="rounded-lg border border-[#ccc] bg-white p-3 text-base"
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor="#666666"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        keyboardType="email-address"
      />
      <Text className="text-sm font-semibold">Password</Text>
      <TextInput
        className="rounded-lg border border-[#ccc] bg-white p-3 text-base"
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#666666"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />
      <Pressable
        className={`mt-2 items-center rounded-lg bg-[#0a7ea4] px-6 py-3 active:opacity-70 ${
          !emailAddress || !password ? 'opacity-50' : ''
        }`}
        onPress={onSignInPress}
        disabled={!emailAddress || !password}
      >
        <Text className="font-semibold text-white">Sign in</Text>
      </Pressable>
      <View className="mt-3 flex-row items-center gap-1">
        <Text> Don't have an account? </Text>
        <Link href="/sign-up">
          <Text type="link">Sign up</Text>
        </Link>
      </View>
    </View>
  )
}
