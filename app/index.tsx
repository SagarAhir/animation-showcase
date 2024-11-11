import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AnimationButton from '@/components/AnimationButton';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { ANIMATIONS } from '@/constants/Constants';


export default function TabOneScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const navigateToPreview = (animationId: string) => {
    router.push({ pathname: '/preview', params: { animationId } });
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {ANIMATIONS.map((animation) => (
          <AnimationButton
            key={animation.id}
            title={animation.title}
            onPress={() => navigateToPreview(animation.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  themeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
});
