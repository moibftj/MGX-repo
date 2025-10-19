// Enhanced Supabase client with foolproof architecture and elite design patterns
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'employee' | 'admin';
  createdAt: string;
  couponCode?: string;
  referrals?: number;
  earnings?: number;
  isActive?: boolean;
  lastLoginAt?: string;
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
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  version: number;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'single' | 'annual4' | 'annual8';
  price: number;
  originalPrice: number;
  discount: number;
  couponCode?: string;
  employeeId?: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt?: string;
  lettersUsed: number;
  lettersAllowed: number;
}

export interface SystemMetrics {
  totalUsers: number;
  totalEmployees: number;
  totalLetters: number;
  totalRevenue: number;
  activeSubscriptions: number;
  conversionRate: number;
}

// Enhanced error handling
class LegalLetterError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'LegalLetterError';
  }
}

// Validation utilities
class Validator {
  static email(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static password(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain uppercase, lowercase, and number' };
    }
    return { valid: true };
  }

  static name(name: string): boolean {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
  }

  static adminSecret(secret: string): boolean {
    return secret === 'ADMIN_SECRET_2025';
  }
}

// Enhanced MockSupabaseClient with enterprise-grade features
class MockSupabaseClient {
  private readonly STORAGE_PREFIX = 'legalletter_v2_';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  private getStorageKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }

  private generateSecureId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCouponCode(): string {
    const prefix = 'EMP';
    const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}${suffix}`;
  }

  private validateSession(): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const lastLogin = localStorage.getItem(this.getStorageKey('lastLogin'));
    if (!lastLogin) return false;

    const sessionAge = Date.now() - parseInt(lastLogin);
    if (sessionAge > this.SESSION_TIMEOUT) {
      this.signOut();
      return false;
    }

    return true;
  }

  private logActivity(action: string, userId?: string, details?: any): void {
    const activity = {
      id: this.generateSecureId(),
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: '127.0.0.1' // Mock IP
    };

    const activities = this.getActivities();
    activities.push(activity);
    
    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }
    
    localStorage.setItem(this.getStorageKey('activities'), JSON.stringify(activities));
  }

  private getActivities(): any[] {
    const activitiesStr = localStorage.getItem(this.getStorageKey('activities'));
    return activitiesStr ? JSON.parse(activitiesStr) : [];
  }

  // Enhanced user operations with comprehensive validation
  async signUp(
    email: string, 
    password: string, 
    fullName: string, 
    role: 'user' | 'employee' | 'admin', 
    adminSecret?: string
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      // Input validation
      if (!Validator.email(email)) {
        throw new LegalLetterError('Invalid email format', 'INVALID_EMAIL');
      }

      const passwordValidation = Validator.password(password);
      if (!passwordValidation.valid) {
        throw new LegalLetterError(passwordValidation.message!, 'INVALID_PASSWORD');
      }

      if (!Validator.name(fullName)) {
        throw new LegalLetterError('Invalid name format', 'INVALID_NAME');
      }

      if (role === 'admin' && !Validator.adminSecret(adminSecret || '')) {
        throw new LegalLetterError('Invalid admin secret key', 'INVALID_ADMIN_SECRET');
      }

      const users = this.getUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        throw new LegalLetterError('User already exists with this email', 'USER_EXISTS');
      }

      const user: User = {
        id: this.generateSecureId(),
        email: email.toLowerCase(),
        fullName: fullName.trim(),
        role,
        createdAt: new Date().toISOString(),
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        ...(role === 'employee' && {
          couponCode: this.generateCouponCode(),
          referrals: 0,
          earnings: 0
        })
      };

      users.push(user);
      localStorage.setItem(this.getStorageKey('users'), JSON.stringify(users));
      localStorage.setItem(this.getStorageKey('currentUser'), JSON.stringify(user));
      localStorage.setItem(this.getStorageKey('lastLogin'), Date.now().toString());

      this.logActivity('USER_SIGNUP', user.id, { role, email: user.email });

      return { user, error: null };
    } catch (error) {
      if (error instanceof LegalLetterError) {
        return { user: null, error: error.message };
      }
      return { user: null, error: 'An unexpected error occurred during signup' };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      if (!Validator.email(email)) {
        throw new LegalLetterError('Invalid email format', 'INVALID_EMAIL');
      }

      if (!password.trim()) {
        throw new LegalLetterError('Password is required', 'MISSING_PASSWORD');
      }

      const users = this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user || !user.isActive) {
        throw new LegalLetterError('Invalid credentials or account deactivated', 'INVALID_CREDENTIALS');
      }

      // Update last login
      user.lastLoginAt = new Date().toISOString();
      const userIndex = users.findIndex(u => u.id === user.id);
      users[userIndex] = user;
      localStorage.setItem(this.getStorageKey('users'), JSON.stringify(users));

      localStorage.setItem(this.getStorageKey('currentUser'), JSON.stringify(user));
      localStorage.setItem(this.getStorageKey('lastLogin'), Date.now().toString());

      this.logActivity('USER_SIGNIN', user.id, { email: user.email });

      return { user, error: null };
    } catch (error) {
      if (error instanceof LegalLetterError) {
        return { user: null, error: error.message };
      }
      return { user: null, error: 'An unexpected error occurred during signin' };
    }
  }

  async signOut(): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.logActivity('USER_SIGNOUT', currentUser.id);
    }
    
    localStorage.removeItem(this.getStorageKey('currentUser'));
    localStorage.removeItem(this.getStorageKey('lastLogin'));
  }

  getCurrentUser(): User | null {
    if (!this.validateSession()) return null;
    
    const userStr = localStorage.getItem(this.getStorageKey('currentUser'));
    return userStr ? JSON.parse(userStr) : null;
  }

  private getUsers(): User[] {
    const usersStr = localStorage.getItem(this.getStorageKey('users'));
    return usersStr ? JSON.parse(usersStr) : [];
  }

  // Enhanced letter operations with business logic
  async createLetter(letterData: Omit<Letter, 'id' | 'createdAt' | 'status' | 'version'>): Promise<Letter> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new LegalLetterError('User not authenticated', 'NOT_AUTHENTICATED');
      }

      if (currentUser.role !== 'user') {
        throw new LegalLetterError('Only users can generate letters', 'INSUFFICIENT_PERMISSIONS');
      }

      // Check subscription limits
      const subscription = this.getUserActiveSubscription(currentUser.id);
      if (!subscription) {
        throw new LegalLetterError('Active subscription required', 'NO_SUBSCRIPTION');
      }

      if (subscription.lettersUsed >= subscription.lettersAllowed) {
        throw new LegalLetterError('Letter limit exceeded for current subscription', 'LIMIT_EXCEEDED');
      }

      const letter: Letter = {
        ...letterData,
        id: this.generateSecureId(),
        status: 'generating',
        createdAt: new Date().toISOString(),
        version: 1
      };

      const letters = this.getLetters();
      letters.push(letter);
      localStorage.setItem(this.getStorageKey('letters'), JSON.stringify(letters));

      // Update subscription usage
      subscription.lettersUsed += 1;
      this.updateSubscription(subscription);

      this.logActivity('LETTER_CREATED', currentUser.id, { letterId: letter.id, matter: letter.matter });

      // Simulate AI generation process with enhanced content
      setTimeout(() => {
        this.updateLetterStatus(letter.id, 'completed', this.generateEnhancedLetterContent(letterData));
      }, 8000);

      return letter;
    } catch (error) {
      if (error instanceof LegalLetterError) {
        throw error;
      }
      throw new LegalLetterError('Failed to create letter', 'CREATION_FAILED');
    }
  }

  private generateEnhancedLetterContent(data: Omit<Letter, 'id' | 'createdAt' | 'status' | 'version' | 'content'>): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `${data.senderName}
${data.senderAddress}

${currentDate}

${data.recipientName}
${data.recipientAddress}

Re: ${data.matter}

Dear ${data.recipientName.split(' ')[0]},

I am writing to formally address the matter concerning ${data.matter.toLowerCase()}.

${data.resolution}

This correspondence serves as official notice and documentation of our position regarding this matter. We expect your prompt attention and response to facilitate a timely resolution.

Please be advised that failure to respond within thirty (30) days of receipt of this letter may result in further legal action being taken to protect our interests and enforce our rights under applicable law.

We remain open to discussing this matter in good faith and look forward to your prompt response.

Sincerely,

${data.senderName}

---
This letter was generated using LegalLetter AI
Generated on: ${currentDate}
Letter ID: ${this.generateSecureId().substr(0, 8)}`;
  }

  private updateLetterStatus(letterId: string, status: Letter['status'], content?: string): void {
    const letters = this.getLetters();
    const letterIndex = letters.findIndex(l => l.id === letterId);
    
    if (letterIndex !== -1) {
      letters[letterIndex].status = status;
      letters[letterIndex].version += 1;
      
      if (content) {
        letters[letterIndex].content = content;
        letters[letterIndex].completedAt = new Date().toISOString();
      }
      
      localStorage.setItem(this.getStorageKey('letters'), JSON.stringify(letters));
      
      this.logActivity('LETTER_UPDATED', letters[letterIndex].userId, {
        letterId,
        status,
        version: letters[letterIndex].version
      });
    }
  }

  getLetters(): Letter[] {
    const lettersStr = localStorage.getItem(this.getStorageKey('letters'));
    return lettersStr ? JSON.parse(lettersStr) : [];
  }

  getUserLetters(userId: string): Letter[] {
    return this.getLetters().filter(l => l.userId === userId);
  }

  // Enhanced subscription operations
  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'status' | 'lettersUsed' | 'lettersAllowed' | 'originalPrice'>): Promise<Subscription> {
    try {
      const planLimits = {
        single: 1,
        annual4: 4,
        annual8: 8
      };

      const subscription: Subscription = {
        ...subscriptionData,
        id: this.generateSecureId(),
        originalPrice: subscriptionData.price / (1 - subscriptionData.discount / 100),
        status: 'active',
        createdAt: new Date().toISOString(),
        lettersUsed: 0,
        lettersAllowed: planLimits[subscriptionData.plan],
        ...(subscriptionData.plan !== 'single' && {
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
      };

      const subscriptions = this.getSubscriptions();
      subscriptions.push(subscription);
      localStorage.setItem(this.getStorageKey('subscriptions'), JSON.stringify(subscriptions));

      // Update employee earnings if coupon was used
      if (subscription.employeeId) {
        this.updateEmployeeEarnings(subscription.employeeId, subscription.price * 0.05);
      }

      this.logActivity('SUBSCRIPTION_CREATED', subscription.userId, {
        subscriptionId: subscription.id,
        plan: subscription.plan,
        price: subscription.price
      });

      return subscription;
    } catch (error) {
      throw new LegalLetterError('Failed to create subscription', 'SUBSCRIPTION_FAILED');
    }
  }

  private updateSubscription(subscription: Subscription): void {
    const subscriptions = this.getSubscriptions();
    const index = subscriptions.findIndex(s => s.id === subscription.id);
    if (index !== -1) {
      subscriptions[index] = subscription;
      localStorage.setItem(this.getStorageKey('subscriptions'), JSON.stringify(subscriptions));
    }
  }

  private getUserActiveSubscription(userId: string): Subscription | null {
    const subscriptions = this.getSubscriptions();
    return subscriptions.find(s => 
      s.userId === userId && 
      s.status === 'active' && 
      (!s.expiresAt || new Date(s.expiresAt) > new Date())
    ) || null;
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
      
      this.logActivity('EMPLOYEE_EARNINGS_UPDATED', employeeId, {
        earnings,
        totalEarnings: users[employeeIndex].earnings
      });
    }
  }

  // Enhanced admin operations
  getAllUsers(): User[] {
    return this.getUsers();
  }

  getAllLetters(): Letter[] {
    return this.getLetters();
  }

  getAllSubscriptions(): Subscription[] {
    return this.getSubscriptions();
  }

  getSystemMetrics(): SystemMetrics {
    const users = this.getUsers();
    const letters = this.getLetters();
    const subscriptions = this.getSubscriptions();

    return {
      totalUsers: users.filter(u => u.role === 'user').length,
      totalEmployees: users.filter(u => u.role === 'employee').length,
      totalLetters: letters.length,
      totalRevenue: subscriptions.reduce((sum, sub) => sum + sub.price, 0),
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      conversionRate: users.length > 0 ? (subscriptions.length / users.length) * 100 : 0
    };
  }

  getEmployeeByCode(couponCode: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.role === 'employee' && u.couponCode === couponCode && u.isActive) || null;
  }

  // Data export for admin
  exportData(): { users: User[]; letters: Letter[]; subscriptions: Subscription[]; activities: any[] } {
    return {
      users: this.getAllUsers(),
      letters: this.getAllLetters(),
      subscriptions: this.getAllSubscriptions(),
      activities: this.getActivities()
    };
  }

  // Health check
  healthCheck(): { status: 'healthy' | 'degraded'; timestamp: string; metrics: SystemMetrics } {
    try {
      const metrics = this.getSystemMetrics();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics
      };
    } catch (error) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        metrics: {
          totalUsers: 0,
          totalEmployees: 0,
          totalLetters: 0,
          totalRevenue: 0,
          activeSubscriptions: 0,
          conversionRate: 0
        }
      };
    }
  }
}

export const supabase = new MockSupabaseClient();
export { LegalLetterError, Validator };