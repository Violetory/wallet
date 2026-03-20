import { useUser } from '@clerk/clerk-react';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/stack';

export default function Layout() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href={'/sign-in'} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}