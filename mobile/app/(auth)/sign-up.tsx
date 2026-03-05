import { useSignUp } from '@clerk/clerk-expo';
import { Asset } from 'expo-asset';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Text } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import SafeScreen from 'components/SafeScreen';
import EmailVerification from './EmailVerification';
import Alert, { type AlertType } from 'components/Alert';

const coverPhoneUri = Asset.fromModule(require('assets/cover/cover-security.svg')).uri;

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [SignUpLoading, setSignUpLoading] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertType, setAlertType] = React.useState<AlertType>('danger');

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

  const showAlert = React.useCallback((message: string, type: AlertType) => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  }, []);

  const isValidEmailFormat = React.useCallback((value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, []);

  // 处理注册表单提交
  const onSignUpPress = React.useCallback(async () => {
    if (SignUpLoading) return;

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

    setSignUpLoading(true);

    // 使用输入的邮箱和密码发起注册流程
    try {
      await signUp.create({
        emailAddress: trimmedEmail,
        password,
      });

      // 向用户邮箱发送验证码
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // 将 pendingVerification 设为 true，展示第二步表单并输入验证码
      setPendingVerification(true);
    } catch (error) {
      // 错误处理参考：https://clerk.com/docs/guides/development/custom-flows/error-handling
      showAlert(extractClerkErrorMessage(error), 'danger');
    } finally {
      setSignUpLoading(false);
    }
  }, [
    SignUpLoading,
    emailAddress,
    extractClerkErrorMessage,
    isLoaded,
    isValidEmailFormat,
    password,
    showAlert,
    signUp,
  ]);

  // 处理验证码表单提交
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
      // 使用用户输入的验证码进行验证
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: trimmedCode,
      });

      // 如果验证完成，则激活会话并跳转
      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              showAlert('Additional verification is required to finish sign up.', 'warning');
              return;
            }

            router.replace('/');
          },
        });
      } else {
        showAlert('Verification failed. Please try again.', 'danger');
      }
    } catch (error) {
      // 错误处理参考：https://clerk.com/docs/guides/development/custom-flows/error-handling
      showAlert(extractClerkErrorMessage(error), 'danger');
    }
  }, [code, extractClerkErrorMessage, isLoaded, router, setActive, showAlert, signUp]);

  if (pendingVerification) {
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

        {/* 注册表单 */}
        <SafeScreen>
          <View className="flex-1 gap-5 bg-white -mt-10">
            <Text className="mb-2 text-2xl font-bold">Create Account</Text>

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

            {/* 创建按钮 */}
            <View className="relative mt-2">
              <Button
                mode="contained"
                onPress={onSignUpPress}
                disabled={SignUpLoading}
                style={{ borderRadius: 4 }}
                contentStyle={{ height: 48 }}
                labelStyle={SignUpLoading ? { opacity: 0 } : undefined}>
                Create
              </Button>
              {SignUpLoading ? (
                <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                  <ActivityIndicator size={20} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
            <View className="flex flex-row items-center justify-center">
              <Text className="text-gray-400"> Already have an account? </Text>
              <Button mode="text" onPress={() => router.push('/sign-in')} compact>
                Sign in
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
