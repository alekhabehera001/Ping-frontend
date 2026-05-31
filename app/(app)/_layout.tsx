import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { useSocketStore } from '../../store/socket.store';
import { useQueryClient } from '@tanstack/react-query';
import { COLORS } from '../../constants/config';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function AppLayout() {
  const { tokens } = useAuthStore();
  const { connect, disconnect, socket } = useSocketStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tokens?.accessToken) return;
    connect(tokens.accessToken);

    return () => {
      disconnect();
    };
  }, [tokens?.accessToken]);

  useEffect(() => {
    if (!socket) return;

    const handleMoodUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['latest-moods'] });
    };

    const handleAnswerReveal = (data: { questionId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['today-answers', data.questionId] });
      queryClient.invalidateQueries({ queryKey: ['reveal-answers', data.questionId] });
    };

    const handleMemoryNew = () => {
      queryClient.invalidateQueries({ queryKey: ['memories-timeline'] });
    };

    const handleStreakMilestone = () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    };

    const handleNotificationNew = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('mood:update', handleMoodUpdate);
    socket.on('answer:reveal', handleAnswerReveal);
    socket.on('memory:new', handleMemoryNew);
    socket.on('streak:milestone', handleStreakMilestone);
    socket.on('notification:new', handleNotificationNew);

    return () => {
      socket.off('mood:update', handleMoodUpdate);
      socket.off('answer:reveal', handleAnswerReveal);
      socket.off('memory:new', handleMemoryNew);
      socket.off('streak:milestone', handleStreakMilestone);
      socket.off('notification:new', handleNotificationNew);
    };
  }, [socket]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0F1A',
          borderTopColor: '#1A1A2E',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: 'Mood',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💭" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📸" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          title: 'Streak',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      <Tabs.Screen name="question" options={{ href: null }} />
      <Tabs.Screen name="reveal" options={{ href: null }} />
      <Tabs.Screen name="couple-setup" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
