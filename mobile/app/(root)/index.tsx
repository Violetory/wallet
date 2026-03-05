import { View, Text } from 'react-native';
import { SignOutButton } from 'components/SignOutButton';
import { SignedIn, SignedOut, useSession, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import SafeScreen from 'components/SafeScreen';

export default function Page() {
  const { user } = useUser();

  // 你可以在这里访问 session 和 user 对象，来根据需要展示不同的 UI 或进行其他逻辑处理
  const { session } = useSession();
  console.log(session?.currentTask);

  return (
    <SafeScreen>
      <View className="flex-1 items-center gap-4">
        <Text className="text-2xl font-bold">Welcome!</Text>

        {/* 未登录状态 */}
        <SignedOut>
          <Link href="/(auth)/sign-in">
            <Text>Sign in</Text>
          </Link>
          <Link href="/(auth)/sign-up">
            <Text>Sign up</Text>
          </Link>
        </SignedOut>
        
        {/* 已登录状态 */}
        <SignedIn>
          <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
          <SignOutButton />
        </SignedIn>
      </View>
    </SafeScreen>
  );
}
