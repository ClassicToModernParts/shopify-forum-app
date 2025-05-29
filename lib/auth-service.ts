import { forumDataStore } from "@/app/api/forum/data-store"

export interface UserRegistrationData {
  email: string
  username: string
  password: string
  name: string
}

export interface UserLoginData {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
    email: string
    name: string
    username: string
  }
}

// Simple hash function for passwords (in production, use proper hashing)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// Simple token generation
function generateToken(userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  return `${userId}_${timestamp}_${random}`
}

export class AuthService {
  // Register a new user
  async registerUser(userData: UserRegistrationData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = forumDataStore.getUserByEmail(userData.email)
      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists",
        }
      }

      const existingUsername = forumDataStore.getUserByUsername(userData.username)
      if (existingUsername) {
        return {
          success: false,
          message: "Username is already taken",
        }
      }

      // Hash the password
      const hashedPassword = simpleHash(userData.password)

      // Create the user
      const newUser = forumDataStore.addUser({
        email: userData.email,
        username: userData.username,
        name: userData.name,
        password: hashedPassword,
        role: "user",
      })

      // Generate token
      const token = generateToken(newUser.id)

      return {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          username: newUser.username,
        },
      }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: "Registration failed. Please try again.",
      }
    }
  }

  // Login user
  async loginUser(loginData: UserLoginData): Promise<AuthResult> {
    try {
      // Find user by email
      const user = forumDataStore.getUserByEmail(loginData.email)
      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
        }
      }

      // Compare passwords
      const hashedPassword = simpleHash(loginData.password)
      if (hashedPassword !== user.password) {
        return {
          success: false,
          message: "Invalid email or password",
        }
      }

      // Update last active timestamp
      forumDataStore.updateUserActivity(user.id)

      // Generate token
      const token = generateToken(user.id)

      return {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        },
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "Login failed. Please try again.",
      }
    }
  }

  // Verify token (simplified)
  verifyToken(token: string) {
    try {
      const parts = token.split("_")
      if (parts.length !== 3) {
        return { valid: false, decoded: null }
      }

      const userId = parts[0]
      const user = forumDataStore.getUserById(userId)

      if (!user) {
        return { valid: false, decoded: null }
      }

      return {
        valid: true,
        decoded: {
          id: userId,
          email: user.email,
          role: user.role,
        },
      }
    } catch (error) {
      return {
        valid: false,
        decoded: null,
      }
    }
  }
}

export const authService = new AuthService()
