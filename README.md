# ByeByeSugar - Diabetes Management App

A React Native application for tracking habits and managing diabetes.

## AI Integration Guide

To integrate an AI chatbot into the ByeByeSugar app, follow these steps:

### 1. Create a ChatAI Component

Create a new component called `ChatAI.tsx` in the components folder:

```tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Send } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useHabitsStore } from '@/store/habits-store';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your ByeByeSugar AI assistant. How can I help you with your diabetes management today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { clientHabits } = useHabitsStore();
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Create context from user's habit data
      const habitContext = Object.values(clientHabits).slice(0, 5).map(habit => 
        `Date: ${habit.date}, Energy: ${habit.energyLevel2pm}/10 at 2pm, ${habit.energyLevel8pm}/10 at 8pm`
      ).join('\n');
      
      // Prepare the messages for the AI
      const aiMessages = [
        {
          role: 'system',
          content: `You are a helpful diabetes management assistant for the ByeByeSugar app. 
          You provide supportive, evidence-based advice on diet, exercise, and lifestyle changes.
          Be encouraging but realistic. Focus on small, achievable steps.
          Here is some context about the user's recent habits:
          ${habitContext}`
        },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: inputText }
      ];
      
      // Make the API request
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: aiMessages }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Add AI response to messages
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.completion,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I couldn't process your request. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      
      // Scroll to the bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userBubble : styles.aiBubble
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.disabledButton
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Send size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messageList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 16,
    color: props => props.sender === 'user' ? 'white' : Colors.text,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: props => props.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : Colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.input,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
```

### 2. Add a Chat Screen

Create a new file in the app directory called `chat.tsx`:

```tsx
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/Header';
import ChatAI from '@/components/ChatAI';
import Colors from '@/constants/colors';

export default function ChatScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="AI Assistant" 
        showBackButton 
      />
      <View style={styles.content}>
        <ChatAI />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
```

### 3. Add a Chat Button to the Client Screen

In the client.tsx file, add a button to navigate to the chat screen:

```tsx
// Add this import
import { MessageCircle } from 'lucide-react-native';

// Add this to the JSX, perhaps in the header or as a floating button
<TouchableOpacity 
  style={styles.chatButton}
  onPress={() => router.push('/chat')}
>
  <MessageCircle size={24} color="white" />
</TouchableOpacity>

// Add this to the styles
chatButton: {
  position: 'absolute',
  bottom: 80,
  right: 20,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: Colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
},
```

### 4. Customize the AI Prompts

For better results, you can customize the system prompt based on the specific needs:

#### For Nutrition Advice:
```
You are a nutrition expert specializing in diabetes management. Provide evidence-based dietary advice that helps maintain stable blood sugar levels. Focus on low glycemic index foods, portion control, and meal timing. Always consider the user's specific situation and habits.
```

#### For Exercise Recommendations:
```
You are an exercise physiologist specializing in diabetes management. Provide safe, effective exercise recommendations that help improve insulin sensitivity and blood sugar control. Consider the user's energy levels and current habits when making suggestions.
```

#### For Motivation and Habit Building:
```
You are a behavioral health coach specializing in diabetes management. Help users build sustainable habits through small, achievable steps. Provide encouragement, celebrate wins, and offer strategies to overcome common obstacles in diabetes management.
```

### 5. Make the AI Context-Aware

To make the AI more helpful, provide it with context from the user's data:

```tsx
// Example of creating context from user data
const createAIContext = () => {
  const recentHabits = Object.values(clientHabits).slice(0, 7); // Last 7 days
  
  // Calculate averages
  const avgEnergy2pm = recentHabits.reduce((sum, habit) => sum + (habit.energyLevel2pm || 0), 0) / recentHabits.length;
  const avgEnergy8pm = recentHabits.reduce((sum, habit) => sum + (habit.energyLevel8pm || 0), 0) / recentHabits.length;
  
  // Count workout days
  const workoutDays = recentHabits.filter(habit => habit.championWorkout === 'yes').length;
  
  // Create context string
  return `
    User's recent data (last 7 days):
    - Average energy at 2pm: ${avgEnergy2pm.toFixed(1)}/10
    - Average energy at 8pm: ${avgEnergy8pm.toFixed(1)}/10
    - Completed workouts: ${workoutDays}/7 days
    - Most recent meal: ${recentHabits[0]?.meal6pm || 'Not recorded'}
  `;
};
```

### 6. Add Conversation Starters

To help users engage with the AI, add suggested conversation starters:

```tsx
// Add these to the ChatAI component
const conversationStarters = [
  "What foods can help stabilize my blood sugar?",
  "How can I increase my energy levels?",
  "What exercises are best for diabetes?",
  "How can I build better habits?",
  "What should I do when my blood sugar is high?"
];

// Add this to the JSX, before the input field
<View style={styles.startersContainer}>
  <Text style={styles.startersTitle}>Try asking:</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {conversationStarters.map((starter, index) => (
      <TouchableOpacity
        key={index}
        style={styles.starterButton}
        onPress={() => {
          setInputText(starter);
        }}
      >
        <Text style={styles.starterText}>{starter}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>
```

By following these steps, you'll have a fully functional AI assistant integrated into your ByeByeSugar app that can provide personalized advice based on the user's habits and data.