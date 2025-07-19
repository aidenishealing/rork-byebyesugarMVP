import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Edit, Trash, ChevronRight, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Client } from '@/types/habit';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useHabitsStore } from '@/store/habits-store';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/Header';

export default function AdminDashboard() {
  const router = useRouter();
  const { newClient } = useLocalSearchParams<{ newClient?: string }>();
  const { isAuthenticated, isAdmin, logout } = useAuthStore();
  const { allClients, updateClientDetails, deleteClient, isLoading } = useHabitsStore();
  
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'client-1',
      name: 'John Smith',
      phoneNumber: '+1234567890',
      role: 'client',
      habits: {},
      lastActive: '2023-06-15'
    },
    {
      id: 'client-2',
      name: 'Sarah Johnson',
      phoneNumber: '+0987654321',
      role: 'client',
      habits: {},
      lastActive: '2023-06-14'
    },
    {
      id: 'client-3',
      name: 'Michael Brown',
      phoneNumber: '+1122334455',
      role: 'client',
      habits: {},
      lastActive: '2023-06-10'
    }
  ]);
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    
    if (!isAdmin) {
      router.replace('/client');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);
  
  // Handle new client data from add-client screen
  useEffect(() => {
    if (newClient) {
      try {
        const clientData = JSON.parse(newClient);
        console.log('Received new client data:', clientData);
        
        // Add the new client to the existing clients list
        setClients(prevClients => {
          // Check if client already exists to avoid duplicates
          const exists = prevClients.some(client => client.id === clientData.id);
          if (!exists) {
            console.log('Adding new client to list:', clientData);
            return [...prevClients, clientData];
          }
          console.log('Client already exists, not adding duplicate');
          return prevClients;
        });
        
        // Show success message
        Alert.alert(
          'Success',
          `Client "${clientData.name}" has been added successfully!`,
          [{ text: 'OK' }]
        );
        
      } catch (error) {
        console.error('Error parsing new client data:', error);
        Alert.alert(
          'Error',
          'Failed to add client. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [newClient]);
  
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditPhoneNumber(client.phoneNumber);
    setEditModalVisible(true);
  };
  
  const handleSaveEdit = async () => {
    if (!editingClient) return;
    
    try {
      const success = await updateClientDetails(editingClient.id, editName, editPhoneNumber);
      
      if (success) {
        // Update local state
        setClients(clients.map(client => 
          client.id === editingClient.id 
            ? { ...client, name: editName, phoneNumber: editPhoneNumber } 
            : client
        ));
        
        setEditModalVisible(false);
        Alert.alert('Success', 'Client details updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update client details. Please try again.');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };
  
  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
    setDeleteConfirmVisible(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      const success = await deleteClient(clientToDelete);
      
      if (success) {
        // Update local state
        setClients(clients.filter(client => client.id !== clientToDelete));
        
        setDeleteConfirmVisible(false);
        Alert.alert('Success', 'Client deleted successfully!');
      } else {
        Alert.alert('Error', 'Failed to delete client. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };
  
  const handleClientPress = (client: Client) => {
    // Navigate to client details
    router.push(`/admin/client/${client.id}`);
  };
  
  const handleLogout = () => {
    setLogoutConfirmVisible(true);
  };
  
  const confirmLogout = () => {
    logout();
    router.replace('/');
  };
  
  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity 
      style={styles.clientCard}
      onPress={() => handleClientPress(item)}
    >
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientPhoneNumber}>{item.phoneNumber}</Text>
        <Text style={styles.lastActive}>Last active: {item.lastActive}</Text>
      </View>
      
      <View style={styles.clientActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditClient(item)}
        >
          <Edit size={20} color={Colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteClick(item.id)}
        >
          <Trash size={20} color={Colors.error} />
        </TouchableOpacity>
        
        <ChevronRight size={20} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
  
  // Edit Client Modal
  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitle}>Edit Client</Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setEditModalVisible(false)}
          >
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Input
            label="Name"
            value={editName}
            onChangeText={setEditName}
            placeholder="Enter client name"
          />
          
          <Input
            label="Phone Number"
            value={editPhoneNumber}
            onChangeText={setEditPhoneNumber}
            placeholder="Enter client phone number"
            keyboardType="phone-pad"
          />
          
          <View style={styles.modalButtons}>
            <Button
              title="Save Changes"
              onPress={handleSaveEdit}
              style={styles.saveButton}
              loading={isLoading}
              disabled={isLoading}
            />
            
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setEditModalVisible(false)}
              style={styles.cancelButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Admin Dashboard" 
        showLogout 
        onLogout={handleLogout} 
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>Client Management</Text>
        <Text style={styles.subtitle}>Manage your clients and their habits</Text>
        
        <FlatList
          data={clients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.clientsList}
        />
        
        <Button
          title="Add New Client"
          onPress={() => router.push('/admin/add-client')}
          style={styles.addButton}
        />
      </View>
      
      {renderEditModal()}
      
      <ConfirmationModal
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client? All their data will be permanently removed. This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
      
      <ConfirmationModal
        visible={logoutConfirmVisible}
        onClose={() => setLogoutConfirmVisible(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        isDestructive={true}
      />
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
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  clientsList: {
    paddingBottom: 16,
  },
  clientCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  clientPhoneNumber: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  clientActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    marginTop: 8,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalButtons: {
    marginTop: 24,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 0,
  },
});