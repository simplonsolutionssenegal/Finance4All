import type { ClerkRegisterInput } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const registerUser = async (userData: ClerkRegisterInput) => {
  try {  
    const requestBody = {
      clerkId: userData.clerkId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'BENEFICIAIRE' as const,
      status: 'ACTIF' as const
    };
    
    console.warn('Sending registration request to backend:', {
      url: `${API_BASE_URL}/api/v1/users/register`,
      method: 'POST',
      body: requestBody
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (_e) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    console.warn('Backend response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data
    });

    if (!response.ok) {
      console.error('Backend error:', {
        status: response.status,
        message: data.error?.message || 'Unknown error',
        data
      });
      throw new Error(data.error?.message || `Erreur serveur: ${response.status}`);
    }

    console.warn('Registration successful, user created:', data);
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};