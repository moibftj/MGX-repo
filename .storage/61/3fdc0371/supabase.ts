// Mock Supabase client for local storage operations
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'employee' | 'admin';
  createdAt: string;
  couponCode?: string;
  referrals?: number;
  earnings?: number;
}

export interface Letter {
  id: string;
  userId: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  matter: string;
  resolution: string;
  content: string;
  status: 'generating' | 'completed';
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'single' | 'annual4' | 'annual8';
  price: number;
  discount: number;
  couponCode?: string;
  employeeId?: string;
  createdAt: string;
}

class MockSupabaseClient {
  private getStorageKey(key: string): string {
    return `legalletter_${key}`;
  }

  // User operations
  async signUp(email: string, password: string, fullName: string, role: 'user' | 'employee' | 'admin', adminSecret?: string): Promise<{ user: User | null; error: string | null }> {
    if (role === 'admin' && adminSecret !== 'ADMIN_SECRET_2025') {
      return { user: null, error: 'Invalid admin secret key' };
    }

    const users = this.getUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      return { user: null, error: 'User already exists' };
    }

    const user: User = {
      id: crypto.randomUUID(),
      email,
      fullName,
      role,
      createdAt: new Date().toISOString(),
      ...(role === 'employee' && {
        couponCode: `EMP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        referrals: 0,
        earnings: 0
      })
    };

    users.push(user);
    localStorage.setItem(this.getStorageKey('users'), JSON.stringify(users));
    localStorage.setItem(this.getStorageKey('currentUser'), JSON.stringify(user));

    return { user, error: null };
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { user: null, error: 'Invalid credentials' };
    }

    localStorage.setItem(this.getStorageKey('currentUser'), JSON.stringify(user));
    return { user, error: null };
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.getStorageKey('currentUser'));
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.getStorageKey('currentUser'));
    return userStr ? JSON.parse(userStr) : null;
  }

  private getUsers(): User[] {
    const usersStr = localStorage.getItem(this.getStorageKey('users'));
    return usersStr ? JSON.parse(usersStr) : [];
  }

  // Letter operations
  async createLetter(letterData: Omit<Letter, 'id' | 'createdAt' | 'status'>): Promise<Letter> {
    const letter: Letter = {
      ...letterData,
      id: crypto.randomUUID(),
      status: 'generating',
      createdAt: new Date().toISOString()
    };

    const letters = this.getLetters();
    letters.push(letter);
    localStorage.setItem(this.getStorageKey('letters'), JSON.stringify(letters));

    // Simulate AI generation process
    setTimeout(() => {
      this.updateLetterStatus(letter.id, 'completed', this.generateLetterContent(letterData));
    }, 8000);

    return letter;
  }

  private generateLetterContent(data: Omit<Letter, 'id' | 'createdAt' | 'status' | 'content'>): string {
    return `${data.senderName}
${data.senderAddress}

${new Date().toLocaleDateString()}

${data.recipientName}
${data.recipientAddress}

Re: ${data.matter}

Dear ${data.recipientName.split(' ')[0]},

I am writing to address the matter of ${data.matter.toLowerCase()}.

${data.resolution}

This letter serves as formal notice and documentation of our position regarding this matter. We expect your prompt attention and response to resolve this issue in a timely manner.

Please contact us within 30 days of receipt of this letter to discuss resolution options. Failure to respond may result in further legal action.

Thank you for your anticipated cooperation.

Sincerely,

${data.senderName}`;
  }

  private updateLetterStatus(letterId: string, status: Letter['status'], content?: string): void {
    const letters = this.getLetters();
    const letterIndex = letters.findIndex(l => l.id === letterId);
    
    if (letterIndex !== -1) {
      letters[letterIndex].status = status;
      if (content) {
        letters[letterIndex].content = content;
      }
      localStorage.setItem(this.getStorageKey('letters'), JSON.stringify(letters));
    }
  }

  getLetters(): Letter[] {
    const lettersStr = localStorage.getItem(this.getStorageKey('letters'));
    return lettersStr ? JSON.parse(lettersStr) : [];
  }

  getUserLetters(userId: string): Letter[] {
    return this.getLetters().filter(l => l.userId === userId);
  }

  // Subscription operations
  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> {
    const subscription: Subscription = {
      ...subscriptionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    const subscriptions = this.getSubscriptions();
    subscriptions.push(subscription);
    localStorage.setItem(this.getStorageKey('subscriptions'), JSON.stringify(subscriptions));

    // Update employee earnings if coupon was used
    if (subscription.employeeId) {
      this.updateEmployeeEarnings(subscription.employeeId, subscription.price * 0.05);
    }

    return subscription;
  }

  private getSubscriptions(): Subscription[] {
    const subscriptionsStr = localStorage.getItem(this.getStorageKey('subscriptions'));
    return subscriptionsStr ? JSON.parse(subscriptionsStr) : [];
  }

  private updateEmployeeEarnings(employeeId: string, earnings: number): void {
    const users = this.getUsers();
    const employeeIndex = users.findIndex(u => u.id === employeeId);
    
    if (employeeIndex !== -1) {
      users[employeeIndex].referrals = (users[employeeIndex].referrals || 0) + 1;
      users[employeeIndex].earnings = (users[employeeIndex].earnings || 0) + earnings;
      localStorage.setItem(this.getStorageKey('users'), JSON.stringify(users));
    }
  }

  // Admin operations
  getAllUsers(): User[] {
    return this.getUsers();
  }

  getAllLetters(): Letter[] {
    return this.getLetters();
  }

  getAllSubscriptions(): Subscription[] {
    return this.getSubscriptions();
  }

  getEmployeeByCode(couponCode: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.role === 'employee' && u.couponCode === couponCode) || null;
  }
}

export const supabase = new MockSupabaseClient();