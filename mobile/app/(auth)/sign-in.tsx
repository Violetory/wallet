import { useSignIn } from '@clerk/clerk-expo';
import type { EmailCodeFactor } from '@clerk/types';
import { Asset } from 'expo-asset';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Text } from 'react-native';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { SvgUri } from 'react-native-svg';
import SafeScreen from 'components/SafeScreen';
import EmailVerification from './EmailVerification';

const coverPhoneUri = Asset.fromModule(require('assets/cover/cover-phone.svg')).uri;

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [LoginLoading, setLoginLoading] = React.useState(false);

  // 处理登录表单提交
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded || LoginLoading) return;
    setLoginLoading(true);

    // 使用输入的邮箱和密码发起登录流程
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // 如果登录完成，则激活创建的会话并跳转
      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // 检查是否存在待处理任务，并跳转到自定义 UI 引导用户完成
              // 参考：https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask);
              return;
            }

            router.replace('/');
          },
        });
      } else if (signInAttempt.status === 'needs_second_factor') {
        // 检查 email_code 是否可用作二次验证方式
        // 当启用 Client Trust 且用户在新设备登录时，这一步是必须的
        // 参考：https://clerk.com/docs/guides/secure/client-trust
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code'
        );

        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        }
      } else {
        // 若状态不是 complete，说明用户可能还需要完成后续步骤
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // 错误处理参考：https://clerk.com/docs/guides/development/custom-flows/error-handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoginLoading(false);
    }
  }, [isLoaded, LoginLoading, signIn, setActive, router, emailAddress, password]);

  // 处理邮箱验证码提交
  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // 检查是否存在待处理任务，并跳转到自定义 UI 引导用户完成
              // 参考：https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
              console.log(session?.currentTask);
              return;
            }

            router.replace('/');
          },
        });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, signIn, setActive, router, code]);

  // 展示邮箱验证码输入表单
  if (showEmailCode) {
    return (
      <EmailVerification
        code={code}
        emailAddress={emailAddress}
        onChangeCode={setCode}
        onVerifyPress={onVerifyPress}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        contentContainerStyle={{ flexGrow: 1 }}>
        {/* 封面 */}
        <View className="h-120 w-full bg-[#F7F4FF]">
          <SafeScreen>
            <View className="flex flex-col items-center gap-6">
              <Text className="text-3xl font-bold text-[#5732BF]">Wallet</Text>

              {/* 封面SVG */}
              <View className="p-10">
                <SvgUri uri={coverPhoneUri} />
              </View>
            </View>
          </SafeScreen>
        </View>

        {/* 登录表单 */}
        <View className="flex-1 gap-5 bg-white p-6">
          <Text className="mb-2 text-2xl font-bold">Welcome Back</Text>

          {/* 账号 */}
          <TextInput
            mode="outlined"
            label="Email"
            autoCapitalize="none"
            value={emailAddress}
            onChangeText={(nextEmailAddress) => setEmailAddress(nextEmailAddress)}
            keyboardType="email-address"
          />

          {/* 密码 */}
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            secureTextEntry={true}
            onChangeText={(nextPassword) => setPassword(nextPassword)}
          />

          {/* 登录按钮 */}
          <View className="relative mt-2">
            <Button
              mode="contained"
              onPress={onSignInPress}
              disabled={!emailAddress || !password || LoginLoading}
              style={{ borderRadius: 4 }}
              contentStyle={{ height: 48 }}
              labelStyle={LoginLoading ? { opacity: 0 } : undefined}>
              Sign In
            </Button>
            {LoginLoading ? (
              <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                <ActivityIndicator size={20} color="#FFFFFF" />
              </View>
            ) : null}
          </View>
          <View className="flex flex-row items-center justify-center">
            <Text className="text-gray-400"> Don't have an account? </Text>
            <Button mode="text" onPress={() => router.push('/sign-up')} compact>
              Sign up
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
