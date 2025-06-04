import { persistentForumDataStore } from "@/lib/persistent-data-store"
import { ensureDataStoreInitialized } from "@/lib/data-store-manager"
import * as crypto from "crypto"

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

// Simple hash function for passwords
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// Simple token generation
function generateToken(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    timestamp: Date.now(),
  }

  // In a real app, you'd use JWT with proper signing
  const tokenParts = [
    user.id,
    Buffer.from(JSON.stringify(payload)).toString("base64"),
    crypto.randomBytes(8).toString("hex"),
  ]

  return tokenParts.join("_")
}

export class AuthService {
  async loginUser({ username, password }: { username: string; password: string }) {
    try {
      console.log(`🔐 Auth Service: Login attempt for ${username}`)

      // Ensure data store is initialized
      await ensureDataStoreInitialized()

      // Get user by username
      const user = await persistentForumDataStore.getUserByUsername(username)

      if (!user) {
        console.log(`❌ Auth Service: User not found: ${username}`)
        return {
          success: false,
          message: "Invalid username or password",
        }
      }

      // Check if user is active
      if (user.isActive === false) {
        console.log(`❌ Auth Service: User account is inactive: ${username}`)
        return {
          success: false,
          message: "Your account is inactive. Please contact support.",
        }
      }

      // Check password
      const hashedPassword = hashPassword(password)
      const passwordMatches = user.password === hashedPassword

      if (!passwordMatches) {
        console.log(`❌ Auth Service: Password mismatch for ${username}`)
        return {
          success: false,
          message: "Invalid username or password",
        }
      }

      // Generate token
      const token = generateToken(user)

      // Update last active timestamp
      await persistentForumDataStore.updateUser(user.id, {
        lastActive: new Date().toISOString(),
      })

      console.log(`✅ Auth Service: Login successful for ${username}`)

      // Return success with user data (excluding password)
      const { password: _, ...userWithoutPassword } = user

      return {
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
        token,
      }
    } catch (error) {
      console.error("❌ Auth Service: Login error:", error)
      return {
        success: false,
        message: "An error occurred during login",
      }
    }
  }

  // Add other auth methods as needed...

  // Register a new user
  async registerUser(userData: UserRegistrationData): Promise<AuthResult> {
    try {
      console.log(`🔐 AuthService: Registering user ${userData.username}`)

      // Check if username already exists
      let existingUsername
      try {
        existingUsername = await persistentForumDataStore.getUserByUsername(userData.username)
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
        hashedPassword = hashPassword(userData.password)
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
        newUser = await persistentForumDataStore.addUser({
          username: userData.username,
          name: userData.name,
          email: `${userData.username}@example.com`, // Generate email from username
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
        token = generateToken(newUser)
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

  // Verify token (simplified)
  async verifyToken(token: string) {
    try {
      const parts = token.split("_")
      if (parts.length !== 3) {
        return { valid: false, decoded: null }
      }

      const userId = parts[0]
      const user = await persistentForumDataStore.getUserById(userId)

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
