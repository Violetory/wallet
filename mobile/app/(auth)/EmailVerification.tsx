import * as React from 'react';
import { Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

type EmailVerificationProps = {
  code: string;
  emailAddress?: string;
  onChangeCode: (value: string) => void;
  onVerifyPress: () => Promise<void> | void;
  placeholder?: string;
  buttonText?: string;
  cellCount?: number;
};

export default function EmailVerification({
  code,
  emailAddress,
  onChangeCode,
  onVerifyPress,
  placeholder = 'Enter six-digit code',
  buttonText = 'Verify',
  cellCount = 6,
}: EmailVerificationProps) {
  const ref = useBlurOnFulfill({ value: code, cellCount });
  const [fieldProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: onChangeCode,
  });
  const [verifyLoading, setVerifyLoading] = React.useState(false);
  const isCodeComplete = code.length === cellCount;

  const handleVerifyPress = React.useCallback(async () => {
    if (verifyLoading || !isCodeComplete) return;
    setVerifyLoading(true);
    try {
      await onVerifyPress();
    } finally {
      setVerifyLoading(false);
    }
  }, [isCodeComplete, onVerifyPress, verifyLoading]);

  return (
    <>
      {/* Header */}
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => <Text className="text-3xl font-bold text-[#5732BF]">Wallet</Text>,
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
        }}
      />
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
          contentContainerClassName="flex-grow p-5">
          <View className="flex flex-col gap-5">
            {/* 标题 */}
            <View className="flex flex-col items-center justify-center gap-1">
              <Text className="font-bold text-lg">A verification code has been sent to your email</Text>
              {emailAddress ? <Text className="font-bold text-lg">{emailAddress}</Text> : null}
            </View>

            <Text className="mx-auto text-sm text-[#666666]">{placeholder}</Text>

            {/* 验证码 */}
            <View className="items-center gap-2">
              <CodeField
                ref={ref}
                {...fieldProps}
                value={code}
                onChangeText={(value) => onChangeCode(value.replace(/\D/g, '').slice(0, cellCount))}
                cellCount={cellCount}
                rootStyle={{ width: '100%', justifyContent: 'space-between' }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                renderCell={({ index, symbol, isFocused }) => (
                  <View
                    key={index}
                    onLayout={getCellOnLayoutHandler(index)}
                    className={`h-12 w-12 items-center justify-center rounded-md border ${
                      isFocused ? 'border-2 border-[#5732BF]' : 'border-[#ccc]'
                    }`}>
                    {symbol ? (
                      <Text
                        className="text-center text-xl leading-6"
                        style={{ includeFontPadding: false, textAlignVertical: 'center' }}>
                        {symbol}
                      </Text>
                    ) : isFocused ? (
                      <Text
                        className="text-center text-xl leading-6"
                        style={{ includeFontPadding: false, textAlignVertical: 'center' }}>
                        <Cursor />
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            </View>

            {/* 验证按钮 */}
            <View className="relative mt-2">
              <Button
                mode="contained"
                disabled={!isCodeComplete || verifyLoading}
                onPress={handleVerifyPress}
                style={{ borderRadius: 4 }}
                contentStyle={{ height: 48 }}
                labelStyle={verifyLoading ? { opacity: 0 } : undefined}>
                {buttonText}
              </Button>
              {verifyLoading ? (
                <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                  <ActivityIndicator size={20} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
