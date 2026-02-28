import { useSignUp } from '@clerk/clerk-expo';
import { Asset } from 'expo-asset';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Text } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import SafeScreen from 'components/SafeScreen';
import EmailVerification from './EmailVerification';

const coverPhoneUri = Asset.fromModule(require('assets/cover/cover-security.svg')).uri;

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [SignUpLoading, setSignUpLoading] = React.useState(false);

  // 处理注册表单提交
  const onSignUpPress = async () => {
    if (!isLoaded || SignUpLoading) return;
    setSignUpLoading(true);
    // 使用输入的邮箱和密码发起注册流程
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // 向用户邮箱发送验证码
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // 将 pendingVerification 设为 true，展示第二步表单并输入验证码
      setPendingVerification(true);
    } catch (err) {
      // 错误处理参考：https://clerk.com/docs/guides/development/custom-flows/error-handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setSignUpLoading(false);
    }
  };

  // 处理验证码表单提交
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // 使用用户输入的验证码进行验证
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // 如果验证完成，则激活会话并跳转
      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
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
        // 若状态不是 complete，说明用户可能还需要完成后续步骤
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // 错误处理参考：https://clerk.com/docs/guides/development/custom-flows/error-handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
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

        {/* 注册表单 */}
        <View className="flex-1 gap-5 bg-white p-6">
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
              disabled={!emailAddress || !password || SignUpLoading}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
