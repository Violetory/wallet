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
import Alert, { type AlertType } from 'components/Alert';
import AppIcon from 'components/AppIcon';

const coverPhoneUri = Asset.fromModule(require('assets/cover/cover-phone.svg')).uri;

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [showEmailCode, setShowEmailCode] = React.useState(false);
  const [LoginLoading, setLoginLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertType, setAlertType] = React.useState<AlertType>('danger');

  // 提取 Clerk 错误信息
  const extractClerkErrorMessage = React.useCallback((err: unknown) => {
    if (err && typeof err === 'object') {
      const firstError = (
        err as {
          errors?: Array<{ message?: string; longMessage?: string }>;
          message?: string;
        }
      ).errors?.[0];

      if (firstError?.longMessage) return firstError.longMessage;
      if (firstError?.message) return firstError.message;

      if (typeof (err as { message?: string }).message === 'string') {
        return (err as { message: string }).message;
      }
    }

    return 'Request failed, please try again.';
  }, []);

  // 展示全局 Alert
  const showAlert = React.useCallback((message: string, type: AlertType) => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  }, []);

  const isValidEmailFormat = React.useCallback((value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, []);

  // 处理登录表单提交
  const onSignInPress = React.useCallback(async () => {
    if (LoginLoading) return;

    const trimmedEmail = emailAddress.trim();
    if (!trimmedEmail || !password) {
      showAlert('Account or password cannot be empty.', 'warning');
      return;
    }
    if (!isValidEmailFormat(trimmedEmail)) {
      showAlert('Please enter a valid email address.', 'warning');
      return;
    }
    if (!isLoaded) {
      showAlert('Authentication is still loading. Please try again.', 'warning');
      return;
    }

    setLoginLoading(true);

    // 使用输入的邮箱和密码发起登录流程
    try {
      const signInAttempt = await signIn.create({
        identifier: trimmedEmail,
        password,
      });

      // 如果登录完成，则激活创建的会话并跳转
      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              showAlert('Additional verification is required to finish sign in.', 'warning');
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
        } else {
          showAlert('Email verification is not available for this account.', 'danger');
        }
      } else {
        showAlert('Unable to complete sign in. Please try again.', 'danger');
      }
    } catch (error) {
      // 错误处理参考：https://clerk.com/docs/guides/development/custom-flows/error-handling
      showAlert(extractClerkErrorMessage(error), 'danger');
    } finally {
      setLoginLoading(false);
    }
  }, [
    isLoaded,
    LoginLoading,
    signIn,
    setActive,
    router,
    emailAddress,
    password,
    showAlert,
    extractClerkErrorMessage,
    isValidEmailFormat,
  ]);

  // 处理邮箱验证码提交
  const onVerifyPress = React.useCallback(async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      showAlert('Please enter verification code.', 'warning');
      return;
    }
    if (trimmedCode.length < 6) {
      showAlert('Please enter the complete 6-digit code.', 'warning');
      return;
    }
    if (!isLoaded) {
      showAlert('Authentication is still loading. Please try again.', 'warning');
      return;
    }

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: trimmedCode,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              showAlert('Additional verification is required to finish sign in.', 'warning');
              return;
            }

            router.replace('/');
          },
        });
      } else {
        showAlert('Verification failed. Please try again.', 'danger');
      }
    } catch (error) {
      showAlert(extractClerkErrorMessage(error), 'danger');
    }
  }, [code, extractClerkErrorMessage, isLoaded, router, setActive, showAlert, signIn]);

  // 展示邮箱验证码输入表单
  if (showEmailCode) {
    return (
      <>
        <EmailVerification
          code={code}
          emailAddress={emailAddress}
          onChangeCode={setCode}
          onVerifyPress={onVerifyPress}
        />
        <Alert
          visible={alertVisible}
          onDismiss={() => setAlertVisible(false)}
          type={alertType}
          message={alertMessage}
        />
      </>
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
        <SafeScreen>
          <View className="-mt-10 flex-1 gap-5 bg-white">
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
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={({ size, color }) => (
                    <AppIcon
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={size}
                      color={typeof color === 'string' ? color : '#78838D'}
                    />
                  )}
                  onPress={() => setShowPassword((prev) => !prev)}
                  forceTextInputFocus={false}
                />
              }
              onChangeText={(nextPassword) => setPassword(nextPassword)}
            />

            {/* 登录按钮 */}
            <View className="relative mt-2">
              <Button
                mode="contained"
                onPress={onSignInPress}
                disabled={LoginLoading}
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
        </SafeScreen>
      </ScrollView>
      <Alert
        visible={alertVisible}
        onDismiss={() => setAlertVisible(false)}
        type={alertType}
        message={alertMessage}
      />
    </KeyboardAvoidingView>
  );
}
