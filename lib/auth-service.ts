import { forumDataStore } from "@/app/api/forum/data-store"

export interface UserRegistrationData {
  username: string
  password: string
  name: string
}

export interface UserLoginData {
  username: string
  password: string
}

export interface AuthResult {
  success: boolean
  message: string
  token?: string
  user?: {
    id: string
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
      console.log(`🔐 AuthService: Registering user ${userData.username}`)

      // Import the data store
      let forumDataStore
      try {
        const dataStoreModule = await import("@/app/api/forum/data-store")
        forumDataStore = dataStoreModule.forumDataStore
        console.log("🔐 AuthService: Data store imported successfully")
      } catch (importError) {
        console.error("❌ AuthService: Failed to import data store:", importError)
        return {
          success: false,
          message: `Data store import failed: ${importError instanceof Error ? importError.message : String(importError)}`,
        }
      }

      // Check if username already exists
      let existingUsername
      try {
        existingUsername = await forumDataStore.getUserByUsername(userData.username)
        console.log(`🔐 AuthService: Username check completed for ${userData.username}`)
      } catch (checkError) {
        console.error("❌ AuthService: Error checking existing username:", checkError)
        return {
          success: false,
          message: `Username check failed: ${checkError instanceof Error ? checkError.message : String(checkError)}`,
        }
      }

      if (existingUsername) {
        console.log(`❌ AuthService: Username ${userData.username} already exists`)
        return {
          success: false,
          message: "Username is already taken",
        }
      }

      // Hash the password
      let hashedPassword
      try {
        hashedPassword = simpleHash(userData.password)
        console.log("🔐 AuthService: Password hashed successfully")
      } catch (hashError) {
        console.error("❌ AuthService: Error hashing password:", hashError)
        return {
          success: false,
          message: "Password processing failed",
        }
      }

      // Create the user
      console.log(`🔐 AuthService: Creating new user ${userData.username}`)
      let newUser
      try {
        newUser = await forumDataStore.addUser({
          username: userData.username,
          name: userData.name,
          password: hashedPassword,
          role: "user",
        })
        console.log("🔐 AuthService: User creation call completed")
      } catch (createError) {
        console.error("❌ AuthService: Error creating user:", createError)
        return {
          success: false,
          message: `User creation failed: ${createError instanceof Error ? createError.message : String(createError)}`,
        }
      }

      if (!newUser || !newUser.id) {
        console.error("❌ AuthService: Failed to create user - invalid user object returned:", newUser)
        return {
          success: false,
          message: "Failed to create user account. Please try again.",
        }
      }

      console.log(`✅ AuthService: User ${userData.username} created with ID ${newUser.id}`)

      // Generate token
      let token
      try {
        token = generateToken(newUser.id)
        console.log("🔐 AuthService: Token generated successfully")
      } catch (tokenError) {
        console.error("❌ AuthService: Error generating token:", tokenError)
        return {
          success: false,
          message: "Token generation failed",
        }
      }

      return {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
        },
      }
    } catch (error) {
      console.error("❌ AuthService: Registration error:", error)
      return {
        success: false,
        message: `Registration failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  // Login user
  async loginUser(loginData: UserLoginData): Promise<AuthResult> {
    try {
      console.log(`🔐 AuthService: Login attempt for ${loginData.username}`)

      // Find user by username
      const user = await forumDataStore.getUserByUsername(loginData.username)
      if (!user) {
        console.log(`❌ AuthService: User ${loginData.username} not found`)
        return {
          success: false,
          message: "Invalid username or password",
        }
      }

      // Compare passwords
      const hashedPassword = simpleHash(loginData.password)
      if (hashedPassword !== user.password) {
        console.log(`❌ AuthService: Invalid password for ${loginData.username}`)
        return {
          success: false,
          message: "Invalid username or password",
        }
      }

      // Update last active timestamp
      await forumDataStore.updateUserActivity(user.id)
      console.log(`✅ AuthService: User ${loginData.username} logged in successfully`)

      // Generate token
      const token = generateToken(user.id)

      return {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
        },
      }
    } catch (error) {
      console.error("❌ AuthService: Login error:", error)
      return {
        success: false,
        message: "Login failed. Please try again.",
      }
    }
  }

  // Verify token (simplified)
  async verifyToken(token: string) {
    try {
      const parts = token.split("_")
      if (parts.length !== 3) {
        return { valid: false, decoded: null }
      }

      const userId = parts[0]
      const user = await forumDataStore.getUserById(userId)

      if (!user) {
        return { valid: false, decoded: null }
      }

      return {
        valid: true,
        decoded: {
          id: userId,
          username: user.username,
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
